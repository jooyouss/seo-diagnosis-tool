import { Empty as AntdEmpty } from 'antd';

const Empty = () => (
  <div style={{ textAlign: 'center', marginTop: 48 }}>
    <AntdEmpty description="请先输入网址进行SEO检测" />
  </div>
);

export default Empty; 