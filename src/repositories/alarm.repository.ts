import { executeClickhouseQuery } from '../database/clickhouse/connection.js';

export interface AlarmRecord {
  alarm_id: string;
  error_code: string;
  device_id: string;
  time_created: string;
  time_solved: string | null;
  status: string;
  severity: string;
  raw_log: string;
  description: string;
}

export interface QueryAlarmsParams {
  from_time: Date;
  to_time: Date;
  cursor_time?: Date;
  cursor_id?: string;
  limit: number;
  severity?: string;
  status?: string;
  device_id?: string;
  error_code?: string;
  sort_by: 'timestamp' | 'severity' | 'status';
  sort_order: 'asc' | 'desc';
}

export interface TimeSeriesCountParams {
  from_time: Date;
  to_time: Date;
  interval: 'hour' | 'day';
  severity?: string;
  status?: string;
  device_id?: string;
}

export interface TimeSeriesDurationParams {
  from_time: Date;
  to_time: Date;
  interval: 'day' | 'month' | 'year';
  severity?: string;
  status?: string;
  device_id?: string;
}

export interface TopNParams {
  from_time: Date;
  to_time: Date;
  by: 'device' | 'error_code';
  n: number;
}

export interface RatioParams {
  from_time: Date;
  to_time: Date;
}

