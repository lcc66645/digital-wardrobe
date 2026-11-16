import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import type { AlgorithmRuleItem, DistributionItem } from '@dw/shared';
import { fetchAlgorithmOverview, type AlgorithmOverview } from '@/api/admin';
import { brand } from '@/theme/tokens';
import { CATEGORY_META, CLOTHING_STATUS_META, metaOf } from './dashboard/meta';

const { Title, Text, Paragraph } = Typography;

const SEASON_META: Record<string, { label: string; color: string }> = {
  SPRING: { label: '春季', color: '#7BD389' },
  SUMMER: { label: '夏季', color: '#F5A623' },
  AUTUMN: { label: '秋季', color: '#E8B88A' },
  WINTER: { label: '冬季', color: '#6C9BD2' },
};

const OCCASION_META: Record<string, { label: string; color: string }> = {
  CASUAL: { label: '休闲', color: '#7BD389' },
  WORK: { label: '通勤', color: '#6C9BD2' },
  DATE: { label: '约会', color: '#FFB6C1' },
  SPORT: { label: '运动', color: '#F5A623' },
  FORMAL: { label: '正式', color: '#9C8271' },
  HOME: { label: '居家', color: '#B18CDB' },
  OTHER: { label: '其他', color: '#E8B88A' },
};

/** 单条分布进度行 */
function DistributionRow({
  label,
  count,
  percent,
  color,
  tag,
}: {
  label: string;
  count: number;
  percent: number;
  color: string;
  tag?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: brand.brown }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 4,
              background: color,
              marginRight: 8,
            }}
          />
          {label}
          {tag}
        </Text>
        <Text strong>{count}</Text>
      </div>
      <Progress percent={percent} showInfo={false} strokeColor={color} trailColor="#F0E8DC" size="small" />
    </div>
  );
}

