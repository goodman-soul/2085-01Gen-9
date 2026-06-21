import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username.trim(), password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-700 via-forest-800 to-forest-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-block p-5 bg-white/10 backdrop-blur-sm rounded-3xl mb-4"
          >
            <Mountain className="w-14 h-14 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1">景区储物柜</h1>
          <p className="text-forest-200">管理后台登录</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-8 shadow-2xl space-y-5"
        >
          <div>
            <label className="label flex items-center gap-2">
              <User className="w-4 h-4" />
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Lock className="w-4 h-4" />
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            登 录
          </motion.button>

          <div className="text-center text-xs text-gray-400 pt-2 border-t">
            演示账号：<span className="font-mono text-gray-600">admin</span> / <span className="font-mono text-gray-600">admin123</span>
          </div>
        </motion.form>

        <p className="text-center text-forest-300 text-sm mt-6">
          <button onClick={() => navigate('/')} className="hover:underline">
            ← 返回游客端
          </button>
        </p>
      </motion.div>
    </div>
  );
}
