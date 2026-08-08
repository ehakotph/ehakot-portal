import type { User } from '~/types/auth.model';
import type { BaseResponse, ProfileForm } from '~/types/form.model';


export const useUsers = () => {
  const { $api } = useNuxtApp()

  const getUsers = async ({ query = '' }: { query?: string } = {}): Promise<BaseResponse<User[]>> => {
    try {
      const api = $api();
      const response = await api(`/accounts${query ? `?${query}` : ''}`);

      return { data: (response as any).data as User[], total: (response as any).totalCount as number };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  };

  const setUsers = async (payload: { email: string | undefined; password: string; role: 'admin' | 'driver' | undefined }, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/accounts/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update users:', error);
      throw error;
    }
  };

  const updateUsers = async (payload: ProfileForm, id: number): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/accounts/${id}`, { method: 'PUT', body: payload });

      return response;
    } catch (error) {
      console.error('Failed to update users:', error);
      throw error;
    }
  };

  const updateUserLocation = async (
    id: number,
    payload: {
      location: { lat: number; lng: number };
    }
  ): Promise<any> => {
    try {
      const api = $api();
      const response = await api(`/accounts/${id}`, { method: 'PUT', body: payload });
      return response;
    } catch (error) {
      console.error('Failed to update user location:', error);
      throw error;
    }
  };

  return { getUsers, updateUsers, updateUserLocation, setUsers };
}
