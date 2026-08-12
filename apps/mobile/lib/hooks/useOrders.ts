import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useOrders(page = 0) {
  return useQuery({
    queryKey: ['orders', page],
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
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users/me/addresses');
      return res.data.data as any[];
    },
  });
}
