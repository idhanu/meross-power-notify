import logger from '../pino';

import { getMerossPlug, setMerossPlug } from '../apis/meross';
import { sleep } from '../utils/helpers';

export class SimpleChargeMonitor {
  async shouldCharge() {
    const date = new Date();
    // Charge between 12am-6am
    if (date.getHours() >= 0 && date.getHours() < 6) {
      return true;
    }

    // Charge between 11am-2pm
    if (date.getHours() >= 11 && date.getHours() < 14) {
      return true;
    }
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
        await sleep(next * 60 * 1000);
      } catch (e) {
        logger.error(e);
        logger.info(`Error occurred retrying after 1 minute`);
        await sleep(60000);
      }
    }
  }
}
