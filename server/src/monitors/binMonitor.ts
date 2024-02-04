import { sleep } from '../utils/helpers';
import logger from '../pino';
import { NORMAL_BIN_IMAGE, RECYCLE_BIN_IMAGE } from '../data/images';
import { addNotifications } from '../apis/display';

const ONE_WEEK_IN_MS = 60 * 60 * 24 * 7 * 1000;

export class BinMonitor {
  private lastNotificationWeek = 0;

  private async notify(type: 'normal' | 'recycle') {
    logger.info(`Notifying bin collection for ${type} bin`);
    await addNotifications('led-display1', {
      notifications: [
        {
          id: `bin-${type}`,
          imageData: type === 'normal' ? NORMAL_BIN_IMAGE : RECYCLE_BIN_IMAGE,
          brightness: 40,
          blink: true,
        },
      ],
    });
  }

  async checkBinDateAndNotify() {
    const date = new Date();
    const week = Math.ceil(date.getTime() / ONE_WEEK_IN_MS);
    if (new Date().getDay() === 2 && new Date().getHours() >= 17) {
      if (week !== this.lastNotificationWeek) {
        const image = week % 2 === 0 ? 'normal' : 'recycle';
        this.lastNotificationWeek = week;
        await this.notify(image);
      }
    }
  }

  async monitor() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this.checkBinDateAndNotify();
        await sleep(1000 * 60 * 60);
      } catch (e) {
        logger.error(e);
        // Retry in 1 minute
        logger.warn('Retrying in 1 minute');
        sleep(1000 * 60);
      }
    }
  }
}
