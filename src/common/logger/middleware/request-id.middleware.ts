import { Request, Response, NextFunction } from 'express';

export interface RequestWithId extends Request {
  requestId: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  req.requestId = generateRequestId();
  next();
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10);
}
