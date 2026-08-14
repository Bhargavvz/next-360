import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../auth';

export function useOrders(page = 0) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['orders', page],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get(`/api/v1/orders?page=${page}&size=20`);
      return res.data.data;
    },
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('No orderId');
      const res = await api.get(`/api/v1/orders/${orderId}`);
      return res.data.data;
    },
    enabled: !!orderId,
  });
}

export function useAddresses() {
  // Gated on auth: firing this while signed out returns 401, which trips the client's
  // refresh-then-sign-out handling for no reason.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['addresses'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me/addresses');
      return res.data.data as any[];
    },
  });
}
