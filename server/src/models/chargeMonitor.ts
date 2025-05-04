import { Rate } from './amber';

interface PriceTime {
  time: number;
  price: number;
}

export interface ChargeMonitorSettingsOvo {
  force: boolean;
  forceOffPeak: boolean;
}

export interface ChargeMonitorSettingsAmber {
  maxPrice: number;
  stateOfCharge: number;
  force: boolean;
}

export interface ChargeMonitorLastUpdate<TSettings> {
  settings: TSettings;
  isPluggedIn: boolean;
}

export interface ChargeMonitorLastUpdateOvo extends ChargeMonitorLastUpdate<ChargeMonitorSettingsOvo> {
  currentPrice: number;
}
export interface ChargeMonitorLastUpdateAmber extends ChargeMonitorLastUpdate<ChargeMonitorSettingsAmber> {
  prices: Rate[];
  lowestPrices: Rate[];
  priceMax: number;
  cutoff: number;
  charge: boolean;
  currentPrice: Rate;
  predictedStateOfCharge: number;
  predictedAveragePrice: number;
  chargingTimes: PriceTime[];
}
