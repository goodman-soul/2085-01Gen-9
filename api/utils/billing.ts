import { format, differenceInMinutes, differenceInCalendarDays, startOfDay } from 'date-fns';

export interface BillingInput {
  name: string;
  type: string;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
}

export interface BillingResult {
  durationMinutes: number;
  billableHours: number;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
  days: number;
  dailyAmounts: { date: string; amount: number; hours: number }[];
  totalAmount: number;
  pricingRuleName: string;
  pricingRuleType: string;
}

export function calculateBilling(startTime: Date, endTime: Date, pricing: BillingInput): BillingResult {
  const durationMinutes = Math.max(differenceInMinutes(endTime, startTime), 1);
  const days = Math.max(differenceInCalendarDays(endTime, startOfDay(startTime)) + 1, 1);

  const dailyAmounts: { date: string; amount: number; hours: number }[] = [];
  let totalAmount = 0;

  for (let d = 0; d < days; d++) {
    const dayStart = new Date(startTime);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + d);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const effectiveStart = d === 0 ? startTime : dayStart;
    const effectiveEnd = d === days - 1 ? endTime : dayEnd;

    const minutesInDay = differenceInMinutes(effectiveEnd, effectiveStart);
    const billableHoursInDay = Math.ceil(minutesInDay / 60);

    let dayAmount = 0;
    if (d === 0) {
      dayAmount = pricing.firstHourPrice + Math.max(billableHoursInDay - 1, 0) * pricing.nextHourPrice;
    } else {
      dayAmount = billableHoursInDay * pricing.nextHourPrice;
    }

    if (pricing.dailyCap > 0) {
      dayAmount = Math.min(dayAmount, pricing.dailyCap);
    }

    dailyAmounts.push({
      date: format(dayStart, 'yyyy-MM-dd'),
      amount: dayAmount,
      hours: billableHoursInDay,
    });
    totalAmount += dayAmount;
  }

  const billableHours = dailyAmounts.reduce((sum, d) => sum + d.hours, 0);

  return {
    durationMinutes,
    billableHours,
    firstHourPrice: pricing.firstHourPrice,
    nextHourPrice: pricing.nextHourPrice,
    dailyCap: pricing.dailyCap,
    days,
    dailyAmounts,
    totalAmount,
    pricingRuleName: pricing.name,
    pricingRuleType: pricing.type,
  };
}

export function generateOrderId(): string {
  const now = new Date();
  const ts = format(now, 'yyyyMMddHHmmss');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LC${ts}${rand}`;
}

export function generateLogId(): string {
  return `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
