import { Collapse, Tag, Alert, Button } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import Loading from './Loading';
import Empty from './Empty';
import ErrorDrawer from './ErrorDrawer';
// 可访问性与内容质量
export interface AccessibilityType {
  custom404: { status: string; message: string };
  deadLinks: { status: string; dead: number; total: number; message: string; deadLinkList?: string[] };
  readability: { status: string; score: number; message: string };
}

const statusTag = (status: string) =>
  status === 'pass' ? <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">通过</Tag> :
  status === 'warning' ? <Tag icon={<ExclamationCircleTwoTone twoToneColor="#faad14" />} color="warning">警告</Tag> :
  <Tag icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} color="error">错误</Tag>;

const AccessibilityResult = ({ data, error, loading }: { data?: AccessibilityType, error?: string, loading?: boolean }) => {
  if (loading) return <Loading />;
  if (!data) return <Empty />;
  if (error) return <Alert type="error" showIcon message="可访问性与内容质量检测失败" description={error} style={{ marginBottom: 16 }} />;
  return (
    <Collapse
      defaultActiveKey={['custom404', 'deadLinks', 'readability']}
      ghost
      items={[
        {
          key: 'custom404',
          label: <span>{statusTag(data.custom404.status)} 404页面检测</span>,
          children: <span>{data.custom404.message}</span>
        },
        {
          key: 'deadLinks',
          label: <span>{statusTag(data.deadLinks.status)} 死链检测</span>,
          children: (
            <>
              <span>死链数: {data.deadLinks.dead} / {data.deadLinks.total}</span>
              <div style={{ marginTop: 8 }}>{data.deadLinks.message}</div>
              {Array.isArray(data.deadLinks.deadLinkList) && data.deadLinks.deadLinkList.length > 0 && (
                <ErrorDrawer
                  errors={data.deadLinks.deadLinkList.map(url => `死链: ${url}`)}
                  title="死链详情"
                  trigger={<Button type="link" size="small">查看详情（{data.deadLinks.deadLinkList.length}条）</Button>}
                />
              )}
            </>
          )
        },
        {
          key: 'readability',
          label: <span>{statusTag(data.readability.status)} 可读性分析</span>,
          children: (
            <>
              <span>可读性评分: {data.readability.score}</span>
              <div style={{ marginTop: 8 }}>{data.readability.message}</div>
            </>
          )
        }
      ]}
    />
  );
};

export default AccessibilityResult; 