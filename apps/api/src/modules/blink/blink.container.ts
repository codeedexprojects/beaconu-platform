import { BlinkController } from './blink.controller';
import { BlinkService } from './blink.service';
import { BlinkRepository } from './blink.repository';

export const BlinkModule = {
  Controller: BlinkController,
  Service: BlinkService,
  Repository: BlinkRepository,
};
