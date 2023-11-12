import { NextFunction, Request, Response } from 'express';

export const commonHeadersMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
};
