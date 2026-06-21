import type { CommonFilters } from '../../services/generated/nettrace-api';

export interface DashboardFilterFormValues {
  fromDate: string;
  toDate: string;
  severity: string;
  status: string;
  deviceId: string;
  errorCode: string;
  province: string;
}

export type DashboardFilters = CommonFilters;
