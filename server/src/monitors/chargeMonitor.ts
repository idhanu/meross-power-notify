import logger from '../pino';
import { getUpcomingRates } from '../apis/amber';
import { getMerossPlug, setMerossPlug } from '../apis/meross';
import { InterruptableSleep } from '../utils/helpers';
import { ChargeMonitorLastUpdate, ChargeMonitorSettings } from '../models/chargeMonitor';

export class ChargeMonitor {
  private settings: ChargeMonitorSettings = {
    maxPrice: 35,
    stateOfCharge: 60,
    force: false,
  };

  private lastUpdate: Partial<ChargeMonitorLastUpdate> = {};

  private interruptableSleep = new InterruptableSleep();

  setLastUpdate(values: Partial<ChargeMonitorLastUpdate>) {
    if (values.chargingTimes && this.lastUpdate.chargingTimes) {
      const newChargingTimes = [...this.lastUpdate.chargingTimes, ...values.chargingTimes];
      values.chargingTimes = newChargingTimes.slice(Math.max(newChargingTimes.length - 48, 0));
    }

    this.lastUpdate = {
      ...this.lastUpdate,
      ...values,
    };
  }

  calculateTimeToNextMinute = (): number => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const targetMinute = (currentMinute > 30 ? 60 : 30) - currentMinute + 1;
    return targetMinute;
  };

  getSettings(): typeof this.settings {
    return this.settings;
  }

  getLastUpdate() {
    return this.lastUpdate;
  }

  updateOverrideSettings(settings: Partial<typeof this.settings>) {
    this.settings = {
      ...this.settings,
      ...settings,
    };

    this.interruptableSleep.interrupt();
    logger.info(`Updated override settings: ${JSON.stringify(this.settings)}`);
  }

  async shouldCharge() {
    const prices = await getUpcomingRates();
    const settings = this.getSettings();

    const requiredTime = Math.ceil((100 - settings.stateOfCharge + 0.1) / 1.25);

    const lowestPrices = [...prices].sort((a, b) => a.perKwh - b.perKwh).slice(0, requiredTime);

    const priceMax = Math.min(lowestPrices[lowestPrices.length - 1].perKwh + 7, settings.maxPrice);
    if (lowestPrices.length < requiredTime) {
      logger.info(`Battery will not reach 100% in the next 24 hours`);
    }
    const currentPrice = prices.find((price) => price.type === 'CurrentInterval');
    if (!currentPrice) {
      throw new Error('No current price found');
    }

    let decision = false;
    if (currentPrice && currentPrice.perKwh < priceMax) {
      decision = true;
    }

    const predictedOnState = prices.filter((price) => price.perKwh <= priceMax);
    const predictedStateOfCharge = Math.min(predictedOnState.length * 1.25 + settings.stateOfCharge, 100);
    const predictedAveragePrice =
      predictedOnState.reduce((accumulator, currentValue) => accumulator + currentValue.perKwh, 0) /
      predictedOnState.length;

    this.setLastUpdate({
      prices,
      lowestPrices,
      priceMax,
      currentPrice,
      settings,
      charge: decision,
      predictedStateOfCharge,
      predictedAveragePrice,
    });

    return decision;
  }

  async recordPower() {
    const settings = this.getSettings();
    const plug = await getMerossPlug('EV');
    if (plug.power > 1000) {
      const newStateOfCharge = Math.min(settings.stateOfCharge + 1.25, 100);
      logger.info(`Charging is at ${plug.power}. New state of charge is ${newStateOfCharge}`);
      this.updateOverrideSettings({ stateOfCharge: newStateOfCharge });
      return true;
    }
    return false;
  }

  async monitor() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        if (await this.shouldCharge()) {
          logger.info('Turn on charging');
          await setMerossPlug('EV', true);
          await this.interruptableSleep.sleep(20000);
          const isPluggedIn = await this.recordPower();
          this.setLastUpdate({
            isPluggedIn: isPluggedIn,
            chargingTimes: isPluggedIn
              ? [{ time: Date.now(), price: this.getLastUpdate()?.currentPrice?.perKwh || 0 }]
              : [],
          });
        } else {
          logger.info('Turn off charging');
          await setMerossPlug('EV', false);
          this.setLastUpdate({
            isPluggedIn: false,
          });
        }
        const next = this.calculateTimeToNextMinute();
        logger.info(`Wait for ${next} minutes until next check`);
        await this.interruptableSleep.sleep(next * 60 * 1000);
      } catch (e) {
        logger.error(e);
        logger.info(`Error occurred retrying after 1 minute`);
        await this.interruptableSleep.sleep(60000);
      }
    }
  }
}
