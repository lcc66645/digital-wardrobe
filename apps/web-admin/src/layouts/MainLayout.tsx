import {
  AppstoreOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from 'antd';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '@/theme/tokens';
import { useAuth } from '@/store/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/clothing', icon: <AppstoreOutlined />, label: '衣物库' },
  { key: '/community', icon: <MessageOutlined />, label: '社区内容' },
  { key: '/devices', icon: <CloudServerOutlined />, label: '硬件设备' },
  { key: '/algorithm', icon: <ExperimentOutlined />, label: '算法管理' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ position: 'sticky', top: 0, height: '100vh' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: brand.cream,
            fontWeight: 700,
            fontSize: collapsed ? 18 : 16,
          }}
        >
          <span style={{ fontSize: 24 }}>🧥</span>
          {!collapsed && <span>数字衣橱后台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.key),
          }))}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((v) => !v)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar
                size="small"
                src={user?.avatar || undefined}
                icon={<UserOutlined />}
                style={{ background: brand.yellow, color: brand.brown }}
              />
              <Text strong>{user?.nickname ?? '管理员'}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 20 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
