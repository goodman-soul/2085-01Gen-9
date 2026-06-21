import { Router } from 'express';
import getDb from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { calculateBilling, generateOrderId } from '../utils/billing.js';
import { findApplicablePricingRule, addLog } from '../utils/helpers.js';

const router = Router();

router.get('/active', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    `SELECT o.*, l.status as locker_status FROM orders o JOIN lockers l ON o.locker_id = l.id
     WHERE o.status = '进行中' ORDER BY o.start_time DESC`
  ).all() as any[];
  const orders = rows.map(formatOrder);
  res.json(orders);
});

router.get('/active/:lockerId', (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE locker_id = ? AND status = '进行中'").get(req.params.lockerId) as any;
  if (!row) {
    res.json(null);
    return;
  }
  res.json(formatOrder(row));
});

router.get('/today', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM orders WHERE date(start_time) = date('now') ORDER BY start_time DESC"
  ).all() as any[];
  res.json(rows.map(formatOrder));
});

router.get('/today/revenue', (_req, res) => {
  const db = getDb();
  const row = db.prepare(
    "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = '已完成' AND date(start_time) = date('now')"
  ).get() as any;
  res.json({ revenue: row.revenue });
});

router.post('/', (req, res) => {
  const { lockerId, password, phone } = req.body || {};
  if (!lockerId || !password || !phone) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const db = getDb();
  const locker = db.prepare('SELECT * FROM lockers WHERE id = ? AND status = ?').get(lockerId, '空闲') as any;
  if (!locker) {
    res.status(400).json({ error: '柜门不可用' });
    return;
  }

  const pricing = findApplicablePricingRule();
  const pricingSnapshot = JSON.stringify({
    name: pricing.name,
    type: pricing.type,
    firstHourPrice: pricing.firstHourPrice,
    nextHourPrice: pricing.nextHourPrice,
    dailyCap: pricing.dailyCap,
  });

  const id = generateOrderId();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO orders (id, locker_id, password, phone, start_time, status, pricing_snapshot) VALUES (?, ?, ?, ?, ?, '进行中', ?)`
  ).run(id, lockerId, password, phone, now, pricingSnapshot);

  db.prepare("UPDATE lockers SET status = '使用中' WHERE id = ?").run(lockerId);

  addLog({
    actionType: '寄存',
    lockerId,
    orderId: id,
    operator: '游客',
    beforeState: '空闲',
    afterState: '使用中',
    remark: `手机号 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`,
  });

  res.json({ id, lockerId, startTime: now, pricingSnapshot: JSON.parse(pricingSnapshot) });
});

router.post('/:id/complete', (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};

  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND status = '进行中'").get(id) as any;
  if (!order) {
    res.status(404).json({ error: '订单不存在或已完成' });
    return;
  }

  if (password && order.password !== password) {
    res.status(400).json({ error: '密码错误' });
    return;
  }

  const snapshot = JSON.parse(order.pricing_snapshot);
  const billing = calculateBilling(new Date(order.start_time), new Date(), snapshot);
  const endTime = new Date().toISOString();

  db.prepare(
    `UPDATE orders SET end_time = ?, duration_minutes = ?, total_amount = ?, status = '已完成' WHERE id = ?`
  ).run(endTime, billing.durationMinutes, billing.totalAmount, id);

  db.prepare("UPDATE lockers SET status = '空闲' WHERE id = ?").run(order.locker_id);

  const operator = (req as any).admin?.name
    ? `${(req as any).admin.name}(人工代取)`
    : '游客';

  addLog({
    actionType: (req as any).admin ? '人工代取' : '取件',
    lockerId: order.locker_id,
    orderId: id,
    operator,
    beforeState: '使用中',
    afterState: '空闲',
    remark: req.body?.reason
      ? `${req.body.reason} | 时长${billing.durationMinutes}分钟，费用¥${billing.totalAmount.toFixed(2)}`
      : `时长${billing.durationMinutes}分钟，费用¥${billing.totalAmount.toFixed(2)}`,
  });

  res.json({
    id,
    durationMinutes: billing.durationMinutes,
    totalAmount: billing.totalAmount,
    billing,
  });
});

router.patch('/:id/password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body || {};
  if (!newPassword) {
    res.status(400).json({ error: '请输入新密码' });
    return;
  }

  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE id = ? AND status = '进行中'").get(id) as any;
  if (!order) {
    res.status(404).json({ error: '订单不存在或已完成' });
    return;
  }

  db.prepare('UPDATE orders SET password = ? WHERE id = ?').run(newPassword, id);

  addLog({
    actionType: '密码重置',
    lockerId: order.locker_id,
    orderId: id,
    operator: '游客(自助)',
    remark: '通过手机验证码重置密码',
  });

  res.json({ ok: true });
});

router.post('/verify', (req, res) => {
  const { lockerId, password } = req.body || {};
  if (!lockerId || !password) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE locker_id = ? AND status = '进行中'").get(lockerId.toUpperCase()) as any;
  if (!order) {
    res.status(404).json({ error: '该柜门当前没有寄存订单' });
    return;
  }
  if (order.password !== password) {
    res.status(400).json({ error: '密码错误' });
    return;
  }

  const snapshot = JSON.parse(order.pricing_snapshot);
  const billing = calculateBilling(new Date(order.start_time), new Date(), snapshot);

  res.json({
    order: formatOrder(order),
    billing,
  });
});

function formatOrder(row: any) {
  return {
    id: row.id,
    lockerId: row.locker_id,
    password: row.password,
    phone: row.phone,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: row.duration_minutes,
    totalAmount: row.total_amount,
    status: row.status,
    pricingSnapshot: typeof row.pricing_snapshot === 'string' ? JSON.parse(row.pricing_snapshot) : row.pricing_snapshot,
  };
}

export default router;
