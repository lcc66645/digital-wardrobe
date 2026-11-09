import {
  App as AntApp,
  Button,
  Card,
  Drawer,
  Empty,
  Image,
  Input,
  List,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { AuditStatus, Mood } from '@dw/shared';
import {
  auditOutfit,
  fetchAdminOutfits,
  fetchOutfitComments,
  type AdminComment,
  type AdminOutfit,
  type AdminOutfitQuery,
} from '@/api/admin';
import { brand } from '@/theme/tokens';

const { Title, Text, Paragraph } = Typography;

const MOOD_LABEL: Record<Mood, string> = {
  HAPPY: '开心',
  CALM: '平静',
  ENERGETIC: '活力',
  LAZY: '慵懒',
  CONFIDENT: '自信',
  SAD: '低落',
  OTHER: '其他',
};

const AUDIT_META: Record<AuditStatus, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'gold' },
  APPROVED: { label: '已通过', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
};

function formatDate(d: string | Date): string {
  const date = new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day} ${h}:${min}`;
}

export default function CommunityPage() {
  const { message } = AntApp.useApp();

  const [list, setList] = useState<AdminOutfit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [auditFilter, setAuditFilter] = useState<AuditStatus | undefined>(undefined);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');

  // 评论抽屉
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [drawerOutfit, setDrawerOutfit] = useState<AdminOutfit | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: AdminOutfitQuery = { page, pageSize };
    if (auditFilter) params.auditStatus = auditFilter;
    if (keyword) params.keyword = keyword;
    fetchAdminOutfits(params)
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, auditFilter, keyword, message]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAudit = async (id: string, status: AuditStatus) => {
    try {
      await auditOutfit(id, status);
      message.success(status === AuditStatus.APPROVED ? '已通过审核' : '已驳回该穿搭');
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const openComments = (record: AdminOutfit) => {
    setDrawerOutfit(record);
    setDrawerOpen(true);
    setCommentsLoading(true);
    fetchOutfitComments(record.id)
      .then((data) => setComments(data))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setCommentsLoading(false));
  };

  const columns: ColumnsType<AdminOutfit> = [
    {
      title: '穿搭',
      dataIndex: 'content',
      render: (_, record) => (
        <Space align="start">
          <Image
            src={record.imageUrl ?? undefined}
            width={52}
            height={52}
            style={{ objectFit: 'cover', borderRadius: 8, background: brand.pinkLight }}
            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MiIgaGVpZ2h0PSI1MiIvPg=="
          />
          <Paragraph
            style={{ margin: 0, maxWidth: 180 }}
            ellipsis={{ rows: 2 }}
            type={record.content ? undefined : 'secondary'}
          >
            {record.content ?? '（无文案）'}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: '作者',
      key: 'owner',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.ownerName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.ownerPhone ?? '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: '心情',
      dataIndex: 'mood',
      width: 80,
      render: (m: Mood | null) => (m ? <Tag>{MOOD_LABEL[m]}</Tag> : '—'),
    },
    {
      title: '发布',
      dataIndex: 'isPublished',
      width: 80,
      render: (published: boolean) =>
        published ? <Tag color="blue">已发布</Tag> : <Tag>未发布</Tag>,
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      width: 90,
      render: (s: AuditStatus) => <Tag color={AUDIT_META[s].color}>{AUDIT_META[s].label}</Tag>,
    },
    {
      title: '点赞',
      dataIndex: 'likeCount',
      width: 70,
      align: 'right',
    },
    {
      title: '评论',
      dataIndex: 'commentCount',
      width: 70,
      align: 'right',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 140,
      render: (d: string | Date) => formatDate(d),
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            disabled={record.auditStatus === AuditStatus.APPROVED}
            onClick={() => handleAudit(record.id, AuditStatus.APPROVED)}
          >
            通过
          </Button>
          <Popconfirm
            title="确认驳回该穿搭？"
            description="驳回后该内容不在社区展示"
            disabled={record.auditStatus === AuditStatus.REJECTED}
            onConfirm={() => handleAudit(record.id, AuditStatus.REJECTED)}
          >
            <Button
              type="link"
              size="small"
              danger
              disabled={record.auditStatus === AuditStatus.REJECTED}
            >
              驳回
            </Button>
          </Popconfirm>
          <Button type="link" size="small" onClick={() => openComments(record)}>
            评论
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        社区内容
      </Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="审核状态"
            style={{ width: 140 }}
            value={auditFilter}
            onChange={(v: AuditStatus | undefined) => {
              setAuditFilter(v);
              setPage(1);
            }}
            options={Object.values(AuditStatus).map((s) => ({
              value: s,
              label: AUDIT_META[s].label,
            }))}
          />
          <Input
            allowClear
            placeholder="搜索穿搭文案"
            style={{ width: 200 }}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onPressEnter={() => {
              setKeyword(keywordInput.trim());
              setPage(1);
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              setKeyword(keywordInput.trim());
              setPage(1);
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              setKeywordInput('');
              setKeyword('');
              setAuditFilter(undefined);
              setPage(1);
            }}
          >
            重置
          </Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条穿搭`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Drawer
        title={
          drawerOutfit
            ? `评论 · ${drawerOutfit.ownerName}（${drawerOutfit.commentCount}）`
            : '评论'
        }
        width={420}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List
          loading={commentsLoading}
          dataSource={comments}
          locale={{ emptyText: <Empty description="暂无评论" /> }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{item.ownerName}</Text>
                    {item.parentId && <Tag color="default">回复</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Text style={{ color: brand.brown }}>{item.content}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(item.createdAt)} · 点赞 {item.likeCount}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}
