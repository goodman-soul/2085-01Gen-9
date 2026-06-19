export type LockerStatus = '空闲' | '使用中' | '故障';
export type LockerSize = '小' | '中' | '大';

export interface Locker {
  id: string;
  status: LockerStatus;
  location: string;
  size: LockerSize;
  createdAt: string;
  faultRemark?: string;
}

export type OrderStatus = '进行中' | '已完成' | '已取消';

export interface Order {
  id: string;
  lockerId: string;
  password: string;
  phone: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalAmount?: number;
  status: OrderStatus;
  pricingSnapshot: PricingSnapshot;
}

export interface PricingSnapshot {
  name: string;
  type: PricingRuleType;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
}

export type PricingRuleType = '基础' | '旺季' | '临时';

export interface PricingRule {
  id: string;
  name: string;
  type: PricingRuleType;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export type ActionType =
  | '寄存'
  | '取件'
  | '密码重置'
  | '故障标记'
  | '故障解除'
  | '人工代取'
  | '价格调整'
  | '柜门状态变更'
  | '管理员登录';

export interface LogEntry {
  id: string;
  actionType: ActionType;
  lockerId?: string;
  orderId?: string;
  operator: string;
  timestamp: string;
  beforeState?: string;
  afterState?: string;
  remark?: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
}

export interface BillingDetail {
  durationMinutes: number;
  billableHours: number;
  firstHourPrice: number;
  nextHourPrice: number;
  dailyCap: number;
  days: number;
  dailyAmounts: { date: string; amount: number; hours: number }[];
  totalAmount: number;
  pricingRuleName: string;
  pricingRuleType: PricingRuleType;
}
