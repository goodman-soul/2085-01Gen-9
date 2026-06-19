import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Lock, Phone, ShieldCheck, Mountain } from 'lucide-react';
import LockerGrid from '@/components/LockerGrid';
import PasswordInput from '@/components/PasswordInput';
import { Locker } from '@/types';
import { useLockerStore } from '@/store/useLockerStore';
import { useOrderStore } from '@/store/useOrderStore';
import { usePricingStore } from '@/store/usePricingStore';
import { useLogStore } from '@/store/useLogStore';
import { findApplicablePricingRule } from '@/utils/pricing';
import { formatCurrency, formatDuration } from '@/utils/billing';
import { format } from 'date-fns';

type Step = 'select' | 'password' | 'confirm' | 'success';

export default function StorePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');

  const { getAvailableLockers, updateLockerStatus } = useLockerStore();
  const { createOrder } = useOrderStore();
  const { rules } = usePricingStore();
  const { addLog } = useLogStore();

  const availableLockers = getAvailableLockers();
  const currentRule = findApplicablePricingRule(rules);

  const handleSelectLocker = (locker: Locker) => {
    if (locker.status !== '空闲') return;
    setSelectedLocker(locker);
    setStep('password');
  };

  const handlePasswordNext = () => {
    if (password.length !== 6) {
      setPasswordError('请输入6位数字密码');
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError('两次密码输入不一致');
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setPasswordError('请输入正确的11位手机号');
      return;
    }
    setPasswordError('');
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!selectedLocker) return;

    const pricingSnapshot = {
      name: currentRule.name,
      type: currentRule.type,
      firstHourPrice: currentRule.firstHourPrice,
      nextHourPrice: currentRule.nextHourPrice,
      dailyCap: currentRule.dailyCap,
    };

    const order = createOrder(selectedLocker.id, password, phone, pricingSnapshot);
    updateLockerStatus(selectedLocker.id, '使用中');

    addLog({
      actionType: '寄存',
      lockerId: selectedLocker.id,
      orderId: order.id,
      operator: '游客',
      beforeState: '空闲',
      afterState: '使用中',
      remark: `手机号 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`,
    });

    setCreatedOrderId(order.id);
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
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
            <div className="p-2 bg-forest-600 rounded-xl">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">寄存行李</h1>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {['选择柜门', '设置密码', '确认信息', '完成'].map((label, idx) => {
            const stepIdx = ['select', 'password', 'confirm', 'success'].indexOf(step);
            const isActive = idx <= stepIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isActive ? 'bg-forest-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-forest-700 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
                {idx < 3 && <div className={`w-16 h-0.5 ${idx < stepIdx ? 'bg-forest-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">请选择空闲柜门</h2>
              <p className="text-gray-500 text-sm mb-6">
                当前适用 <span className="text-amber-600 font-semibold">{currentRule.name}</span>：
                首小时 {formatCurrency(currentRule.firstHourPrice)}，
                续时 {formatCurrency(currentRule.nextHourPrice)}/小时，
                每日封顶 {formatCurrency(currentRule.dailyCap)}
              </p>
              {availableLockers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无空闲柜门，请稍后再试</p>
                </div>
              ) : (
                <LockerGrid lockers={availableLockers} onSelectLocker={handleSelectLocker} />
              )}
            </motion.div>
          )}

          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 max-w-lg mx-auto"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-forest-100 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-forest-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">柜门 {selectedLocker?.id}</h2>
                  <p className="text-sm text-gray-500">{selectedLocker?.location}</p>
                </div>
              </div>

              <div className="space-y-5">
                <PasswordInput value={password} onChange={setPassword} label="设置6位取件密码" />
                <PasswordInput
                  value={passwordConfirm}
                  onChange={setPasswordConfirm}
                  label="再次输入密码确认"
                />

                <div>
                  <label className="label flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    联系手机号
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="用于忘记密码时找回"
                    className="input-field"
                    inputMode="numeric"
                  />
                </div>

                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep('select')}
                  className="btn-outline flex-1"
                >
                  返回选择
                </button>
                <button onClick={handlePasswordNext} className="btn-primary flex-1">
                  下一步
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 max-w-lg mx-auto space-y-5"
            >
              <h2 className="text-xl font-bold text-gray-800">确认寄存信息</h2>

              <div className="space-y-3 bg-gray-50 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">柜门编号</span>
                  <span className="font-bold text-forest-700">{selectedLocker?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">位置</span>
                  <span className="font-medium">{selectedLocker?.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">尺寸</span>
                  <span className="font-medium">{selectedLocker?.size}号柜</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">开始时间</span>
                  <span className="font-medium">{format(new Date(), 'yyyy-MM-dd HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">联系手机</span>
                  <span className="font-medium">{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">计费规则</span>
                    <span className="text-amber-600 font-semibold">{currentRule.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    首小时 {formatCurrency(currentRule.firstHourPrice)}，
                    续时 {formatCurrency(currentRule.nextHourPrice)}/小时，
                    每日封顶 {formatCurrency(currentRule.dailyCap)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    不足1小时按1小时计费，超过{formatDuration(currentRule.dailyCap / currentRule.nextHourPrice * 60 || 600)}按封顶计费
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('password')} className="btn-outline flex-1">
                  返回修改
                </button>
                <button onClick={handleConfirm} className="btn-primary flex-1">
                  确认寄存
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">寄存成功！</h2>
              <p className="text-gray-500 mb-6">柜门已开启，请放入行李后关闭柜门</p>

              <div className="bg-forest-50 rounded-xl p-5 mb-6 space-y-2">
                <div className="flex justify-between text-left">
                  <span className="text-gray-500">柜门编号</span>
                  <span className="font-bold text-forest-700 text-xl">{selectedLocker?.id}</span>
                </div>
                <div className="flex justify-between text-left">
                  <span className="text-gray-500">取件密码</span>
                  <span className="font-mono font-bold text-amber-600 text-xl tracking-widest">
                    {password}
                  </span>
                </div>
                <div className="flex justify-between text-left">
                  <span className="text-gray-500">订单号</span>
                  <span className="font-mono text-sm">{createdOrderId}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-6">
                ⚠️ 请牢记柜门号和取件密码，取件时需要验证
              </p>

              <div className="flex gap-4">
                <Link to="/" className="btn-outline flex-1">
                  返回首页
                </Link>
                <button onClick={() => navigate('/pickup')} className="btn-accent flex-1">
                  我要取件
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
