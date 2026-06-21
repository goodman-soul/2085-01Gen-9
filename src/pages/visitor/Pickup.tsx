import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Mountain, Lock } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import FeeBreakdown from '@/components/FeeBreakdown';
import { Order, BillingDetail } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import { formatDuration, formatCurrency } from '@/utils/billing';

type Step = 'input' | 'confirm' | 'success';

export default function PickupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [lockerId, setLockerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [billingResult, setBillingResult] = useState<BillingDetail | null>(null);
  const [completedBilling, setCompletedBilling] = useState<BillingDetail | null>(null);
  const [, setTick] = useState(0);

  const { verifyAndBill, completeOrder } = useOrderStore();

  useEffect(() => {
    if (step === 'confirm' && order) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, order]);

  const handleVerify = async () => {
    setError('');
    if (!lockerId.trim()) {
      setError('请输入柜门号');
      return;
    }
    if (password.length !== 6) {
      setError('请输入6位密码');
      return;
    }

    setVerifying(true);
    try {
      const { order: foundOrder, billing } = await verifyAndBill(lockerId.toUpperCase(), password);
      setOrder(foundOrder);
      setBillingResult(billing);
      setStep('confirm');
    } catch {
      setError('柜门号或密码错误，请重试或点击忘记密码');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (step === 'confirm' && order) {
      verifyAndBill(order.lockerId, order.password).then(({ billing }) => {
        setBillingResult(billing);
      }).catch(() => {});
    }
  });

  const handleConfirmPay = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      const result = await completeOrder(order.id);
      setCompletedBilling(result.billing);
      setStep('success');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-forest-50 p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-xl">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">取件结算</h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center mb-8">
                <div className="p-4 bg-amber-100 rounded-2xl">
                  <Lock className="w-10 h-10 text-amber-600" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">柜门编号</label>
                  <input
                    type="text"
                    value={lockerId}
                    onChange={(e) =>
                      setLockerId(e.target.value.toUpperCase().slice(0, 3))
                    }
                    placeholder="例如 A01"
                    className="input-field text-center font-mono text-xl tracking-wider"
                  />
                </div>

                <PasswordInput value={password} onChange={setPassword} label="取件密码" />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button onClick={handleVerify} disabled={verifying} className="btn-accent w-full">
                  {verifying ? '查询中...' : '查询订单'}
                </button>

                <Link
                  to="/forgot"
                  className="block text-center text-forest-600 hover:underline text-sm"
                >
                  忘记密码？
                </Link>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && order && billingResult && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-800">订单信息</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    进行中
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">订单号</span>
                    <p className="font-mono text-gray-800">{order.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">柜门号</span>
                    <p className="font-bold text-forest-700 text-lg">{order.lockerId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">开始时间</span>
                    <p className="text-gray-800">
                      {new Date(order.startTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">当前时间</span>
                    <p className="text-gray-800">{new Date().toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              </div>

              <FeeBreakdown billing={billingResult} />

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep('input');
                    setLockerId('');
                    setPassword('');
                  }}
                  className="btn-outline flex-1"
                >
                  返回
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPay}
                  disabled={paying}
                  className="btn-accent flex-1 text-lg animate-pulse-slow"
                >
                  {paying ? '支付中...' : `确认支付 ${formatCurrency(billingResult.totalAmount)}`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'success' && order && completedBilling && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-10 max-w-lg mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-forest-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">取件成功！</h2>
              <p className="text-gray-500 mb-6">柜门已开启，请取出行李后关闭柜门</p>

              <div className="bg-forest-50 rounded-xl p-5 mb-6 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">柜门编号</span>
                  <span className="font-bold text-forest-700">{order.lockerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">使用时长</span>
                  <span className="font-medium">{formatDuration(completedBilling.durationMinutes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-500">支付金额</span>
                  <span className="font-black text-amber-600 text-xl">
                    {formatCurrency(completedBilling.totalAmount)}
                  </span>
                </div>
              </div>

              <Link to="/" className="btn-primary w-full inline-block">
                返回首页
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
