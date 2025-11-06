const express = require('express');
const router = express.Router();

router.get('/home-content', (req, res) => {
  res.json({
    hero: {
      title: 'AI驱动的SEO诊断平台',
      subtitle: '一键检测网站SEO健康状况，获取专业优化建议，助力内容创作者和运营者提升网站表现。',
      cta: '立即开始诊断',
      image: '/hero-illustration.svg'
    },
    features: [
      {
        icon: 'SearchOutlined',
        title: '全站SEO体检',
        desc: '自动检测站点基础信息、页面SEO要素、技术SEO、可访问性等核心指标。'
      },
      {
        icon: 'BulbOutlined',
        title: '智能优化建议',
        desc: '基于AI分析结果，生成针对性优化建议，助力网站排名提升。'
      },
      {
        icon: 'ThunderboltOutlined',
        title: '一键报告导出',
        desc: '支持导出PDF/图片报告，便于团队协作与汇报。'
      },
      {
        icon: 'SafetyCertificateOutlined',
        title: '数据安全保障',
        desc: '本地化分析，保障您的数据隐私与安全。'
      }
    ],
    faqs: [
      {
        q: 'SEO诊断工具适合哪些用户？',
        a: '适合个人站长、自媒体、企业网站运营人员、产品经理/开发者、SEO顾问等。'
      },
      {
        q: '诊断结果是否安全可靠？',
        a: '所有分析均在本地服务器完成，不会泄露您的网站数据。'
      },
      {
        q: '支持哪些类型的网站？',
        a: '支持绝大多数公开可访问的网站，包括PC和移动端。'
      },
      {
        q: '可以导出诊断报告吗？',
        a: '支持导出PDF或图片格式的诊断报告，便于分享和归档。'
      }
    ],
    contact: {
      email: 'support@yourdomain.com',
      wechat: 'your-wechat-id',
      qq: '12345678'
    }
  });
});

module.exports = router;