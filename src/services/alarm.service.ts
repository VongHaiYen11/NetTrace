import {
  AlarmRepository,
  QueryAlarmsParams,
  TimeSeriesCountParams,
  TimeSeriesDurationParams,
  TopNParams,
  RatioParams,
} from '../repositories/alarm.repository.js';
import { DeviceRepository, DeviceMetadata } from '../repositories/device.repository.js';
import { ErrorRepository, ErrorMetadata } from '../repositories/error.repository.js';

export interface ServiceMetrics {
  clickhouse_query_time_ms: number;
  postgres_query_time_ms: number;
  records_returned: number;
}

export class AlarmService {
  constructor(
    private alarmRepo: AlarmRepository,
    private deviceRepo: DeviceRepository,
    private errorRepo: ErrorRepository,
  ) {}

  /**
   * API 1: Detail Queries (Table View) with Keyset Pagination.
   * 1. Fetch one page of alarm records from ClickHouse using keyset pagination.
   * 2. Extract distinct device_ids and error_codes from the result set.
   * 3. Query Postgres for corresponding metadata.
   * 4. Stitch metadata into the response.
   */
  async queryAlarms(params: QueryAlarmsParams, metrics: ServiceMetrics) {
    // 1. Fetch page from ClickHouse
    const { alarms, total, durationMs: chDuration } = await this.alarmRepo.queryAlarms(params);
    metrics.clickhouse_query_time_ms += chDuration;
    metrics.records_returned += alarms.length;

    if (alarms.length === 0) {
      return { alarms: [], total };
    }

    // 2. Extract distinct device_ids and error_codes
    const deviceIds = [...new Set(alarms.map((a) => a.device_id))];
    const errorCodes = [...new Set(alarms.map((a) => a.error_code))];

    // 3. Query Postgres for corresponding metadata
    const startPg = performance.now();
    const [deviceRes, errorRes] = await Promise.all([
      this.deviceRepo.getDevicesByIds(deviceIds),
      this.errorRepo.getErrorsByCodes(errorCodes),
    ]);
    const pgDuration = Math.round(performance.now() - startPg);
    metrics.postgres_query_time_ms += pgDuration;

    const deviceMap = deviceRes.devices.reduce<Record<string, DeviceMetadata>>((acc, d) => {
      acc[d.device_id] = d;
      return acc;
    }, {});

    const errorMap = errorRes.errors.reduce<Record<string, ErrorMetadata>>((acc, e) => {
      acc[e.error_code] = e;
      return acc;
    }, {});

    // 4. Stitch metadata in service layer
    const enrichedAlarms = alarms.map((alarm) => ({
      alarm_id: alarm.alarm_id,
      error_code: alarm.error_code,
      error_details: errorMap[alarm.error_code] || null,
      device_id: alarm.device_id,
      device_details: deviceMap[alarm.device_id] || null,
      time_created: alarm.time_created,
      time_solved: alarm.time_solved,
      status: alarm.status,
      severity: alarm.severity,
      raw_log: alarm.raw_log,
      description: alarm.description,
    }));

    return { alarms: enrichedAlarms, total };
  }

  /**
   * API 2: Time Series Counts (Line Chart - Volume)
   */
  async getTimeSeriesCount(params: TimeSeriesCountParams, metrics: ServiceMetrics) {
    const { rows, durationMs } = await this.alarmRepo.getTimeSeriesCount(params);
    metrics.clickhouse_query_time_ms += durationMs;
    metrics.records_returned += rows.length;
    return rows;
  }

  /**
   * API 3: Average Resolution Duration (Line Chart - Operational Performance)
   */
  async getTimeSeriesDuration(params: TimeSeriesDurationParams, metrics: ServiceMetrics) {
    const { rows, durationMs } = await this.alarmRepo.getTimeSeriesDuration(params);
    metrics.clickhouse_query_time_ms += durationMs;
    metrics.records_returned += rows.length;
    return rows;
  }

  /**
   * API 4: Repeat Alarms Ranking (Bar Chart - Top-N)
   * Groups alarms by device or error_code. Nodes.js queries Postgres to get labels.
   */
  async getTopNAnalytics(params: TopNParams, metrics: ServiceMetrics) {
    const { rows, durationMs: chDuration } = await this.alarmRepo.getTopN(params);
    metrics.clickhouse_query_time_ms += chDuration;
    metrics.records_returned += rows.length;

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.entity_id);
    const startPg = performance.now();

