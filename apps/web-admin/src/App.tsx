import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Clothing from '@/pages/Clothing';
import Community from '@/pages/Community';
import Devices from '@/pages/Devices';
import Placeholder from '@/pages/Placeholder';
import { RequireAuth } from '@/routes/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/clothing" element={<Clothing />} />
        <Route path="/community" element={<Community />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/algorithm" element={<Placeholder title="算法管理" description="推荐策略、模型参数与效果监控。" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
