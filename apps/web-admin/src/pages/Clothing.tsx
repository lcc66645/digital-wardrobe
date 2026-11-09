import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App as AntApp } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  ClothingCategory,
  ClothingStatus,
} from '@dw/shared';
import {
  fetchAdminClothing,
  updateClothingStatus,
  type AdminClothing,
  type AdminClothingQuery,
} from '@/api/admin';
import { brand } from '@/theme/tokens';

const { Title, Text } = Typography;

const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  TOP: '上装',
  BOTTOM: '下装',
  OUTERWEAR: '外套',
  DRESS: '连衣裙',
  SHOES: '鞋履',
  BAG: '包袋',
  ACCESSORY: '配饰',
  OTHER: '其他',
};

const STATUS_META: Record<ClothingStatus, { label: string; color: string }> = {
  IN_USE: { label: '在用', color: 'success' },
  STORED: { label: '收纳', color: 'blue' },
  DONATED: { label: '捐赠', color: 'gold' },
  RESOLD: { label: '转卖', color: 'cyan' },
  DISCARDED: { label: '丢弃', color: 'error' },
};

/** 终态：进入后不再参与日常穿搭推荐 */
const TERMINAL_STATUS: ClothingStatus[] = [
  ClothingStatus.DONATED,
  ClothingStatus.RESOLD,
  ClothingStatus.DISCARDED,
];

function formatDate(d: string | Date): string {
  const date = new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day}`;
}

export default function ClothingPage() {
  const { message } = AntApp.useApp();

  const [list, setList] = useState<AdminClothing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ClothingStatus | undefined>(undefined);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');

  // 状态调整 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminClothing | null>(null);
  const [targetStatus, setTargetStatus] = useState<ClothingStatus | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: AdminClothingQuery = { page, pageSize };
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    if (keyword) params.keyword = keyword;
    fetchAdminClothing(params)
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, categoryFilter, statusFilter, keyword, message]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (record: AdminClothing) => {
    setEditing(record);
    setTargetStatus(undefined);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing || !targetStatus) return;
    setSaving(true);
    try {
      await updateClothingStatus(editing.id, targetStatus);
      message.success('已更新衣物生命周期状态');
      setModalOpen(false);
      load();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<AdminClothing> = [
    {
      title: '衣物',
      dataIndex: 'name',
      render: (_, record) => (
        <Space>
          <Image
            src={record.imageUrl ?? undefined}
            width={44}
            height={44}
            style={{ objectFit: 'cover', borderRadius: 8, background: brand.pinkLight }}
            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIvPg=="
          />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: '品类',
      dataIndex: 'category',
      width: 90,
      render: (c: ClothingCategory) => <Tag>{CATEGORY_LABEL[c] ?? c}</Tag>,
    },
    {
      title: '所属用户',
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
      title: '颜色',
      dataIndex: 'color',
      width: 90,
      render: (color: string | null) => color ?? '—',
    },
    {
      title: '穿着次数',
      dataIndex: 'wearCount',
      width: 90,
      align: 'right',
    },
    {
      title: '购入价',
      dataIndex: 'purchasePrice',
      width: 100,
      align: 'right',
      render: (price: number | null) => (price === null ? '—' : `¥${price}`),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: ClothingStatus) => (
        <Tag color={STATUS_META[s].color}>{STATUS_META[s].label}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 110,
      render: (d: string | Date) => formatDate(d),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openModal(record)}>
          调整状态
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        衣物库
      </Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="品类"
            style={{ width: 130 }}
            value={categoryFilter}
            onChange={(v: ClothingCategory | undefined) => {
              setCategoryFilter(v);
              setPage(1);
            }}
            options={Object.values(ClothingCategory).map((c) => ({
              value: c,
              label: CATEGORY_LABEL[c],
            }))}
          />
          <Select
            allowClear
            placeholder="生命周期状态"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v: ClothingStatus | undefined) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={Object.values(ClothingStatus).map((s) => ({
              value: s,
              label: STATUS_META[s].label,
            }))}
          />
          <Input
            allowClear
            placeholder="搜索名称/颜色"
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
              setCategoryFilter(undefined);
              setStatusFilter(undefined);
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
          scroll={{ x: 1080 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 件衣物`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title="调整衣物生命周期状态"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="确认调整"
        cancelText="取消"
        confirmLoading={saving}
        okButtonProps={{ disabled: !targetStatus || targetStatus === editing?.status }}
      >
        {editing && (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Text>
              衣物：<Text strong>{editing.name}</Text>（当前：
              {STATUS_META[editing.status].label}）
            </Text>
            <Select
              placeholder="选择目标状态"
              style={{ width: '100%' }}
              value={targetStatus}
              onChange={(v: ClothingStatus) => setTargetStatus(v)}
              options={Object.values(ClothingStatus).map((s) => ({
                value: s,
                label: STATUS_META[s].label,
                disabled: s === editing.status,
              }))}
            />
            {targetStatus && TERMINAL_STATUS.includes(targetStatus) && (
              <Text type="warning" style={{ fontSize: 12 }}>
                「{STATUS_META[targetStatus].label}」为终态，调整后该衣物将不再进入日常穿搭推荐与组合。
              </Text>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}
