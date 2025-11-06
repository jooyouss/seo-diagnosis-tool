import { Card, Table, Tag, List, Typography, Space, Tooltip, Button } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import ErrorDrawer from './ErrorDrawer';
import { useState } from 'react';

// 页面SEO要素分析
export interface SeoElementsType {
  hTags: {
    h1: number;
    h2: number;
    h3: number;
    structure: { tag: string; text: string }[];
    status: 'pass' | 'error';
    message?: string;
    errors?: string[];
  };
  imgAlt: {
    total: number;
    missingAlt: number;
    status: 'pass' | 'error';
    message?: string;
    missingAltList?: string[];
  };
  links: {
    internal: number;
    external: number;
    nofollow: number;
    status: 'pass' | 'error';
    message?: string;
    errors?: string[];
    internalLinks?: { href: string; text: string }[];
    externalLinks?: { href: string; text: string }[];
    nofollowLinks?: { href: string; text: string }[];
  };
  keywordDensity: { word: string; count: number; density: string }[];
  errors?: string[];
}

const mockSeoElements: SeoElementsType = {
  hTags: {
    h1: 1,
    h2: 3,
    h3: 5,
    structure: [
      { tag: 'h1', text: '主标题' },
      { tag: 'h2', text: '小节1' },
      { tag: 'h2', text: '小节2' },
      { tag: 'h3', text: '细分1' }
    ],
    status: 'pass',
    message: 'H1标签数量合理。',
    errors: []
  },
  imgAlt: {
    total: 10,
    missingAlt: 2,
    status: 'error',
    message: '有2张图片缺失alt属性，建议为所有图片添加alt属性。',
    missingAltList: ['image1.jpg', 'image2.jpg']
  },
  links: {
    internal: 8,
    external: 4,
    nofollow: 2,
    status: 'pass',
    message: '内外链分布合理.',
    errors: [],
    internalLinks: [
      { href: 'internal1.html', text: '内部链接1' },
      { href: 'internal2.html', text: '内部链接2' }
    ],
    externalLinks: [
      { href: 'external1.html', text: '外部链接1' },
      { href: 'external2.html', text: '外部链接2' }
    ],
    nofollowLinks: [
      { href: 'nofollow1.html', text: 'nofollow链接1' },
      { href: 'nofollow2.html', text: 'nofollow链接2' }
    ]
  },
  keywordDensity: [
    { word: 'SEO', count: 5, density: '2.1%' },
    { word: '优化', count: 3, density: '1.2%' }
  ],
  errors: []
};

const statusTag = (status: string) =>
  status === 'pass' ? <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">通过</Tag> :
  <Tag icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} color="error">错误</Tag>;

