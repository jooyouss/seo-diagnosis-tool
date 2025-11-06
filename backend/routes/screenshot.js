const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

router.get('/screenshot', async (req, res) => {
  const { url, selector } = req.query;
  if (!url) return res.status(400).send('Missing url');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  if (selector) {
    await page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        el.style.outline = '3px solid red';
        el.style.background = 'rgba(255,0,0,0.08)';
      }
    }, selector);
  }
  const buffer = await page.screenshot({ fullPage: true });
  await browser.close();
  res.type('image/png').send(buffer);
});

module.exports = router; 