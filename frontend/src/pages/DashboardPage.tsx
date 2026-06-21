import { useState, useMemo } from 'react';
import { PenLine } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DashboardWidget } from '../features/dashboard/components/DashboardWidget';
import {
  WidgetSettingsDrawer,
  type WidgetSettingsValues,
} from '../features/dashboard/components/WidgetSettingsDrawer';

type WidgetType =
  | 'kpi-count'
  | 'kpi-devices'
  | 'kpi-status'
  | 'chart-trend'
  | 'chart-severity'
  | 'chart-weekly'
  | 'chart-heatmap'
  | 'table-alarms';

interface WidgetConfig extends WidgetSettingsValues {
  id: string;
  title: string;
  type: WidgetType;
}

export function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    {
      id: 'kpi-1',
      type: 'kpi-count',
      title: 'Số lượng cảnh báo',
      chartType: 'line',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'kpi-2',
      type: 'kpi-devices',
      title: 'Thiết bị bị ảnh hưởng',
      chartType: 'bar',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'kpi-3',
      type: 'kpi-status',
      title: 'Trạng thái hiện tại',
      chartType: 'pie',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'chart-1',
      type: 'chart-trend',
      title: 'Cảnh báo theo ngày',
      chartType: 'line',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'chart-2',
      type: 'chart-severity',
      title: 'Phân bố mức độ',
      chartType: 'pie',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'chart-3',
      type: 'chart-weekly',
      title: 'Cảnh báo (tuần này)',
      chartType: 'bar',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'chart-4',
      type: 'chart-heatmap',
      title: 'Bản đồ nhiệt',
      chartType: 'heatmap',
      info1: true,
      info2: true,
      info3: false,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
    {
      id: 'table-1',
      type: 'table-alarms',
      title: 'Danh sách cảnh báo',
      chartType: 'table',
      info1: true,
      info2: true,
      info3: true,
      preset: 'Active Connections',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    },
  ]);

  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);

  const activeWidget = useMemo(() => {
    return widgets.find((w) => w.id === activeWidgetId);
  }, [widgets, activeWidgetId]);

  function handleApplySettings(newValues: WidgetSettingsValues) {
    if (!activeWidgetId) return;
    setWidgets((prev) =>
      prev.map((w) => (w.id === activeWidgetId ? { ...w, ...newValues } : w))
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mt-3 text-5xl font-black leading-tight sm:text-6xl">
            Bảng điều khiển <span className="text-[#00f5d4]">cảnh báo</span>
          </h1>
        </div>
        <Button variant="secondary" className="h-12 px-5 font-mono font-bold">
          <PenLine size={18} />
          Chọn mẫu
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {widgets
          .filter((w) => w.type.startsWith('kpi'))
          .map((w) => (
            <DashboardWidget
              key={w.id}
              id={w.id}
              config={w}
              onSettingsClick={() => setActiveWidgetId(w.id)}
            />
          ))}
      </div>

      {/* Daily Trend & Severity Charts */}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          {widgets
            .filter((w) => w.id === 'chart-1')
            .map((w) => (
              <DashboardWidget
                key={w.id}
                id={w.id}
                config={w}
                onSettingsClick={() => setActiveWidgetId(w.id)}
              />
            ))}
        </div>
        <div className="xl:col-span-2">
          {widgets
            .filter((w) => w.id === 'chart-2')
            .map((w) => (
              <DashboardWidget
                key={w.id}
                id={w.id}
                config={w}
                onSettingsClick={() => setActiveWidgetId(w.id)}
              />
            ))}
        </div>
      </div>

      {/* Weekly Trend & Heatmap Charts */}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          {widgets
            .filter((w) => w.id === 'chart-3')
            .map((w) => (
              <DashboardWidget
                key={w.id}
                id={w.id}
                config={w}
                onSettingsClick={() => setActiveWidgetId(w.id)}
              />
            ))}
        </div>
        <div className="xl:col-span-3">
          {widgets
            .filter((w) => w.id === 'chart-4')
            .map((w) => (
              <DashboardWidget
                key={w.id}
                id={w.id}
                config={w}
                onSettingsClick={() => setActiveWidgetId(w.id)}
              />
            ))}
        </div>
      </div>

      {/* Alarms List Table */}
      {widgets
        .filter((w) => w.id === 'table-1')
        .map((w) => (
          <DashboardWidget
            key={w.id}
            id={w.id}
            config={w}
            onSettingsClick={() => setActiveWidgetId(w.id)}
          />
        ))}

      {/* Settings Drawer */}
      {activeWidget && (
        <WidgetSettingsDrawer
          isOpen={activeWidgetId !== null}
          onClose={() => setActiveWidgetId(null)}
          onApply={handleApplySettings}
          initialValues={activeWidget}
          widgetTitle={activeWidget.title}
          widgetKind={activeWidget.type}
        />
      )}
    </div>
  );
}
