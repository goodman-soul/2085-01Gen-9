# 🏔️ 景区智能储物柜结算系统

景区智能储物柜自助寄存与结算全栈系统。游客自助寄存、按小时计费结算；管理员管理柜门、旺季调价、故障处理、人工代取，全流程操作可追溯。

---

## ✨ 功能特性

### 🎫 游客端
- **储物柜看板**：20 个柜门实时状态（绿色空闲 / 橙色使用中 / 红色故障）
- **四步式寄存流程**：选择柜门 → 设置 6 位取件密码 → 填写手机号 → 确认寄存（自动开门）
- **取件结算**：输入柜门号 + 密码 → 实时显示已用时长、计费明细、总费用 → 支付开门
- **密码找回**：手机号验证 → 验证码（演示模式） → 重置新密码

### 🔧 管理后台（`/admin/login`）
| 模块 | 功能 |
|------|------|
| 📊 **运营仪表盘** | 今日订单数、收入、在柜率、故障数；柜门总览；在柜订单列表 |
| 🚪 **柜门管理** | 搜索 / 状态筛选；标记 / 解除故障（含备注）；强制释放；展开查看订单详情 |
| 💰 **价格配置** | 基础费率 + 旺季 / 临时调价规则（日期段），支持启停、编辑、删除 |
| 👤 **人工代取** | 查询柜门 → 核验身份 → 填写代取原因 → 强制开门结算（全程记录） |
| 📜 **操作日志** | 按柜门号 / 操作类型 / 操作人 / 日期段筛选，全流程 9 类动作可追溯 |

### 💰 计费引擎
- **首小时定价 + 续小时阶梯定价 + 单日封顶**
- 跨日按天叠加计算每日封顶
- **规则优先级**：临时调价 > 旺季调价 > 基础价格（按日期自动匹配）
- **规则快照机制**：寄存时锁定费率快照，后续调价不影响历史订单

### 📝 可追溯日志类型
寄存、取件、密码重置、故障标记、故障解除、人工代取、价格调整、柜门状态变更、管理员登录

---

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────────────┐
│                        前端 (React 18)                        │
│  Vite · TS · TailwindCSS 3 · Zustand · Framer Motion · Lucide │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP (Vite 代理 /api)
┌──────────────────────────────▼───────────────────────────────┐
│                      后端 (Express 4)                        │
│  TS (tsx) · ESM · Cookie 会话认证 · better-sqlite3            │
├──────────────┬───────────────┬───────────────────────────────┤
│  认证中间件  │   路由层       │        工具层                 │
│  cookie-    │  /api/auth     │  计费引擎 (billing.ts)        │
│  parser +   │  /api/lockers  │  价格匹配 (helpers.ts)        │
│  内存会话    │  /api/orders   │  日志写入 (helpers.ts)        │
│             │  /api/pricing  │                               │
│             │  /api/logs     │                               │
└──────────────┴───────────────┴───────────────┬───────────────┘
                                               │
┌──────────────────────────────────────────────▼───────────────┐
│                     数据库 (SQLite 3)                         │
│  admins · lockers · orders · pricing_rules · logs            │
└──────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 18 + TypeScript + Vite 6 | SPA 架构 |
| 样式 | TailwindCSS 3 + Framer Motion | 原子化 CSS + 微交互动画 |
| 状态 | Zustand 5 | 轻量级 store，统一封装 API 调用 |
| 路由 | React Router 7 | 含管理员路由守卫 |
| **后端** | Express 4 + TypeScript (tsx 运行时) | ESM 模块 |
| 认证 | Cookie + 内存 Session Map | 24 小时过期 |
| **数据库** | SQLite (better-sqlite3) | WAL 模式，同步高性能 |
| 其他 | date-fns · lucide-react · cors | 日期、图标、跨域 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 1. 安装依赖

```bash
npm install
```

> 首次安装会自动编译 `better-sqlite3` 原生模块，需要支持 C++ 的构建环境。

### 2. 启动开发环境（同时启动前后端）

```bash
npm run dev
```

