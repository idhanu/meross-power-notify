import { ChargeMonitor } from './chargeMonitor';

describe('chargeMonitor', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  it('gets the right settings', () => {
    jest.setSystemTime(new Date('2023-11-17 06:00:00'));
    const cm = new ChargeMonitor();
    expect(cm.getSettings()).toEqual({
      cutoffHour: 15,
      maxPrice: 30,
      preferredPrice: 18,
      stateOfCharge: 85,
    });

    jest.setSystemTime(new Date('2023-11-17 18:00:00'));
    expect(cm.getSettings()).toMatchObject({
      cutoffHour: 9,
    });

    jest.setSystemTime(new Date('2023-11-18 06:00:00'));
    expect(cm.getSettings()).toMatchObject({
      cutoffHour: 9,
    });

    jest.setSystemTime(new Date('2023-11-18 06:00:00'));
    expect(cm.getSettings()).toMatchObject({
      cutoffHour: 9,
    });

    jest.setSystemTime(new Date('2023-11-19 06:00:00'));
    expect(cm.getSettings()).toMatchObject({
      cutoffHour: 10,
    });
  });
});
