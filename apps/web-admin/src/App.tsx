import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
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
        <Route path="/users" element={<Placeholder title="用户管理" description="用户列表、封禁与解封、资料查看。" />} />
        <Route path="/clothing" element={<Placeholder title="衣物库" description="全量衣物检索与生命周期管理。" />} />
        <Route path="/community" element={<Placeholder title="社区内容" description="穿搭审核、评论与举报处理。" />} />
        <Route path="/devices" element={<Placeholder title="硬件设备" description="设备绑定、在线状态与固件管理。" />} />
        <Route path="/algorithm" element={<Placeholder title="算法管理" description="推荐策略、模型参数与效果监控。" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
