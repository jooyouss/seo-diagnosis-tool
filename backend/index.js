const express = require('express');
const cors = require('cors');
const homeContentRouter = require('./routes/homeContent');
const basicInfoRouter = require('./routes/basicInfo');
const seoElementsRouter = require('./routes/seoElements');
const techSeoRouter = require('./routes/techSeo');
const accessibilityRouter = require('./routes/accessibility');
const reportRouter = require('./routes/report');
const screenshotRouter = require('./routes/screenshot');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', homeContentRouter);
app.use('/api', basicInfoRouter);
app.use('/api', seoElementsRouter);
app.use('/api', techSeoRouter);
app.use('/api', accessibilityRouter);
app.use('/api', reportRouter);
app.use('/api', screenshotRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`SEO诊断后端服务已启动，端口：${PORT}`);
});
