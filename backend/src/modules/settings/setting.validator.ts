// src/modules/settings/setting.validator.ts
import { z } from 'zod';

export const upsertSettingSchema = z.object({
  value: z.string().min(1, 'مقدار نمی‌تواند خالی باشد'),
});
