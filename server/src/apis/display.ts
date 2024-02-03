import axios from 'axios';

const getBaseUrl = (displayHost: string) => `http://${displayHost}.local`;

export interface LedDisplayResult {
  success: true;
}

export interface LedDisplayShowNotification {
  id: string;
  imageData: number[];
  brightness: number;
  blink: boolean;
}

export interface LedDisplayShowParams {
  notifications: LedDisplayShowNotification[];
}

export const showNotifications = async (displayHost: string, notifications: LedDisplayShowParams) => {
  const res = await axios.post<LedDisplayResult>('/show', notifications, { baseURL: getBaseUrl(displayHost) });
  return res.data.success;
};

export const addNotifications = async (displayHost: string, notifications: LedDisplayShowParams) => {
  const res = await axios.post<LedDisplayResult>('/add', notifications, { baseURL: getBaseUrl(displayHost) });
  return res.data.success;
};
