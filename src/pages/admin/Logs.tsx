import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, Filter } from 'lucide-react';
import Timeline from '@/components/Timeline';
import { ActionType } from '@/types';
import { useLogStore } from '@/store/useLogStore';

const allActionTypes: ActionType[] = [
  '寄存',
  '取件',
  '密码重置',
  '故障标记',
  '故障解除',
  '人工代取',
  '价格调整',
  '柜门状态变更',
  '管理员登录',
];

export default function Logs() {
  const { logs, filterLogs } = useLogStore();

  const [lockerId, setLockerId] = useState('');
  const [actionType, setActionType] = useState<ActionType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [operator, setOperator] = useState('');

  const filteredLogs = useMemo(() => {
    return filterLogs({
      lockerId: lockerId.trim() || undefined,
      actionType: actionType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      operator: operator.trim() || undefined,
    });
  }, [lockerId, actionType, startDate, endDate, operator, filterLogs]);

  const resetFilters = () => {
    setLockerId('');
    setActionType('');
    setStartDate('');
    setEndDate('');
    setOperator('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ScrollText className="w-7 h-7 text-forest-600" />
            操作日志
          </h1>
          <p className="text-gray-500 mt-1">
            全流程操作追溯 · 共 <span className="text-forest-600 font-semibold">{logs.length}</span> 条记录
            {filteredLogs.length !== logs.length && (
              <span className="text-gray-400 ml-2">
                (筛选后 {filteredLogs.length} 条)
              </span>
            )}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="font-medium">筛选条件</span>
          <button
            onClick={resetFilters}
            className="ml-auto text-sm text-gray-400 hover:text-gray-600"
          >
            重置
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="label text-xs">柜门号</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={lockerId}
                onChange={(e) => setLockerId(e.target.value.toUpperCase())}
                placeholder="A01"
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:border-forest-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs">操作类型</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType | '')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:border-forest-500 outline-none bg-white"
            >
              <option value="">全部</option>
              {allActionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-xs">操作人</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="管理员/游客"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:border-forest-500 outline-none"
            />
          </div>

          <div>
            <label className="label text-xs">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:border-forest-500 outline-none"
            />
          </div>

          <div>
            <label className="label text-xs">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:border-forest-500 outline-none"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-h-[calc(100vh-380px)] overflow-auto scrollbar-thin pr-2"
      >
        <Timeline logs={filteredLogs} />
      </motion.div>
    </div>
  );
}
