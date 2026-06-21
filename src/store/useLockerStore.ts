import { create } from 'zustand';
import { Locker, LockerStatus } from '@/types';
import { api } from '@/lib/api';

interface LockerState {
  lockers: Locker[];
  loading: boolean;
  fetchLockers: () => Promise<void>;
  getLocker: (id: string) => Locker | undefined;
  getLockersByStatus: (status: LockerStatus) => Locker[];
  getAvailableLockers: () => Locker[];
  updateLockerStatus: (id: string, status: LockerStatus, faultRemark?: string) => Promise<void>;
}

export const useLockerStore = create<LockerState>()((set, get) => ({
  lockers: [],
  loading: false,

  fetchLockers: async () => {
    set({ loading: true });
    try {
      const lockers = await api.get<Locker[]>('/lockers');
      set({ lockers });
    } finally {
      set({ loading: false });
    }
  },

  getLocker: (id) => get().lockers.find((l) => l.id === id),

  getLockersByStatus: (status) => get().lockers.filter((l) => l.status === status),

  getAvailableLockers: () => get().lockers.filter((l) => l.status === '空闲'),

  updateLockerStatus: async (id, status, faultRemark) => {
    await api.patch(`/lockers/${id}/status`, { status, faultRemark });
    await get().fetchLockers();
  },
}));
