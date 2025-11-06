const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// 工具函数：获取 robots.txt 和 sitemap.xml 状态
const fetchTextFile = async (url, file) => {
  try {
    const res = await fetch(url + '/' + file, { method: 'GET' });
    if (res.status === 200) return '通过';
    return '缺失';
  } catch {
    return '缺失';
  }
};

// 工具函数：根据 status/message 返回建议
function getSuggestion(module, status, message) {
  if (status === 'pass') return '';
  if (module === 'basic') {
    if (message.includes('缺失')) return '请完善站点标题、描述、关键词、favicon、robots.txt、sitemap.xml等基础信息。';
    return '请检查基础信息配置。';
  }
  return '请参考优化建议。';
}

router.post('/basic-info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const data = await page.evaluate(() => {
      const getMeta = (name) => {
        const el = document.querySelector(`meta[name='${name}']`);
        return el ? el.getAttribute('content') : '';
      };
      const faviconEl = document.querySelector("link[rel~='icon']");
      return {
        title: document.title || '',
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        favicon: faviconEl ? faviconEl.href : '',
      };
    });
    // 检查 robots.txt 和 sitemap.xml
    const robots = await fetchTextFile(url, 'robots.txt');
    const sitemap = await fetchTextFile(url, 'sitemap.xml');
    // 评分逻辑
    let score = 100;
    let status = 'pass', message = '基础信息齐全。';
    let suggestion = '';
    if (!data.title || !data.description || !data.keywords || !data.favicon || robots === '缺失' || sitemap === '缺失') {
      score = 60;
      status = 'error';
      message = '部分基础信息缺失。';
      suggestion = getSuggestion('basic', status, message);
    }
    res.json({ ...data, robots, sitemap, score, status, message, suggestion });
  } catch (e) {
    res.status(500).json({ error: '抓取失败', detail: e.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router; 