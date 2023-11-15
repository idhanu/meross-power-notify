export interface AmberRate {
  type: 'CurrentInterval' | 'ForecastInterval';
  date: string;
  duration: number;
  startTime: string;
  endTime: string;
  nemTime: string;
  perKwh: number;
  renewables: number;
  spotPerKwh: number;
  channelType: string;
  spikeStatus: string;
  descriptor: string;
  estimate?: boolean | null;
  range?: AmberRateRange | null;
}

interface AmberRateRange {
  min: number;
  max: number;
}

export interface Rate extends AmberRate {
  startTimestamp: number;
  endTimestamp: number;
}
