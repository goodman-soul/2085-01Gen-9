import { BillingDetail } from '@/types';
import { formatDuration, formatCurrency } from '@/utils/billing';
import { Clock, Calendar, Tag, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeeBreakdownProps {
  billing: BillingDetail;
}

export default function FeeBreakdown({ billing }: FeeBreakdownProps) {
  const ruleBadge = {
    基础: 'bg-forest-100 text-forest-700',
    旺季: 'bg-amber-100 text-amber-700',
    临时: 'bg-blue-100 text-blue-700',
  }[billing.pricingRuleType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 space-y-5"
    >
      <div className="flex items-center gap-2 border-b pb-4">
        <Receipt className="w-6 h-6 text-forest-600" />
        <h3 className="text-xl font-bold text-gray-800">费用明细</h3>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${ruleBadge}`}>
          {billing.pricingRuleName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            使用时长
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatDuration(billing.durationMinutes)}</div>
          <div className="text-xs text-gray-400 mt-1">计费 {billing.billableHours} 小时</div>
        </div>

        <div className="bg-forest-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-forest-600 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            占用天数
          </div>
          <div className="text-2xl font-bold text-forest-700">{billing.days} 天</div>
          <div className="text-xs text-forest-500 mt-1">每日封顶 {formatCurrency(billing.dailyCap)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          <Tag className="w-4 h-4" /> 每日明细
        </div>
        {billing.dailyAmounts.map((day, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
          >
            <span className="text-gray-600">{day.date}</span>
            <span className="text-gray-500 text-sm">{day.hours} 小时</span>
            <span className="font-semibold text-gray-800">{formatCurrency(day.amount)}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-dashed">
        <div className="flex items-baseline justify-between">
          <span className="text-gray-600 font-medium">首小时 {formatCurrency(billing.firstHourPrice)} + 续时 {formatCurrency(billing.nextHourPrice)}/小时</span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-xl font-bold text-gray-800">应付金额</span>
          <span className="text-4xl font-black text-amber-600">{formatCurrency(billing.totalAmount)}</span>
        </div>
      </div>
    </motion.div>
  );
}
