import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 直接复用 App 根组件，前台源码零改动
import App from '../App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('root 容器缺失');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