export class AlarmRepository {
  private buildFilters(params: {
    severity?: string;
    status?: string;
    device_id?: string;
    error_code?: string;
  }) {
    const conditions: string[] = [];
    const queryParams: Record<string, unknown> = {};

    if (params.severity) {
      conditions.push('severity = {severity: String}');
      queryParams.severity = params.severity;
    }
    if (params.status) {
      conditions.push('status = {status: String}');
      queryParams.status = params.status;
    }
    if (params.device_id) {
      conditions.push('device_id = {device_id: String}');
      queryParams.device_id = params.device_id;
    }
    if (params.error_code) {
      conditions.push('error_code = {error_code: String}');
      queryParams.error_code = params.error_code;
    }

    return { conditions, queryParams };
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * API 1: Detail Queries with Keyset Pagination.
   * Uses cursor (time_created & alarm_id) to retrieve records without OFFSET.
   */
  async queryAlarms(
    params: QueryAlarmsParams,
  ): Promise<{ alarms: AlarmRecord[]; total: number; durationMs: number }> {
    const { from_time, to_time, cursor_time, cursor_id, limit, sort_by, sort_order } = params;

    const fromStr = this.formatDate(from_time);
    const toStr = this.formatDate(to_time);

    const { conditions, queryParams } = this.buildFilters({
      severity: params.severity,
      status: params.status,
      device_id: params.device_id,
      error_code: params.error_code,
    });

    queryParams.from_time = fromStr;
    queryParams.to_time = toStr;
    queryParams.limit = limit;

    // Apply cursor condition for Keyset Pagination (older/newer than cursor)
    if (cursor_time && cursor_id) {
      const cursorTimeStr = this.formatDate(cursor_time);
      queryParams.cursor_time = cursorTimeStr;
      queryParams.cursor_id = cursor_id;

      if (sort_order === 'asc') {
        conditions.push(
          '(time_created > {cursor_time: DateTime} OR (time_created = {cursor_time: DateTime} AND alarm_id > {cursor_id: String}))',
        );
      } else {
        conditions.push(
          '(time_created < {cursor_time: DateTime} OR (time_created = {cursor_time: DateTime} AND alarm_id < {cursor_id: String}))',
        );
      }
    }

    const sortFieldMap: Record<string, string> = {
      timestamp: 'time_created',
      severity: 'severity',
      status: 'status',
    };
    const orderColumn = sortFieldMap[sort_by] || 'time_created';
    const orderDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataQuery = `
      SELECT 
        alarm_id,
        error_code,
        device_id,
        time_created,
        time_solved,
        status,
        severity,
        raw_log,
        description
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      ${whereClause}
      ORDER BY ${orderColumn} ${orderDirection}, alarm_id ${orderDirection}
      LIMIT {limit: UInt32}
    `;

    // Filter count query (does not include cursor constraints since it represents the total size of matching set)
    const countConditions = [...conditions];
    // Remove the cursor filter for count
    if (cursor_time && cursor_id) {
      countConditions.pop();
    }
    const countWhereClause =
      countConditions.length > 0 ? `WHERE ${countConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT count() as total
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      ${countWhereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      executeClickhouseQuery<AlarmRecord>(dataQuery, queryParams),
      executeClickhouseQuery<{ total: string }>(countQuery, queryParams),
    ]);

    const total = countResult.rows.length > 0 ? parseInt(countResult.rows[0].total, 10) : 0;
    const totalDuration = dataResult.durationMs + countResult.durationMs;

    return {
      alarms: dataResult.rows,
      total,
      durationMs: totalDuration,
    };
  }

  /**
   * API 2: Time Series Counts (Line Chart - Volume)
   */
  async getTimeSeriesCount(params: TimeSeriesCountParams): Promise<{
    rows: { bucket: string; total_alarms: number; active_alarms: number }[];
    durationMs: number;
  }> {
    const { from_time, to_time, interval } = params;

    const fromStr = this.formatDate(from_time);
    const toStr = this.formatDate(to_time);

    const { conditions, queryParams } = this.buildFilters({
      severity: params.severity,
      status: params.status,
      device_id: params.device_id,
    });

    queryParams.from_time = fromStr;
    queryParams.to_time = toStr;

    const bucketFn = interval === 'hour' ? 'toStartOfHour' : 'toStartOfDay';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ${bucketFn}(time_created) as bucket,
        count() as total_alarms,
        countIf(status = 'ACTIVE' OR status = 'active') as active_alarms
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      ${whereClause}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    const { rows, durationMs } = await executeClickhouseQuery<{
      bucket: string;
      total_alarms: string;
      active_alarms: string;
    }>(query, queryParams);

    const formattedRows = rows.map((r) => ({
      bucket: r.bucket,
      total_alarms: parseInt(r.total_alarms, 10),
      active_alarms: parseInt(r.active_alarms, 10),
    }));

    return { rows: formattedRows, durationMs };
  }

  /**
   * API 3: Average Resolution Duration (Line Chart - Operational Performance)
   */
  async getTimeSeriesDuration(
    params: TimeSeriesDurationParams,
  ): Promise<{ rows: { bucket: string; avg_duration_seconds: number }[]; durationMs: number }> {
    const { from_time, to_time, interval } = params;

    const fromStr = this.formatDate(from_time);
    const toStr = this.formatDate(to_time);

    const { conditions, queryParams } = this.buildFilters({
      severity: params.severity,
      status: params.status,
      device_id: params.device_id,
    });

    queryParams.from_time = fromStr;
    queryParams.to_time = toStr;

    const bucketFunctionMap = {
      day: 'toStartOfDay',
      month: 'toStartOfMonth',
      year: 'toStartOfYear',
    };
    const bucketFn = bucketFunctionMap[interval] || 'toStartOfDay';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ${bucketFn}(time_created) as bucket,
        avg(if(isNull(time_solved), now(), time_solved) - time_created) as avg_duration_seconds
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      ${whereClause}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    const { rows, durationMs } = await executeClickhouseQuery<{
      bucket: string;
      avg_duration_seconds: string | number;
    }>(query, queryParams);

    const formattedRows = rows.map((r) => ({
      bucket: r.bucket,
      avg_duration_seconds: Math.round(Number(r.avg_duration_seconds) * 100) / 100,
    }));

    return { rows: formattedRows, durationMs };
  }

  /**
   * API 4: Repeat Alarms Ranking (Bar Chart - Top-N)
   */
  async getTopN(
    params: TopNParams,
  ): Promise<{ rows: { entity_id: string; alarm_count: number }[]; durationMs: number }> {
    const { from_time, to_time, by, n } = params;

    const fromStr = this.formatDate(from_time);
    const toStr = this.formatDate(to_time);

    const queryParams: Record<string, unknown> = {
      from_time: fromStr,
      to_time: toStr,
      limit: n,
    };

    const dimColumn = by === 'device' ? 'device_id' : 'error_code';

    const query = `
      SELECT 
        ${dimColumn} as entity_id,
        count() as alarm_count
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      GROUP BY entity_id
      ORDER BY alarm_count DESC
      LIMIT {limit: UInt32}
    `;

    const { rows, durationMs } = await executeClickhouseQuery<{
      entity_id: string;
      alarm_count: string;
    }>(query, queryParams);

    const formattedRows = rows.map((r) => ({
      entity_id: r.entity_id,
      alarm_count: parseInt(r.alarm_count, 10),
    }));

    return { rows: formattedRows, durationMs };
  }

  /**
   * API 5: Share Composition - Group by Severity (Direct ClickHouse)
   */
  async getRatioBySeverity(
    params: RatioParams,
  ): Promise<{ rows: { severity: string; count: number }[]; durationMs: number }> {
    const fromStr = this.formatDate(params.from_time);
    const toStr = this.formatDate(params.to_time);

    const queryParams = { from_time: fromStr, to_time: toStr };

    const query = `
      SELECT 
        severity,
        count() as count
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      GROUP BY severity
      ORDER BY count DESC
    `;

    const { rows, durationMs } = await executeClickhouseQuery<{
      severity: string;
      count: string;
    }>(query, queryParams);

    const formattedRows = rows.map((r) => ({
      severity: r.severity,
      count: parseInt(r.count, 10),
    }));

    return { rows: formattedRows, durationMs };
  }

  /**
   * API 5: Share Composition - Group by Device ID (to be aggregated in service layer via Postgres metadata)
   */
  async getRatioByDevice(
    params: RatioParams,
  ): Promise<{ rows: { device_id: string; count: number }[]; durationMs: number }> {
    const fromStr = this.formatDate(params.from_time);
    const toStr = this.formatDate(params.to_time);

    const queryParams = { from_time: fromStr, to_time: toStr };

    const query = `
      SELECT 
        device_id,
        count() as count
      FROM alarms
      PREWHERE time_created BETWEEN {from_time: DateTime} AND {to_time: DateTime}
      GROUP BY device_id
    `;

    const { rows, durationMs } = await executeClickhouseQuery<{
      device_id: string;
      count: string;
    }>(query, queryParams);

    const formattedRows = rows.map((r) => ({
      device_id: r.device_id,
      count: parseInt(r.count, 10),
    }));

    return { rows: formattedRows, durationMs };
  }
}
