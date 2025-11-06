# SEO 诊断工具 - 后端服务

基于 Node.js + Express + Puppeteer 的 SEO 自动化诊断后端 API 服务。

## 📋 功能概述

本后端服务提供一套完整的 SEO 诊断 API，支持对任意网站进行全方位的 SEO 健康检测，包括：

### 核心功能模块

1. **基础信息分析** (`/api/basic-info`)
   - 页面标题、描述、关键词检测
   - Favicon 存在性验证
   - Robots.txt 和 Sitemap.xml 检查
   - Open Graph 和 Twitter Card 标签分析

2. **SEO 要素分析** (`/api/seo-elements`)
   - H 标签（h1-h6）结构和层级检查
   - 图片 alt 属性完整性分析
   - 内链和外链统计
   - 页面关键词密度分析

3. **技术 SEO 检测** (`/api/tech-seo`)
   - 移动端适配（viewport）检查
   - 结构化数据（Schema.org）检测
   - HTTPS/SSL 证书验证
   - 页面加载速度测试

4. **可访问性与内容质量** (`/api/accessibility`)
   - 自定义 404 页面检查
   - 死链检测（前 20 个链接）
   - 内容可读性评估
   - 页面字数统计

5. **综合报告** (`/api/report`)
   - 汇总所有模块的诊断结果
   - 按权重计算总体 SEO 得分
   - 生成优化建议列表

6. **页面截图** (`/api/screenshot`)
   - 生成网站截图（用于报告展示）

7. **首页内容获取** (`/api/home-content`)
   - 获取目标网站首页内容用于预览

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装依赖

```bash
cd backend
npm install
```

### 启动服务

```bash
npm start
```

或直接运行：

```bash
node index.js
```

服务将在 **http://localhost:3001** 启动。

## 📦 技术栈

- **Express 5.x** - Web 框架
- **Puppeteer 22.x** - 无头浏览器自动化
- **CORS** - 跨域资源共享支持

## 🔧 API 接口文档

### 基础信息分析

**POST** `/api/basic-info`

```json
{
  "url": "https://example.com"
}
```

**响应示例：**

```json
{
  "score": 85,
  "issues": ["缺少 meta description"],
  "suggestions": ["建议添加 meta description 提升 SEO"],
  "data": {
    "title": "网站标题",
    "description": "",
    "keywords": "关键词1, 关键词2",
    "hasRobots": true,
    "hasSitemap": true
  }
}
```

### SEO 要素分析

**POST** `/api/seo-elements`

```json
{
  "url": "https://example.com"
}
```

### 技术 SEO 检测

**POST** `/api/tech-seo`

```json
{
  "url": "https://example.com"
}
```

### 可访问性检测

**POST** `/api/accessibility`

```json
{
  "url": "https://example.com"
}
```

### 综合报告

**POST** `/api/report`

```json
{
  "url": "https://example.com"
}
```

### 页面截图

**POST** `/api/screenshot`

```json
{
  "url": "https://example.com"
}
```

**响应：** Base64 编码的图片数据

### 首页内容获取

**POST** `/api/home-content`

```json
{
  "url": "https://example.com"
}
```

## 📁 项目结构

```
backend/
├── index.js              # 服务入口文件
├── package.json          # 项目依赖配置
├── routes/               # API 路由目录
│   ├── basicInfo.js      # 基础信息分析路由
│   ├── seoElements.js    # SEO 要素分析路由
│   ├── techSeo.js        # 技术 SEO 检测路由
│   ├── accessibility.js  # 可访问性检测路由
│   ├── report.js         # 综合报告路由
│   ├── screenshot.js     # 截图功能路由
│   └── homeContent.js    # 首页内容获取路由
└── node_modules/         # 依赖包
```

## 🔒 安全说明

- 本服务使用 Puppeteer 访问外部网站，请确保在可信环境中运行
- 建议在生产环境中添加请求频率限制和身份验证
- 使用 CORS 中间件控制跨域访问权限

## 📝 开发说明

### 添加新的诊断模块

1. 在 `routes/` 目录下创建新的路由文件
2. 使用 Puppeteer 编写诊断逻辑
3. 在 `index.js` 中引入并注册路由

### 示例路由结构

```javascript
const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

router.post('/api/your-endpoint', async (req, res) => {
  const { url } = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // 诊断逻辑

    await browser.close();

    res.json({
      score: 100,
      issues: [],
      suggestions: [],
      data: {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🐛 常见问题

### Puppeteer 安装失败

如果 Puppeteer 下载 Chromium 失败，可以设置环境变量：

```bash
export PUPPETEER_SKIP_DOWNLOAD=true
npm install
```

然后手动指定 Chromium 路径。

### 端口被占用

修改 `index.js` 中的 `PORT` 常量：

```javascript
const PORT = 3001; // 改为其他端口
```

## 📄 许可证

ISC

## 👥 作者

Backend Team

---

**注意：** 本服务需要与前端项目配合使用，前端项目位于 `../frontend` 目录。
