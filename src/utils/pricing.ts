import { PricingRule } from '@/types';
import { isWithinInterval, parseISO } from 'date-fns';

export function findApplicablePricingRule(
  rules: PricingRule[],
  targetDate: Date = new Date()
): PricingRule {
  const baseRule = rules.find((r) => r.type === '基础' && r.isActive);
  if (!baseRule) {
    throw new Error('未找到基础价格规则');
  }

  const tempRule = rules.find((r) => {
    if (r.type !== '临时' || !r.isActive || !r.startDate || !r.endDate) return false;
    return isWithinInterval(targetDate, {
      start: parseISO(r.startDate),
      end: parseISO(r.endDate + 'T23:59:59'),
    });
  });

  const peakRule = rules.find((r) => {
    if (r.type !== '旺季' || !r.isActive || !r.startDate || !r.endDate) return false;
    return isWithinInterval(targetDate, {
      start: parseISO(r.startDate),
      end: parseISO(r.endDate + 'T23:59:59'),
    });
  });

  return tempRule || peakRule || baseRule;
}

export function createBasePricingRule(): PricingRule {
  return {
    id: 'base-default',
    name: '基础价格',
    type: '基础',
    firstHourPrice: 10,
    nextHourPrice: 5,
    dailyCap: 50,
    isActive: true,
  };
}
