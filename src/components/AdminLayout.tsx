import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, Lock, Tags, UserCheck, ScrollText, LogOut, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout() {
  const { currentAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { path: '/admin/lockers', label: '柜门管理', icon: Lock },
    { path: '/admin/pricing', label: '价格配置', icon: Tags },
    { path: '/admin/manual', label: '人工代取', icon: UserCheck },
    { path: '/admin/logs', label: '操作日志', icon: ScrollText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gradient-to-b from-forest-700 to-forest-900 text-white flex flex-col">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-6 border-b border-forest-600/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">景区储物柜</h1>
              <p className="text-xs text-forest-200">管理后台</p>
            </div>
          </div>
        </motion.div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-forest-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-forest-600/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center font-bold">
              {currentAdmin?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentAdmin?.name}</p>
              <p className="text-xs text-forest-300">{currentAdmin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-forest-100 hover:bg-red-500/30 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto scrollbar-thin">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
