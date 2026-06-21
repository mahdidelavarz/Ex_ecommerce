// src/modules/settings/setting.service.ts
import { AppDataSource } from '../../config/database';
import { AppSetting } from '../../database/entities/app-setting.entity';

const DEFAULTS: Record<string, { value: string; label: string }> = {
  shipping_cost: { value: '50000', label: 'هزینه ارسال (تومان)' },
};

export class SettingService {
  private repo = AppDataSource.getRepository(AppSetting);

  async list(): Promise<AppSetting[]> {
    const rows = await this.repo.find({ order: { key: 'ASC' } });
    // Merge in any keys that don't yet have a DB row
    const existing = new Set(rows.map((r) => r.key));
    for (const [key, def] of Object.entries(DEFAULTS)) {
      if (!existing.has(key)) {
        rows.push(this.repo.create({ key, value: def.value, label: def.label }));
      }
    }
    return rows;
  }

  async getByKey(key: string): Promise<{ key: string; value: string; label: string }> {
    const row = await this.repo.findOne({ where: { key } });
    if (row) return row;
    const def = DEFAULTS[key];
    return { key, value: def?.value ?? '', label: def?.label ?? key };
  }

  async upsert(key: string, value: string): Promise<AppSetting> {
    const def = DEFAULTS[key];
    await this.repo.upsert(
      { key, value, label: def?.label ?? key },
      { conflictPaths: ['key'] }
    );
    return this.repo.findOneOrFail({ where: { key } });
  }
}
