import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'data', 'locker.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  return _db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '管理员'
    );

    CREATE TABLE IF NOT EXISTS lockers (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT '空闲' CHECK(status IN ('空闲', '使用中', '故障')),
      location TEXT NOT NULL,
      size TEXT NOT NULL DEFAULT '中' CHECK(size IN ('小', '中', '大')),
      fault_remark TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('基础', '旺季', '临时')),
      first_hour_price REAL NOT NULL DEFAULT 0,
      next_hour_price REAL NOT NULL DEFAULT 0,
      daily_cap REAL NOT NULL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      locker_id TEXT NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_minutes INTEGER,
      total_amount REAL,
      status TEXT NOT NULL DEFAULT '进行中' CHECK(status IN ('进行中', '已完成', '已取消')),
      pricing_snapshot TEXT NOT NULL,
      FOREIGN KEY (locker_id) REFERENCES lockers(id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      locker_id TEXT,
      order_id TEXT,
      operator TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      before_state TEXT,
      after_state TEXT,
      remark TEXT
    );
  `);

  const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admins').get() as any).c;
  if (adminCount === 0) {
    db.prepare(
      "INSERT INTO admins (id, username, password, name, role) VALUES ('admin-1', 'admin', 'admin123', '系统管理员', '超级管理员')"
    ).run();
  }

  const lockerCount = (db.prepare('SELECT COUNT(*) as c FROM lockers').get() as any).c;
  if (lockerCount === 0) {
    const sizes = ['小', '中', '大'];
    const insert = db.prepare(
      'INSERT INTO lockers (id, status, location, size) VALUES (?, ?, ?, ?)'
    );
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 5; col++) {
        const id = `A${String((row - 1) * 5 + col).padStart(2, '0')}`;
        insert.run(id, '空闲', `A区第${row}排`, sizes[(row + col) % 3]);
      }
    }
    db.prepare("UPDATE lockers SET status = '故障', fault_remark = '电子锁损坏，待维修' WHERE id = 'A05'").run();
  }

  const pricingCount = (db.prepare('SELECT COUNT(*) as c FROM pricing_rules').get() as any).c;
  if (pricingCount === 0) {
    const today = new Date();
    const peakStart = new Date(today);
    peakStart.setDate(today.getDate() - 5);
    const peakEnd = new Date(today);
    peakEnd.setDate(today.getDate() + 15);

    db.prepare(
      'INSERT INTO pricing_rules (id, name, type, first_hour_price, next_hour_price, daily_cap, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('base-default', '基础价格', '基础', 10, 5, 50, 1);

    db.prepare(
      'INSERT INTO pricing_rules (id, name, type, first_hour_price, next_hour_price, daily_cap, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'peak-summer',
      '暑期旺季',
      '旺季',
      15,
      8,
      80,
      peakStart.toISOString().split('T')[0],
      peakEnd.toISOString().split('T')[0],
      1
    );
  }
}

export default getDb;
