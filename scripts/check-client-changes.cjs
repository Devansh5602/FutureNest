const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.BASE_URL || 'http://localhost:8080';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    for (const width of [320, 440, 768, 1920]) {
      await page.setViewportSize({ width, height: 700 });
      for (const route of ['/', '/about/', '/services/', '/refer/', '/contact/']) {
        await page.goto(baseURL + route);
        await page.evaluate(() => document.fonts.ready);
        const banner = page.locator('main > section').first();
        assert(await banner.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const copy = element.querySelector('[class*="hero__copy"]');
          return [...copy.querySelectorAll('h1, h2, p')].every(child => {
            const box = child.getBoundingClientRect();
            return box.top >= document.querySelector('.header').getBoundingClientRect().bottom &&
              box.bottom <= bounds.bottom && box.left >= bounds.left && box.right <= bounds.right;
          });
        }), `${route} banner text fits at ${width}px`);
        for (const link of await page.locator('.ab-faq__intro a').all()) {
          assert(await link.evaluate(element => element.getClientRects().length === 1), `FAQ contact link at ${width}px`);
        }
        if (route === '/') {
          assert(await page.locator('[data-hero="pause"]').isHidden());
          for (let index = 0; index < 3; index++) {
            const slide = page.locator('.fn-hero__slide.is-active');
            assert(await slide.evaluate(element => {
              const image = element.querySelector('img').getBoundingClientRect();
              const banner = element.closest('.fn-hero').getBoundingClientRect();
              const lead = element.querySelector('p').getBoundingClientRect();
              const controls = element.closest('.fn-hero').querySelector('.fn-hero__controls').getBoundingClientRect();
              return Math.abs(image.top - banner.top) < 1 && lead.bottom < controls.top;
            }), `Home slide ${index + 1} fills banner and clears controls at ${width}px`);
            await page.locator('[data-hero="next"]').click();
          }
        }
        if (width <= 600 && (route === '/' || route === '/services/')) {
          for (const selector of ['.fn-story-grid', '.fn-live__row']) {
            const row = page.locator(selector);
            assert(await row.evaluate(element => {
              const box = element.getBoundingClientRect();
              return Math.abs(box.left) < 1 && Math.abs(box.right - innerWidth) < 1;
            }), `${route} ${selector} reaches both screen edges`);
            await row.focus();
            await page.keyboard.press('End');
            assert(await row.evaluate(element => {
              const box = element.lastElementChild.getBoundingClientRect();
              return box.right <= innerWidth && box.left >= 0;
            }), `${route} final card is fully reachable`);
            await page.keyboard.press('Home');
          }
        }
      }
    }
    for (const width of [440, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(baseURL + '/');
      await page.mouse.move(100, 200);
      for (const index of [1, 2, 0]) {
        await page.waitForFunction(expected => [...document.querySelectorAll('.fn-hero__slide')]
          .findIndex(slide => slide.classList.contains('is-active')) === expected, index, { timeout: 8000 });
      }
      const pause = page.locator('[data-hero="pause"]');
      await pause.click();
      await page.locator('.logo').focus();
      await page.waitForTimeout(6200);
      assert(await page.locator('.fn-hero__slide').first().evaluate(element => element.classList.contains('is-active')));
      await pause.click();
      await page.locator('.logo').focus();
      await page.waitForFunction(() => document.querySelectorAll('.fn-hero__slide')[1].classList.contains('is-active'), null, { timeout: 8000 });
    }
    console.log('PASS banner text, full-bleed card scrolling, FAQ links, autoplay looping, pause, and resume.');
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
