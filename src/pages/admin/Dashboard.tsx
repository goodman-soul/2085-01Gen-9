import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Archive, AlertTriangle, Coins, TrendingUp, Clock, Calendar } from 'lucide-react';
import StatCard from '@/components/StatCard';
import LockerGrid from '@/components/LockerGrid';
import { useLockerStore } from '@/store/useLockerStore';
import { useOrderStore } from '@/store/useOrderStore';
import { usePricingStore } from '@/store/usePricingStore';
import { formatCurrency, formatDuration } from '@/utils/billing';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Dashboard() {
  const { lockers, getLockersByStatus, fetchLockers } = useLockerStore();
  const { activeOrders, todayOrders, todayRevenue, fetchActiveOrders, fetchTodayOrders, fetchTodayRevenue } = useOrderStore();
  const { currentRule, fetchCurrentRule } = usePricingStore();

  useEffect(() => {
    fetchLockers();
    fetchActiveOrders();
    fetchTodayOrders();
    fetchTodayRevenue();
    fetchCurrentRule();
  }, [fetchLockers, fetchActiveOrders, fetchTodayOrders, fetchTodayRevenue, fetchCurrentRule]);

  const freeCount = getLockersByStatus('空闲').length;
  const usedCount = getLockersByStatus('使用中').length;
  const faultCount = getLockersByStatus('故障').length;
  const totalCount = lockers.length;
  const usageRate = totalCount > 0 ? Math.round((usedCount / (totalCount - faultCount)) * 100) : 0;

  const recentOrders = useMemo(() => {
    return todayOrders.slice(0, 5);
  }, [todayOrders]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运营仪表盘</h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </p>
        </div>
        {currentRule && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-700 font-medium text-sm">
              当前费率：{currentRule.name} - 首小时{formatCurrency(currentRule.firstHourPrice)}
            </span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-4 gap-5">
        <StatCard title="今日订单" value={todayOrders.length} icon={Archive} color="green" />
        <StatCard title="今日收入" value={formatCurrency(todayRevenue)} icon={Coins} color="amber" />
        <StatCard title="当前在柜" value={usedCount} icon={Clock} color="blue" trend={`使用率 ${usageRate}%`} />
        <StatCard title="故障柜门" value={faultCount} icon={AlertTriangle} color="red" trend={`共 ${totalCount} 个柜`} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 card p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            实时柜门状态
          </h2>
          <LockerGrid lockers={lockers} />
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-forest-500" />
              空闲 {freeCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              使用中 {usedCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              故障 {faultCount}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-600" />
            今日订单
          </h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Archive className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无今日订单</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-forest-100 text-forest-700 rounded text-xs">
                        {order.lockerId}
                      </span>
                      <span
                        className={`text-xs ${
                          order.status === '进行中'
                            ? 'text-amber-600'
                            : order.status === '已完成'
                            ? 'text-forest-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      {format(new Date(order.startTime), 'HH:mm:ss')}
                    </div>
                  </div>
                  <div className="text-right">
                    {order.totalAmount !== undefined ? (
                      <div className="font-bold text-amber-600">{formatCurrency(order.totalAmount)}</div>
                    ) : (
                      <div className="text-sm text-gray-400">进行中</div>
                    )}
                    {order.durationMinutes !== undefined && (
                      <div className="text-xs text-gray-400">{formatDuration(order.durationMinutes)}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">当前在柜订单 ({activeOrders.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-3 px-4 font-medium">订单号</th>
                <th className="text-left py-3 px-4 font-medium">柜门</th>
                <th className="text-left py-3 px-4 font-medium">手机号</th>
                <th className="text-left py-3 px-4 font-medium">开始时间</th>
                <th className="text-left py-3 px-4 font-medium">已用时长</th>
                <th className="text-left py-3 px-4 font-medium">计费规则</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    暂无在柜订单
                  </td>
                </tr>
              ) : (
                activeOrders.map((order) => {
                  const mins = Math.floor((Date.now() - new Date(order.startTime).getTime()) / 60000);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{order.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-forest-100 text-forest-700 rounded font-semibold">
                          {order.lockerId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {order.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(order.startTime), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-600 font-semibold">{formatDuration(mins)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                          {order.pricingSnapshot.name}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
