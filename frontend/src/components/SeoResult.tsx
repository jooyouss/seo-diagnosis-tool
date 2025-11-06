import { Card, Descriptions, Tag } from 'antd';

export interface SeoResultType {
  title: string;
  description: string;
  keywords: string;
  favicon: string;
  robots: string;
  sitemap: string;
}

const statusColor = (status: string) => {
  if (status === '存在' || status === '通过') return 'success';
  if (status === '警告') return 'warning';
  return 'error';
};
//基础信息
const SeoResult = ({ result }: { result: SeoResultType }) => {
  return (
    <Card title="检测结果" style={{ marginTop: 16 }}>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="标题">
          {result.title || <Tag color="error">缺失</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="描述">
          {result.description || <Tag color="error">缺失</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="关键词">
          {result.keywords || <Tag color="error">缺失</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Favicon">
          {result.favicon ? <img src={result.favicon} alt="favicon" style={{ width: 24, verticalAlign: 'middle' }} /> : <Tag color="error">缺失</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="robots.txt">
          <Tag color={statusColor(result.robots)}>{result.robots}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="sitemap.xml">
          <Tag color={statusColor(result.sitemap)}>{result.sitemap}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default SeoResult; 