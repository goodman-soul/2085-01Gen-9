import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, LogIn, KeyRound, Mountain, ShieldCheck, Clock, Coins } from 'lucide-react';
import LockerGrid from '@/components/LockerGrid';
import StatCard from '@/components/StatCard';
import { useLockerStore } from '@/store/useLockerStore';
import { useOrderStore } from '@/store/useOrderStore';
import { usePricingStore } from '@/store/usePricingStore';
import { findApplicablePricingRule } from '@/utils/pricing';
import { formatCurrency } from '@/utils/billing';

export default function VisitorHome() {
  const navigate = useNavigate();
  const { lockers, getLockersByStatus } = useLockerStore();
  const { activeOrders, getTodayRevenue } = useOrderStore();
  const { rules } = usePricingStore();
  const currentRule = findApplicablePricingRule(rules);

  const freeCount = getLockersByStatus('空闲').length;
  const usedCount = getLockersByStatus('使用中').length;
  const faultCount = getLockersByStatus('故障').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-amber-50 p-8">
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl shadow-lg">
              <Mountain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-forest-800 tracking-tight">
                景区智能储物柜
              </h1>
              <p className="text-forest-600/80 mt-1">安全 · 便捷 · 智能计费</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm text-gray-400 hover:text-forest-600 transition-colors"
          >
            管理员入口 →
          </button>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4"
        >
          <StatCard title="空闲可用" value={freeCount} icon={ShieldCheck} color="green" />
          <StatCard title="使用中" value={usedCount} icon={Clock} color="amber" />
          <StatCard title="故障维护" value={faultCount} icon={ShieldCheck} color="red" />
          <StatCard
            title={`${currentRule.name}费率`}
            value={formatCurrency(currentRule.firstHourPrice) + '起'}
            icon={Coins}
            color="blue"
            trend={`首小时 +${formatCurrency(currentRule.nextHourPrice)}/小时 封顶${formatCurrency(currentRule.dailyCap)}/天`}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">储物柜状态</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-forest-500" />
                空闲
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                使用中
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                故障
              </span>
            </div>
          </div>
          <LockerGrid lockers={lockers} />
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/store')}
            disabled={freeCount === 0}
            className="card-hover p-6 bg-gradient-to-br from-forest-500 to-forest-700 text-white text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
              <Archive className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-1">寄存行李</h3>
            <p className="text-white/80 text-sm">选择空闲柜门，开始寄存</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/pickup')}
            disabled={activeOrders.length === 0}
            className="card-hover p-6 bg-gradient-to-br from-amber-500 to-amber-700 text-white text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-1">取件结算</h3>
            <p className="text-white/80 text-sm">输入柜门号密码，支付取件</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/forgot')}
            className="card-hover p-6 bg-gradient-to-br from-gray-600 to-gray-800 text-white text-left"
          >
            <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-1">忘记密码</h3>
            <p className="text-white/80 text-sm">手机验证，重置取件密码</p>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