const SeoElementsResult = ({ data, onlyKeywordDensity }: { data?: SeoElementsType, onlyKeywordDensity?: boolean }) => {
  const [linkDrawer, setLinkDrawer] = useState<{type: 'internal'|'external'|'nofollow'|null, open: boolean}>({type: null, open: false});
  const [drawerType, setDrawerType] = useState<'internal'|'external'|'nofollow'|null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  if (!data) return null;
  if (onlyKeywordDensity) {
    return (
      <Card title="关键词密度" style={{ marginTop: 24 }}>
        <Table
          size="small"
          columns={[
            { title: '关键词', dataIndex: 'word', key: 'word' },
            { title: '出现次数', dataIndex: 'count', key: 'count' },
            { title: '密度', dataIndex: 'density', key: 'density' }
          ]}
          dataSource={data.keywordDensity.map((item: any, i: number) => ({ ...item, key: i }))}
          pagination={false}
          style={{ marginTop: 8 }}
        />
      </Card>
    );
  }
  // 格式化链接为字符串数组
  const internalLinkStrs = (data.links.internalLinks || []).map(link => `${link.text ? link.text + ' - ' : ''}${link.href}`);
  const externalLinkStrs = (data.links.externalLinks || []).map(link => `${link.text ? link.text + ' - ' : ''}${link.href}`);
  const nofollowLinkStrs = (data.links.nofollowLinks || []).map(link => `${link.text ? link.text + ' - ' : ''}${link.href}`);
  return (
    <Card title="页面SEO要素分析" style={{ marginTop: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 全局错误 */}
        {/* {Array.isArray(data.errors) && data.errors.length > 0 && (
          <ErrorDrawer
            errors={data.errors}
            title="全局SEO错误详情"
            trigger={<Button type="link" size="small">查看详情（{data.errors.length}条）</Button>}
          />
        )} */}
        <div>
          <b>H标签结构：</b> {statusTag(data.hTags.status)}
          {Array.isArray(data.hTags.errors) && data.hTags.errors.length > 0 && (
            <ErrorDrawer
              errors={data.hTags.errors}
              title="H标签结构详情"
              trigger={<Button type="link" size="small">查看详情（{data.hTags.errors.length}条）</Button>}
            />
          )}
          <List
            size="small"
            dataSource={data.hTags.structure}
            renderItem={item => (
              <List.Item>
                <Tag color="blue">{item.tag}</Tag> <Typography.Text>{item.text}</Typography.Text>
              </List.Item>
            )}
          />
        </div>
        <div>
          <b>图片alt属性：</b> {statusTag(data.imgAlt.status)}
          {Array.isArray(data.imgAlt.missingAltList) && data.imgAlt.missingAltList.length > 0 && (
            <ErrorDrawer
              errors={data.imgAlt.missingAltList.map(src => `缺失alt图片：${src}`)}
              title="缺失alt图片详情"
              trigger={<Button type="link" size="small">查看详情（{data.imgAlt.missingAltList.length}条）</Button>}
            />
          )}
          <span style={{ marginLeft: 8 }}>
            缺失alt: {data.imgAlt.missingAlt} / {data.imgAlt.total}
          </span>
        </div>
        <div>
          <b>链接统计：</b> {statusTag(data.links.status)}
          {Array.isArray(data.links.errors) && data.links.errors.length > 0 && (
            <ErrorDrawer
              errors={data.links.errors}
              title="链接错误详情"
              trigger={<Button type="link" size="small">查看详情（{data.links.errors.length}条）</Button>}
            />
          )}
          <Tag color="blue">
            内链: {data.links.internal}
            {internalLinkStrs.length > 0 && (
              <ErrorDrawer
                errors={internalLinkStrs}
                title="内链详情"
                trigger={
                  <Button type="link" size="small" style={{ padding: 0, marginLeft: 4 }}>
                    查看详情（{internalLinkStrs.length}条）
                  </Button>
                }
              />
            )}
          </Tag>
          <Tag color="geekblue">
            外链: {data.links.external}
            {externalLinkStrs.length > 0 && (
              <ErrorDrawer
                errors={externalLinkStrs}
                title="外链详情"
                trigger={
                  <Button type="link" size="small" style={{ padding: 0, marginLeft: 4 }}>
                    查看详情（{externalLinkStrs.length}条）
                  </Button>
                }
              />
            )}
          </Tag>
          <Tag color={data.links.nofollow > 0 ? 'warning' : 'success'}>
            nofollow: {data.links.nofollow}
            {nofollowLinkStrs.length > 0 && (
              <ErrorDrawer
                errors={nofollowLinkStrs}
                title="nofollow链接详情"
                trigger={
                  <Button type="link" size="small" style={{ padding: 0, marginLeft: 4 }}>
                    查看详情（{nofollowLinkStrs.length}条）
                  </Button>
                }
              />
            )}
          </Tag>
        </div>
        <div>
          <b>关键词密度：</b>
          <Table
            size="small"
            columns={[
              { title: '关键词', dataIndex: 'word', key: 'word' },
              { title: '出现次数', dataIndex: 'count', key: 'count' },
              { title: '密度', dataIndex: 'density', key: 'density' }
            ]}
            dataSource={data.keywordDensity.map((item: any, i: number) => ({ ...item, key: i }))}
            pagination={false}
            style={{ marginTop: 8 }}
          />
        </div>
      </Space>
    </Card>
  );
};

export default SeoElementsResult; 