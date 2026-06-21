import { create } from 'zustand';
import { PricingRule } from '@/types';
import { api } from '@/lib/api';

interface CurrentRule {
  id: string;
  name: string;
  type: string;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
}

interface PricingState {
  rules: PricingRule[];
  currentRule: CurrentRule | null;
  loading: boolean;
  fetchRules: () => Promise<void>;
  fetchCurrentRule: () => Promise<void>;
  addRule: (rule: Omit<PricingRule, 'id'>) => Promise<string>;
  updateRule: (id: string, updates: Partial<PricingRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRuleActive: (id: string) => Promise<boolean>;
}

export const usePricingStore = create<PricingState>()(() => ({
  rules: [],
  currentRule: null,
  loading: false,

  fetchRules: async () => {
    const rules = await api.get<PricingRule[]>('/pricing');
    usePricingStore.setState({ rules });
  },

  fetchCurrentRule: async () => {
    const currentRule = await api.get<CurrentRule>('/pricing/current');
    usePricingStore.setState({ currentRule });
  },

  addRule: async (rule) => {
    const { id } = await api.post<{ id: string }>('/pricing', rule);
    await usePricingStore.getState().fetchRules();
    return id;
  },

  updateRule: async (id, updates) => {
    await api.patch(`/pricing/${id}`, updates);
    await usePricingStore.getState().fetchRules();
  },

  deleteRule: async (id) => {
    await api.delete(`/pricing/${id}`);
    await usePricingStore.getState().fetchRules();
  },

  toggleRuleActive: async (id) => {
    const { isActive } = await api.patch<{ ok: boolean; isActive: boolean }>(`/pricing/${id}/toggle`);
    await usePricingStore.getState().fetchRules();
    return isActive;
  },
}));
