import { NextFunction, Request, Response } from 'express';

export const commonHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
};
