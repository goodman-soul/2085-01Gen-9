import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Locker, LockerSize, LockerStatus } from '@/types';

interface LockerState {
  lockers: Locker[];
  getLocker: (id: string) => Locker | undefined;
  getLockersByStatus: (status: LockerStatus) => Locker[];
  getAvailableLockers: () => Locker[];
  updateLockerStatus: (id: string, status: LockerStatus, faultRemark?: string) => void;
  resetLockers: () => void;
}

function generateInitialLockers(): Locker[] {
  const lockers: Locker[] = [];
  const sizes: LockerSize[] = ['小', '中', '大'];
  for (let row = 1; row <= 4; row++) {
    for (let col = 1; col <= 5; col++) {
      const id = `A${String((row - 1) * 5 + col).padStart(2, '0')}`;
      lockers.push({
        id,
        status: '空闲',
        location: `A区第${row}排`,
        size: sizes[(row + col) % 3],
        createdAt: new Date().toISOString(),
      });
    }
  }
  lockers[2].status = '使用中';
  lockers[4].status = '故障';
  lockers[4].faultRemark = '电子锁损坏，待维修';
  return lockers;
}

export const useLockerStore = create<LockerState>()(
  persist(
    (set, get) => ({
      lockers: generateInitialLockers(),

      getLocker: (id) => get().lockers.find((l) => l.id === id),

      getLockersByStatus: (status) => get().lockers.filter((l) => l.status === status),

      getAvailableLockers: () => get().lockers.filter((l) => l.status === '空闲'),

      updateLockerStatus: (id, status, faultRemark) =>
        set((state) => ({
          lockers: state.lockers.map((l) =>
            l.id === id ? { ...l, status, faultRemark: status === '故障' ? faultRemark : undefined } : l
          ),
        })),

      resetLockers: () => set({ lockers: generateInitialLockers() }),
    }),
    { name: 'locker-store' }
  )
);
