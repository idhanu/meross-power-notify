import express, { Express, Request, Response, json } from 'express';

import { CONFIG_ENVIRONMENT, CONFIG_PORT } from './utils/config';
import { errorResponseMiddleware } from './middleware/errorHandler';
import { commonHeadersMiddleware } from './middleware/commonHeaders';
import logger from './pino';

export const app: Express = express();
app.use(json());
app.use(commonHeadersMiddleware);

// Health check endpoint
app.get('/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

app.use(errorResponseMiddleware);

/* istanbul ignore next */
if (CONFIG_ENVIRONMENT !== 'test') {
  app.listen(CONFIG_PORT, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${CONFIG_PORT}`);
  });
}
