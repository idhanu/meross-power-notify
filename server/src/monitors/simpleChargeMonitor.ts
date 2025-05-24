import logger from '../pino';

import { getMerossPlug, setMerossPlug } from '../apis/meross';
import { InterruptableSleep, sleep } from '../utils/helpers';
import { ChargeMonitorLastUpdateOvo, ChargeMonitorSettingsOvo } from '../models/chargeMonitor';

export class SimpleChargeMonitor {
  private settings: ChargeMonitorSettingsOvo = {
    force: false,
    forceOffPeak: false,
  };

  private lastUpdate: Partial<ChargeMonitorLastUpdateOvo> | null = null;
  private interruptableSleep = new InterruptableSleep();

  async shouldCharge() {
    // Charge between 12am-6am and 11am-2pm
    if (this.isSuperOffPeak() || this.isEvCharging()) {
      logger.info('Charging during super off-peak and EV charging hours');
      return true;
    }

    // Charge if the force setting is enabled
    if (this.settings.forceOffPeak && this.isOffPeak()) {
      logger.info('Force charging during off-peak hours');
      return true;
    }

    if (this.settings.force) {
      logger.info('Force charging');
      return true;
    }
    return false;
  }

  getSettings(): typeof this.settings {
    return this.settings;
  }

  isOffPeak() {
    const date = new Date();
    // Check if the current time is not between 3pm and 9pm
    return !(date.getHours() >= 15 && date.getHours() < 21);
  }

  isSuperOffPeak() {
    const date = new Date();
    return date.getHours() >= 11 && date.getHours() < 14;
  }

  isEvCharging() {
    const date = new Date();
    // Check if the current time is between 12am and 6am
    return date.getHours() >= 0 && date.getHours() < 6;
  }

  getLastUpdate() {
    let price = 47.3; // Default price
    if (this.isEvCharging()) {
      price = 8;
    } else if (this.isSuperOffPeak()) {
      price = 0;
    } else if (this.isOffPeak()) {
      price = 30.8;
    }

    return {
      ...this.lastUpdate,
      settings: this.settings,
      currentPrice: price,
    };
  }

  updateOverrideSettings(settings: Partial<typeof this.settings>) {
    this.settings = {
      ...this.settings,
      ...settings,
    };

    this.interruptableSleep.interrupt();
    logger.info(`Updated override settings: ${JSON.stringify(this.settings)}`);
  }

  calculateTimeToNextMinute = (): number => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const targetMinute = 60 - currentMinute + 1;
    return targetMinute;
  };

  async isCharging() {
    const plug = await getMerossPlug('EV');
    if (plug.power > 1000) {
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
          await sleep(30000); // wait for 30 seconds
          const isPluggedIn = await this.isCharging();
          this.lastUpdate = {
            isPluggedIn,
            ...this.lastUpdate,
          };

          if (isPluggedIn) {
            logger.info('Charging');
          } else {
            // TODO: Notify display
            logger.info('Not charging');
          }
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
        await sleep(60000);
      }
    }
  }
}
