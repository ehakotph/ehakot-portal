import type { Trucks } from '~/types/auth.model';
import type { BaseResponse } from '~/types/form.model';

export const useTrucks = () => {
  const { $api } = useNuxtApp();

  const getTrucks = async ({ query = ''}: { query?: string } = {}): Promise<BaseResponse<Trucks[]>> => {
    try {
      const api = $api();
      const response = await api(`/trucks${query? `?${query}` : ''}`);

      return {data: (response as any).data as Trucks[], total: (response as any).totalCount as number};
    } catch (error) {
      console.error('Failed to fetch trucks:', error);
      throw error;
    }
  };


  const createTrucks = async (payload: {city_id: number | undefined; plate_number: string;}): Promise<any> => {
    try {
      const api = $api();
      const response = await api('/trucks', { method: 'POST', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to create trucks:', error);
      throw error;
    }
  };

  const updateTrucks = async (payload: {city_id: number | undefined; plate_number: string;}, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/trucks/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update trucks:', error);
      throw error;
    }
  };
  
  return { getTrucks, createTrucks, updateTrucks };
};