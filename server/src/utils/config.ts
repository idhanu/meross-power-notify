import exp from 'constants';
import dotenv from 'dotenv';

type ENVIRONMENTS = 'local' | 'test' | 'prod';

dotenv.config({ path: '../.env' });
export const CONFIG_PORT = process.env.PORT;
export const CONFIG_ENVIRONMENT: ENVIRONMENTS = (process.env.ENV as ENVIRONMENTS) || 'local';
export const AMBER_API_KEY = process.env.AMBER_API_KEY;
