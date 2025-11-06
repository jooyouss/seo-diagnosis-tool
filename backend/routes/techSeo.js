const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// 工具函数：根据 status/message 返回建议
function getSuggestion(module, status, message) {
  if (status === 'pass') return '';
  if (module === 'techSeo') {
    const suggestions = [];
    if (message.includes('viewport')) suggestions.push('添加viewport标签，提升移动端适配。');
    if (message.includes('HTTPS')) suggestions.push('建议开启HTTPS/SSL证书，提升安全性。');
    if (message.includes('结构化数据')) suggestions.push('建议添加Schema.org结构化数据，提升搜索引擎理解。');
    if (message.includes('加载')) suggestions.push('优化图片和脚本，提升页面加载速度。');
    if (suggestions.length) return suggestions.join(' ');
    return '请优化技术SEO相关项。';
  }
  return '请参考优化建议。';
}

router.post('/tech-seo', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const start = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const loadTime = ((Date.now() - start) / 1000).toFixed(2) + 's';
    const result = await page.evaluate(() => {
      // 响应式/移动端适配检测
      const viewport = document.querySelector('meta[name="viewport"]');
      let responsive = { status: 'pass', message: '已检测到viewport标签，支持移动端适配。' };
      if (!viewport) {
        responsive = { status: 'error', message: '未检测到viewport标签，移动端适配可能存在问题。' };
      }
      // 结构化数据检测
      const hasSchema = !!document.querySelector('script[type="application/ld+json"]') || !!document.querySelector('[itemscope],[itemtype]');
      let schema = { status: 'pass', message: '已检测到结构化数据。' };
      if (!hasSchema) {
        schema = { status: 'error', message: '未检测到结构化数据，建议添加Schema.org标记。' };
      }
      return { responsive, schema };
    });
    // HTTPS/SSL证书检测
    let https = { status: 'pass', message: '已启用HTTPS，证书有效。' };
    try {
      const u = new URL(url);
      if (u.protocol !== 'https:') {
        https = { status: 'error', message: '未启用HTTPS，建议开启SSL证书。' };
      }
    } catch {
      https = { status: 'error', message: 'URL格式有误。' };
    }
    // 页面加载速度
    let speed = { status: 'pass', value: loadTime, message: `页面加载速度：${loadTime}` };
    const sec = parseFloat(loadTime);
    if (sec > 3) speed = { status: 'error', value: loadTime, message: `页面加载较慢（${loadTime}），建议优化图片和脚本。` };
    else if (sec > 2) speed = { status: 'warning', value: loadTime, message: `页面加载速度一般（${loadTime}），可进一步优化。` };
    // 评分与建议
    let score = 100, status = 'pass', suggestion = ''
    if (speed.status === 'error' || https.status === 'error' || result.responsive.status === 'error' || result.schema.status === 'error') {
      score = 60; status = 'error';
      // 只拼接出错项的message
      let errorMessages = [];
      if (result.responsive.status === 'error') errorMessages.push(result.responsive.message);
      if (https.status === 'error') errorMessages.push(https.message);
      if (result.schema.status === 'error') errorMessages.push(result.schema.message);
      if (speed.status === 'error') errorMessages.push(speed.message);
      suggestion = getSuggestion('techSeo', 'error', errorMessages.join(' '));
    }
    res.json({ responsive: result.responsive, speed, https, schema: result.schema, score, status, suggestion });
  } catch (e) {
    res.status(500).json({ error: '技术SEO检测失败', detail: e.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router; 