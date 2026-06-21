import { PenLine } from 'lucide-react';
import { KpiGrid } from '../features/dashboard/components/KpiGrid';
import { AnalyticsCharts, WeeklyAlarmChart } from '../features/dashboard/components/AnalyticsCharts';
import { WeekdayHeatmap } from '../features/dashboard/components/WeekdayHeatmap';
import { AlarmTable } from '../features/dashboard/components/AlarmTable';
import { Button } from '../components/ui/Button';
import {
  mockAlarms,
  mockHeatmap,
  mockSeverityDistribution,
  mockSummary,
  mockWeeklyTrend,
  mockYearlyTrend,
} from '../features/dashboard/mock-dashboard-data';

export function DashboardPage() {
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

      <KpiGrid
        data={mockSummary}
        isLoading={false}
        isError={false}
      />

      <AnalyticsCharts
        trend={mockYearlyTrend}
        severity={mockSeverityDistribution}
        isTrendLoading={false}
        isSeverityLoading={false}
        isTrendError={false}
        isSeverityError={false}
      />

      <section className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <WeeklyAlarmChart
            trend={mockWeeklyTrend}
            isLoading={false}
            isError={false}
          />
        </div>
        <div className="xl:col-span-3">
          <WeekdayHeatmap
            data={mockHeatmap}
            isLoading={false}
            isError={false}
          />
        </div>
      </section>

      <AlarmTable
        data={mockAlarms}
        isLoading={false}
        isError={false}
      />
    </div>
  );
}
