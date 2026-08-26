import { Request, Response, NextFunction } from 'express';

const UNRELIABLE_MODE = process.env.UNRELIABLE_MODE !== 'false'; // Enabled for testing race conditions

export const unreliableMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!UNRELIABLE_MODE) {
    return next();
  }

  const delay = Math.floor(Math.random() * (1800 - 100 + 1) + 100);
  
  setTimeout(() => {
    // 10% chance of random 500
    if (Math.random() < 0.1) {
      return res.status(500).json({ error: 'SIMULATED_500', message: 'Simulated random server error' });
    }
    next();
  }, delay);
};
