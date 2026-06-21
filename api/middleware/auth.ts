import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

const SESSION_SECRET = 'locker-system-session-2024';
const SESSION_COOKIE = 'locker_session';

const sessions = new Map<string, { adminId: string; username: string; name: string; role: string }>();

export function createSession(admin: { id: string; username: string; name: string; role: string }): string {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessions.set(token, { adminId: admin.id, username: admin.username, name: admin.name, role: admin.role });
  return token;
}

export function getSession(token: string) {
  return sessions.get(token) || null;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const session = getSession(token);
  if (!session) {
    res.status(401).json({ error: '会话已过期' });
    return;
  }
  (req as any).admin = session;
  next();
}

export { SESSION_COOKIE, cookieParser };