启动后：
| 服务 | 地址 |
|------|------|
| 🌐 前端 SPA | http://localhost:5173 |
| ⚙️ 后端 API | http://localhost:3001 |
| 📦 API 代理 | 前端 `/api` 自动转发到后端 3001 端口 |

首次启动后端会自动：
- 创建 `data/locker.db` SQLite 数据库
- 执行建表（参考 `migrations/001_init.sql`）
- 插入初始数据：管理员账号、20 个柜门、基础 + 旺季价格规则

### 3. （可选）只启动后端

```bash
npm run dev:server   # http://localhost:3001
```

### 4. （可选）只启动前端

```bash
npm run dev:client   # http://localhost:5173（需已启动后端）
```

---

## 🔐 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | `admin` | `admin123` |

> 登录信息以 Cookie 形式存储，有效期 24 小时；密码未哈希（本地演示用，生产环境请加 bcrypt）

---

## 📂 项目结构

```
scenic-locker-system/
├── api/                              # 🟢 Express 后端（TypeScript ESM）
│   ├── index.ts                      # 服务入口：初始化 DB、挂载中间件、注册路由
│   ├── db.ts                         # SQLite 连接（WAL + 外键）、建表、种子数据
│   ├── middleware/
│   │   └── auth.ts                   # Cookie Parser + Session 创建/销毁/鉴权中间件
│   ├── routes/
│   │   ├── auth.ts                   # POST /login · /logout · GET /me
│   │   ├── lockers.ts                # 柜门 CRUD + 状态变更（含日志）
│   │   ├── orders.ts                 # 订单创建/验证/结算/密码重置 + 计费计算
│   │   ├── pricing.ts                # 价格规则 CRUD + 启停 + 当前生效规则
│   │   └── logs.ts                   # 操作日志多维筛选（500 条上限）
│   └── utils/
│       ├── billing.ts                # 核心计费引擎（按天拆分+封顶+快照）
│       └── helpers.ts                # 价格规则匹配器 + 日志写入工具
│
├── migrations/
│   └── 001_init.sql                  # DDL 建表脚本（与 db.ts 同步）
│
├── data/                             # SQLite 数据目录（gitignore，首次启动自动生成）
│   └── locker.db / -shm / -wal
│
├── src/                              # 🔵 React 前端
│   ├── components/                   # 可复用 UI 组件
│   │   ├── LockerCard.tsx            # 单个柜门卡片（状态色+动画）
│   │   ├── LockerGrid.tsx            # 5×4 柜门网格
│   │   ├── StatCard.tsx              # 统计渐变卡片
│   │   ├── PasswordInput.tsx         # 6 位数字密码输入
│   │   ├── FeeBreakdown.tsx          # 费用明细卡片（分层+动画）
│   │   ├── Timeline.tsx              # 操作日志垂直时间线
│   │   └── AdminLayout.tsx           # 后台侧边栏布局
│   ├── pages/
│   │   ├── visitor/                  # 游客端 4 页
│   │   │   ├── Home.tsx              # 看板+三大入口
│   │   │   ├── Store.tsx             # 四步式寄存流程
│   │   │   ├── Pickup.tsx            # 取件结算+实时计费刷新
│   │   │   └── Forgot.tsx            # 验证码+密码重置
│   │   └── admin/                    # 管理端 6 页
│   │       ├── Login.tsx             # 管理员登录
│   │       ├── Dashboard.tsx         # 仪表盘
│   │       ├── LockerManage.tsx      # 柜门管理+故障弹窗
│   │       ├── Pricing.tsx           # 价格规则+编辑弹窗
│   │       ├── ManualPickup.tsx      # 人工代取流程
│   │       └── Logs.tsx              # 日志多维筛选
│   ├── store/                        # Zustand 状态管理（全 API 调用）
│   │   ├── useAuthStore.ts
│   │   ├── useLockerStore.ts
│   │   ├── useOrderStore.ts
│   │   ├── usePricingStore.ts
│   │   └── useLogStore.ts
│   ├── lib/
│   │   └── api.ts                    # fetch 统一封装（含 credentials、错误处理）
│   ├── utils/
│   │   └── billing.ts                # 前端格式化工具（formatCurrency / formatDuration）
│   ├── types/index.ts                # 全局 TypeScript 类型
│   ├── App.tsx                       # 路由配置（含保护路由）
│   └── main.tsx
│
├── public/
├── index.html
├── tailwind.config.js                # 自定义 forest / amber 主题色
├── vite.config.ts                    # Vite + React + TS 路径 + /api 代理
├── tsconfig.json                     # @/* -> src/* 路径别名
├── eslint.config.js
├── package.json
└── README.md
```

