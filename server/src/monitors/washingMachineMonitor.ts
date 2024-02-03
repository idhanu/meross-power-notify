import { addNotifications } from '../apis/display';
import { getMerossPlug } from '../apis/meross';
import { WASHING_MACHINE_IMAGE } from '../data/images';
import logger from '../pino';
import { sleep } from '../utils/helpers';
import { Tracker } from './washingMachineTracker';

const RUNNING_DELAY = 180;
const STOPPED_DELAY = 1800;
const THRESHOLD = 100;

export class WashingMachineMonitor {
  private record = new Tracker({
    sampleSize: 5,
    threshold: 10,
    runningDetectionPoints: 2,
    stoppedDetectionPoints: 5,
  });

  public async monitor(): Promise<void> {
    let delay = STOPPED_DELAY;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const instantConsumption = await getMerossPlug('Synology');

      this.record.record(instantConsumption.power);

      if (instantConsumption.power > THRESHOLD) {
        logger.info(`Washing machine is running with ${instantConsumption.power}W`);
        delay = RUNNING_DELAY;
      }

      if (this.record.turnOffDetected) {
        logger.info('Washing machine has stopped. Notifying display.');
        await addNotifications('led-display1', {
          notifications: [
            {
              id: 'washing-machine',
              imageData: WASHING_MACHINE_IMAGE,
              brightness: 40,
              blink: true,
            },
          ],
        });

        delay = STOPPED_DELAY;
        this.record.clear();
      }

      await sleep(delay * 1000);
    }
  }
}
