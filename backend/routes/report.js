const express = require('express');
const router = express.Router();

router.post('/report', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });
  try {
    // 并发请求各模块
    const [basic, seo, tech, access] = await Promise.all([
      fetch('http://localhost:3001/api/basic-info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).then(r => r.json()),
      fetch('http://localhost:3001/api/seo-elements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).then(r => r.json()),
      fetch('http://localhost:3001/api/tech-seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).then(r => r.json()),
      fetch('http://localhost:3001/api/accessibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).then(r => r.json()),
    ])
    // 总分加权（可自定义权重）
    const totalScore = Math.round((basic.score * 0.25 + seo.score * 0.25 + tech.score * 0.25 + access.score * 0.25))
    res.json({
      url,
      totalScore,
      modules: {
        basic: { score: basic.score, status: basic.status, suggestion: basic.suggestion, suggestions: basic.suggestions, message: basic.message },
        seoElements: { score: seo.score, status: seo.status, suggestion: seo.suggestion, suggestions: seo.suggestions },
        techSeo: { score: tech.score, status: tech.status, suggestion: tech.suggestion, suggestions: tech.suggestions },
        accessibility: { score: access.score, status: access.status, suggestion: access.suggestion, suggestions: access.suggestions }
      }
    })
  } catch (e) {
    res.status(500).json({ error: '报告生成失败', detail: e.message });
  }
});

module.exports = router; 