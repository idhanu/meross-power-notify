import { Tracker } from './washingMachineTracker';

describe('Tracker', () => {
  let record: Tracker;

  beforeEach(() => {
    record = new Tracker({
      sampleSize: 5,
      threshold: 10,
      runningDetectionPoints: 2,
      stoppedDetectionPoints: 5,
    });
  });

  test('detect turn off', () => {
    record.record(5);
    record.record(3);
    record.record(4);
    record.record(5);
    record.record(5);
    expect(record.turnOffDetected).toBeFalsy();

    record.record(15);
    record.record(2);
    record.record(3);
    record.record(3);
    record.record(16);
    expect(record.isRunning).toBeTruthy();
    expect(record.turnOffDetected).toBeFalsy();

    record.record(15);
    record.record(13);
    record.record(4);
    record.record(5);
    record.record(4);
    expect(record.turnOffDetected).toBeFalsy();

    record.record(4);
    expect(record.turnOffDetected).toBeFalsy();

    record.record(4);
    expect(record.turnOffDetected).toBeTruthy();

    record.clear();
    expect(record.turnOffDetected).toBeFalsy();
  });

  test('ignore invalid turn off', () => {
    expect(record.turnOffDetected).toBeFalsy();

    record.record(15);
    record.record(13);
    record.record(4);
    record.record(4);
    record.record(16);
    expect(record.turnOffDetected).toBeFalsy();

    record.record(5);
    record.record(3);
    record.record(4);
    record.record(5);
    record.record(5);
    expect(record.turnOffDetected).toBeTruthy();

    record.clear();
    expect(record.turnOffDetected).toBeFalsy();

    record.record(15);
    record.record(2);
    record.record(4);
    record.record(4);
    record.record(4);
    expect(record.turnOffDetected).toBeFalsy();

    record.record(5);
    record.record(3);
    record.record(4);
    record.record(5);
    record.record(5);
    expect(record.turnOffDetected).toBeFalsy();
  });
});
