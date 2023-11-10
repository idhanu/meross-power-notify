import dotenv from 'dotenv';

type ENVIRONMENTS = 'local' | 'test' | 'prod';

dotenv.config({ path: '../.env' });
export const CONFIG_PORT = process.env.PORT;
export const CONFIG_ENVIRONMENT: ENVIRONMENTS = (process.env.ENV as ENVIRONMENTS) || 'local';
