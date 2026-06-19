import { format, differenceInMinutes, differenceInCalendarDays, startOfDay } from 'date-fns';
import { BillingDetail, PricingRule } from '@/types';

export function calculateBilling(
  startTime: Date,
  endTime: Date,
  pricing: Pick<PricingRule, 'name' | 'type' | 'firstHourPrice' | 'nextHourPrice' | 'dailyCap'>
): BillingDetail {
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

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} 分钟`;
  if (mins === 0) return `${hours} 小时`;
  return `${hours} 小时 ${mins} 分钟`;
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
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