---

## 🔌 API 接口文档

所有接口返回 JSON；需认证接口返回 401 表示未登录。

### 🔐 认证 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/login` | 登录，Set-Cookie 返回 Session | ❌ |
| POST | `/logout` | 退出登录，清除 Cookie | ✅ |
| GET  | `/me` | 获取当前管理员信息 | ✅ |

**POST /api/auth/login Body：**
```json
{ "username": "admin", "password": "admin123" }
```

---

### 🚪 柜门 `/api/lockers`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET  | `/` | 列出所有柜门（按 id 排序） | ❌ |
| GET  | `/:id` | 单个柜门详情 | ❌ |
| PATCH | `/:id/status` | 更新柜门状态（空闲/使用中/故障） | ✅ |

**PATCH /api/lockers/A05/status Body：**
```json
{ "status": "故障", "faultRemark": "电子锁损坏" }
```
> 每次状态变更自动写入操作日志

---

### 📦 订单 `/api/orders`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET  | `/active` | 所有进行中订单（join 柜门信息） | ❌ |
| GET  | `/active/:lockerId` | 指定柜门的在柜订单（或 null） | ❌ |
| GET  | `/today` | 今日所有订单 | ❌ |
| GET  | `/today/revenue` | 今日已完成订单总收入 | ❌ |
| POST | `/` | 创建寄存订单（同时改柜门为使用中） | ❌ |
| POST | `/:id/complete` | 完成取件结算（含管理员人工代取） | 取件❌ / 代取✅ |
| POST | `/verify` | 验证柜门号+密码并返回实时计费 | ❌ |
| PATCH | `/:id/password` | 重置取件密码 | ❌ |

**POST /api/orders Body（寄存）：**
```json
{ "lockerId": "A01", "password": "123456", "phone": "13800138000" }
```

**POST /api/orders/:id/complete Body：**
- 游客自助取件：`{ "password": "123456" }`
- 管理员人工代取（已登录 Cookie 自动识别）：`{ "reason": "游客紧急就医" }`

**POST /api/orders/verify 返回：**
```json
{
  "order": { ...订单信息... },
  "billing": {
    "durationMinutes": 135,
    "billableHours": 3,
    "totalAmount": 20,
    "dailyAmounts": [{ "date": "2024-07-20", "hours": 3, "amount": 20 }],
    ...
  }
}
```

---

### 💰 价格规则 `/api/pricing`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET  | `/` | 所有规则列表 | ❌ |
| GET  | `/current` | 当前生效规则（临时>旺季>基础） | ❌ |
| POST | `/` | 新增规则 | ✅ |
| PATCH | `/:id` | 修改规则 | ✅ |
| DELETE | `/:id` | 删除规则（基础规则不可删） | ✅ |
| PATCH | `/:id/toggle` | 启用 / 停用切换 | ✅ |

**规则类型优先级：** `临时`（日期命中）> `旺季`（日期命中）> `基础`（兜底）

---

### 📜 操作日志 `/api/logs`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 筛选查询（Query 参数见下） | ✅ |

**查询参数（均可选）：**
```
?lockerId=A01
&actionType=寄存
&operator=管理员
&startDate=2024-07-01
&endDate=2024-07-31
```
> 返回最新 500 条，按时间倒序

---

## 🗄️ 数据库设计

### ER 图

