import { Router } from 'express';
import getDb from '../db.js';
import { createSession, destroySession, authRequired, SESSION_COOKIE } from '../middleware/auth.js';
import { addLog } from '../utils/helpers.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ error: '请输入用户名和密码' });
    return;
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password) as any;
  if (!admin) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = createSession({ id: admin.id, username: admin.username, name: admin.name, role: admin.role });

  addLog({ actionType: '管理员登录', operator: admin.name, remark: '后台管理系统登录' });

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  }).json({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
  });
});

router.post('/logout', authRequired, (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) destroySession(token);
  res.clearCookie(SESSION_COOKIE).json({ ok: true });
});

router.get('/me', authRequired, (req, res) => {
  res.json((req as any).admin);
});

export default router;
