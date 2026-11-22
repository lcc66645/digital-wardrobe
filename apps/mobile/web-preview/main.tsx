import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 直接复用 App 根组件，前台源码零改动
import App from '../App';
import { http } from '../src/api/client';
import { demoAdapter } from './mock/demo-adapter';

// 生产构建（含 GitHub Pages）启用离线演示：无公网后端也可登录并浏览全部界面
if (import.meta.env.VITE_DEMO_MODE === 'true') {
  http.defaults.adapter = demoAdapter;
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('root 容器缺失');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