    if (params.by === 'device') {
      const { devices } = await this.deviceRepo.getDevicesByIds(ids);
      metrics.postgres_query_time_ms += Math.round(performance.now() - startPg);

      const deviceMap = devices.reduce<Record<string, DeviceMetadata>>((acc, d) => {
        acc[d.device_id] = d;
        return acc;
      }, {});

      return rows.map((row) => {
        const dev = deviceMap[row.entity_id];
        const label = dev ? `${dev.name} (${dev.station_name || 'No Station'})` : row.entity_id;
        return {
          device_id: row.entity_id,
          alarm_count: row.alarm_count,
          label,
          device_details: dev || null,
        };
      });
    } else {
      const { errors } = await this.errorRepo.getErrorsByCodes(ids);
      metrics.postgres_query_time_ms += Math.round(performance.now() - startPg);

      const errorMap = errors.reduce<Record<string, ErrorMetadata>>((acc, e) => {
        acc[e.error_code] = e;
        return acc;
      }, {});

      return rows.map((row) => {
        const err = errorMap[row.entity_id];
        const label = err ? err.name : row.entity_id;
        return {
          error_code: row.entity_id,
          alarm_count: row.alarm_count,
          label,
          error_details: err || null,
        };
      });
    }
  }

  /**
   * API 5: Share Composition Analysis (Pie Chart - Ratio)
   * Dynamically federates and aggregates data for type, station, site, and region.
   */
  async getRatioAnalytics(
    params: RatioParams & { by: 'severity' | 'type' | 'station' | 'site' | 'region' },
    metrics: ServiceMetrics,
  ) {
    const { by } = params;

    // A. Direct ClickHouse aggregation for severity
    if (by === 'severity') {
      const { rows, durationMs } = await this.alarmRepo.getRatioBySeverity(params);
      metrics.clickhouse_query_time_ms += durationMs;
      metrics.records_returned += rows.length;

      const total = rows.reduce((sum, r) => sum + r.count, 0);
      return rows.map((r) => ({
        severity: r.severity,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 10000) / 100 : 0,
      }));
    }

    // B. Federated aggregation for Postgres metadata (type, station, site, region)
    // 1. Get raw alarms count grouped by device_id from ClickHouse
    const { rows: clickhouseRows, durationMs: chDuration } =
      await this.alarmRepo.getRatioByDevice(params);
    metrics.clickhouse_query_time_ms += chDuration;

    if (clickhouseRows.length === 0) return [];

    const deviceIds = clickhouseRows.map((r) => r.device_id);

    // 2. Fetch device metadata from PostgreSQL
    const startPg = performance.now();
    const { devices } = await this.deviceRepo.getDevicesByIds(deviceIds);
    metrics.postgres_query_time_ms += Math.round(performance.now() - startPg);

    const deviceMap = devices.reduce<Record<string, DeviceMetadata>>((acc, d) => {
      acc[d.device_id] = d;
      return acc;
    }, {});

    // 3. Aggregate counts in-memory based on target dimension
    const aggregationMap: Record<string, number> = {};
    let grandTotal = 0;

    for (const chRow of clickhouseRows) {
      const dev = deviceMap[chRow.device_id];
      let dimensionValue = 'Unknown';

      if (dev) {
        if (by === 'type') dimensionValue = dev.device_type || 'Unknown';
        else if (by === 'station') dimensionValue = dev.station_name || 'Unknown';
        else if (by === 'site') dimensionValue = dev.station_id || 'Unknown';
        else if (by === 'region') dimensionValue = dev.station_province || 'Unknown';
      }

      aggregationMap[dimensionValue] = (aggregationMap[dimensionValue] || 0) + chRow.count;
      grandTotal += chRow.count;
    }

    // 4. Calculate percentages and format output
    const result = Object.entries(aggregationMap).map(([key, count]) => {
      const percentage = grandTotal > 0 ? Math.round((count / grandTotal) * 10000) / 100 : 0;

      const payload: { count: number; percentage: number; [key: string]: string | number } = {
        count,
        percentage,
      };
      if (by === 'type') payload.device_type = key;
      else if (by === 'station') payload.station_name = key;
      else if (by === 'site') payload.station_id = key;
      else if (by === 'region') payload.region_name = key;

      return payload;
    });

    // Sort by count descending
    result.sort((a, b) => b.count - a.count);
    metrics.records_returned += result.length;

    return result;
  }
}
