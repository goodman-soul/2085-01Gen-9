import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Mountain, Lock, Search, AlertCircle, Check } from 'lucide-react';
import { useLockerStore } from '@/store/useLockerStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogStore } from '@/store/useLogStore';
import { calculateBilling, formatCurrency, formatDuration } from '@/utils/billing';
import { format } from 'date-fns';

export default function ManualPickup() {
  const { getLocker } = useLockerStore();
  const { getActiveOrderByLocker, completeOrder } = useOrderStore();
  const { currentAdmin } = useAuthStore();
  const { addLog } = useLogStore();

  const [lockerId, setLockerId] = useState('');
  const [reason, setReason] = useState('');
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setTick] = useState(0);

  const order = lockerId ? getActiveOrderByLocker(lockerId.toUpperCase()) : null;
  const locker = lockerId ? getLocker(lockerId.toUpperCase()) : null;

  useEffect(() => {
    if (searched && order) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [searched, order]);

  const handleSearch = () => {
    setError('');
    setSuccess(false);
    if (!lockerId.trim()) {
      setError('请输入柜门号');
      return;
    }
    if (!locker) {
      setError('柜门不存在');
      return;
    }
    if (!order) {
      setError('该柜门当前没有寄存订单');
      return;
    }
    setSearched(true);
  };

  const handleManualPickup = () => {
    if (!order || !reason.trim()) {
      setError('请填写代取原因');
      return;
    }

    const billing = calculateBilling(
      new Date(order.startTime),
      new Date(),
      order.pricingSnapshot
    );
    const result = completeOrder(order.id);

    if (result) {
      addLog({
        actionType: '人工代取',
        lockerId: order.lockerId,
        orderId: order.id,
        operator: currentAdmin?.name || '管理员',
        beforeState: '使用中',
        afterState: '空闲',
        remark: `${reason} | 时长${formatDuration(result.durationMinutes)}，费用${formatCurrency(result.totalAmount)}`,
      });
      setSuccess(true);
    }
  };

  const billing = order
    ? calculateBilling(new Date(order.startTime), new Date(), order.pricingSnapshot)
    : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserCheck className="w-7 h-7 text-amber-600" />
          人工代取
        </h1>
        <p className="text-gray-500 mt-1">管理员验证身份后强制开门，全程记录可追溯</p>
      </div>

      {!searched || success ? (
        <motion.div
          key="search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-forest-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">人工代取完成</h2>
              <p className="text-gray-500 mb-8">柜门已开启，操作已记录到日志</p>
              <button
                onClick={() => {
                  setSearched(false);
                  setSuccess(false);
                  setLockerId('');
                  setReason('');
                }}
                className="btn-primary"
              >
                继续代取
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-8">
                <div className="p-5 bg-amber-50 rounded-2xl">
                  <Mountain className="w-12 h-12 text-amber-600" />
                </div>
              </div>

              <div className="space-y-5 max-w-md mx-auto">
                <div>
                  <label className="label flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    柜门编号
                  </label>
                  <input
                    type="text"
                    value={lockerId}
                    onChange={(e) => setLockerId(e.target.value.toUpperCase().slice(0, 3))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="输入柜门号，如 A01"
                    className="input-field text-center font-mono text-xl tracking-wider"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-red-500 bg-red-50 rounded-lg px-4 py-3"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button onClick={handleSearch} className="btn-accent w-full">
                  查询订单
                </button>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        order && billing && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                订单信息
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">订单号</span>
                  <p className="font-mono text-gray-800">{order.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">柜门号</span>
                  <p className="font-bold text-forest-700 text-xl">{order.lockerId}</p>
                </div>
                <div>
                  <span className="text-gray-500">手机号</span>
                  <p className="font-mono">
                    {order.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">开始时间</span>
                  <p className="text-gray-800">
                    {format(new Date(order.startTime), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">已用时长</span>
                  <p className="text-amber-600 font-semibold">
                    {formatDuration(billing.durationMinutes)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">计费规则</span>
                  <p>{order.pricingSnapshot.name}</p>
                </div>
                <div className="col-span-2 bg-amber-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">预计费用</span>
                    <span className="text-3xl font-black text-amber-600">
                      {formatCurrency(billing.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 border-2 border-amber-200 bg-amber-50/30">
              <label className="label flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                代取原因（必填，将记录到日志）
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例如：游客证件核验通过、游客紧急就医、密码遗忘且手机无法接收验证码..."
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 resize-none bg-white"
                rows={3}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSearched(false);
                  setLockerId('');
                  setReason('');
                }}
                className="btn-outline flex-1"
              >
                返回查询
              </button>
              <button
                onClick={handleManualPickup}
                className="btn-accent flex-1 text-lg"
              >
                确认人工代取并开门
              </button>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