export default function AlgorithmPage() {
  const [data, setData] = useState<AlgorithmOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchAlgorithmOverview()
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
        <Spin size="large" tip="加载算法数据底座…">
          <div style={{ height: 1 }} />
        </Spin>
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message="算法数据加载失败" description={error} showIcon action={<a onClick={load}>重试</a>} />;
  }

  const { metrics, categoryCoverage, seasonDistribution, occasionDistribution, occasionUnsetCount, lifecycleDistribution, rules } =
    data;

  const maxCategory = Math.max(...categoryCoverage.map((c) => c.count), 1);
  const seasonTotal = seasonDistribution.reduce((s, i) => s + i.count, 0);
  const occasionTotal = occasionDistribution.reduce((s, i) => s + i.count, 0);
  const lifecycleTotal = lifecycleDistribution.reduce((s, i) => s + i.count, 0);
  const gapCount = categoryCoverage.filter((c) => c.gap).length;

  const ruleColumns: ColumnsType<AlgorithmRuleItem> = [
    {
      title: '环节',
      dataIndex: 'stage',
      width: 110,
      render: (stage: string) => <Tag color="orange">{stage}</Tag>,
    },
    {
      title: '规则',
      dataIndex: 'name',
      width: 140,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    { title: '口径说明', dataIndex: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: AlgorithmRuleItem['status']) =>
        status === 'ACTIVE' ? <Tag color="success">已生效</Tag> : <Tag>规划中</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ThunderboltOutlined style={{ color: brand.yellow, marginRight: 8 }} />
          算法管理
        </Title>
        <Button icon={<ReloadOutlined />} onClick={load}>
          刷新
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="本页呈现推荐算法依赖的衣橱数据底座与当前策略口径"
        description="所有计数均由线上真实数据库实时聚合，可作为推荐候选池规模与品类完备度的依据；推荐曝光、点击率、转化率等线上效果指标需在推荐埋点与曝光日志上线后接入，当前不展示任何估算值。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="推荐候选池（在用衣物）" value={metrics.inUseClothingCount} suffix="件" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              全部衣物 {metrics.clothingTotal} 件，仅在用进入候选
            </Text>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="平均穿着次数" value={metrics.avgWearCount} suffix="次 / 件" precision={1} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              在用衣物累计穿着 {metrics.totalWearCount} 次
            </Text>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic
              title="闲置衣物（0 穿着）"
              value={metrics.idleClothingCount}
              suffix="件"
              valueStyle={{ color: metrics.idleClothingCount > 0 ? '#F5A623' : undefined }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              推荐侧优先盘活的高潜单品
            </Text>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="穿搭组合总数" value={metrics.outfitTotal} suffix="套" />
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic title="公开穿搭（已发布且通过）" value={metrics.publicOutfitCount} suffix="套" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              可进入社区与推荐内容池
            </Text>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <Statistic
              title="品类缺口（必备品类为 0）"
              value={gapCount}
              suffix="类"
              valueStyle={{ color: gapCount > 0 ? brand.danger : '#7BD389' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              缺口会限制可生成的成套搭配
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="品类完备度（在用衣物）"
            style={{ height: '100%' }}
            extra={
              <Tooltip title="上装、下装、外套、鞋履为成套搭配必备；数量为 0 标记为缺口">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  必备口径说明
                </Text>
              </Tooltip>
            }
          >
            {categoryCoverage.map((c) => {
              const meta = metaOf(CATEGORY_META, c.category);
              return (
                <DistributionRow
                  key={c.category}
                  label={meta.label}
                  count={c.count}
                  percent={Math.round((c.count / maxCategory) * 100)}
                  color={meta.color}
                  tag={
                    c.gap ? (
                      <Tag color="error" style={{ marginLeft: 8 }}>
                        缺口
                      </Tag>
                    ) : c.required ? (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        必备
                      </Tag>
                    ) : (
                      <Tag style={{ marginLeft: 8 }}>可选</Tag>
                    )
                  }
                />
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="季节分布（在用衣物）" style={{ marginBottom: 16 }}>
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
              按衣物适用季节打标，一件衣物可同时计入多个季节，故各项之和可能大于候选池件数。
            </Paragraph>
            {seasonDistribution.map((i: DistributionItem) => {
              const meta = SEASON_META[i.key] ?? { label: i.key, color: '#9C8271' };
              return (
                <DistributionRow
                  key={i.key}
                  label={meta.label}
                  count={i.count}
                  percent={seasonTotal === 0 ? 0 : Math.round((i.count / seasonTotal) * 100)}
                  color={meta.color}
                />
              );
            })}
          </Card>
          <Card title="场合分布（在用衣物）">
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
              未设置场合的在用衣物 {occasionUnsetCount} 件，不计入下方分布。
            </Paragraph>
            {occasionDistribution.map((i: DistributionItem) => {
              const meta = OCCASION_META[i.key] ?? { label: i.key, color: '#9C8271' };
              return (
                <DistributionRow
                  key={i.key}
                  label={meta.label}
                  count={i.count}
                  percent={occasionTotal === 0 ? 0 : Math.round((i.count / occasionTotal) * 100)}
                  color={meta.color}
                />
              );
            })}
          </Card>
        </Col>
      </Row>

      <Card title="生命周期分布（全量衣物）" style={{ marginTop: 16 }}>
        <Row gutter={[16, 0]}>
          {lifecycleDistribution.map((i: DistributionItem) => {
            const meta = metaOf(CLOTHING_STATUS_META, i.key);
            return (
              <Col xs={12} sm={8} lg={24 / 5} key={i.key}>
                <DistributionRow
                  label={meta.label}
                  count={i.count}
                  percent={lifecycleTotal === 0 ? 0 : Math.round((i.count / lifecycleTotal) * 100)}
                  color={meta.color}
                />
              </Col>
            );
          })}
        </Row>
      </Card>

      <Card title="推荐策略规则口径（只读）" style={{ marginTop: 16 }}>
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          以下为当前推荐引擎遵循的产品规则，用于对齐算法、产品与运营口径；规则参数（权重、阈值）待推荐配置中心上线后支持在线调整，本页暂不提供编辑入口。
        </Paragraph>
        <Table<AlgorithmRuleItem>
          rowKey="name"
          columns={ruleColumns}
          dataSource={rules}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
