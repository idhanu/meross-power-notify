import { BinMonitor } from './binMonitor';
import { addNotifications } from '../apis/display';
import { NORMAL_BIN_IMAGE, RECYCLE_BIN_IMAGE } from '../data/images';

jest.mock('../apis/display');

const binMonitor = new BinMonitor();
describe('BinMonitor', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not notify on Monday', async () => {
    jest.setSystemTime(new Date('2024-02-05'));

    binMonitor.checkBinDateAndNotify();
    expect(addNotifications).not.toHaveBeenCalled();
  });

  it('should not notify on Tuesday morning', async () => {
    // todo fix this test
    jest.setSystemTime(new Date('2024-02-06 10:00:00'));

    binMonitor.checkBinDateAndNotify();
    expect(addNotifications).not.toHaveBeenCalled();
  });

  it('should notify on Tuesday afternoon for recycle', async () => {
    jest.setSystemTime(new Date('2024-02-06 17:00:00'));

    binMonitor.checkBinDateAndNotify();
    expect(addNotifications).toHaveBeenCalledWith('led-display1', {
      notifications: [
        {
          id: 'bin-recycle',
          imageData: RECYCLE_BIN_IMAGE,
          brightness: 40,
          blink: true,
        },
      ],
    });
  });

  it('should notify on Tuesday afternoon for normal', async () => {
    jest.setSystemTime(new Date('2024-02-13 17:00:00'));

    binMonitor.checkBinDateAndNotify();
    expect(addNotifications).toHaveBeenCalledWith('led-display1', {
      notifications: [
        {
          id: 'bin-normal',
          imageData: NORMAL_BIN_IMAGE,
          brightness: 40,
          blink: true,
        },
      ],
    });
  });
});
