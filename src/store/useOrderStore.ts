import { create } from 'zustand';
import { Order, PricingSnapshot, BillingDetail } from '@/types';
import { api } from '@/lib/api';

interface OrderState {
  activeOrders: Order[];
  todayOrders: Order[];
  todayRevenue: number;
  loading: boolean;
  fetchActiveOrders: () => Promise<void>;
  fetchTodayOrders: () => Promise<void>;
  fetchTodayRevenue: () => Promise<void>;
  createOrder: (lockerId: string, password: string, phone: string, pricingSnapshot: PricingSnapshot) => Promise<{ id: string; lockerId: string; startTime: string }>;
  completeOrder: (orderId: string, reason?: string) => Promise<{ durationMinutes: number; totalAmount: number; billing: BillingDetail }>;
  verifyAndBill: (lockerId: string, password: string) => Promise<{ order: Order; billing: BillingDetail }>;
  getActiveOrderByLocker: (lockerId: string) => Promise<Order | null>;
  updateOrderPassword: (orderId: string, newPassword: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>()(() => ({
  activeOrders: [],
  todayOrders: [],
  todayRevenue: 0,
  loading: false,

  fetchActiveOrders: async () => {
    const activeOrders = await api.get<Order[]>('/orders/active');
    useOrderStore.setState({ activeOrders });
  },

  fetchTodayOrders: async () => {
    const todayOrders = await api.get<Order[]>('/orders/today');
    useOrderStore.setState({ todayOrders });
  },

  fetchTodayRevenue: async () => {
    const { revenue } = await api.get<{ revenue: number }>('/orders/today/revenue');
    useOrderStore.setState({ todayRevenue: revenue });
  },

  createOrder: async (lockerId, password, phone) => {
    return api.post('/orders', { lockerId, password, phone });
  },

  completeOrder: async (orderId, reason) => {
    const result = await api.post<{
      id: string;
      durationMinutes: number;
      totalAmount: number;
      billing: BillingDetail;
    }>(`/orders/${orderId}/complete`, { reason });
    return result;
  },

  verifyAndBill: async (lockerId, password) => {
    return api.post<{ order: Order; billing: BillingDetail }>('/orders/verify', { lockerId, password });
  },

  getActiveOrderByLocker: async (lockerId) => {
    return api.get<Order | null>(`/orders/active/${lockerId}`);
  },

  updateOrderPassword: async (orderId, newPassword) => {
    await api.patch(`/orders/${orderId}/password`, { newPassword });
  },
}));
