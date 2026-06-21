import { subDays, formatISO } from 'date-fns';
import type { DashboardFilterFormValues, DashboardFilters } from './types';

export function defaultFilterValues(): DashboardFilterFormValues {
  const now = new Date();
  return {
    fromDate: toDateInputValue(subDays(now, 7)),
    toDate: toDateInputValue(now),
    severity: '',
    status: '',
    deviceId: '',
    errorCode: '',
    province: '',
  };
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toDashboardFilters(values: DashboardFilterFormValues): DashboardFilters {
  return {
    from_time: values.fromDate ? formatISO(new Date(`${values.fromDate}T00:00:00`)) : undefined,
    to_time: values.toDate ? formatISO(new Date(`${values.toDate}T23:59:59`)) : undefined,
    severity: values.severity ? [values.severity] : undefined,
    status: values.status ? [values.status] : undefined,
    device_id: splitCsv(values.deviceId),
    error_code: splitCsv(values.errorCode),
    province: splitCsv(values.province),
  };
}
