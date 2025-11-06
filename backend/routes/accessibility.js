const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// 工具函数：根据 status/message 返回建议
function getSuggestion(module, status, message) {
  if (status === 'pass') return '';
  if (module === 'accessibility') {
    if (message.includes('404')) return '配置友好的自定义404页面，提升用户体验。';
    if (message.includes('死链')) return '及时修复死链，避免用户访问无效页面。';
    if (message.includes('可读性')) return '优化段落和句子结构，提升页面可读性。';
    return '请优化可访问性与内容质量。';
  }
  return '请参考优化建议。';
}

router.post('/accessibility', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    // 1. 检查自定义404页面
    let custom404 = { status: 'pass', message: '已检测到自定义404页面。' };
    try {
      const notFoundUrl = url.replace(/\/$/, '') + '/this-page-should-not-exist-404-check';
      const resp = await page.goto(notFoundUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = resp.status();
      const text = await page.content();
      if (status === 404 || /404|not found|页面不存在|未找到/i.test(text)) {
        custom404 = { status: 'pass', message: '已检测到自定义404页面。' };
      } else {
        custom404 = { status: 'error', message: '未检测到自定义404页面，建议配置友好的404提示。' };
      }
    } catch {
      custom404 = { status: 'error', message: '404页面检测失败。' };
    }
    // 2. 死链检测
    const links = await page.$$eval('a', as => as.map(a => a.href).filter(href => href.startsWith('http')));
    let dead = 0;
    const deadLinkList = [];
    for (let i = 0; i < Math.min(links.length, 20); i++) { // 最多检测20个链接
      try {
        const res = await page.goto(links[i], { waitUntil: 'domcontentloaded', timeout: 8000 });
        if (res.status() === 404) {
          dead++;
          deadLinkList.push(links[i]);
        }
      } catch {
        dead++;
        deadLinkList.push(links[i]);
      }
    }
    const deadLinks = {
      status: dead === 0 ? 'pass' : 'warning',
      total: links.length,
      dead,
      message: dead === 0 ? '未发现死链。' : `发现${dead}个死链，建议修复。`,
      deadLinkList
    };
    // 3. 可读性分析（简单实现）
    const readability = await page.evaluate(() => {
      const text = document.body.innerText.replace(/\s+/g, ' ');
      const sentences = text.split(/[。！？.!?]/).filter(Boolean);
      const words = text.split(/\b[\u4e00-\u9fa5\w]{2,}\b/g).filter(Boolean);
      const paragraphs = text.split(/\n+/).filter(Boolean);
      const avgSentenceLen = sentences.length ? (text.length / sentences.length).toFixed(1) : 0;
      let score = 100;
      if (avgSentenceLen > 40) score -= 20;
      if (paragraphs.length < 3) score -= 20;
      if (text.length < 200) score -= 20;
      let status = 'pass', message = '页面可读性良好。';
      if (score < 60) { status = 'warning'; message = '页面可读性一般，建议优化段落和句子结构。'; }
      if (score < 40) { status = 'error'; message = '页面可读性较差，建议增加内容丰富度和分段。'; }
      return { status, score, message };
    });
    // 评分与建议
    let score = 100, status = 'pass';
    const suggestions = [];
    if (custom404.status !== 'pass') {
      suggestions.push('配置友好的自定义404页面，提升用户体验。');
    }
    if (deadLinks.status !== 'pass') {
      suggestions.push('及时修复死链，避免用户访问无效页面。');
    }
    if (readability.status !== 'pass') {
      suggestions.push('优化段落和句子结构，提升页面可读性。');
    }
    if (suggestions.length > 0) {
      score = 60; status = 'error';
    }
    res.json({ custom404, deadLinks, readability, score, status, suggestions, suggestion: suggestions[0] || '' });
  } catch (e) {
    res.status(500).json({ error: '可访问性与内容质量检测失败', detail: e.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router; 