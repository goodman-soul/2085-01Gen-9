import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PricingRule } from '@/types';
import { createBasePricingRule } from '@/utils/pricing';

function createInitialRules(): PricingRule[] {
  const base = createBasePricingRule();
  const today = new Date();
  const peakStart = new Date(today);
  peakStart.setDate(today.getDate() - 5);
  const peakEnd = new Date(today);
  peakEnd.setDate(today.getDate() + 15);

  return [
    base,
    {
      id: 'peak-summer',
      name: '暑期旺季',
      type: '旺季',
      firstHourPrice: 15,
      nextHourPrice: 8,
      dailyCap: 80,
      startDate: peakStart.toISOString().split('T')[0],
      endDate: peakEnd.toISOString().split('T')[0],
      isActive: true,
    },
  ];
}

interface PricingState {
  rules: PricingRule[];
  addRule: (rule: Omit<PricingRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<PricingRule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set, get) => ({
      rules: createInitialRules(),

      addRule: (rule) => {
        const newRule: PricingRule = {
          ...rule,
          id: `rule-${Date.now()}`,
        };
        set((state) => ({ rules: [...state.rules, newRule] }));
      },

      updateRule: (id, updates) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRule: (id) => {
        if (get().rules.find((r) => r.id === id)?.type === '基础') return;
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
      },

      toggleRuleActive: (id) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
        })),
    }),
    { name: 'pricing-store' }
  )
);
