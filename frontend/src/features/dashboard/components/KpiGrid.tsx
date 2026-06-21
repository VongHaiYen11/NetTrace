import { AlertTriangle, MoreHorizontal, RadioTower, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { StateBlock } from '../../../components/shared/StateBlock';
import type { SummaryResult } from '../../../services/generated/nettrace-api';

interface KpiGridProps {
  data?: SummaryResult;
  isLoading: boolean;
  isError: boolean;
}

const cards = [
  {
    key: 'totalAlarms',
    label: 'Số lượng cảnh báo',
    icon: RadioTower,
    border: 'border-[#ff2d85]/70',
    iconBg: 'bg-[#ff2d85]/20',
    tone: 'text-[#ff2d85]',
    delta: '↑ 12.5% so với giờ trước',
  },
  {
    key: 'affectedDevices',
    label: 'Thiết bị bị ảnh hưởng',
    icon: TrendingUp,
    border: 'border-[#00f5d4]/70',
    iconBg: 'bg-[#00f5d4]/15',
    tone: 'text-[#00f5d4]',
    delta: '↑ 4.2% so với giờ trước',
  },
  {
    key: 'criticalAlarms',
    label: 'Trạng thái hiện tại',
    icon: AlertTriangle,
    border: 'border-[#f8e231]/70',
    iconBg: 'bg-[#f8e231]/15',
    tone: 'text-[#f8e231]',
    delta: 'ⓘ phát hiện cảnh báo nghiêm trọng',
  },
] as const;

export function KpiGrid({ data, isLoading, isError }: KpiGridProps) {
  if (isLoading) {
    return <StateBlock state="loading" title="Đang tải tổng quan" />;
  }

  if (isError || !data) {
    return (
      <StateBlock
        state="error"
        title="Không có dữ liệu tổng quan"
        description="Backend chưa trả về dữ liệu KPI cho bộ lọc hiện tại."
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-label="Tổng quan KPI">
      {cards.map((card) => {
        const Icon = card.icon;
        const value =
          card.key === 'criticalAlarms' && data.criticalAlarms > 0
            ? 'Cảnh báo'
            : data[card.key].toLocaleString();
        return (
          <Card key={card.key} className={card.border}>
            <CardContent className="min-h-[136px] pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-[#a69db6]">{card.label}</p>
                  <p className={card.key === 'criticalAlarms' ? 'mt-3 text-3xl font-black tabular-nums text-[#f8e231] drop-shadow-[0_0_10px_rgba(248,226,49,0.45)]' : 'mt-3 text-3xl font-black tabular-nums text-[#f3edff]'}>
                    {value}
                  </p>
                  <p className="mt-4 text-sm text-[#a69db6]">
                    <span className={card.key === 'criticalAlarms' ? 'font-semibold text-[#f8e231]' : 'font-semibold text-[#00f5d4]'}>
                      {card.delta.split(' ').slice(0, 2).join(' ')}
                    </span>{' '}
                    {card.delta.split(' ').slice(2).join(' ')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MoreHorizontal className="text-[#a69db6]" size={20} />
                  <span className={`flex h-10 w-10 items-center justify-center rounded ${card.iconBg}`}>
                    <Icon className={card.tone} size={20} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
