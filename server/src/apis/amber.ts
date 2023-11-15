import axios from 'axios';
import { AMBER_API_KEY } from '../utils/config';
import logger from '../pino';
import { AmberRate } from '../models/amber';

// Set the base API endpoint URL
const amberBaseUrl = 'https://api.amber.com.au/v1';
// Define the specific endpoint for prices
const sitesEndpoint = '/sites/01FWZA56KHW0TTQNA8478MT5J1/prices/current?resolution=30&next=48';


export const getUpcomingRates = async () => {
  const url = `${amberBaseUrl}${sitesEndpoint}`;
  const headers = {
    Authorization: `Bearer ${AMBER_API_KEY}`,
    Accept: 'application/json',
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      // Parse the JSON response
      const data = response.data as AmberRate[];
      return data.map((rate) => ({
        ...rate,
        startTimestamp: new Date(rate.startTime).getTime(),
        endTimestamp: new Date(rate.endTime).getTime(),
      }));
    } else {
      throw new Error(`Request failed with status code: ${response.status} ${response.data} x`);
    }
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
