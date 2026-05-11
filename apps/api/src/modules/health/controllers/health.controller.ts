import { Request, Response, NextFunction } from 'express';
import { getHealthStatus } from '../services/health.service';

export class HealthController {
  static async check(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await getHealthStatus();
      return res.status(health.status === 'ok' ? 200 : 503).json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }
}
