import express, { Express, Request, Response, json } from 'express';

import { CONFIG_ENVIRONMENT, CONFIG_PORT } from './utils/config';
import { errorResponseMiddleware } from './middleware/errorHandler';
import { commonHeadersMiddleware } from './middleware/commonHeaders';
import logger from './pino';
import { getUpcomingRates } from './apis/amber';
import { ChargeMonitor } from './monitors/chargeMonitor';

const chargeMonitor = new ChargeMonitor();

export const app: Express = express();
app.use(json());
app.use(commonHeadersMiddleware);

// Health check endpoint
app.get('/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

app.get('/amber/rates', async (_req: Request, res: Response) => {
  res.json({ result: await getUpcomingRates() });
});

app.use(errorResponseMiddleware);

chargeMonitor.monitor();
/* istanbul ignore next */
if (CONFIG_ENVIRONMENT !== 'test') {
  app.listen(CONFIG_PORT, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${CONFIG_PORT}`);
  });
}
