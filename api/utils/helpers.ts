import { isWithinInterval, parseISO } from 'date-fns';
import getDb from '../db.js';

interface PricingRuleRow {
  id: string;
  name: string;
  type: string;
  first_hour_price: number;
  next_hour_price: number;
  daily_cap: number;
  start_date: string | null;
  end_date: string | null;
  is_active: number;
}

export function findApplicablePricingRule(targetDate: Date = new Date()) {
  const db = getDb();
  const rules = db.prepare('SELECT * FROM pricing_rules WHERE is_active = 1 ORDER BY type').all() as PricingRuleRow[];

  const baseRule = rules.find((r) => r.type === '基础');
  if (!baseRule) throw new Error('未找到基础价格规则');

  const tempRule = rules.find((r) => {
    if (r.type !== '临时' || !r.start_date || !r.end_date) return false;
    return isWithinInterval(targetDate, {
      start: parseISO(r.start_date),
      end: parseISO(r.end_date + 'T23:59:59'),
    });
  });

  const peakRule = rules.find((r) => {
    if (r.type !== '旺季' || !r.start_date || !r.end_date) return false;
    return isWithinInterval(targetDate, {
      start: parseISO(r.start_date),
      end: parseISO(r.end_date + 'T23:59:59'),
    });
  });

  const rule = tempRule || peakRule || baseRule;
  return {
    id: rule.id,
    name: rule.name,
    type: rule.type,
    firstHourPrice: rule.first_hour_price,
    nextHourPrice: rule.next_hour_price,
    dailyCap: rule.daily_cap,
  };
}

export function addLog(params: {
  actionType: string;
  lockerId?: string;
  orderId?: string;
  operator: string;
  beforeState?: string;
  afterState?: string;
  remark?: string;
}) {
  const db = getDb();
  const id = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
  db.prepare(
    `INSERT INTO logs (id, action_type, locker_id, order_id, operator, before_state, after_state, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.actionType,
    params.lockerId || null,
    params.orderId || null,
    params.operator,
    params.beforeState || null,
    params.afterState || null,
    params.remark || null
  );
  return id;
}
