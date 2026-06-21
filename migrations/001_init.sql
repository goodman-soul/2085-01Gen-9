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

INSERT OR IGNORE INTO admins (id, username, password, name, role)
VALUES ('admin-1', 'admin', 'admin123', '系统管理员', '超级管理员');
