import { Collapse, Tag, Alert } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import Loading from './Loading';
import Empty from './Empty';

const { Panel } = Collapse;
// 技术SEO检测
export interface TechSeoType {
  responsive: { status: string; message: string };
  speed: { status: string; message: string };
  https: { status: string; message: string };
  schema: { status: string; message: string };
}

const statusTag = (status: string) =>
  status === 'pass' ? <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">通过</Tag> :
  status === 'warning' ? <Tag icon={<ExclamationCircleTwoTone twoToneColor="#faad14" />} color="warning">警告</Tag> :
  <Tag icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} color="error">错误</Tag>;

const TechSeoResult = ({ data, error, loading }: { data?: TechSeoType, error?: string, loading?: boolean }) => {
  if (loading) return <Loading />;
  if (!data) return <Empty />;
  if (error) return <Alert type="error" showIcon message="技术SEO检测失败" description={error} style={{ marginBottom: 16 }} />;
  return (
    <Collapse
      defaultActiveKey={['responsive', 'speed', 'https', 'schema']}
      ghost
      items={[
        {
          key: 'responsive',
          label: <span>{statusTag(data.responsive.status)} 响应式/移动端适配</span>,
          children: <span>{data.responsive.message}</span>
        },
        {
          key: 'speed',
          label: <span>{statusTag(data.speed.status)} 页面加载速度</span>,
          children: <span>{data.speed.message}</span>
        },
        {
          key: 'https',
          label: <span>{statusTag(data.https.status)} HTTPS/SSL证书</span>,
          children: <span>{data.https.message}</span>
        },
        {
          key: 'schema',
          label: <span>{statusTag(data.schema.status)} 结构化数据（Schema.org）</span>,
          children: <span>{data.schema.message}</span>
        }
      ]}
    />
  );
};

export default TechSeoResult; 