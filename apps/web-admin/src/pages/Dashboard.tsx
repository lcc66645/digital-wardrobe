import {
  AppstoreOutlined,
  AuditOutlined,
  CloudServerOutlined,
  CommentOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Alert, Card, Col, Progress, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { DashboardVo, DistributionItem } from '@dw/shared';
import { fetchDashboard } from '@/api/admin';
import { brand } from '@/theme/tokens';
import {
  AUDIT_META,
  CATEGORY_META,
  CLOTHING_STATUS_META,
  metaOf,
  type EnumMeta,
} from './dashboard/meta';
import TrendChart from './dashboard/TrendChart';

const { Title, Text } = Typography;

function StatCard({
  icon,
  title,
  value,
  suffix,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
  accent: string;
  sub?: string;
}) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: accent,
            color: brand.brown,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: brand.brown }}>
            {value}
            {suffix && (
              <span style={{ fontSize: 14, fontWeight: 400, color: '#9C8271' }}>{suffix}</span>
            )}
          </div>
          {sub && (
            <Text style={{ fontSize: 12, color: '#9C8271' }}>{sub}</Text>
          )}
        </div>
      </div>
    </Card>
  );
}

function DistributionCard({
  title,
  items,
  metaMap,
}: {
  title: string;
  items: DistributionItem[];
  metaMap: Record<string, EnumMeta>;
}) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  return (
    <Card title={title} style={{ height: '100%' }}>
      {items.map((item) => {
        const meta = metaOf(metaMap, item.key);
        const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);
        return (
          <div key={item.key} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: brand.brown }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: meta.color,
                    marginRight: 8,
                  }}
                />
                {meta.label}
              </Text>
              <Text strong>{item.count}</Text>
            </div>
            <Progress
              percent={percent}
              showInfo={false}
              strokeColor={meta.color}
              trailColor="#F0E8DC"
              size="small"
            />
          </div>
        );
      })}
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardVo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchDashboard()
      .then((vo) => setData(vo))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 96 }}>
        <Spin size="large" tip="加载看板数据…">
          <div style={{ height: 1 }} />
        </Spin>
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message="看板加载失败" description={error} showIcon action={<a onClick={load}>重试</a>} />;
  }

  const { overview } = data;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        数据看板
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<TeamOutlined />}
            title="用户总数"
            value={overview.userTotal}
            accent={brand.yellow}
            sub={`封禁 ${overview.bannedUserCount} 人`}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<AppstoreOutlined />}
            title="衣物总数"
            value={overview.clothingTotal}
            accent={brand.pink}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<MessageOutlined />}
            title="穿搭总数"
            value={overview.outfitTotal}
            accent="#E8B88A"
            sub={`已发布 ${overview.publishedOutfitCount} 条`}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<CloudServerOutlined />}
            title="在线设备"
            value={overview.onlineDeviceCount}
            suffix={` / ${overview.deviceTotal}`}
            accent="#7BD389"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<AuditOutlined />}
            title="待审核穿搭"
            value={overview.pendingAuditCount}
            accent="#F5A623"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            icon={<CommentOutlined />}
            title="待处理反馈"
            value={overview.pendingFeedbackCount}
            accent={brand.danger}
          />
        </Col>
      </Row>

      <Card
        style={{ marginTop: 16 }}
        title="近 7 天新增趋势"
        extra={
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#FFD93D', marginRight: 6 }} />
              新增用户
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#3D2C1E', marginRight: 6 }} />
              新增穿搭
            </span>
          </div>
        }
      >
        <TrendChart data={data.trend} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <DistributionCard title="衣物品类分布" items={data.clothingByCategory} metaMap={CATEGORY_META} />
        </Col>
        <Col xs={24} lg={8}>
          <DistributionCard title="衣物生命周期" items={data.clothingByStatus} metaMap={CLOTHING_STATUS_META} />
        </Col>
        <Col xs={24} lg={8}>
          <DistributionCard title="穿搭审核状态" items={data.outfitByAudit} metaMap={AUDIT_META} />
        </Col>
      </Row>
    </div>
  );
}
