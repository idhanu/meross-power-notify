import { Rate } from './amber';

interface PriceTime {
  time: number;
  price: number;
}

export interface ChargeMonitorSettings {
  maxPrice: number;
  stateOfCharge: number;
  expireAt?: number;
}

export interface ChargeMonitorLastUpdate {
  lowestPrices: Rate[];
  priceMax: number;
  currentPrice: Rate;
  cutoff: number;
  settings: ChargeMonitorSettings;
  charge: boolean;
  predictedStateOfCharge: number;
  predictedAveragePrice: number;
  isPluggedIn: boolean;
  chargingTimes: PriceTime[];
}
