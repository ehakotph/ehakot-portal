export const useNotifications = () => {
    const { $api } = useNuxtApp();

    const getNotifications = async (userId?: number) => {
        const api = $api();
        const params = new URLSearchParams();
        if (userId) params.append('user_id', String(userId));
        params.append('paginate', 'false');
        params.append('sortBy', 'created_at');
        params.append('sortOrder', 'DESC');

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api(`/notifications${queryString}`);
        return response;
    };

    const markAsRead = async (id: number) => {
        const api = $api();
        return await api(`/notifications/${id}`, {
            method: 'PUT',
            body: { read_at: new Date().toISOString() }
        });
    };

    return { getNotifications, markAsRead };
};
