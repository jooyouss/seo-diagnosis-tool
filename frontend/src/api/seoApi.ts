// SEO 相关 API 封装
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export type ApiModuleKey = 'basic-info' | 'seo-elements' | 'tech-seo' | 'accessibility' | 'report';

const apiMap: Record<ApiModuleKey, string> = {
  'basic-info': '/basic-info',
  'seo-elements': '/seo-elements',
  'tech-seo': '/tech-seo',
  'accessibility': '/accessibility',
  'report': '/report',
};

/**
 * 请求单个SEO模块
 * @param module 模块名
 * @param url 目标网址
 */
export async function fetchSeoModule(module: ApiModuleKey, url: string) {
  const res = await fetch(`${BASE_URL}${apiMap[module]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    let errMsg = '接口请求失败';
    try {
      const err = await res.json();
      errMsg = err.detail || err.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return res.json();
}

/**
 * 并发请求所有SEO模块，返回聚合结果
 * @param url 目标网址
 * @returns { basic, seoElements, techSeo, accessibility, report }
 */
export async function fetchAllSeoModules(url: string) {
  const modules: ApiModuleKey[] = [
    'basic-info',
    'seo-elements',
    'tech-seo',
    'accessibility',
    'report',
  ];
  const results: Record<string, any> = {};
  const mapping: Record<ApiModuleKey, string> = {
    'basic-info': 'basic',
    'seo-elements': 'seoElements',
    'tech-seo': 'techSeo',
    'accessibility': 'accessibility',
    'report': 'report',
  };
  await Promise.all(
    modules.map(async (key) => {
      results[mapping[key]] = await fetchSeoModule(key, url);
    })
  );
  return results;
}

// 如需扩展更多SEO相关API，请在此处继续封装并导出