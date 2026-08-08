import type { HeatmapReport } from '~/types/auth.model';
import type { BaseResponse } from '~/types/form.model';
import type { GarbageReports } from '~/types/auth.model';

export const useGarbageReports = () => {
  const { $api } = useNuxtApp();

  const createGarbageReport = async (payload: {
    location: { lat: number; lng: number };
    location_city: string;
    location_barangay: string;
    user_id: number;
    collection_id?: number | null;
    status?: 'ACTIVE' | 'ASSUMPTION_COLLECTED' | 'COLLECTED';
  }): Promise<GarbageReports> => {
    try {
      const api = $api();
      const response = await api('/garbage-reports', { method: 'POST', body: payload });
      return (response as any).data || response;
    } catch (error) {
      console.error('Failed to create garbage report:', error);
      throw error;
    }
  };

  const getReports = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<HeatmapReport[]>> => {
    try {
      const api = $api();
      const response = await api(`/garbage-reports/heatmap/report${query ? `?${query}` : ''}`)

      return { data: (response as any).data as HeatmapReport[], total: (response as any).totalCount as number };
    } catch (error) {
      console.error('Failed to fetch garbage reports:', error);
      throw error;
    }
  };

  const getGarbageReports = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<GarbageReports[]>> => {
    try {
      const api = $api();
      const response = await api(`/garbage-reports${query ? `?${query}` : ''}`);
      return { data: (response as any).data as GarbageReports[], total: (response as any).totalCount as number };
    } catch (error) {
      console.error('Failed to fetch garbage reports:', error);
      throw error;
    }
  };

  const deleteGarbageReport = async (id: number): Promise<any> => {
    try {
      const api = $api();
      return await api(`/garbage-reports/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete garbage report:', error);
      throw error;
    }
  };

  const updateGarbageReport = async (payload: any, id: number): Promise<any> => {
    try {
      const api = $api();
      return await api(`/garbage-reports/${id}`, { method: 'PUT', body: payload });
    } catch (error) {
      console.error('Failed to update garbage report:', error);
      throw error;
    }
  };

  return { createGarbageReport, getGarbageReports, getReports, deleteGarbageReport, updateGarbageReport };
};
