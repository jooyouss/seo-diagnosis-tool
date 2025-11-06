import { useState, useEffect, useRef } from 'react';
import { message, Steps, Progress, Alert, Typography, Tag, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import UrlInput from '../components/UrlInput';
import { useDiagnose } from '../context/DiagnoseContext';
import { fetchSeoModule } from '../api/seoApi';
import { fetchHomeContent } from '../api/homeContentApi';
import './HomePage.css';
import logo from '../assets/logo.png';
const { Text } = Typography;

const HISTORY_KEY = 'seo_history';
const EXAMPLES = [
  'https://www.example.com',
  'https://www.wikipedia.org'
];
const MODULES: { key: keyof DiagnoseState; label: string; api: string }[] = [
  { key: 'basic', label: '基础信息', api: 'basic-info' },
  { key: 'seoElements', label: '页面SEO要素分析', api: 'seo-elements' },
  { key: 'techSeo', label: '技术SEO检测', api: 'tech-seo' },
  { key: 'accessibility', label: '可访问性与内容质量', api: 'accessibility' },
];

type ModuleStatus = 'pending' | 'loading' | 'success' | 'error';
interface DiagnoseState {
  basic: ModuleStatus;
  seoElements: ModuleStatus;
  techSeo: ModuleStatus;
  accessibility: ModuleStatus;
  report: ModuleStatus;
}

const HomePage = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [diagnoseState, setDiagnoseState] = useState<DiagnoseState>({
    basic: 'pending',
    seoElements: 'pending',
    techSeo: 'pending',
    accessibility: 'pending',
    report: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [autoFocus, setAutoFocus] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const navigate = useNavigate();
  const { setResult } = useDiagnose();
  const inputRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) setHistory(JSON.parse(saved));
    fetchHomeContent().then(data => {
      // 可用于后续内容扩展
    });
  }, []);

  const mainSuccess = MODULES.every(m => diagnoseState[m.key as keyof DiagnoseState] === 'success');
  const finishedCount = MODULES.filter(m => diagnoseState[m.key as keyof DiagnoseState] === 'success').length;
  const totalCount = MODULES.length;

  useEffect(() => {
    if (diagnoseState.report === 'success' && inputUrl) {
      setTimeout(() => {
        sessionStorage.setItem('diagnose_in_progress', '1');
        navigate(`/result/basic?url=${encodeURIComponent(inputUrl)}`);
      }, 1000);
    }
  }, [diagnoseState.report, inputUrl, navigate]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleDiagnose = async (url: string) => {
    if (!url) {
      message.warning('请输入网址');
      return;
    }
    setInputUrl(url);
    setAutoFocus(false);
    const newHistory = [url, ...history.filter(h => h !== url)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setDiagnoseState({
      basic: 'loading',
      seoElements: 'pending',
      techSeo: 'pending',
      accessibility: 'pending',
      report: 'pending'
    });
    setLoading(true);
    setReportLoading(false);
    const results: any = { url };
    let hasError = false;
    for (let i = 0; i < MODULES.length; i++) {
      const { key, api } = MODULES[i];
      setDiagnoseState(prev => ({
        ...prev,
        [key]: 'loading',
        ...(i > 0 ? { [MODULES[i - 1].key]: prev[MODULES[i - 1].key] === 'loading' ? 'success' : prev[MODULES[i - 1].key] } : {})
      }));
      try {
        results[key] = await fetchSeoModule(api as any, url);
        setDiagnoseState(prev => ({ ...prev, [key]: 'success' }));
      } catch (e) {
        setDiagnoseState(prev => ({ ...prev, [key]: 'error' }));
        hasError = true;
      }
    }
    setLoading(false);
    if (!hasError) {
      setReportLoading(true);
      setDiagnoseState(prev => ({ ...prev, report: 'loading' }));
      try {
        results.report = await fetchSeoModule('report', url);
        setDiagnoseState(prev => ({ ...prev, report: 'success' }));
        setResult(results);
      } catch {
        setDiagnoseState(prev => ({ ...prev, report: 'error' }));
        message.error('报告生成失败');
      }
      setReportLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && !reportLoading) {
      handleDiagnose(inputUrl);
    }
  };

  return (
    <div className="homepage-bg">
      <header className="homepage-header">
        <img src={logo} alt="Logo" className="homepage-logo" />
        <h1>SEO 诊断工具</h1>
        <p className="homepage-desc">测试看一下</p>
        <p className="homepage-desc">一键检测网站SEO健康状况，获取专业优化建议，助力内容创作者和运营者提升网站表现。</p>
      </header>
      <main className="homepage-main">
        <section className="homepage-input-block">
          <div className="example-list">
            <Text type="secondary">示例：</Text>
            {EXAMPLES.map((ex) => (
              <Tag key={ex} color="blue" style={{ cursor: 'pointer', marginRight: 8 }} onClick={() => { setInputUrl(ex); setAutoFocus(true); }}>{ex}</Tag>
            ))}
          </div>
          <UrlInput
            value={inputUrl}
            onChange={setInputUrl}
            onDiagnose={handleDiagnose}
            loading={loading || reportLoading}
            history={history}
            disabled={loading || reportLoading}
            autoFocus={autoFocus}
            onKeyDown={handleInputKeyDown}
            onDeleteHistory={(url) => {
              const newHistory = history.filter(h => h !== url);
              setHistory(newHistory);
              localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            }}
          />
        </section>
        <section className="homepage-progress-block">
          <div className="progress-bar">
            <span className="progress-percent">{Math.round((finishedCount / totalCount) * 100)}%</span>
            <Progress
              percent={Math.round((finishedCount / totalCount) * 100)}
              showInfo={false}
              status={loading ? 'active' : mainSuccess ? 'success' : 'normal'}
              strokeColor={{
                '0%': '#1677ff',
                '100%': mainSuccess ? '#52c41a' : '#faad14'
              }}
              trailColor="#e6f4ff"
              style={{ marginBottom: 8, borderRadius: 8, height: 14 }}
            />
          </div>
          <Steps direction="vertical" size="small" className="steps-list">
            {MODULES.map(m => (
              <Steps.Step
                key={m.key}
                title={m.label}
                status={
                  diagnoseState[m.key as keyof DiagnoseState] === 'pending' ? 'wait' :
                  diagnoseState[m.key as keyof DiagnoseState] === 'loading' ? 'process' :
                  diagnoseState[m.key as keyof DiagnoseState] === 'success' ? 'finish' : 'error'
                }
                description={
                  diagnoseState[m.key as keyof DiagnoseState] === 'loading' ? '正在分析...' :
                  diagnoseState[m.key as keyof DiagnoseState] === 'success' ? '分析成功' :
                  diagnoseState[m.key as keyof DiagnoseState] === 'error' ? '分析失败' : ''
                }
              />
            ))}
          </Steps>
        </section>

        <section className="homepage-alert-block">
          {mainSuccess && reportLoading && (
            <div className="alert-loading">
              <Spin><div style={{ minHeight: 24 }} /></Spin> <span style={{ marginLeft: 8,color:"#1677ff" }}>正在生成报告...</span>
            </div>
          )}
          {diagnoseState.report === 'success' && (
            <Alert
              type="success"
              showIcon
              message="诊断完成，正在跳转到结果页..."
              style={{ marginTop: 0 }}
            />
          )}
          {Object.values(diagnoseState).some(s => s === 'error') && !loading && !reportLoading && (
            <Alert
              type="error"
              showIcon
              message="部分模块分析失败，可重试或检查网址有效性。"
              style={{ marginTop: 0 }}
            />
          )}
        </section>
      </main>
      <footer className="homepage-footer">
        <p>© 2025 Your Brand. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;