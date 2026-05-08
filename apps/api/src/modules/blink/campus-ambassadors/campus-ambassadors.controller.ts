import { Request, Response, NextFunction } from 'express';
import { BlinkService } from '../blink.service';
import { blinkSchemas } from '../blink.schema';
import { ApiResponse } from '@/shared/responses/api-response';

export class CampusAmbassadorsController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = blinkSchemas.registerCampusAmbassador.parse(req.body);
      const result = await BlinkService.registerCampusAmbassador(data, req.userId!);

      return res.status(201).json(
        ApiResponse.success('Campus ambassador created successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}
