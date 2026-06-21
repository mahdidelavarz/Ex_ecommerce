// src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import { useAdminSettings, useUpdateSetting } from '@/modules/settings/hooks/useSettings';
import { SvgSpinnersRingResize } from '@/components/icons/Icons';
import type { AppSetting } from '@/modules/settings/services/setting.service';

export default function AdminSettingsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      settings.forEach((s) => { initial[s.key] = s.value; });
      setValues(initial);
      setDirty({});
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = (setting: AppSetting) => {
    updateSetting.mutate(
      { key: setting.key, value: values[setting.key] ?? setting.value },
      { onSuccess: () => setDirty((prev) => ({ ...prev, [setting.key]: false })) }
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">تنظیمات فروشگاه</h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <SvgSpinnersRingResize className="text-primary" width={48} />
            </div>
          ) : (
            <div className="space-y-4">
              {settings?.map((setting) => (
                <div key={setting.key} className="bg-surface rounded-card shadow-card p-6">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {setting.label}
                  </label>
                  <p className="text-xs text-text-muted mb-3 font-mono">{setting.key}</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={values[setting.key] ?? setting.value}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="flex-1 px-4 py-2 border border-border rounded-input text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting)}
                      disabled={!dirty[setting.key]}
                      loading={updateSetting.isPending}
                    >
                      ذخیره
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
