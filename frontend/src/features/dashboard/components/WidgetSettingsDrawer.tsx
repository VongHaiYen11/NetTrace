import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, TrendingUp, BarChart3, PieChart, Table, Grid, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Field, Input, Select } from '../../../components/ui/Field';

export type WidgetKind =
  | 'kpi-count'
  | 'kpi-devices'
  | 'kpi-status'
  | 'chart-trend'
  | 'chart-severity'
  | 'chart-weekly'
  | 'chart-heatmap'
  | 'table-alarms';

export interface WidgetSettingsValues {
  chartType: 'line' | 'bar' | 'pie' | 'table' | 'heatmap';
  info1: boolean;
  info2: boolean;
  info3: boolean;
  preset: string;
  startDate: string;
  endDate: string;
}

interface WidgetSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (values: WidgetSettingsValues) => void;
  initialValues: WidgetSettingsValues;
  widgetTitle: string;
  widgetKind: WidgetKind;
}

export function WidgetSettingsDrawer({
  isOpen,
  onClose,
  onApply,
  initialValues,
  widgetTitle,
  widgetKind,
}: WidgetSettingsDrawerProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<WidgetSettingsValues>({
    defaultValues: initialValues,
  });

  const selectedChartType = watch('chartType');
  const info1 = watch('info1');
  const info2 = watch('info2');
  const info3 = watch('info3');

  // Reset form when active widget changes or drawer opens
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset, isOpen]);

  if (!isOpen) return null;

  function onSubmit(values: WidgetSettingsValues) {
    onApply(values);
    onClose();
  }

  const isKpiWidget = widgetKind.startsWith('kpi');
  const isTableWidget = widgetKind === 'table-alarms';

  const chartTypesByWidget: Record<WidgetKind, Array<{ id: WidgetSettingsValues['chartType']; label: string; icon: typeof TrendingUp }>> = {
    'kpi-count': [],
    'kpi-devices': [],
    'kpi-status': [],
    'chart-trend': [
      { id: 'line', label: 'ĐƯỜNG', icon: TrendingUp },
      { id: 'bar', label: 'CỘT', icon: BarChart3 },
    ],
    'chart-severity': [
      { id: 'pie', label: 'TRÒN', icon: PieChart },
      { id: 'bar', label: 'CỘT', icon: BarChart3 },
    ],
    'chart-weekly': [
      { id: 'bar', label: 'CỘT', icon: BarChart3 },
      { id: 'line', label: 'ĐƯỜNG', icon: TrendingUp },
    ],
    'chart-heatmap': [{ id: 'heatmap', label: 'BẢN ĐỒ NHIỆT', icon: Grid }],
    'table-alarms': [{ id: 'table', label: 'BẢNG', icon: Table }],
  };

  const infoOptionsByWidget: Record<WidgetKind, Array<{ name: 'info1' | 'info2' | 'info3'; label: string; checked: boolean }>> = {
    'kpi-count': [
      { name: 'info1', label: 'Hiển thị trạng thái mở / đóng', checked: info1 },
      { name: 'info2', label: 'Hiển thị biểu tượng', checked: info2 },
    ],
    'kpi-devices': [
      { name: 'info1', label: 'Hiển thị mô tả thiết bị duy nhất', checked: info1 },
      { name: 'info2', label: 'Hiển thị biểu tượng', checked: info2 },
    ],
    'kpi-status': [
      { name: 'info1', label: 'Hiển thị số cảnh báo nghiêm trọng', checked: info1 },
      { name: 'info2', label: 'Hiển thị biểu tượng', checked: info2 },
    ],
    'chart-trend': [
      { name: 'info1', label: 'Hiển thị lưới nền', checked: info1 },
      { name: 'info2', label: 'Hiển thị trục giá trị', checked: info2 },
      { name: 'info3', label: 'Hiển thị tooltip khi hover', checked: info3 },
    ],
    'chart-severity': [
      { name: 'info1', label: 'Hiển thị tooltip khi hover', checked: info1 },
    ],
    'chart-weekly': [
      { name: 'info1', label: 'Hiển thị lưới nền', checked: info1 },
      { name: 'info2', label: 'Hiển thị trục giá trị', checked: info2 },
      { name: 'info3', label: 'Hiển thị tooltip khi hover', checked: info3 },
    ],
    'chart-heatmap': [
      { name: 'info1', label: 'Hiển thị tooltip khi hover', checked: info1 },
      { name: 'info2', label: 'Hiển thị nhãn thời gian / ngày', checked: info2 },
    ],
    'table-alarms': [
      { name: 'info1', label: 'Cột thời gian', checked: info1 },
      { name: 'info2', label: 'Cột mã lỗi', checked: info2 },
      { name: 'info3', label: 'Cột trạng thái', checked: info3 },
    ],
  };

  const chartTypes = chartTypesByWidget[widgetKind];
  const infoOptions = infoOptionsByWidget[widgetKind];

  return (
    <>
      {/* Backdrop Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed top-0 right-0 h-full w-[360px] bg-[#0c0b14] border-l border-white/10 z-50 shadow-2xl flex flex-col justify-between overflow-y-auto text-[#f3edff]">
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#ff2d85]">Cấu hình tiện ích</h2>
              <p className="text-xs text-[#a69db6] mt-1 font-mono">{widgetTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#a69db6] hover:text-[#f3edff] transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {!isKpiWidget && chartTypes.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#00f5d4]">
                  Loại biểu đồ
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {chartTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedChartType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setValue('chartType', type.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded border transition ${
                          isSelected
                            ? 'border-[#ff2d85] bg-[#ff2d85]/10 shadow-[0_0_15px_rgba(255,45,133,0.3)] text-[#ff2d85]'
                            : 'border-white/10 bg-[#151421] text-[#a69db6] hover:border-white/20 hover:text-[#f3edff]'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="mt-2 font-mono text-[10px] font-bold tracking-wider">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Information Card Checkboxes */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#00f5d4]">
                {isKpiWidget ? 'Thông tin hiển thị' : 'Thông tin phù hợp'}
              </span>
              <div className="flex flex-col gap-2.5">
                {infoOptions.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setValue(item.name, !item.checked)}
                    className={`flex items-center justify-between p-3 rounded border transition ${
                      item.checked
                        ? 'border-[#00f5d4]/40 bg-[#00f5d4]/5 text-[#f3edff]'
                        : 'border-white/10 bg-[#151421] text-[#a69db6]'
                    }`}
                  >
                    <span className="text-sm font-mono">{item.label}</span>
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center transition ${
                        item.checked
                          ? 'bg-[#00f5d4] text-[#0c0b14]'
                          : 'border border-white/20 bg-transparent'
                      }`}
                    >
                      {item.checked && <Check size={14} strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!isKpiWidget ? (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#00f5d4]">
                  Khoảng thời gian
                </span>
                <Field label="Ngày bắt đầu">
                  <Input type="date" {...register('startDate')} />
                </Field>
                <Field label="Ngày kết thúc">
                  <Input type="date" {...register('endDate')} />
                </Field>
              </div>
            ) : null}

            {/* Footer Action */}
            <div className="pt-4 border-t border-white/10 mt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#ff2d85] to-[#e11d48] text-white hover:opacity-90 font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(255,45,133,0.4)]"
              >
                Áp dụng thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
