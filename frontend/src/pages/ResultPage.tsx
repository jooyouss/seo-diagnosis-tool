import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, message, Alert } from 'antd';
import SeoResult, { SeoResultType } from '../components/SeoResult';
import SeoElementsResult, { SeoElementsType } from '../components/SeoElementsResult';
import TechSeoResult from '../components/TechSeoResult';
import AccessibilityResult from '../components/AccessibilityResult';
import Loading from '../components/Loading';
import Empty from '../components/Empty';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useDiagnose } from '../context/DiagnoseContext';
import { fetchSeoModule } from '../api/seoApi';
import ReactECharts from 'echarts-for-react';

const { Sider, Content } = Layout;

const MODULES = [
  { key: 'basic', label: '基础信息' },
  { key: 'seoElements', label: '页面SEO要素分析' },
  { key: 'techSeo', label: '技术SEO检测' },
  { key: 'accessibility', label: '可访问性与内容质量' }
];

const ResultPage = () => {
  const { module = 'basic' } = useParams();
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url') || '';
  const navigate = useNavigate();
  const { result, setResult } = useDiagnose();

  // 各模块数据
  const [loading, setLoading] = useState(false);
  const [basicInfoError, setBasicInfoError] = useState<string | null>(null);
  const [seoElementsError, setSeoElementsError] = useState<string | null>(null);
  const [techSeoError, setTechSeoError] = useState<string | null>(null);
  const [accessibilityError, setAccessibilityError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // 结果数据
  const [data, setData] = useState<any>({});

  // 判断所有模块数据都存在才直接渲染 context
  const allModulesReady = result
    && result.url === url
    && result.basic
    && result.seoElements
    && result.techSeo
    && result.accessibility
    && result.report;

  useEffect(() => {
    if (allModulesReady) {
      setData(result);
      setBasicInfoError(null);
      setSeoElementsError(null);
      setTechSeoError(null);
      setAccessibilityError(null);
      setReportError(null);
      setLoading(false);
      sessionStorage.removeItem('diagnose_in_progress');
      return;
    }
    if (sessionStorage.getItem('diagnose_in_progress') === '1') {
      return;
    }
    if (!url) return;
    setLoading(true);
    setBasicInfoError(null);
    setSeoElementsError(null);
    setTechSeoError(null);
    setAccessibilityError(null);
    setReportError(null);
    Promise.all([
      fetchSeoModule('basic-info', url),
      fetchSeoModule('seo-elements', url),
      fetchSeoModule('tech-seo', url),
      fetchSeoModule('accessibility', url),
      fetchSeoModule('report', url),
    ]).then(([basic, seoElements, techSeo, accessibility, report]) => {
      const newData = { url, basic, seoElements, techSeo, accessibility, report };
      setData(newData);
      setResult(newData);
    }).catch(e => {
      message.error(e.message || '诊断失败，请重试');
    }).finally(() => {
      setLoading(false);
    });
  }, [url, result]);

  // 侧边栏切换
  const handleMenuClick = (e: any) => {
    navigate(`/result/${e.key}?url=${encodeURIComponent(url)}`);
  };

  // 导出报告
  const handleExport = async () => {
    const content = document.getElementById('report-content');
    if (!content) return;
    const canvas = await html2canvas(content, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = canvas.width / canvas.height > pageWidth / pageHeight
      ? { width: pageWidth - 20, height: (pageWidth - 20) * canvas.height / canvas.width }
      : { width: (pageHeight - 20) * canvas.width / canvas.height, height: pageHeight - 20 };
    pdf.text('SEO诊断报告', pageWidth / 2, 16, { align: 'center' });
    pdf.addImage(imgData, 'PNG', (pageWidth - imgProps.width) / 2, 24, imgProps.width, imgProps.height);
    pdf.save(`SEO报告_${url || '未命名'}.pdf`);
  };

  // 雷达图配置
  const radarOption = data.report && data.report.modules ? {
    tooltip: {},
    radar: {
      indicator: [
        { name: '基础信息', max: 100 },
        { name: 'SEO要素', max: 100 },
        { name: '技术SEO', max: 100 },
        { name: '可访问性', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [
            data.report.modules.basic?.score || 0,
            data.report.modules.seoElements?.score || 0,
            data.report.modules.techSeo?.score || 0,
            data.report.modules.accessibility?.score || 0
          ],
          name: '得分'
        }
      ]
    }]
  } : undefined;

  // 顶部报告
  const renderReportOverview = () => {
    if (loading) return null;
    if (reportError) return <Alert type="error" showIcon message="报告生成失败" description={reportError} style={{ marginBottom: 16 }} />;
    if (!data.report) return null;
    const scoreColor = (score: number) => score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f';
    const statusTag = (status: string) =>
      status === 'pass' ? <span style={{ color: '#52c41a' }}>通过</span> :
      status === 'warning' ? <span style={{ color: '#faad14' }}>警告</span> :
      <span style={{ color: '#ff4d4f' }}>错误</span>;
    return (
      <div style={{ marginBottom: 24, background: '#fafafa', padding: 16, borderRadius: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>SEO总分：<span style={{ color: scoreColor(data.report.totalScore), fontSize: 24 }}>{data.report.totalScore}</span>/100</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {data.report.modules && Object.entries(data.report.modules).map(([key, mod]: any) => (
            <div key={key} style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{MODULES.find(m => m.key === key)?.label || key}</div>
              <div>{statusTag(mod.status)} <span style={{ color: scoreColor(mod.score), fontWeight: 600 }}>{mod.score}</span>/100</div>
              {Array.isArray(mod.suggestions) && mod.suggestions.length > 0
                ? mod.suggestions.map((s, i) => (
                    <div key={i} style={{ marginTop: 4, color: '#faad14', fontSize: 13 }}>
                      <InfoCircleOutlined /> {s}
                    </div>
                  ))
                : mod.suggestion && (
                    <div style={{ marginTop: 4, color: '#faad14', fontSize: 13 }}>
                      <InfoCircleOutlined /> {mod.suggestion}
                    </div>
                  )
              }
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '80vh', background: 'transparent' }}>
      <Sider width={200} style={{ background: '#fff', borderRadius: 8, marginRight: 24, boxShadow: '0 2px 8px #f0f1f2' }}>
        <Menu
          mode="inline"
          selectedKeys={[module]}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
          items={MODULES.map(m => ({ key: m.key, label: m.label }))}
        />
        <Button type="link" style={{ margin: 16, marginTop: 32 }} onClick={() => navigate('/')}>返回首页</Button>
      </Sider>
      <Content style={{ background: '#fff', borderRadius: 8, padding: 32, minHeight: 400, boxShadow: '0 2px 8px #f0f1f2', position: 'relative' }}>
        {/* 雷达图展示 */}
        {radarOption && <ReactECharts option={radarOption} style={{ height: 300, width: '100%', marginBottom: 24 }} />}
        <Button type="primary" style={{ position: 'absolute', right: 32, top: 32, zIndex: 10 }} onClick={handleExport}>导出报告</Button>
        <div id="report-content">
          {renderReportOverview()}
          {module === 'basic' ? (
            loading ? <Loading /> : basicInfoError ? <Alert type="error" showIcon message="基础信息抓取失败" description={basicInfoError} style={{ marginBottom: 16 }} /> : data.basic ? <SeoResult result={data.basic} /> : <Empty />
          ) : module === 'seoElements' ? (
            loading ? <Loading /> : seoElementsError ? <Alert type="error" showIcon message="SEO要素分析失败" description={seoElementsError} style={{ marginBottom: 16 }} /> : data.seoElements ? <SeoElementsResult data={data.seoElements} /> : <Empty />
          ) : module === 'techSeo' ? (
            <TechSeoResult loading={loading} data={data.techSeo} error={techSeoError || undefined} />
          ) : (
            <AccessibilityResult loading={loading} data={data.accessibility} error={accessibilityError || undefined} />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ResultPage;