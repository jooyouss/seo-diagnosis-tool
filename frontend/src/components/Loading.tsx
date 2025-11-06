import { Spin } from 'antd';

const Loading = () => (
  <Spin tip="诊断中..." size="large">
    <div style={{ minHeight: 80 }} />
  </Spin>
);

export default Loading; 