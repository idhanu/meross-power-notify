import axios from 'axios';

const baseURL = 'http://0.0.0.0:22001';
export const setMerossPlug = async (deviceName: string, on: boolean) => {
  const res = await axios.post<{ results: { on: boolean } }>('/api/meross/plug', { on, name: deviceName }, { baseURL });
  return res.data.results;
};
