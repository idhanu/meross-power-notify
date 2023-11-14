import axios from 'axios';

const baseURL = 'http://0.0.0.0:22001';
export const setMerossPlug = async (deviceName: string, on: boolean) => {
  const res = await axios.post<{ results: { on: boolean } }>('/api/meross/plug', { on, name: deviceName }, { baseURL });
  return res.data.results;
};

export interface PlugPowerConsumption {
  power: number;
  current: number;
  voltage: number;
}

export const getMerossPlug = async (deviceName: string) => {
  const res = await axios.get<{ result: PlugPowerConsumption }>('/api/meross/plug', {
    baseURL,
    params: { name: deviceName },
  });
  return res.data.result;
};
