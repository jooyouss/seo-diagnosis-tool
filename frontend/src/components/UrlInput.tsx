import { useState } from 'react';
import { Input, Button, Space, List, Drawer, message } from 'antd';
import { LinkOutlined, ClockCircleOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
// 诊断页
interface UrlInputProps {
  value: string;
  onChange: (v: string) => void;
  onDiagnose: (url: string) => void;
  loading: boolean;
  history: string[];
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onDeleteHistory?: (url: string) => void;
}

const UrlInput = ({ value, onChange, onDiagnose, loading, history, disabled, autoFocus, onKeyDown, onDeleteHistory }: UrlInputProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDiagnose = () => {
    onDiagnose(value.trim());
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          size="large"
          prefix={<LinkOutlined />}
          placeholder="请输入要诊断的网址，如 https://example.com"
          value={value}
          onChange={e => onChange(e.target.value)}
          onPressEnter={handleDiagnose}
          disabled={loading || disabled}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
        />
        <Button type="primary" size="large" block onClick={handleDiagnose} loading={loading} disabled={loading || disabled}>
          开始诊断
        </Button>
        {history.length > 0 && (
          <>
            <List
              size="small"
              header={<span><ClockCircleOutlined /> 最近诊断</span>}
              bordered
              dataSource={history.slice(0, 3)}
              style={{ marginTop: 8, borderRadius: 6, maxHeight: 180, overflowY: 'auto' }}
              renderItem={item => (
                <List.Item
                  style={{ cursor: loading || disabled ? 'not-allowed' : 'pointer', color: loading || disabled ? '#ccc' : undefined }}
                  onClick={() => {
                    if (loading || disabled) return;
                    onChange(item);
                  }}
                >
                  {item}
                </List.Item>
              )}
            />
            {history.length > 3 && (
              <Button type="link" icon={<UnorderedListOutlined />} style={{ paddingLeft: 0 }} onClick={() => setDrawerOpen(true)}>
                查看全部历史
              </Button>
            )}
            <Drawer
              title="全部历史记录"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              width={420}
            >
              <List
                size="small"
                dataSource={history}
                style={{ maxHeight: 400, overflowY: 'auto' }}
                renderItem={item => (
                  <List.Item
                    actions={onDeleteHistory ? [
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteHistory(item);
                        }}
                      />
                    ] : []}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { onChange(item); setDrawerOpen(false); }}
                  >
                    {item}
                  </List.Item>
                )}
              />
            </Drawer>
          </>
        )}
      </Space>
    </div>
  );
};

export default UrlInput; 