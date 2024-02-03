import express, { Express, Request, Response, json } from 'express';

import { CONFIG_ENVIRONMENT, CONFIG_PORT } from './utils/config';
import { errorResponseMiddleware } from './middleware/errorHandler';
import { commonHeadersMiddleware } from './middleware/commonHeaders';
import logger from './pino';
import { getUpcomingRates } from './apis/amber';
// import { ChargeMonitor } from './monitors/chargeMonitor';
import path from 'path';
import { readFile } from 'fs/promises';
import { WashingMachineMonitor } from './monitors/washingMachineMonitor';

// const chargeMonitor = new ChargeMonitor();
const washingMachineMonitor = new WashingMachineMonitor();

export const app: Express = express();
app.use(json());
app.use(commonHeadersMiddleware);

app.use('/', express.static(path.join(__dirname, '../../home-dashboard/dist')));

// Health check endpoint
app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

app.get('/api/amber/rates', async (_req: Request, res: Response) => {
  res.json({ result: await getUpcomingRates() });
});

// app.post('/api/ev/settings', async (req: Request, res: Response) => {
//   chargeMonitor.updateOverrideSettings(req.body);

//   res.json({ result: null });
// });

// app.get('/api/ev/last_update', async (req: Request, res: Response) => {
//   res.json({ result: chargeMonitor.getLastUpdate() });
// });

// app.get('/api/ev/settings', async (_req: Request, res: Response) => {
//   res.json({ result: chargeMonitor.getSettings() });
// });

app.get('/api/logs', async (_req: Request, res: Response) => {
  const file = await readFile(path.join(__dirname, '../../logs.log'), { flag: 'r' });
  const lines = file.toString().split('\n');
  res.json({ result: lines.slice(Math.max(lines.length - 20, 0)) });
});

app.use(errorResponseMiddleware);

// chargeMonitor.monitor();
washingMachineMonitor.monitor();
/* istanbul ignore next */
if (CONFIG_ENVIRONMENT !== 'test') {
  app.listen(CONFIG_PORT, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${CONFIG_PORT}`);
  });
}
