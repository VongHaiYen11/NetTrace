import { executePgQuery } from '../database/postgres/connection.js';

export interface DeviceMetadata {
  device_id: string;
  name: string;
  vendor_id: string | null;
  vendor_name: string | null;
  vendor_country: string | null;
  station_id: string | null;
  station_name: string | null;
  station_province: string | null;
  device_type: string | null;
  ip_address: string | null;
  longitude: number | null;
  latitude: number | null;
  additional_info: string | null;
}

export class DeviceRepository {
  /**
   * Fetches metadata for a list of device IDs from PostgreSQL,
   * joining vendor and station details.
   */
  async getDevicesByIds(ids: string[]): Promise<{ devices: DeviceMetadata[]; durationMs: number }> {
    if (ids.length === 0) {
      return { devices: [], durationMs: 0 };
    }

    const query = `
      SELECT 
        d.device_id,
        d.name,
        d.vendor_id,
        v.name as vendor_name,
        v.country as vendor_country,
        d.station_id,
        s.name as station_name,
        s.province as station_province,
        d.device_type,
        d.ip_address,
        d.longitude,
        d.latitude,
        d.additional_info
      FROM device d
      LEFT JOIN vendor v ON d.vendor_id = v.vendor_id
      LEFT JOIN station s ON d.station_id = s.station_id
      WHERE d.device_id = ANY($1)
    `;

    const { rows, durationMs } = await executePgQuery<DeviceMetadata>(query, [ids]);
    return { devices: rows, durationMs };
  }
}
