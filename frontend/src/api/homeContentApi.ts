// 首页内容API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * 获取首页内容
 */
export async function fetchHomeContent() {
  const res = await fetch(`${BASE_URL}/home-content`);
  if (!res.ok) throw new Error('首页内容获取失败');
  return res.json();
} 