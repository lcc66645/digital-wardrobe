import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { brand } from '@/theme/tokens';
import { useAuth } from '@/store/auth';
import type { LoginPayload } from '@/api/auth';

const { Title, Text } = Typography;

export default function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<LoginPayload>();

  const redirect =
    (location.state as { from?: string } | null)?.from ??
    new URLSearchParams(location.search).get('redirect') ??
    '/';

  // 已登录用户访问登录页时直接进入后台
  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  const onFinish = async (values: LoginPayload) => {
    try {
      const user = await signIn(values);
      message.success(`欢迎回来，${user.nickname}`);
      navigate(redirect, { replace: true });
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登录失败，请稍后重试');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${brand.cream} 0%, ${brand.pinkLight} 100%)`,
        padding: 24,
      }}
    >
      <Card
        style={{ width: 400, maxWidth: '100%', borderRadius: 20, boxShadow: '0 12px 40px rgba(61,44,30,0.12)' }}
        styles={{ body: { padding: '32px 28px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: brand.yellow,
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
            }}
          >
            <span role="img" aria-label="衣橱">🧥</span>
          </div>
          <Title level={3} style={{ marginBottom: 4, color: brand.brown }}>
            数字衣橱 · 管理后台
          </Title>
          <Text type="secondary">管理员登录，管理用户、内容与硬件</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的 11 位手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" maxLength={11} inputMode="numeric" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为 6–20 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" maxLength={20} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 12 }}>
          联调可用种子账号 13900000001 / 123456
        </Text>
      </Card>
    </div>
  );
}
