import {
  App as AntApp,
  Button,
  Card,
  Input,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { DeviceOnlineStatus } from '@dw/shared';
import {
  fetchAdminDevices,
  unbindDevice,
  type AdminDevice,
  type AdminDeviceQuery,
} from '@/api/admin';
import { brand } from '@/theme/tokens';

const { Title, Text } = Typography;

const ONLINE_META: Record<DeviceOnlineStatus, { label: string; color: string }> = {
  ONLINE: { label: '在线', color: 'success' },
  OFFLINE: { label: '离线', color: 'default' },
};

function formatDate(d: string | Date | null): string {
  if (!d) return '—';
  const date = new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day} ${h}:${min}`;
}

/** 电量条颜色：低电量红、中等橙、充足绿 */
function batteryColor(battery: number): string {
  if (battery < 20) return brand.danger;
  if (battery < 50) return '#F5A623';
  return '#7BD389';
}

export default function DevicesPage() {
  const { message } = AntApp.useApp();

  const [list, setList] = useState<AdminDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<DeviceOnlineStatus | undefined>(undefined);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params: AdminDeviceQuery = { page, pageSize };
    if (statusFilter) params.onlineStatus = statusFilter;
    if (keyword) params.keyword = keyword;
    fetchAdminDevices(params)
      .then((res) => {
        setList(res.list);
        setTotal(res.total);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter, keyword, message]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnbind = async (id: string) => {
    try {
      await unbindDevice(id);
      message.success('已强制解绑设备');
      load();
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const columns: ColumnsType<AdminDevice> = [
    {
      title: '设备 SN',
      dataIndex: 'sn',
      width: 170,
      render: (sn: string) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sn}</Text>
      ),
    },
    {
      title: '绑定用户',
      key: 'owner',
      render: (_, record) =>
        record.userId ? (
          <Space direction="vertical" size={0}>
            <Text>{record.ownerName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.ownerPhone ?? '—'}
            </Text>
          </Space>
        ) : (
          <Tag color="default">未绑定</Tag>
        ),
    },
    {
      title: '固件版本',
      dataIndex: 'firmwareVersion',
      width: 120,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: '电量',
      dataIndex: 'battery',
      width: 150,
      render: (b: number | null) =>
        b === null ? (
          '—'
        ) : (
          <Progress
            percent={b}
            size="small"
            strokeColor={batteryColor(b)}
            format={(p) => `${p}%`}
          />
        ),
    },
    {
      title: '在线状态',
      dataIndex: 'onlineStatus',
      width: 90,
      render: (s: DeviceOnlineStatus) => (
        <Tag color={ONLINE_META[s].color}>{ONLINE_META[s].label}</Tag>
      ),
    },
    {
      title: '最后在线',
      dataIndex: 'lastOnlineAt',
      width: 150,
      render: (d: string | Date | null) => formatDate(d),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确认强制解绑该设备？"
          description="解绑后用户需重新配对，设备记录保留"
          disabled={!record.userId}
          onConfirm={() => handleUnbind(record.id)}
        >
          <Button type="link" size="small" danger disabled={!record.userId}>
            强制解绑
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        硬件设备
      </Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="在线状态"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v: DeviceOnlineStatus | undefined) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={Object.values(DeviceOnlineStatus).map((s) => ({
              value: s,
              label: ONLINE_META[s].label,
            }))}
          />
          <Input
            allowClear
            placeholder="搜索 SN / 固件版本"
            style={{ width: 220 }}
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
          scroll={{ x: 1050 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 台设备`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
}
