import { Drawer, List, Button, Input, message, Tooltip, Space, Checkbox, Pagination } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
    return true;
  } catch {
    message.error('复制失败');
    return false;
  }
};

const exportText = (lines: string[], filename = 'errors.txt') => {
  try {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
    return true;
  } catch {
    message.error('导出失败');
    return false;
  }
};

const ErrorDrawer = ({ errors, title = '详情', trigger }: { errors: string[], title?: string, trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  // 分页相关 state
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = useMemo(() => search
    ? errors.filter(e => e.toLowerCase().includes(search.toLowerCase()))
    : errors, [errors, search]);
  // 分页数据
  const total = filtered.length;
  const startIdx = (current - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageData = filtered.slice(startIdx, endIdx);
  // 多选状态：存储当前页筛选下的选中索引
  const [selected, setSelected] = useState<number[]>([]);

  // 全选/取消全选（当前页）
  const allChecked = pageData.length > 0 && selected.length === pageData.length;
  const indeterminate = selected.length > 0 && selected.length < pageData.length;
  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? pageData.map((_, i) => i) : []);
  };
  // 单项选择（当前页）
  const handleSelect = (idx: number, checked: boolean) => {
    setSelected(prev => checked ? [...prev, idx] : prev.filter(i => i !== idx));
  };
  // 选中内容（当前页）
  const selectedItems = selected.map(i => pageData[i]);

  // 批量复制
  const handleBatchCopy = async () => {
    if (selectedItems.length === 0) return;
    await copyText(selectedItems.join('\n'));
  };
  // 批量导出
  const handleBatchExport = () => {
    if (selectedItems.length === 0) return;
    exportText(selectedItems);
  };

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>{trigger}</span>
      <Drawer
        open={open}
        title={title}
        width={480}
        onClose={() => setOpen(false)}
        destroyOnClose
        extra={
          <Space>
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={e => handleSelectAll(e.target.checked)}
              disabled={pageData.length === 0}
            >全选</Checkbox>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={handleBatchCopy}
              disabled={selected.length === 0}
            >批量复制</Button>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={handleBatchExport}
              disabled={selected.length === 0}
            >批量导出</Button>
          </Space>
        }
      >
        <Input.Search
          placeholder="搜索"
          allowClear
          style={{ marginBottom: 12 }}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrent(1);
            setSelected([]);
          }}
        />
        <List
          size="small"
          dataSource={pageData}
          renderItem={(item, idx) => (
            <List.Item
              actions={[
                <Tooltip title="复制此条" key="copy">
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => copyText(item)}
                  />
                </Tooltip>
              ]}
            >
              <Checkbox
                checked={selected.includes(idx)}
                onChange={e => handleSelect(idx, e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <span style={{ wordBreak: 'break-all' }}>{startIdx + idx + 1}. {item}</span>
            </List.Item>
          )}
          style={{ overflowY: 'auto' }}
        />
        {total > pageSize && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={['5', '10', '20', '50']}
              onChange={(page, size) => {
                setCurrent(page);
                setPageSize(size || 10);
                setSelected([]); // 翻页清空多选
              }}
              showTotal={t => `共 ${t} 条`}
            />
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ErrorDrawer;
