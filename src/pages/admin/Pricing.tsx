import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tags, Trash2, ToggleLeft, ToggleRight, Edit2, X, Calendar, Check } from 'lucide-react';
import { PricingRule, PricingRuleType } from '@/types';
import { usePricingStore } from '@/store/usePricingStore';
import { formatCurrency } from '@/utils/billing';

export default function Pricing() {
  const { rules, currentRule, fetchRules, fetchCurrentRule, addRule, updateRule, deleteRule, toggleRuleActive } = usePricingStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  useEffect(() => {
    fetchRules();
    fetchCurrentRule();
  }, [fetchRules, fetchCurrentRule]);

  const [form, setForm] = useState({
    name: '',
    type: '旺季' as PricingRuleType,
    firstHourPrice: 10,
    nextHourPrice: 5,
    dailyCap: 50,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const resetForm = () => {
    setForm({
      name: '',
      type: '旺季',
      firstHourPrice: 10,
      nextHourPrice: 5,
      dailyCap: 50,
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setEditingRule(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      type: rule.type,
      firstHourPrice: rule.firstHourPrice,
      nextHourPrice: rule.nextHourPrice,
      dailyCap: rule.dailyCap,
      startDate: rule.startDate || '',
      endDate: rule.endDate || '',
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (form.type !== '基础' && (!form.startDate || !form.endDate)) return;

    if (editingRule) {
      await updateRule(editingRule.id, form);
    } else {
      await addRule(form);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (rule: PricingRule) => {
    if (rule.type === '基础') return;
    if (confirm(`确定删除规则「${rule.name}」吗？`)) {
      await deleteRule(rule.id);
    }
  };

  const handleToggle = async (rule: PricingRule) => {
    await toggleRuleActive(rule.id);
  };

  const typeBadge: Record<PricingRuleType, string> = {
    基础: 'bg-gray-100 text-gray-700',
    旺季: 'bg-amber-100 text-amber-700',
    临时: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">价格配置</h1>
          {currentRule && (
            <p className="text-gray-500 mt-1">
              当前生效：
              <span className="text-amber-600 font-semibold ml-1">{currentRule.name}</span>
              <span className="ml-2 text-sm">
                首小时{formatCurrency(currentRule.firstHourPrice)} + 续{formatCurrency(currentRule.nextHourPrice)}/小时
              </span>
            </p>
          )}
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增规则
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`card p-5 ${currentRule?.id === rule.id ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-forest-50 rounded-xl">
                  <Tags className="w-6 h-6 text-forest-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{rule.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge[rule.type]}`}>
                      {rule.type}
                    </span>
                    {currentRule?.id === rule.id && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> 当前生效
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                    <span>首小时 {formatCurrency(rule.firstHourPrice)}</span>
                    <span>续时 {formatCurrency(rule.nextHourPrice)}/小时</span>
                    <span>每日封顶 {formatCurrency(rule.dailyCap)}</span>
                    {rule.startDate && rule.endDate && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {rule.startDate} ~ {rule.endDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(rule)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  title={rule.isActive ? '停用' : '启用'}
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-7 h-7 text-forest-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-400" />
                  )}
                </button>
                {rule.type !== '基础' && (
                  <>
                    <button
                      onClick={() => openEdit(rule)}
                      className="p-2 text-gray-500 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-[480px] max-h-[90vh] overflow-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingRule ? '编辑规则' : '新增价格规则'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">规则名称</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="例如：春节旺季、国庆临时"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">规则类型</label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value as PricingRuleType })
                      }
                      disabled={editingRule?.type === '基础'}
                      className="input-field"
                    >
                      <option value="旺季">旺季</option>
                      <option value="临时">临时</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">状态</label>
                    <select
                      value={form.isActive ? '1' : '0'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}
                      className="input-field"
                    >
                      <option value="1">启用</option>
                      <option value="0">停用</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">首小时价格 (元)</label>
                    <input
                      type="number"
                      value={form.firstHourPrice}
                      onChange={(e) =>
                        setForm({ ...form, firstHourPrice: Number(e.target.value) })
                      }
                      min={0}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">续小时价格 (元)</label>
                    <input
                      type="number"
                      value={form.nextHourPrice}
                      onChange={(e) =>
                        setForm({ ...form, nextHourPrice: Number(e.target.value) })
                      }
                      min={0}
                      className="input-field"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="label">每日封顶金额 (元，0表示不封顶)</label>
                    <input
                      type="number"
                      value={form.dailyCap}
                      onChange={(e) => setForm({ ...form, dailyCap: Number(e.target.value) })}
                      min={0}
                      className="input-field"
                    />
                  </div>

                  {form.type !== '基础' && (
                    <>
                      <div>
                        <label className="label">生效开始日期</label>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">生效结束日期</label>
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1">
                  {editingRule ? '保存修改' : '创建规则'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
