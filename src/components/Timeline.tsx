import { LogEntry } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Archive,
  LogOut,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Tags,
  Lock,
  LogIn,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineProps {
  logs: LogEntry[];
}

const actionConfig: Record<
  LogEntry['actionType'],
  { icon: typeof Archive; color: string; label: string }
> = {
  寄存: { icon: Archive, color: 'bg-forest-500', label: '寄存' },
  取件: { icon: LogOut, color: 'bg-blue-500', label: '取件' },
  密码重置: { icon: KeyRound, color: 'bg-purple-500', label: '密码重置' },
  故障标记: { icon: AlertTriangle, color: 'bg-red-500', label: '故障标记' },
  故障解除: { icon: CheckCircle2, color: 'bg-forest-500', label: '故障解除' },
  人工代取: { icon: UserCheck, color: 'bg-amber-500', label: '人工代取' },
  价格调整: { icon: Tags, color: 'bg-indigo-500', label: '价格调整' },
  柜门状态变更: { icon: Lock, color: 'bg-gray-500', label: '状态变更' },
  管理员登录: { icon: LogIn, color: 'bg-teal-500', label: '管理员登录' },
};

export default function Timeline({ logs }: TimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无操作记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {logs.map((log, idx) => {
          const config = actionConfig[log.actionType];
          const Icon = config.icon;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative pl-16"
            >
              <div
                className={`absolute left-4 top-1 w-5 h-5 rounded-full ${config.color} border-4 border-white shadow-md`}
              />
              <div className="card p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <Icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{config.label}</span>
                      {log.lockerId && (
                        <span className="px-2 py-0.5 bg-forest-100 text-forest-700 rounded text-xs font-medium">
                          {log.lockerId}
                        </span>
                      )}
                      {log.orderId && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {log.orderId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{log.operator}</span>
                      <span className="mx-2">·</span>
                      <span>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}</span>
                    </div>
                    {(log.beforeState || log.afterState) && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        {log.beforeState && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{log.beforeState}</span>
                        )}
                        {log.beforeState && log.afterState && <span className="text-gray-400">→</span>}
                        {log.afterState && (
                          <span className="px-2 py-1 bg-forest-100 text-forest-700 rounded">{log.afterState}</span>
                        )}
                      </div>
                    )}
                    {log.remark && (
                      <div className="mt-2 text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        📝 {log.remark}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
