import { NextFunction, Request, Response } from 'express';

export const commonHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.method === 'OPTIONS') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
};
