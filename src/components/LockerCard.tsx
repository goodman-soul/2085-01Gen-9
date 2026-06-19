import { motion } from 'framer-motion';
import { Locker } from '@/types';
import { AlertTriangle, Check, User } from 'lucide-react';

interface LockerCardProps {
  locker: Locker;
  onClick?: () => void;
  selected?: boolean;
}

export default function LockerCard({ locker, onClick, selected }: LockerCardProps) {
  const statusConfig = {
    空闲: {
      bg: 'bg-gradient-to-br from-forest-400 to-forest-600',
      border: 'border-forest-300',
      text: 'text-white',
      icon: <Check className="w-6 h-6" />,
      pulse: false,
    },
    使用中: {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      border: 'border-amber-300',
      text: 'text-white',
      icon: <User className="w-6 h-6" />,
      pulse: true,
    },
    故障: {
      bg: 'bg-gradient-to-br from-red-400 to-red-600',
      border: 'border-red-300',
      text: 'text-white',
      icon: <AlertTriangle className="w-6 h-6" />,
      pulse: true,
    },
  };

  const config = statusConfig[locker.status];

  return (
    <motion.button
      whileHover={locker.status === '空闲' ? { scale: 1.05, y: -2 } : {}}
      whileTap={locker.status === '空闲' ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={locker.status !== '空闲'}
      className={`
        relative p-4 rounded-xl border-2 ${config.border} ${config.bg} ${config.text}
        ${locker.status === '空闲' ? 'cursor-pointer shadow-lg hover:shadow-2xl' : 'cursor-not-allowed opacity-90'}
        ${selected ? 'ring-4 ring-amber-400 ring-offset-2' : ''}
        ${config.pulse ? 'animate-pulse-slow' : ''}
        transition-all duration-200 min-h-[100px]
        flex flex-col items-center justify-center gap-2
      `}
    >
      <div className="absolute top-2 left-2 text-xs font-bold opacity-75">
        {locker.size}
      </div>
      <div className="absolute top-2 right-2">{config.icon}</div>
      <div className="text-2xl font-black tracking-wider">{locker.id}</div>
      <div className="text-xs font-medium opacity-90">{locker.status}</div>
      {locker.faultRemark && (
        <div className="text-[10px] mt-1 bg-red-900/30 px-2 py-0.5 rounded">
          {locker.faultRemark}
        </div>
      )}
    </motion.button>
  );
}
