// src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminPage from '@/components/layout/AdminPage';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { useAdminSettings, useUpdateSetting } from '@/modules/settings/hooks/useSettings';
import { MdiCog, MdiCheck, SvgSpinnersRingResize } from '@/components/icons/Icons';
import type { AppSetting } from '@/modules/settings/services/setting.service';

export default function AdminSettingsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

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
    setSavingKey(setting.key);
    updateSetting.mutate(
      { key: setting.key, value: values[setting.key] ?? setting.value },
      {
        onSuccess: () => setDirty((prev) => ({ ...prev, [setting.key]: false })),
        onSettled: () => setSavingKey(null),
      }
    );
  };

  return (
    <AdminPage
      maxWidth="3xl"
      loading={isAuthLoading}
      header={<PageHeader title="تنظیمات فروشگاه" subtitle="پیکربندی عمومی فروشگاه" icon={MdiCog} />}
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <SvgSpinnersRingResize className="text-primary" width={48} />
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {settings?.map((setting) => {
              const isDirty = !!dirty[setting.key];
              return (
                <div
                  key={setting.key}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5"
                >
                  <div className="sm:w-56 shrink-0">
                    <p className="text-sm font-medium text-text-primary">{setting.label}</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5">{setting.key}</p>
                  </div>
                  <Input
                    wrapperClassName="flex-1"
                    type="text"
                    value={values[setting.key] ?? setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant={isDirty ? 'primary' : 'outline'}
                    icon={MdiCheck}
                    onClick={() => handleSave(setting)}
                    disabled={!isDirty}
                    loading={savingKey === setting.key}
                    className="shrink-0"
                  >
                    ذخیره
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </AdminPage>
  );
}
