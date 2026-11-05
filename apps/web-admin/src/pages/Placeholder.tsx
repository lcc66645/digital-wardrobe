import { Card, Empty, Typography } from 'antd';

const { Title, Paragraph } = Typography;

/** 管理页占位：后续轮次逐页替换为真实数据表格/看板 */
export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <Title level={4} style={{ marginBottom: 8 }}>
        {title}
      </Title>
      <Paragraph type="secondary">{description ?? '该模块将在后续迭代对接真实接口。'}</Paragraph>
      <Empty description="功能建设中" />
    </Card>
  );
}
