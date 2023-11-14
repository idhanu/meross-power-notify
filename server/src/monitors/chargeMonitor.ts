import logger from '../pino';
import { getUpcomingRates } from '../apis/amber';
import { getMerossPlug, setMerossPlug } from '../apis/meross';
import { InterruptableSleep, sleep } from '../utils/helpers';

export class ChargeMonitor {
  private settings = {
    cutoffHour: 15,
    maxPrice: 30,
    stateOfCharge: 70,
    preferredPrice: 18,
  };

  private lastUpdate: Record<string, unknown> | null = null;
  private interruptableSleep = new InterruptableSleep();

  calculateTimeToNextMinute = (): number => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const targetMinute = (currentMinute > 30 ? 60 : 30) - currentMinute + 1;
    return targetMinute;
  };

  private getUpcomingCutoff = () => {
    const now = new Date();
    const currentHour = now.getHours();

    const settings = this.getSettings();
    // If the current hour is equal to or greater than the target hour,
    // set the date to the next day
    if (currentHour >= settings.cutoffHour) {
      now.setDate(now.getDate() + 1);
    }

    // Set the time to the target hour
    now.setHours(settings.cutoffHour, 0, 0, 0);

    return now.getTime();
  };

  private overrideSettings: Partial<typeof this.settings> & { expireAt: number } = {
    expireAt: 0,
  };

  private overrideSettingsValid() {
    return this.overrideSettings.expireAt <= Date.now();
  }

  getSettings() {
    return this.overrideSettingsValid() ? { ...this.settings, ...this.overrideSettings } : this.settings;
  }

  getLastUpdate() {
    return this.lastUpdate;
  }

  updateOverrideSettings(settings: Partial<typeof this.settings>, updateExpiry = true) {
    this.overrideSettings = {
      expireAt: updateExpiry ? Date.now() + 24 * 60 * 60 * 1000 : this.overrideSettings.expireAt,
      ...settings,
    };

    this.interruptableSleep.interrupt();
    logger.info('Updated override settings', this.overrideSettings);
  }

  async shouldCharge() {
    const prices = await getUpcomingRates();
    const cutoff = this.getUpcomingCutoff();
    const settings = this.getSettings();

    const requiredTime = Math.ceil(((100 - settings.stateOfCharge) / 2.5) * 2);

    const validPrices = prices.filter((price) => price.endTimestamp <= cutoff).map((price) => price.perKwh);
    validPrices.sort();
    const lowestPrices = validPrices.slice(0, requiredTime);

    const priceMax = Math.min(lowestPrices[lowestPrices.length - 1], settings.maxPrice);
    if (lowestPrices.length < requiredTime) {
      logger.info(`Not enough prices available to calculate average price.`);
    }
    const currentPrice = prices.find((price) => price.type === 'CurrentInterval');
    if (!currentPrice) {
      throw new Error('No current price found');
    }

    let decision = false;
    if (currentPrice && currentPrice.perKwh < priceMax) {
      decision = true;
    }

    const predictedOnState = validPrices.filter((price) => price <= priceMax);
    const predictedStateOfCharge = Math.min(predictedOnState.length * 1.25 + settings.stateOfCharge, 100);
    const predictedAveragePrice =
      predictedOnState.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / predictedOnState.length;

    this.lastUpdate = {
      lowestPrices,
      priceMax,
      currentPrice,
      cutoff,
      settings,
      charge: decision,
      predictedStateOfCharge,
      predictedAveragePrice,
    };

    logger.info(
      'Decision based on: ' +
        JSON.stringify({
          ...this.lastUpdate,
          lowestPrices: undefined,
          cutoff: new Date(this.lastUpdate.cutoff as string).toLocaleDateString(),
        }),
    );

    return decision;
  }

  async recordPower() {
    const settings = this.getSettings();
    const plug = await getMerossPlug('EV');
    if (plug.power > 10) {
      const newStateOfCharge = settings.stateOfCharge + 1.25;
      logger.info(`Charging is at ${plug.power}. New state of charge is ${newStateOfCharge}`);
      if (this.overrideSettingsValid()) {
        this.updateOverrideSettings({ stateOfCharge: newStateOfCharge }, false);
      }
    }
  }

  async monitor() {
    while (true) {
      try {
        if (await this.shouldCharge()) {
          logger.info('Turn on charging');
          await setMerossPlug('EV', true);
          await sleep(60000);
          await this.recordPower();
        } else {
          logger.info('Turn off charging');
          await setMerossPlug('EV', false);
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
