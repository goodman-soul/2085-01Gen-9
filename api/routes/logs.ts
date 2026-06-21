import { Router } from 'express';
import getDb from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, (req, res) => {
  const { lockerId, actionType, startDate, endDate, operator } = req.query as Record<string, string>;
  const conditions: string[] = [];
  const params: any[] = [];

  if (lockerId) {
    conditions.push('locker_id = ?');
    params.push(lockerId);
  }
  if (actionType) {
    conditions.push('action_type = ?');
    params.push(actionType);
  }
  if (operator) {
    conditions.push('operator LIKE ?');
    params.push(`%${operator}%`);
  }
  if (startDate) {
    conditions.push("timestamp >= ?");
    params.push(startDate);
  }
  if (endDate) {
    conditions.push("timestamp <= ?");
    params.push(endDate + 'T23:59:59');
  }

  const db = getDb();
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const rows = db
    .prepare(`SELECT * FROM logs ${where} ORDER BY timestamp DESC LIMIT 500`)
    .all(...params) as any[];

  const logs = rows.map((r) => ({
    id: r.id,
    actionType: r.action_type,
    lockerId: r.locker_id,
    orderId: r.order_id,
    operator: r.operator,
    timestamp: r.timestamp,
    beforeState: r.before_state,
    afterState: r.after_state,
    remark: r.remark,
  }));
  res.json(logs);
});

export default router;
