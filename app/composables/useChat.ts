import type { Sample } from "~/types/auth.model";
import type { BaseResponse } from "~/types/form.model";

export const useChat = () => {
  const { $api } = useNuxtApp();

  const getSample = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<Sample[]>> => {
    try {
      const api = $api();
      const response = await api(`/sample${query ? `?${query}` : ''}`)

      return {data: (response as any).data as Sample[], total: (response as any).totalCount as number};
    } catch (error) {
      console.error('Failed to fetch sample:', error);
      throw error;
    }
  };

  const createSample = async (payload: Sample): Promise<any> => {
    try {
      const api = $api();
      const response = await api('/sample', { method: 'POST', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to create sample:', error);
      throw error;
    }
  };

  const updateSample = async (payload: Sample, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/sample/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update sample:', error);
      throw error;
    }
  };

  return { getSample, createSample, updateSample };
};