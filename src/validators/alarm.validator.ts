import { z } from 'zod';

const DateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

// Whitelists
const SORT_BY_WHITELIST = ['timestamp', 'severity', 'status'] as const;
const SORT_ORDER_WHITELIST = ['asc', 'desc'] as const;
const TS_COUNT_INTERVAL = ['hour', 'day'] as const;
const TS_DURATION_INTERVAL = ['day', 'month', 'year'] as const;
const TOP_N_BY = ['device', 'error_code'] as const;
const RATIO_BY = ['severity', 'type', 'station', 'site', 'region'] as const;

// Time range verification logic
export function validateTimeRange(fromStr?: string, toStr?: string) {
  const now = new Date();
  const to = toStr ? new Date(toStr) : now;
  const from = fromStr ? new Date(fromStr) : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (from.getTime() > to.getTime()) {
    return {
      isValid: false,
      code: 'INVALID_TIME_RANGE',
      message: 'from_time must be earlier than to_time',
    };
  }

  const diffMs = to.getTime() - from.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 90) {
    return {
      isValid: false,
      code: 'TIME_RANGE_EXCEEDED',
      message: 'Time range cannot exceed 90 days',
    };
  }

  return {
    isValid: true,
    from,
    to,
  };
}

// 1. Schema for Detail Queries (Keyset Pagination)
export const QueryAlarmsSchema = z.object({
  from_time: DateStringSchema.optional(),
  to_time: DateStringSchema.optional(),
  cursor_time: DateStringSchema.optional(),
  cursor_id: z.string().optional(),
  limit: z.preprocess(
    (val) => (val === undefined ? 100 : Number(val)),
    z.number().int().min(1).max(1000).default(100),
  ),
  severity: z.string().optional(),
  status: z.string().optional(),
  device_id: z.string().optional(),
  error_code: z.string().optional(),
  sort_by: z.enum(SORT_BY_WHITELIST).default('timestamp'),
  sort_order: z.enum(SORT_ORDER_WHITELIST).default('desc'),
});

// 2. Schema for Time Series Count Analytics
export const TimeSeriesCountSchema = z.object({
  from_time: DateStringSchema.optional(),
  to_time: DateStringSchema.optional(),
  interval: z.enum(TS_COUNT_INTERVAL).default('hour'),
  severity: z.string().optional(),
  status: z.string().optional(),
  device_id: z.string().optional(),
});

// 3. Schema for Time Series Duration Analytics
export const TimeSeriesDurationSchema = z.object({
  from_time: DateStringSchema.optional(),
  to_time: DateStringSchema.optional(),
  interval: z.enum(TS_DURATION_INTERVAL).default('day'),
  severity: z.string().optional(),
  status: z.string().optional(),
  device_id: z.string().optional(),
});

// 4. Schema for Top-N Analytics
export const TopNSchema = z.object({
  from_time: DateStringSchema.optional(),
  to_time: DateStringSchema.optional(),
  by: z.enum(TOP_N_BY).default('device'),
  n: z.preprocess(
    (val) => (val === undefined ? 10 : Number(val)),
    z.number().int().min(1).max(1000).default(10),
  ),
});

// 5. Schema for Ratio Analytics
export const RatioSchema = z.object({
  from_time: DateStringSchema.optional(),
  to_time: DateStringSchema.optional(),
  by: z.enum(RATIO_BY).default('severity'),
});
