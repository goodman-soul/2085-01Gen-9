import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, KeyRound, Mountain, ShieldCheck } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { useOrderStore } from '@/store/useOrderStore';
import { useLogStore } from '@/store/useLogStore';

type Step = 'verify' | 'reset' | 'success';

export default function ForgotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('verify');
  const [lockerId, setLockerId] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [successLocker, setSuccessLocker] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { getActiveOrderByLocker, updateOrderPassword } = useOrderStore();
  const { addLog } = useLogStore();

  const handleSendCode = () => {
    setError('');
    if (!lockerId.trim()) {
      setError('请输入柜门号');
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }
    const order = getActiveOrderByLocker(lockerId.toUpperCase());
    if (!order) {
      setError('该柜门当前没有寄存订单');
      return;
    }
    if (order.phone !== phone) {
      setError('手机号与寄存时不一致');
      return;
    }
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(generated);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    alert(`【演示模式】验证码已发送：${generated}`);
  };

  const handleVerifyCode = () => {
    setError('');
    if (code !== sentCode) {
      setError('验证码错误');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = () => {
    setError('');
    if (newPassword.length !== 6) {
      setError('请输入6位数字密码');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('两次密码输入不一致');
      return;
    }
    const order = getActiveOrderByLocker(lockerId.toUpperCase());
    if (order) {
      updateOrderPassword(order.id, newPassword);
      addLog({
        actionType: '密码重置',
        lockerId: order.lockerId,
        orderId: order.id,
        operator: '游客(自助)',
        remark: '通过手机验证码重置密码',
      });
      setSuccessLocker(order.lockerId);
      setStep('success');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-forest-50 p-8">
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
            <div className="p-2 bg-gray-700 rounded-xl">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">找回密码</h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center mb-8">
                <div className="p-4 bg-gray-100 rounded-2xl">
                  <KeyRound className="w-10 h-10 text-gray-600" />
                </div>
              </div>
              <p className="text-center text-gray-500 mb-6">
                请输入柜门号和寄存时使用的手机号，我们将发送验证码
              </p>

              <div className="space-y-5">
                <div>
                  <label className="label">柜门编号</label>
                  <input
                    type="text"
                    value={lockerId}
                    onChange={(e) => setLockerId(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="例如 A01"
                    className="input-field text-center font-mono text-xl tracking-wider"
                  />
                </div>

                <div>
                  <label className="label">手机号</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="寄存时使用的手机号"
                    className="input-field"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="label">验证码</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="请输入验证码"
                      className="input-field flex-1"
                      inputMode="numeric"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className="px-5 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button onClick={handleVerifyCode} className="btn-primary w-full">
                  验证身份
                </button>

                <Link
                  to="/pickup"
                  className="block text-center text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← 返回取件
                </Link>
              </div>
            </motion.div>
          )}

          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-forest-100 rounded-2xl">
                  <ShieldCheck className="w-10 h-10 text-forest-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">身份验证成功</h3>
              <p className="text-gray-500 text-center mb-6">请设置新的6位取件密码</p>

              <div className="space-y-5">
                <PasswordInput value={newPassword} onChange={setNewPassword} label="新密码" />
                <PasswordInput
                  value={newPasswordConfirm}
                  onChange={setNewPasswordConfirm}
                  label="再次确认新密码"
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setStep('verify')} className="btn-outline flex-1">
                    返回
                  </button>
                  <button onClick={handleResetPassword} className="btn-primary flex-1">
                    确认重置
                  </button>
                </div>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">密码重置成功！</h2>
              <p className="text-gray-500 mb-6">您可以使用新密码前往取件</p>

              <div className="bg-forest-50 rounded-xl p-5 mb-6 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">柜门编号</span>
                  <span className="font-bold text-forest-700 text-lg">{successLocker}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500">新密码</span>
                  <span className="font-mono font-bold text-amber-600 text-xl tracking-widest">
                    {newPassword}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link to="/" className="btn-outline flex-1">
                  返回首页
                </Link>
                <Link to="/pickup" className="btn-accent flex-1">
                  立即取件
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
