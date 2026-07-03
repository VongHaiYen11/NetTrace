import { splitDateRangeIntoChunks } from '../services/shared.js';
import { TtlMapCache } from '../services/metadata-cache.js';
import { normalizePresetFieldsByChartType } from '../utils/preset-fields.js';

describe('Shared utility tests', () => {
  describe('splitDateRangeIntoChunks', () => {
    it('keeps ranges within the configured max-day window', () => {
      const chunks = splitDateRangeIntoChunks(
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-05T00:00:00.000Z'),
        90,
      );

      expect(chunks).toEqual([
        {
          from_time: new Date('2026-01-01T00:00:00.000Z'),
          to_time: new Date('2026-01-05T00:00:00.000Z'),
        },
      ]);
    });

    it('splits long ranges into contiguous chunks', () => {
      const chunks = splitDateRangeIntoChunks(
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-05T00:00:00.000Z'),
        2,
      );

      expect(chunks).toEqual([
        {
          from_time: new Date('2026-01-01T00:00:00.000Z'),
          to_time: new Date('2026-01-02T23:59:59.999Z'),
        },
        {
          from_time: new Date('2026-01-03T00:00:00.000Z'),
          to_time: new Date('2026-01-04T23:59:59.999Z'),
        },
        {
          from_time: new Date('2026-01-05T00:00:00.000Z'),
          to_time: new Date('2026-01-05T00:00:00.000Z'),
        },
      ]);
    });
  });

  describe('TtlMapCache', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('normalizes keys case-insensitively', () => {
      const cache = new TtlMapCache<{ name: string }>(1000);

      cache.set('DEV001', { name: 'Core Switch' });

      expect(cache.get('dev001')).toEqual({ name: 'Core Switch' });
      expect(cache.get('Dev001')).toEqual({ name: 'Core Switch' });
    });

    it('expires entries after ttl', () => {
      const cache = new TtlMapCache<string>(1000);

      cache.set('ERR01', 'Link Down');
      jest.advanceTimersByTime(1001);

      expect(cache.get('err01')).toBeUndefined();
    });
  });

  describe('normalizePresetFieldsByChartType', () => {
    const basePreset = {
      preset_name: 'Widget preset',
      chart_type: 'line',
      metric: 'count',
      group_by: 'severity',
      time_bucket: 'day',
      heatmap_mode: 'weekday',
      table_columns: 'alarm_id,severity',
      table_page_size: 20,
      table_record_limit: 500,
    };

    it('clears non-line fields for line presets', () => {
      expect(normalizePresetFieldsByChartType(basePreset)).toEqual({
        ...basePreset,
        group_by: null,
        heatmap_mode: null,
        table_columns: null,
        table_page_size: null,
        table_record_limit: null,
      });
    });

    it('keeps table-only fields and clears chart metric fields for table presets', () => {
      expect(
        normalizePresetFieldsByChartType({
          ...basePreset,
          chart_type: 'table',
        }),
      ).toEqual({
        ...basePreset,
        chart_type: 'table',
        metric: null,
        group_by: null,
        time_bucket: null,
        heatmap_mode: null,
      });
    });

    it('keeps only heatmap mode for heatmap presets', () => {
      expect(
        normalizePresetFieldsByChartType({
          ...basePreset,
          chart_type: 'heatmap',
        }),
      ).toEqual({
        ...basePreset,
        chart_type: 'heatmap',
        metric: null,
        group_by: null,
        time_bucket: null,
        table_columns: null,
        table_page_size: null,
        table_record_limit: null,
      });
    });

    it('clears bar time buckets when a grouped dimension is selected', () => {
      expect(
        normalizePresetFieldsByChartType({
          ...basePreset,
          chart_type: 'bar',
          group_by: 'device_type',
        }),
      ).toEqual({
        ...basePreset,
        chart_type: 'bar',
        group_by: 'device_type',
        time_bucket: null,
        heatmap_mode: null,
        table_columns: null,
        table_page_size: null,
        table_record_limit: null,
      });
    });
  });
});
