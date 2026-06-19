import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LogEntry, ActionType } from '@/types';
import { generateLogId } from '@/utils/billing';

interface LogState {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  filterLogs: (filters: {
    lockerId?: string;
    actionType?: ActionType;
    startDate?: string;
    endDate?: string;
    operator?: string;
  }) => LogEntry[];
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (entry) => {
        const log: LogEntry = {
          ...entry,
          id: generateLogId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ logs: [log, ...state.logs] }));
      },

      filterLogs: ({ lockerId, actionType, startDate, endDate, operator }) => {
        return get().logs.filter((log) => {
          if (lockerId && log.lockerId !== lockerId) return false;
          if (actionType && log.actionType !== actionType) return false;
          if (operator && !log.operator.includes(operator)) return false;
          if (startDate && new Date(log.timestamp) < new Date(startDate)) return false;
          if (endDate && new Date(log.timestamp) > new Date(endDate + 'T23:59:59')) return false;
          return true;
        });
      },
    }),
    { name: 'log-store' }
  )
);
