import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { axiosInstance } from './lib/http';
import { demoAdapter } from './mock/demo-adapter';
import { AuthProvider } from './store/auth';
import { themeConfig } from './theme/tokens';
import './index.css';

// 离线演示模式：仅生产构建且显式开启时，用本地模拟数据拦截请求
if (import.meta.env.VITE_DEMO_MODE === 'true') {
  axiosInstance.defaults.adapter = demoAdapter;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <AuthProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
