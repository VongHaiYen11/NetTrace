import { Request, Response, NextFunction } from 'express';
import { AlarmService } from '../services/alarm.service.js';

export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  /**
   * Helper to format success responses and compute performance timings consistently.
   */
  private sendSuccess(
    res: Response,
    data: unknown,
    start: number,
    additionalMeta?: Record<string, unknown>,
  ) {
    const executionTimeMs = Math.round(performance.now() - start);
    return res.status(200).json({
      success: true,
      data,
      meta: {
        ...additionalMeta,
        execution_time_ms: executionTimeMs,
      },
    });
  }

  /**
   * API 1: Detail Queries (Table View) with Keyset Pagination.
   */
  queryAlarms = async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    try {
      const queryParams = res.locals.query;
      const metrics = res.locals.metrics;

      const { alarms, total } = await this.alarmService.queryAlarms(queryParams, metrics);

      return this.sendSuccess(res, alarms, start, {
        limit: queryParams.limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * API 2: Time Series Counts (Line Chart - Volume)
   */
  getTimeSeriesCount = async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    try {
      const queryParams = res.locals.query;
      const metrics = res.locals.metrics;

      const data = await this.alarmService.getTimeSeriesCount(queryParams, metrics);

      return this.sendSuccess(res, data, start);
    } catch (error) {
      next(error);
    }
  };

  /**
   * API 3: Average Resolution Duration (Line Chart - Operational Performance)
   */
  getTimeSeriesDuration = async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    try {
      const queryParams = res.locals.query;
      const metrics = res.locals.metrics;

      const data = await this.alarmService.getTimeSeriesDuration(queryParams, metrics);

      return this.sendSuccess(res, data, start);
    } catch (error) {
      next(error);
    }
  };

  /**
   * API 4: Repeat Alarms Ranking (Bar Chart - Top-N)
   */
  getTopNAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    try {
      const queryParams = res.locals.query;
      const metrics = res.locals.metrics;

      const data = await this.alarmService.getTopNAnalytics(queryParams, metrics);

      return this.sendSuccess(res, data, start);
    } catch (error) {
      next(error);
    }
  };

  /**
   * API 5: Share Composition Analysis (Pie Chart - Ratio)
   */
  getRatioAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    try {
      const queryParams = res.locals.query;
      const metrics = res.locals.metrics;

      const data = await this.alarmService.getRatioAnalytics(queryParams, metrics);

      return this.sendSuccess(res, data, start);
    } catch (error) {
      next(error);
    }
  };
}
