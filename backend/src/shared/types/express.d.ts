// src/shared/types/express.d.ts
import { User } from '../../database/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      requestId?: string;
      startTime?: number;
    }
  }
}

// این خط مهمه - حتماً باشه
export {};