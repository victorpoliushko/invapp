import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

const overflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
console.log('home overflow:', overflow);

await page.locator('header').screenshot({ path: '/private/tmp/claude-502/-Users-personaldev-Documents-invapp/3fd3980e-abbb-47fa-9b2d-965171bfc708/scratchpad/header-375.png' });
await page.locator('footer').screenshot({ path: '/private/tmp/claude-502/-Users-personaldev-Documents-invapp/3fd3980e-abbb-47fa-9b2d-965171bfc708/scratchpad/footer-375.png' });

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
const loginOverflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
console.log('login overflow:', loginOverflow);
await page.screenshot({ path: '/private/tmp/claude-502/-Users-personaldev-Documents-invapp/3fd3980e-abbb-47fa-9b2d-965171bfc708/scratchpad/login-375.png', fullPage: true });

console.log('console errors:', errors);

await browser.close();