```
           ┌──────────────┐
           │    admins    │
           └──────┬───────┘
                  │ creates
                  ▼
┌──────────────┐         ┌──────────────────┐
│   lockers    │──has──►│      orders       │◄──applies───┐
│ (id, status, │         │ (locker_id, pass, │            │
│  location,   │         │  start/end_time, │            │
│  size,       │         │  pricing_snapshot,│            │
│  fault_remark)│         │  total_amount)   │            │
└──────┬───────┘         └────────┬─────────┘            │
       │ appears in              │ generates             │
       ▼                         ▼                        │
┌───────────────────────────────────────────┐   ┌────────────────────┐
│                 logs                      │   │   pricing_rules    │
│ (action_type, locker_id, order_id,       │   │ (type, date_range, │
│  operator, before_state, after_state,    │   │  prices, daily_cap) │
│  remark, timestamp)                      │   └────────────────────┘
└───────────────────────────────────────────┘
```

### 核心字段参考

| 表 | 关键字段 | 说明 |
|----|----------|------|
| **lockers** | `status` CHECK ('空闲','使用中','故障') | 状态由外键联动保证 |
| **orders** | `pricing_snapshot` JSON | 寄存时锁定费率，保证历史可追溯 |
| **orders** | `status` + 外键 `locker_id` | 订单完成后自动改 locker 状态 |
| **pricing_rules** | `type` + `start_date/end_date` | 自动匹配逻辑在 `helpers.ts` |
| **logs** | `before_state / after_state` | 状态变更前后快照，便于审计 |

---

## 🧪 验证清单

用默认数据可按以下步骤验证全流程闭环：

### 游客寄存 → 取件闭环
1. 访问 `http://localhost:5173` → 查看 17 空闲 / 1 使用中 / 1 故障
2. 点击 **寄存行李** → 选择任意绿色柜门 → 输入 `123456` 两次 + 手机号 `13800138000`
3. 成功页记录柜门号和密码，或直接点击 **我要取件**
4. 取件页输入柜门号 + 密码 `123456` → 查看实时时长/费用
5. 确认支付 → 柜门改回空闲状态

### 管理端功能
6. 右上角「管理员入口」或访问 `/admin/login` → `admin / admin123`
7. 仪表盘：看到寄存订单 + 收入更新
8. **柜门管理** → A05 点对号解除故障 → 或 A03 标记故障
9. **价格配置** → 新增「国庆临时价」→ 选择日期区间、首小时 20 → 保存
10. **人工代取** → 输入任意在柜柜门号 → 填原因 → 确认开门（日志自动记录）
11. **操作日志** → 筛选 `人工代取` / `寄存` → 查看所有操作链

---

## 🛠️ 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端 (Vite) + 后端 (tsx watch) |
| `npm run dev:client` | 仅前端开发服务器 (5173) |
| `npm run dev:server` | 仅后端开发服务器 (3001) |
| `npm run check` | TypeScript 类型全量检查 (前后端共享 tsc) |
| `npm run build` | 生产构建前端到 `dist/` (后端可直接 `tsx api/index.ts` 部署) |
| `npm run lint` | ESLint 代码检查 |
| `npm run preview` | 预览生产构建产物 |
| `npm run db:init` | 手动触发数据库初始化（无需，首次启动自动） |

---

## 🔄 部署建议

生产环境推荐：

```bash
# 1. 构建前端
npm run build

# 2. 后端使用 Node 直接运行（tsx 或 预编译 tsc）
tsx api/index.ts
# 或
npx tsc -p tsconfig.api.json && node dist-api/index.js
```

建议：
- 将 `data/` 目录挂载到持久化存储卷
- 管理员密码加 bcrypt 哈希（目前明文仅演示）
- Session 改用 Redis 而不是内存 Map（多实例部署）
- 后端前面挂 Nginx：静态 `dist/` + 反向代理 `/api`

---

## ⚠️ 常见问题

**Q: 首次启动 better-sqlite3 编译失败？**
A: 需要系统有 `python3` + `make` + `g++`。Ubuntu: `sudo apt install build-essential python3`；macOS: `xcode-select --install`

**Q: 前端连不上后端？**
A: 确认后端 3001 端口已启动；Vite `/api` 代理默认指向 `http://localhost:3001`，可在 `vite.config.ts` 修改

**Q: 旺季价格没有生效？**
A: 检查「价格配置」中规则的日期区间是否包含今天，以及规则是否为「启用」状态；优先级：临时 > 旺季 > 基础

---

## 📄 License

MIT
