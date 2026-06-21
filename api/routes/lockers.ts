import { Router } from 'express';
import getDb from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { addLog } from '../utils/helpers.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM lockers ORDER BY id').all() as any[];
  const lockers = rows.map((r) => ({
    id: r.id,
    status: r.status,
    location: r.location,
    size: r.size,
    createdAt: r.created_at,
    faultRemark: r.fault_remark,
  }));
  res.json(lockers);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM lockers WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ error: '柜门不存在' });
    return;
  }
  res.json({
    id: row.id,
    status: row.status,
    location: row.location,
    size: row.size,
    createdAt: row.created_at,
    faultRemark: row.fault_remark,
  });
});

router.patch('/:id/status', authRequired, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status, faultRemark } = req.body || {};

  const locker = db.prepare('SELECT * FROM lockers WHERE id = ?').get(id) as any;
  if (!locker) {
    res.status(404).json({ error: '柜门不存在' });
    return;
  }

  const beforeState = locker.status;

  if (status === '故障') {
    db.prepare('UPDATE lockers SET status = ?, fault_remark = ? WHERE id = ?').run('故障', faultRemark || null, id);
    addLog({
      actionType: '故障标记',
      lockerId: id,
      operator: (req as any).admin?.name || '管理员',
      beforeState,
      afterState: '故障',
      remark: faultRemark || '无备注',
    });
  } else if (status === '空闲') {
    db.prepare('UPDATE lockers SET status = ?, fault_remark = NULL WHERE id = ?').run('空闲', id);
    const actionType = beforeState === '故障' ? '故障解除' : '柜门状态变更';
    addLog({
      actionType,
      lockerId: id,
      operator: (req as any).admin?.name || '管理员',
      beforeState,
      afterState: '空闲',
      remark: beforeState === '故障' ? '故障已修复' : '管理员强制释放',
    });
  } else if (status === '使用中') {
    db.prepare('UPDATE lockers SET status = ? WHERE id = ?').run('使用中', id);
    addLog({
      actionType: '柜门状态变更',
      lockerId: id,
      operator: (req as any).admin?.name || '管理员',
      beforeState,
      afterState: '使用中',
    });
  } else {
    res.status(400).json({ error: '无效状态' });
    return;
  }

  const updated = db.prepare('SELECT * FROM lockers WHERE id = ?').get(id) as any;
  res.json({
    id: updated.id,
    status: updated.status,
    location: updated.location,
    size: updated.size,
    createdAt: updated.created_at,
    faultRemark: updated.fault_remark,
  });
});

export default router;
