import { Router } from 'express';
import getDb from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { addLog, findApplicablePricingRule } from '../utils/helpers.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM pricing_rules ORDER BY type, id').all() as any[];
  const rules = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    firstHourPrice: r.first_hour_price,
    nextHourPrice: r.next_hour_price,
    dailyCap: r.daily_cap,
    startDate: r.start_date,
    endDate: r.end_date,
    isActive: !!r.is_active,
  }));
  res.json(rules);
});

router.get('/current', (_req, res) => {
  const rule = findApplicablePricingRule();
  res.json(rule);
});

router.post('/', authRequired, (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.type) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const db = getDb();
  const id = `rule-${Date.now()}`;
  db.prepare(
    `INSERT INTO pricing_rules (id, name, type, first_hour_price, next_hour_price, daily_cap, start_date, end_date, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    body.name,
    body.type,
    body.firstHourPrice ?? 0,
    body.nextHourPrice ?? 0,
    body.dailyCap ?? 0,
    body.startDate || null,
    body.endDate || null,
    body.isActive !== false ? 1 : 0
  );

  addLog({
    actionType: '价格调整',
    operator: (req as any).admin?.name || '管理员',
    afterState: `${body.name}: 首${body.firstHourPrice}续${body.nextHourPrice}`,
    remark: `新增${body.type}价格规则`,
  });

  res.json({ id });
});

router.patch('/:id', authRequired, (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const db = getDb();

  const existing = db.prepare('SELECT * FROM pricing_rules WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: '规则不存在' });
    return;
  }

  db.prepare(
    `UPDATE pricing_rules SET name = ?, type = ?, first_hour_price = ?, next_hour_price = ?, daily_cap = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`
  ).run(
    body.name ?? existing.name,
    body.type ?? existing.type,
    body.firstHourPrice ?? existing.first_hour_price,
    body.nextHourPrice ?? existing.next_hour_price,
    body.dailyCap ?? existing.daily_cap,
    body.startDate ?? existing.start_date,
    body.endDate ?? existing.end_date,
    body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.is_active,
    id
  );

  addLog({
    actionType: '价格调整',
    operator: (req as any).admin?.name || '管理员',
    beforeState: `${existing.name}: 首${existing.first_hour_price}续${existing.next_hour_price}`,
    afterState: `${body.name ?? existing.name}: 首${body.firstHourPrice ?? existing.first_hour_price}续${body.nextHourPrice ?? existing.next_hour_price}`,
    remark: '修改价格规则',
  });

  res.json({ ok: true });
});

router.delete('/:id', authRequired, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM pricing_rules WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: '规则不存在' });
    return;
  }
  if (existing.type === '基础') {
    res.status(400).json({ error: '基础规则不可删除' });
    return;
  }

  db.prepare('DELETE FROM pricing_rules WHERE id = ?').run(id);

  addLog({
    actionType: '价格调整',
    operator: (req as any).admin?.name || '管理员',
    beforeState: existing.name,
    remark: '删除价格规则',
  });

  res.json({ ok: true });
});

router.patch('/:id/toggle', authRequired, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM pricing_rules WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: '规则不存在' });
    return;
  }

  const newActive = existing.is_active ? 0 : 1;
  db.prepare('UPDATE pricing_rules SET is_active = ? WHERE id = ?').run(newActive, id);

  addLog({
    actionType: '价格调整',
    operator: (req as any).admin?.name || '管理员',
    beforeState: `${existing.name} ${existing.is_active ? '启用' : '停用'}`,
    afterState: `${existing.name} ${newActive ? '启用' : '停用'}`,
    remark: '切换规则状态',
  });

  res.json({ ok: true, isActive: !!newActive });
});

export default router;
