import { create } from 'zustand';
import { LogEntry, ActionType } from '@/types';
import { api } from '@/lib/api';

interface LogState {
  logs: LogEntry[];
  loading: boolean;
  fetchLogs: (filters?: {
    lockerId?: string;
    actionType?: ActionType;
    startDate?: string;
    endDate?: string;
    operator?: string;
  }) => Promise<void>;
}

export const useLogStore = create<LogState>()(() => ({
  logs: [],
  loading: false,

  fetchLogs: async (filters) => {
    const params = new URLSearchParams();
    if (filters?.lockerId) params.set('lockerId', filters.lockerId);
    if (filters?.actionType) params.set('actionType', filters.actionType);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.operator) params.set('operator', filters.operator);
    const qs = params.toString();
    const logs = await api.get<LogEntry[]>(`/logs${qs ? `?${qs}` : ''}`);
    useLogStore.setState({ logs });
  },
}));
