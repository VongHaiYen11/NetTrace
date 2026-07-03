import { PresetRepository, type Preset } from '../repositories/preset.repository.js';
import { PresetService } from '../services/preset.service.js';

describe('PresetService unit tests', () => {
  let presetRepo: jest.Mocked<PresetRepository>;
  let service: PresetService;

  const linePreset: Omit<Preset, 'preset_id'> = {
    preset_name: 'Critical trend',
    chart_type: 'line',
    metric: 'count',
    group_by: 'severity',
    time_bucket: 'day',
    heatmap_mode: 'weekday',
    table_columns: 'alarm_id,severity',
    table_page_size: 20,
    table_record_limit: 500,
  };

  beforeEach(() => {
    presetRepo = {
      listPresets: jest.fn(),
      createPreset: jest.fn(),
      updatePreset: jest.fn(),
      getPresetById: jest.fn(),
      findUsedPresetsByIds: jest.fn(),
      deletePresetsByIds: jest.fn(),
    } as unknown as jest.Mocked<PresetRepository>;

    service = new PresetService(presetRepo);
  });

  it('normalizes preset fields before creating a preset', async () => {
    presetRepo.createPreset.mockResolvedValue({
      preset_id: 1,
      ...linePreset,
      group_by: null,
      heatmap_mode: null,
      table_columns: null,
      table_page_size: null,
      table_record_limit: null,
    });

    await service.createPreset(linePreset);

    expect(presetRepo.createPreset).toHaveBeenCalledWith({
      ...linePreset,
      group_by: null,
      heatmap_mode: null,
      table_columns: null,
      table_page_size: null,
      table_record_limit: null,
    });
  });

  it('normalizes preset fields before updating a preset', async () => {
    const tablePreset: Omit<Preset, 'preset_id'> = {
      ...linePreset,
      chart_type: 'table',
    };
    presetRepo.updatePreset.mockResolvedValue({
      preset_id: 2,
      ...tablePreset,
      metric: null,
      group_by: null,
      time_bucket: null,
      heatmap_mode: null,
    });

    await service.updatePreset(2, tablePreset);

    expect(presetRepo.updatePreset).toHaveBeenCalledWith(2, {
      ...tablePreset,
      metric: null,
      group_by: null,
      time_bucket: null,
      heatmap_mode: null,
    });
  });

  it('blocks deletion when any preset is used by a template', async () => {
    presetRepo.findUsedPresetsByIds.mockResolvedValue([
      {
        preset_id: 3,
        preset_name: 'Used preset',
        chart_type: 'line',
        metric: 'count',
        group_by: null,
        time_bucket: 'day',
        heatmap_mode: null,
        table_columns: null,
        template_id: 10,
        template_name: 'NOC Dashboard',
      },
    ]);

    await expect(service.deletePresets([3])).rejects.toMatchObject({
      message: 'Preset is currently used by a template and cannot be deleted.',
      statusCode: 409,
    });
    expect(presetRepo.deletePresetsByIds).not.toHaveBeenCalled();
  });

  it('deletes unused presets', async () => {
    presetRepo.findUsedPresetsByIds.mockResolvedValue([]);
    presetRepo.deletePresetsByIds.mockResolvedValue(2);

    await expect(service.deletePresets([4, 5])).resolves.toBe(2);
    expect(presetRepo.deletePresetsByIds).toHaveBeenCalledWith([4, 5]);
  });
});
