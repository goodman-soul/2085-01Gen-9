import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, PricingSnapshot } from '@/types';
import { generateOrderId, calculateBilling } from '@/utils/billing';

interface OrderState {
  orders: Order[];
  activeOrders: Order[];
  createOrder: (lockerId: string, password: string, phone: string, pricingSnapshot: PricingSnapshot) => Order;
  completeOrder: (orderId: string) => { durationMinutes: number; totalAmount: number } | null;
  getActiveOrderByLocker: (lockerId: string) => Order | undefined;
  getOrderById: (id: string) => Order | undefined;
  updateOrderPassword: (orderId: string, newPassword: string) => void;
  getTodayOrders: () => Order[];
  getTodayRevenue: () => number;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      get activeOrders() {
        return get().orders.filter((o) => o.status === '进行中');
      },

      createOrder: (lockerId, password, phone, pricingSnapshot) => {
        const order: Order = {
          id: generateOrderId(),
          lockerId,
          password,
          phone,
          startTime: new Date().toISOString(),
          status: '进行中',
          pricingSnapshot,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      completeOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || order.status !== '进行中') return null;

        const endTime = new Date();
        const billing = calculateBilling(
          new Date(order.startTime),
          endTime,
          order.pricingSnapshot
        );

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  endTime: endTime.toISOString(),
                  durationMinutes: billing.durationMinutes,
                  totalAmount: billing.totalAmount,
                  status: '已完成',
                }
              : o
          ),
        }));

        return { durationMinutes: billing.durationMinutes, totalAmount: billing.totalAmount };
      },

      getActiveOrderByLocker: (lockerId) =>
        get().orders.find((o) => o.lockerId === lockerId && o.status === '进行中'),

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      updateOrderPassword: (orderId, newPassword) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, password: newPassword } : o)),
        })),

      getTodayOrders: () => {
        const today = new Date().toDateString();
        return get().orders.filter((o) => new Date(o.startTime).toDateString() === today);
      },

      getTodayRevenue: () => {
        return get()
          .getTodayOrders()
          .filter((o) => o.status === '已完成')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      },
    }),
    { name: 'order-store' }
  )
);
