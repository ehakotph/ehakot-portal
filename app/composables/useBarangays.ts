import type { Barangays } from '~/types/auth.model';
import type { BaseResponse } from '~/types/form.model';

export const useBarangays = () => {
  const { $api } = useNuxtApp();

  const getBarangays = async ({ query = ''}: { query?: string } = {}): Promise<BaseResponse<Barangays[]>> => {
    try {
      const api = $api();
      const response = await api(`/barangays${query? `?${query}` : ''}`)

      return {data: (response as any).data as Barangays[], total: (response as any).totalCount as number};
    } catch (error) {
      console.error('Failed to fetch barangays:', error);
      throw error;
    }
  };

  const createBarangays = async (payload: {name: string, city_id: number | undefined}): Promise<any> => {
    try {
      const api = $api();
      const response = await api('/barangays', { method: 'POST', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to create barangays:', error);
      throw error;
    }
  };

  const updateBarangays = async (payload: {name: string, city_id: number | undefined}, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/barangays/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update barangays:', error);
      throw error;
    }
  };

  return { getBarangays, createBarangays, updateBarangays };
};