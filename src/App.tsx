import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/visitor/Home';
import Store from '@/pages/visitor/Store';
import Pickup from '@/pages/visitor/Pickup';
import Forgot from '@/pages/visitor/Forgot';
import AdminLogin from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import LockerManage from '@/pages/admin/LockerManage';
import Pricing from '@/pages/admin/Pricing';
import ManualPickup from '@/pages/admin/ManualPickup';
import Logs from '@/pages/admin/Logs';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/pickup" element={<Pickup />} />
        <Route path="/forgot" element={<Forgot />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lockers" element={<LockerManage />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="manual" element={<ManualPickup />} />
          <Route path="logs" element={<Logs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
