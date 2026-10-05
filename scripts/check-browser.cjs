const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const baseURL = process.env.BASE_URL || 'http://localhost:8080';
const output = path.resolve('.preview');
const routes = ['/', '/about/', '/services/', '/refer/', '/contact/'];
const widths = [320, 440, 768, 1024, 1440, 1920];

async function run() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 956 });
      for (const route of routes) {
        await page.goto(baseURL + route);
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
          await Promise.all(Array.from(document.images, image => image.decode()));
          await document.fonts.ready;
        });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflows at ${width}px`);
        assert.equal(await page.locator('h1:visible').count(), 1, `${route} visible heading`);

        if (width <= 1024) {
          await page.locator('#hamburger-btn').click();
          assert(await page.locator('#main-content').evaluate(element => element.inert));
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#hamburger-btn').getAttribute('aria-expanded'), 'false');
          assert.equal(await page.locator('#main-content').evaluate(element => element.inert), false);
        }

        const questions = page.locator('.ab-faq__item');
        if (await questions.count()) {
          await questions.first().locator('summary').click();
          assert(await questions.first().evaluate(element => element.open));
          await questions.nth(1).locator('summary').click();
          assert.equal(await questions.first().evaluate(element => element.open), false);
          await questions.nth(1).locator('summary').click();
        }

        if (route === '/services/') {
          for (const tab of await page.getByRole('tab').all()) {
            await tab.click();
            assert.equal(await tab.getAttribute('aria-selected'), 'true');
            assert.equal(await page.locator('.sv-panel:visible').count(), 1);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          }
          await page.getByRole('tab').last().focus();
          await page.keyboard.press('Home');
          assert.equal(await page.getByRole('tab').first().getAttribute('aria-selected'), 'true');
        }

        const next = page.locator('[data-live="next"]');
        if (await next.count() && await next.isEnabled()) {
          await next.click();
          await page.waitForFunction(() => document.getElementById('live-row').scrollLeft > 0);
        }

        if (width === 440 || width === 1440) {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: path.join(output, `${route.replaceAll('/', '') || 'home'}-${width}.png`), fullPage: true });
        }
        console.log(`PASS ${route} ${width}px`);
      }
    }

    await page.goto(`${baseURL}/services/#it-training`);
    assert.equal(await page.locator('#tab-training').getAttribute('aria-selected'), 'true');
    await page.goto(`${baseURL}/contact/?service=it-training#contact-form`);
    assert.match(await page.locator('#contact-message').inputValue(), /IT Training/);
    await page.locator('#contact-name').fill('Site verification');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-phone').fill('1234567890');
    await page.locator('.ct-submit').click();
    assert.match(await page.locator('#contact-status').textContent(), /no message has been sent/);
    await page.goto(`${baseURL}/contact/?enquiry=referral&plan=elite`);
    assert.match(await page.locator('#contact-message').inputValue(), /Elite Plan/);

    await page.goto(baseURL + '/about/');
    await page.locator('.nav__link[href="/services/"]').click();
    await page.waitForURL('**/services/');
    assert(await page.locator('body').evaluate(element => element.classList.contains('fn-services-page')));
    await page.goBack();
    assert(await page.locator('body').evaluate(element => element.classList.contains('fn-about-page')));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(baseURL + '/services/');
    assert.equal(await page.locator('.fn-marquee__track').evaluate(element => getComputedStyle(element).animationName === 'none'), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.fn-marquee__track').evaluate(element => getComputedStyle(element).animationName), 'none');
    assert.deepEqual(errors, []);
    console.log('PASS links, images, FAQs, navigation, tabs, carousels, form validation, referral prefills, and motion preferences.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
