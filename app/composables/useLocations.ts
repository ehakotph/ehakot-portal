export const useLocations = () => {
  const { $api } = useNuxtApp();

  const updateDriverLocation = async (payload: { lat: number, lng: number, driver_id: number, collection_id: number }) => {
    try {
      const api = $api();
      const response = await api(`/locations/update-driver-location`, {
        method: 'POST',
        body: payload
      })

      return response;
    } catch (error) {
      console.error('Failed to update driver location:', error);
      throw error;
    }
  };

  const getDriverLocations = async (collection_id: number) => {
    try {
      const api = $api();

      const response = await api(`/locations/driver-locations`, {
        method: 'POST',
        body: { collection_id }
      })

      return response;
    } catch (error) {
      console.error('Failed to update driver location:', error);
      throw error;
    }
  };

  return { updateDriverLocation, getDriverLocations };
};