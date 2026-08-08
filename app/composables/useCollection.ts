import type { Collections } from '~/types/auth.model';
import type { BaseResponse, BulkCollectionsForm, CollectionsForm, PartialResponse } from '~/types/form.model';
import { useGlobalStore } from '@/stores/global';

export const useCollections = () => {
  const { $api } = useNuxtApp();

  const getCollections = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<Collections[]>> => {
    try {
      const api = $api();
      const response = await api(`/collections${query ? `?${query}` : ''}`)

      return { data: (response as any).data as Collections[], total: (response as any).totalCount as number };
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      throw error;
    }
  };


  const getNearbyCollection = async ({
    query = '',
    city,
    cityId,
    barangay,
  }: {
    query?: string;
    city?: string | null;
    cityId?: number | null;
    barangay?: string | null;
  } = {}): Promise<Collections[]> => {
    try {
      const api = $api();
      const globalStore = useGlobalStore();
      const params = new URLSearchParams();
      const resolvedCityId = cityId ?? null;
      const resolvedCity = city ?? globalStore.guestLocation?.city ?? null;
      const resolvedBarangay = barangay ?? globalStore.guestLocation?.barangay ?? null;

      if (!resolvedCityId && !resolvedCity && !resolvedBarangay) {
        return [];
      }

      params.append('includes', 'city,driver,truck,collection_histories');
      params.append('paginate', 'false');

      if (resolvedCityId) {
        params.append('city_id', String(resolvedCityId));
      }

      const finalQuery = query ? `${query}&${params.toString()}` : params.toString();
      const response = await api(`/collections${finalQuery ? `?${finalQuery}` : ''}`);
      let list = ((response as any).data as Collections[]) ?? [];

      list = list.filter((col) => col.status !== 'COMPLETED');

      if (resolvedBarangay && list.length > 0) {
        const targetBgy = resolvedBarangay.trim().toLowerCase();
        const bgyMatches = list.filter((col) =>
          Array.isArray(col.barangays) &&
          col.barangays.some(
            (b) => typeof b === 'string' &&
              (b.trim().toLowerCase().includes(targetBgy) || targetBgy.includes(b.trim().toLowerCase()))
          )
        );

        if (bgyMatches.length > 0) {
          return bgyMatches;
        }
      }

      if (!resolvedCityId && resolvedCity) {
        const targetCity = resolvedCity.trim().toLowerCase();
        list = list.filter((col) => col.city?.name?.trim().toLowerCase() === targetCity);
      }

      return list;
    } catch (error) {
      console.error('Failed to fetch nearby collections:', error);
      throw error;
    }
  };


  const createCollections = async (payload: CollectionsForm | BulkCollectionsForm): Promise<any> => {
    try {
      const api = $api();
      const response = await api('/collections', { method: 'POST', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to create collections:', error);
      throw error;
    }
  };

  const updateCollections = async (payload: CollectionsForm, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/collections/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update collections:', error);
      throw error;
    }
  };

  const searchCollectionByLocation = async (payload: { lat?: number, lng?: number, city: string, barangay?: string }): Promise<PartialResponse<Collections[]>> => {
    try {
      const api = $api();
      const response = await api('/collections/search/location', { method: 'POST', body: payload });

      return { data: (response as any).data as Collections[] }
    } catch (error) {
      console.error('Failed to search collection by location:', error);
      throw error;
    }
  }

  return { getCollections, getNearbyCollection, createCollections, updateCollections, searchCollectionByLocation };
};