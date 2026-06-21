import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Search, Wrench, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { LockerStatus } from '@/types';
import { useLockerStore } from '@/store/useLockerStore';
import { useOrderStore } from '@/store/useOrderStore';
import { formatCurrency, formatDuration } from '@/utils/billing';
import { format } from 'date-fns';

export default function LockerManage() {
  const { lockers, fetchLockers, updateLockerStatus } = useLockerStore();
  const { activeOrders, fetchActiveOrders } = useOrderStore();

  useEffect(() => {
    fetchLockers();
    fetchActiveOrders();
  }, [fetchLockers, fetchActiveOrders]);

  const orderMap = useMemo(() => {
    const map = new Map<string, (typeof activeOrders)[number]>();
    for (const order of activeOrders) {
      map.set(order.lockerId, order);
    }
    return map;
  }, [activeOrders]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LockerStatus | '全部'>('全部');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [faultModalLocker, setFaultModalLocker] = useState<string | null>(null);
  const [faultRemark, setFaultRemark] = useState('');

  const filteredLockers = lockers.filter((l) => {
    const matchSearch = l.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '全部' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: LockerStatus) => {
    const map = {
      空闲: 'bg-forest-100 text-forest-700',
      使用中: 'bg-amber-100 text-amber-700',
      故障: 'bg-red-100 text-red-700',
    };
    return map[status];
  };

  const handleMarkFault = async () => {
    if (!faultModalLocker) return;
    await updateLockerStatus(faultModalLocker, '故障', faultRemark);
    setFaultModalLocker(null);
    setFaultRemark('');
  };

  const handleClearFault = async (lockerId: string) => {
    await updateLockerStatus(lockerId, '空闲');
  };

  const handleForceFree = async (lockerId: string) => {
    await updateLockerStatus(lockerId, '空闲');
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">柜门管理</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索柜门号..."
              className="pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-forest-500 outline-none transition"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
            {(['全部', '空闲', '使用中', '故障'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-forest-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-left">
              <th className="py-4 px-6 font-medium">柜门号</th>
              <th className="py-4 px-6 font-medium">位置</th>
              <th className="py-4 px-6 font-medium">尺寸</th>
              <th className="py-4 px-6 font-medium">状态</th>
              <th className="py-4 px-6 font-medium">当前订单</th>
              <th className="py-4 px-6 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredLockers.map((locker, idx) => {
              const order = orderMap.get(locker.id);
              const isExpanded = expandedId === locker.id;
              return (
                <motion.tr
                  key={locker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-gray-800 text-lg">{locker.id}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{locker.location}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">
                      {locker.size}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(locker.status)}`}>
                      {locker.status}
                    </span>
                    {locker.faultRemark && (
                      <p className="text-xs text-red-500 mt-1">{locker.faultRemark}</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {order ? (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : locker.id)}
                        className="text-left"
                      >
                        <div className="font-mono text-xs text-gray-600">{order.id}</div>
                        <div className="text-xs text-gray-400">
                          {isExpanded ? (
                            <span className="text-forest-600 flex items-center gap-1">
                            收起 <ChevronUp className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-forest-600 flex items-center gap-1">
                              详情 <ChevronDown className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {locker.status === '故障' ? (
                        <button
                          onClick={() => handleClearFault(locker.id)}
                          className="p-2 text-forest-600 hover:bg-forest-50 rounded-lg transition"
                          title="解除故障"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setFaultModalLocker(locker.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="标记故障"
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                      )}
                      {locker.status === '使用中' && (
                        <button
                          onClick={() => handleForceFree(locker.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="强制释放"
                        >
                          <Unlock className="w-5 h-5" />
                        </button>
                      )}
                      {locker.status === '空闲' && (
                        <button className="p-2 text-gray-400 cursor-not-allowed" title="空闲中" disabled>
                          <Lock className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        <AnimatePresence>
          {expandedId && (() => {
            const order = orderMap.get(expandedId);
            if (!order) return null;
            const mins = Math.floor((Date.now() - new Date(order.startTime).getTime()) / 60000);
            return (
              <motion.tr
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <td colSpan={6} className="p-0">
                  <div className="overflow-hidden bg-forest-50/50 border-t">
                    <div className="p-6 grid grid-cols-4 gap-6">
                      <div>
                        <span className="text-xs text-gray-500">手机号</span>
                        <p className="font-mono font-semibold">
                          {order.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">开始时间</span>
                        <p className="font-medium">
                          {format(new Date(order.startTime), 'yyyy-MM-dd HH:mm')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">已用时长</span>
                        <p className="font-semibold text-amber-600">{formatDuration(Math.floor(mins))}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">计费规则</span>
                        <p className="font-medium">{order.pricingSnapshot.name}</p>
                        <p className="text-xs text-gray-400">
                          首{formatCurrency(order.pricingSnapshot.firstHourPrice)} +
                          续{formatCurrency(order.pricingSnapshot.nextHourPrice)}/h
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })()}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {faultModalLocker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setFaultModalLocker(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card p-6 w-96"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Wrench className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">标记故障</h3>
                <p className="text-sm text-gray-500">柜门 {faultModalLocker}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="label">故障备注</label>
              <textarea
                value={faultRemark}
                onChange={(e) => setFaultRemark(e.target.value)}
                placeholder="请描述故障原因"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFaultModalLocker(null)}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button onClick={handleMarkFault} className="btn-danger flex-1">
                确认标记
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
