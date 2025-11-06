const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

// 工具函数：根据 status/message 返回建议
function getSuggestion(module, status, message) {
  if (status === 'pass') return '';
  if (module === 'seoElements') {
    if (message.includes('H1')) return '每页应有且仅有一个H1标签，利于SEO。';
    if (message.includes('alt')) return '为所有图片添加alt属性，提升图片SEO和可访问性。';
    if (message.includes('内外链')) return '合理分配内外链，避免过多外链。';
    return '请优化页面SEO要素。';
  }
  return '请参考优化建议。';
}

router.post('/seo-elements', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const result = await page.evaluate(() => {
      // H标签统计
      const hTags = { h1: 0, h2: 0, h3: 0, structure: [] };
      const hTagErrors = [];
      ['h1', 'h2', 'h3'].forEach(tag => {
        const nodes = Array.from(document.getElementsByTagName(tag));
        hTags[tag] = nodes.length;
        nodes.forEach(node => {
          hTags.structure.push({ tag, text: node.textContent.trim().slice(0, 50) });
        });
      });
      if (hTags.h1 !== 1) {
        hTagErrors.push(`H1标签数量为${hTags.h1}，建议每页有且仅有一个H1标签。`);
      }
      // 检查H标签嵌套/顺序
      const allH = Array.from(document.querySelectorAll('h1,h2,h3'));
      let lastLevel = 0;
      allH.forEach((el, i) => {
        const level = parseInt(el.tagName[1]);
        if (level - lastLevel > 1) {
          hTagErrors.push(`第${i+1}个${el.tagName}（"${el.textContent.trim().slice(0, 30)}"）层级跳跃，建议按顺序嵌套。`);
        }
        lastLevel = level;
      });
      // 图片alt统计
      const imgs = Array.from(document.getElementsByTagName('img'));
      const imgAlt = {
        total: imgs.length,
        missingAlt: imgs.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '').length,
        missingAltList: imgs.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '').map(img => img.src)
      };
      // 链接统计
      const links = Array.from(document.getElementsByTagName('a'));
      const origin = location.origin;
      const internalLinksArr = [];
      const externalLinksArr = [];
      const nofollowLinksArr = [];
      const linkErrors = [];
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const text = a.textContent.trim();
        if (!href.startsWith('http')) return;
        if (href.startsWith(origin)) internalLinksArr.push({ href, text });
        else externalLinksArr.push({ href, text });
        if (a.getAttribute('rel') && a.getAttribute('rel').includes('nofollow')) nofollowLinksArr.push({ href, text });
        if (!a.textContent.trim()) linkErrors.push(`链接${href}缺少可见文本。`);
        if (a.getAttribute('rel') && a.getAttribute('rel').includes('nofollow')) linkErrors.push(`链接${href}使用了nofollow属性。`);
      });
      // 关键词密度
      const bodyText = document.body.innerText.replace(/\s+/g, ' ');
      const words = bodyText.match(/\b[\u4e00-\u9fa5\w]{2,}\b/g) || [];
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const totalWords = words.length;
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const keywordDensity = sorted.map(([word, count]) => ({ word, count, density: ((count / totalWords) * 100).toFixed(2) + '%' }));
      // === 新增status字段 ===
      const hTagsStatus = hTagErrors.length > 0 ? 'error' : 'pass';
      const imgAltStatus = imgAlt.missingAltList.length > 0 ? 'error' : 'pass';
      const linksStatus = linkErrors.length > 0 ? 'error' : 'pass';
      return {
        hTags: { ...hTags, errors: hTagErrors, status: hTagsStatus },
        imgAlt: { ...imgAlt, status: imgAltStatus },
        links: {
          internal: internalLinksArr.length,
          external: externalLinksArr.length,
          nofollow: nofollowLinksArr.length,
          internalLinks: internalLinksArr,
          externalLinks: externalLinksArr,
          nofollowLinks: nofollowLinksArr,
          errors: linkErrors,
          status: linksStatus
        },
        keywordDensity
      };
    });
    // 汇总所有错误
    const errors = [];
    if (result.hTags.errors && result.hTags.errors.length) errors.push(...result.hTags.errors)
    if (result.imgAlt.missingAltList && result.imgAlt.missingAltList.length) errors.push(`缺失alt图片: ${result.imgAlt.missingAltList.slice(0,5).join(', ')}${result.imgAlt.missingAltList.length>5?'...':''}`)
    if (result.links.errors && result.links.errors.length) errors.push(...result.links.errors)
    // 评分与建议
    let score = 100, status = 'pass', suggestion = ''
    if (errors.length) {
      score = 60; status = 'error';
      suggestion = getSuggestion('seoElements', 'error', errors.join(' '))
    }
    res.json({ ...result, score, status, suggestion, errors });
  } catch (e) {
    res.status(500).json({ error: '分析失败', detail: e.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router; 