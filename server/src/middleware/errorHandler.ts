import { NextFunction, Request, Response } from 'express';
import { error } from 'console';
import logger from '../pino';
import { CONFIG_ENVIRONMENT } from '../utils/config';
import { CustomError } from '../utils/errors';

export const errorResponseMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof CustomError) {
    /* istanbul ignore next */
    logger.info(
      {
        errorMessage: err.message,
      },
      'Error handled',
    );
    res.status(err.status).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  } else {
    /* istanbul ignore if */
    if (CONFIG_ENVIRONMENT !== 'test') {
      error(err);
    }
    /* istanbul ignore next */
    logger.error(
      {
        errorMessage: err instanceof Error ? err.message : '',
        stack: err.stack,
      },
      'Unexpected error occurred',
    ); // More detailed logging
    res.status(500).json({
      message:
        'Unexpected error occurred: ' +
        /* istanbul ignore next */
        (err instanceof Error ? err.message : ''),
      errorCode: 3000,
    });
  }
};
