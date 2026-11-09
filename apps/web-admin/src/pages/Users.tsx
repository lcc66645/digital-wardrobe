import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { App as AntApp, Avatar } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Gender, UserStatus } from '@dw/shared';
import {
  fetchAdminUsers,
  updateUserStatus,
  type AdminUser,
  type AdminUserQuery,
} from '@/api/admin';
import { useAuth } from '@/store/auth';
import { brand } from '@/theme/tokens';

const { Title } = Typography;

const GENDER_LABEL: Record<Gender, string> = {
  MALE: '男',
  FEMALE: '女',
  UNKNOWN: '未知',
};

function formatDate(d: string | Date): string {
  const date = new Date(d);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day}`;
}

export default function Users() {
  const { message } = AntApp.useApp();
  const { user: currentUser } = useAuth();

  const [list, setList] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>(undefined);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [actingId, setActingId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params: AdminUserQuery = { page, pageSize };
    if (statusFilter) params.status = statusFilter;
    if (keyword) params.keyword = keyword;
    fetchAdminUsers(params)
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

  const handleToggle = async (record: AdminUser) => {
    const next =
      record.status === UserStatus.BANNED ? UserStatus.ACTIVE : UserStatus.BANNED;
    setActingId(record.id);
    try {
      await updateUserStatus(record.id, next);
      message.success(next === UserStatus.BANNED ? '已封禁该用户' : '已解封该用户');
      load();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setActingId('');
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户',
      dataIndex: 'nickname',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} style={{ background: brand.pink }}>
            {record.nickname?.slice(0, 1)}
          </Avatar>
          <span>{record.nickname}</span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: (phone: string | null) => phone ?? '—',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 70,
      render: (g: Gender) => GENDER_LABEL[g] ?? '未知',
    },
    {
      title: '城市',
      dataIndex: 'city',
      render: (city: string | null) => city ?? '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: UserStatus) =>
        s === UserStatus.BANNED ? (
          <Tag color="error">已封禁</Tag>
        ) : (
          <Tag color="success">正常</Tag>
        ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 110,
      render: (d: string | Date) => formatDate(d),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => {
        const isSelf = currentUser?.id === record.id;
        const banned = record.status === UserStatus.BANNED;
        const button = (
          <Button
            type="link"
            size="small"
            danger={!banned}
            loading={actingId === record.id}
            disabled={isSelf && !banned}
          >
            {banned ? '解封' : '封禁'}
          </Button>
        );

        if (isSelf && !banned) {
          return <Tooltip title="不能封禁当前登录账号">{button}</Tooltip>;
        }
        return (
          <Popconfirm
            title={banned ? '确认解封该用户？' : '确认封禁该用户？'}
            description={
              banned ? '解封后该用户可正常登录与使用' : '封禁后该用户将无法登录，其内容仍保留'
            }
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: !banned }}
            onConfirm={() => handleToggle(record)}
          >
            {button}
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        用户管理
      </Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="账号状态"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v: UserStatus | undefined) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: UserStatus.ACTIVE, label: '正常' },
              { value: UserStatus.BANNED, label: '已封禁' },
            ]}
          />
          <Input
            allowClear
            placeholder="搜索昵称/手机号"
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
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 个用户`,
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
