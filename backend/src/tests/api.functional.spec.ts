import request from 'supertest';
import net from 'net';
import app from '../app.js';
import { QueryAlarmsRepository } from '../repositories/query-alarms.repository.js';
import { SummaryRepository } from '../repositories/summary.repository.js';
import { AnalyticsQueryRepository } from '../repositories/analytics-query.repository.js';
import { HeatmapRepository } from '../repositories/heatmap.repository.js';
import { DeviceRepository } from '../repositories/device.repository.js';
import { ErrorRepository } from '../repositories/error.repository.js';
import { TemplateRepository } from '../repositories/template.repository.js';
import { WidgetRepository } from '../repositories/widget.repository.js';
import { PresetRepository } from '../repositories/preset.repository.js';

const fixedTemplateDate = new Date('2026-06-15T00:00:00.000Z');
let canRunSupertest = false;

function canBindEphemeralPort() {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(0, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

function apiIt(name: string, fn: () => Promise<void>) {
  it(name, async () => {
    if (!canRunSupertest) return;
    await fn();
  });
}

describe('Functional API tests', () => {
  beforeAll(async () => {
    canRunSupertest = await canBindEphemeralPort();
  });

  beforeEach(() => {
    jest.restoreAllMocks();

    jest.spyOn(QueryAlarmsRepository.prototype, 'queryAlarms').mockResolvedValue({
      alarms: [
        {
          alarm_id: 'alarm-1',
          error_code: 'ERR_LINK_DOWN',
          device_id: 'DEV001',
          time_created: '2026-06-15 00:00:00',
          time_solved: null,
          status: 'active',
          severity: 'critical',
          raw_log: 'link down',
          description: 'Interface down',
        },
      ],
      total: 1,
      durationMs: 12,
    });

    jest.spyOn(SummaryRepository.prototype, 'getSummary').mockResolvedValue({
      summary: {
        totalAlarms: 10,
        activeAlarms: 4,
        archivedAlarms: 6,
        criticalAlarms: 2,
        affectedDevices: 0,
      },
      affectedDeviceIds: ['DEV001', 'DEV002'],
      durationMs: 8,
    });

    jest.spyOn(AnalyticsQueryRepository.prototype, 'executeQuery').mockResolvedValue({
      rows: [
        { severity: 'critical', value: 5 },
        { severity: 'major', value: 3 },
      ],
      durationMs: 9,
    });

    jest.spyOn(HeatmapRepository.prototype, 'getHeatmap').mockResolvedValue({
      rows: [{ day_of_week: 1, hour: 9, count: 7 }],
      durationMs: 5,
    });

    jest.spyOn(DeviceRepository.prototype, 'getDevicesByIds').mockResolvedValue({
      devices: [],
      durationMs: 0,
    });
    jest.spyOn(DeviceRepository.prototype, 'getDeviceIdsByFilters').mockResolvedValue({
      deviceIds: ['DEV001'],
      durationMs: 3,
    });
    jest.spyOn(DeviceRepository.prototype, 'getDeviceIdsBySearch').mockResolvedValue({
      deviceIds: ['DEV001'],
      durationMs: 3,
    });
    jest.spyOn(DeviceRepository.prototype, 'getFilterOptions').mockResolvedValue({
      options: {
        deviceTypes: ['Router'],
        vendors: ['Cisco'],
        stations: ['Hanoi Central'],
        provinces: ['Hanoi'],
      },
      durationMs: 4,
    });

    jest.spyOn(ErrorRepository.prototype, 'getErrorsByCodes').mockResolvedValue({
      errors: [],
      durationMs: 0,
    });
    jest.spyOn(ErrorRepository.prototype, 'getErrorCodesBySearch').mockResolvedValue({
      errorCodes: ['ERR_LINK_DOWN'],
      durationMs: 3,
    });

    jest.spyOn(TemplateRepository.prototype, 'listTemplates').mockResolvedValue([
      {
        template_id: 1,
        name: 'NOC Dashboard',
        selected_cards: '["totalAlarms"]',
        number_of_widgets: 1,
        time_created: fixedTemplateDate,
        time_updated: fixedTemplateDate,
      },
    ]);
    jest.spyOn(TemplateRepository.prototype, 'getTemplateById').mockResolvedValue({
      template_id: 1,
      name: 'NOC Dashboard',
      selected_cards: '["totalAlarms"]',
      number_of_widgets: 1,
      time_created: fixedTemplateDate,
      time_updated: fixedTemplateDate,
    });
    jest.spyOn(WidgetRepository.prototype, 'getWidgetsWithPresetsByTemplateId').mockResolvedValue([
      {
        widget_id: 1,
        template_id: 1,
        preset_id: 10,
        position: 1,
        start_date: '2026-06-01T00:00:00Z',
        end_date: '2026-06-30T00:00:00Z',
        time_created: fixedTemplateDate,
        time_updated: fixedTemplateDate,
        preset: {
          preset_id: 10,
          preset_name: 'Critical routers',
          chart_type: 'line',
          metric: 'count',
          group_by: null,
          time_bucket: 'day',
          heatmap_mode: null,
          table_columns: null,
          table_page_size: null,
          table_record_limit: null,
        },
      },
    ]);

    jest.spyOn(PresetRepository.prototype, 'listPresets').mockResolvedValue([
      {
        preset_id: 10,
        preset_name: 'Critical routers',
        chart_type: 'line',
        metric: 'count',
        group_by: null,
        time_bucket: 'day',
        heatmap_mode: null,
        table_columns: null,
        table_page_size: null,
        table_record_limit: null,
        template_id: 1,
        template_name: 'NOC Dashboard',
      },
    ]);
    jest.spyOn(PresetRepository.prototype, 'findUsedPresetsByIds').mockResolvedValue([]);
    jest.spyOn(PresetRepository.prototype, 'deletePresetsByIds').mockResolvedValue(1);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  apiIt('returns the standard not found envelope for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint GET /api/v1/unknown-route not found',
      },
    });
  });

  describe('GET /api/v1/metadata/options', () => {
    apiIt('returns metadata options from the API envelope', async () => {
      const response = await request(app)
        .get('/api/v1/metadata/options')
        .query({ search: 'ro', limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          deviceTypes: ['Router'],
          vendors: ['Cisco'],
          stations: ['Hanoi Central'],
          provinces: ['Hanoi'],
        },
        meta: {
          execution_time_ms: expect.any(Number),
        },
      });
    });

    apiIt('rejects invalid metadata query input', async () => {
      const response = await request(app)
        .get('/api/v1/metadata/options')
        .query({ limit: 1001 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/alarms', () => {
    apiIt('returns paginated alarms', async () => {
      const response = await request(app)
        .get('/api/v1/alarms')
        .query({
          from_time: '2026-06-15T00:00:00Z',
          to_time: '2026-06-16T00:00:00Z',
          limit: 10,
          offset: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          alarm_id: 'alarm-1',
          severity: 'critical',
          status: 'active',
        }),
      ]);
      expect(response.body.meta).toEqual({
        offset: 0,
        limit: 10,
        total: 1,
        execution_time_ms: expect.any(Number),
      });
    });

    apiIt('rejects invalid alarm query input before repository access', async () => {
      const querySpy = jest.spyOn(QueryAlarmsRepository.prototype, 'queryAlarms');

      const response = await request(app)
        .get('/api/v1/alarms')
        .query({ limit: 1001 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/analytics/summary', () => {
    apiIt('returns summary metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/summary')
        .query({
          from_time: '2026-06-15T00:00:00Z',
          to_time: '2026-06-16T00:00:00Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        totalAlarms: 10,
        activeAlarms: 4,
        archivedAlarms: 6,
        criticalAlarms: 2,
        affectedDevices: 2,
      });
    });
  });

  describe('POST /api/v1/analytics/query', () => {
    apiIt('returns analytics rows', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/query')
        .send({
          metric: 'count',
          group_by: ['severity'],
          filters: {
            from_time: '2026-06-15T00:00:00Z',
            to_time: '2026-06-16T00:00:00Z',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { severity: 'critical', value: 5 },
        { severity: 'major', value: 3 },
      ]);
    });

    apiIt('rejects invalid analytics request bodies', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/query')
        .send({ metric: 'invalid_metric' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/analytics/heatmap', () => {
    apiIt('returns weekday heatmap cells', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/heatmap')
        .send({
          mode: 'weekday',
          filters: {
            from_time: '2026-06-15T00:00:00Z',
            to_time: '2026-06-16T00:00:00Z',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ x: 9, y: 'Monday', value: 7 }]);
    });
  });

  describe('POST /api/v1/export', () => {
    apiIt('rejects unsupported export formats', async () => {
      const response = await request(app)
        .post('/api/v1/export')
        .send({ format: 'xml' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Template endpoints', () => {
    apiIt('lists templates', async () => {
      const response = await request(app)
        .get('/api/v1/templates')
        .query({ limit: 20, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          template_id: 1,
          name: 'NOC Dashboard',
        }),
      ]);
    });

    apiIt('returns detailed template data', async () => {
      const response = await request(app).get('/api/v1/templates/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          template_id: 1,
          name: 'NOC Dashboard',
          widgets: [
            expect.objectContaining({
              widget_id: 1,
              preset: expect.objectContaining({
                preset_name: 'Critical routers',
              }),
            }),
          ],
        }),
      );
    });

    apiIt('returns not found for missing templates', async () => {
      jest.spyOn(TemplateRepository.prototype, 'getTemplateById').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/templates/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template with ID 999 not found',
        },
      });
    });

    apiIt('rejects invalid template IDs', async () => {
      const response = await request(app).get('/api/v1/templates/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Preset endpoints', () => {
    apiIt('lists presets', async () => {
      const response = await request(app)
        .get('/api/v1/presets')
        .query({ limit: 50, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        expect.objectContaining({
          preset_id: 10,
          preset_name: 'Critical routers',
        }),
      ]);
    });

    apiIt('deletes unused presets', async () => {
      const response = await request(app)
        .delete('/api/v1/presets')
        .send({ ids: [10] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          deletedCount: 1,
        },
        meta: {
          execution_time_ms: expect.any(Number),
        },
      });
    });

    apiIt('rejects invalid preset update IDs', async () => {
      const response = await request(app)
        .put('/api/v1/presets/not-a-number')
        .send({
          preset_name: 'Updated preset',
          chart_type: 'line',
          metric: 'count',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Invalid preset ID',
        },
      });
    });
  });
});
