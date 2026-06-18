// src/modules/shipments/components/ShipmentTimeline.tsx
'use client';

import { MdiOpenInNew, MdiTruckDelivery } from '@/components/icons/Icons';
import type { Shipment } from '../types/shipment.types';
import { shipmentStatusLabels, shipmentStatusColors } from '../types/shipment.types';

interface ShipmentTimelineProps {
  shipments: Shipment[];
}

export default function ShipmentTimeline({ shipments }: ShipmentTimelineProps) {
  if (!shipments || shipments.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-4">هنوز اطلاعات ارسالی ثبت نشده است</p>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="bg-surface-raised rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MdiTruckDelivery className="w-5 h-5 text-primary" />
              <span className="font-medium text-text-primary">{shipment.courier_name}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${shipmentStatusColors[shipment.status]}`}>
              {shipmentStatusLabels[shipment.status]}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">کد پیگیری:</span>
              <code className="font-mono text-text-primary bg-surface px-2 py-0.5 rounded">
                {shipment.tracking_number}
              </code>
            </div>

            {shipment.shipped_at && (
              <div className="flex justify-between">
                <span className="text-text-muted">تاریخ ارسال:</span>
                <span className="text-text-secondary">
                  {new Date(shipment.shipped_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            )}

            {shipment.delivered_at && (
              <div className="flex justify-between">
                <span className="text-text-muted">تاریخ تحویل:</span>
                <span className="text-success">
                  {new Date(shipment.delivered_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            )}

            {shipment.estimated_delivery_at && (
              <div className="flex justify-between">
                <span className="text-text-muted">تحویل تخمینی:</span>
                <span className="text-text-secondary">
                  {new Date(shipment.estimated_delivery_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            )}
          </div>

          {shipment.tracking_url && (
            <a
              href={shipment.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-primary hover:text-primary-hover text-sm font-medium transition-colors"
            >
              <MdiOpenInNew className="w-4 h-4" />
              پیگیری مرسوله
            </a>
          )}

          {shipment.notes && (
            <p className="mt-3 text-sm text-text-muted bg-surface p-2 rounded">{shipment.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}