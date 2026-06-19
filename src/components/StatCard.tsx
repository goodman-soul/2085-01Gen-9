import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode, isValidElement } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | ReactNode;
  trend?: string;
  color?: 'green' | 'amber' | 'red' | 'blue';
}

export default function StatCard({ title, value, icon, trend, color = 'green' }: StatCardProps) {
  const colorMap = {
    green: 'from-forest-500 to-forest-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
    blue: 'from-blue-500 to-blue-700',
  };

  const renderIcon = () => {
    if (isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as LucideIcon;
    return <IconComp className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden bg-gradient-to-br ${colorMap[color]} text-white p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-4xl font-black mt-2 tracking-tight">{value}</p>
          {trend && <p className="text-white/70 text-sm mt-2">{trend}</p>}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {renderIcon()}
        </div>
      </div>
    </motion.div>
  );
}
