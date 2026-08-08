import type { Cities } from "~/types/auth.model";
import type { BaseResponse } from "~/types/form.model";

export const useCities = () => {
  const { $api } = useNuxtApp();

  const getCities = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<Cities[]>> => {
    try {
      const api = $api();
      const response = await api(`/cities${query ? `?${query}` : ''}`)

      return { data: (response as any).data as Cities[], total: (response as any).totalCount as number };
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      throw error;
    }
  };

  const createCities = async (payload: { name: string }): Promise<any> => {
    try {
      const api = $api();
      const response = await api('/cities', { method: 'POST', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to create cities:', error);
      throw error;
    }
  };

  const updateCities = async (payload: { name: string }, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/cities/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update cities:', error);
      throw error;
    }
  };

  return { getCities, createCities, updateCities };
};