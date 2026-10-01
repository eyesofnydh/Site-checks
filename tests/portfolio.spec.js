const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Prevent live contact/guestbook writes; read-only GETs remain available.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.abort('blockedbyclient');
    return route.continue();
  });
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), 'Homepage must return a successful HTTP response').toBeTruthy();
  await expect(page.locator('#about')).toBeVisible();
});

test('homepage title and core sections', async ({ page }) => {
  await expect(page).toHaveTitle(/Nidhin Narayanan.*Portfolio/i);
  for (const id of ['home', 'about', 'services', 'skills', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('#services h3')).toHaveCount(6);
});

for (const [name, id] of [['Home', 'home'], ['About', 'about'], ['Projects', 'services'], ['Skills', 'skills'], ['Contact', 'contact']]) {
  test(`navigation: ${name}`, async ({ page }) => {
    const link = page.getByRole('link', { name, exact: true });
    if (!(await link.isVisible())) await page.locator('.hamburger').click();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', `#${id}`);
    await link.click();
    // Visibility alone does not prove the section was scrolled into view.
    await expect.poll(() => page.locator(`#${id}`).evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    })).toBeTruthy();
  });
}

test('About popup opens and closes', async ({ page }) => {
  await page.locator('#box123-knowMoreBtn').click();
  await expect(page.locator('#box123-popup')).toBeVisible();
  await expect(page.locator('#box123-popup')).toContainText('Tech Stack');
  await page.locator('.box123-close-btn').click();
  await expect(page.locator('#box123-popup')).toBeHidden();
});

test('About popup supports keyboard dismissal', async ({ page }) => {
  await page.locator('#box123-knowMoreBtn').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#box123-popup')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#box123-popup')).toBeHidden();
});

test('contact rejects empty required fields and invalid email', async ({ page }) => {
  const form = page.locator('#contact form');
  await expect(form.getByPlaceholder('Name', { exact: true })).toHaveAttribute('required', '');
  await expect(form.getByPlaceholder('Email Address')).toHaveAttribute('required', '');
  expect(await form.evaluate(el => el.checkValidity())).toBe(false);
  await form.getByPlaceholder('Name', { exact: true }).fill('QA Test');
  await form.getByPlaceholder('Email Address').fill('invalid-email');
  expect(await form.getByPlaceholder('Email Address').evaluate(el => el.validity.typeMismatch)).toBe(true);
  expect(await form.evaluate(el => el.checkValidity())).toBe(false);
});

test('contact includes name, email and message in submission data without sending', async ({ page }) => {
  const form = page.locator('#contact form');
  await form.getByPlaceholder('Name', { exact: true }).fill('QA Test');
  await form.getByPlaceholder('Email Address').fill('qa@example.com');
  await form.getByPlaceholder('Your message', { exact: true }).fill('Automation validation only');
  expect(await form.evaluate(el => el.checkValidity())).toBe(true);
  const values = await form.evaluate(el => [...new FormData(el).values()]);
  expect.soft(values, 'Name must be included in the payload').toContain('QA Test');
  expect.soft(values).toContain('qa@example.com');
  expect.soft(values).toContain('Automation validation only');
});

test('guestbook required message and reaction selection', async ({ page }) => {
  const form = page.locator('#guestbook-form');
  expect(await form.evaluate(el => el.checkValidity())).toBe(false);
  await page.locator('#message-text').fill('Validation only; never submitted');
  expect(await form.evaluate(el => el.checkValidity())).toBe(true);
  const radios = form.locator('input[type="radio"]');
  await expect(radios).toHaveCount(5);
  // Labels are visually styled; selecting them checks the underlying radio.
  const last = radios.last();
  await form.locator('label.reaction-option').last().click();
  await expect(last).toBeChecked();
  await expect(form.locator('input[type="radio"]:checked')).toHaveCount(1);
});

test('snake difficulty, mode, start and pause', async ({ page }) => {
  await page.locator('#difficulty').selectOption('150');
  await page.locator('#mode').selectOption('boxless');
  await expect(page.locator('#difficulty')).toHaveValue('150');
  await expect(page.locator('#mode')).toHaveValue('boxless');
  await page.getByRole('button', { name: /START GAME/ }).click();
  await expect(page.locator('#popupWrapper')).toBeVisible();
  await page.getByRole('button', { name: /BEGIN MISSION/ }).click();
  await expect(page.locator('#popupWrapper')).toBeHidden();
  await expect(page.locator('#gameCanvas')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#pauseOverlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#pauseOverlay')).toBeHidden();
});

test('layout has no horizontal overflow', async ({ page }) => {
  const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  expect(size.content).toBeLessThanOrEqual(size.viewport + 2);
});

test('images load after scrolling through the page', async ({ page }) => {
  const imgs = page.locator('img');
  expect(await imgs.count()).toBeGreaterThan(0);
  for (const img of await imgs.all()) {
    if (await img.isVisible()) await img.scrollIntoViewIfNeeded();
  }
  await expect.poll(() => imgs.evaluateAll(es => es.filter(e => !e.complete || e.naturalWidth === 0).map(e => e.getAttribute('src')))).toEqual([]);
});

test('internal fragment links have valid targets', async ({ page }) => {
  const broken = await page.locator('a[href^="#"]').evaluateAll(es => es.map(e => e.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
  expect(broken).toEqual([]);
});

test('no uncaught JavaScript errors during reload and section scroll', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload({ waitUntil: 'load' });
  for (const id of ['about', 'services', 'skills', 'contact']) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});

for (const [state, action] of [
  ['default page', async () => {}],
  ['About popup', async page => page.locator('#box123-knowMoreBtn').click()],
  ['game briefing', async page => page.getByRole('button', { name: /START GAME/ }).click()]
]) {
  test(`accessibility: ${state}`, async ({ page }, testInfo) => {
    await action(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    await testInfo.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
    // Incomplete results are included for manual follow-up, not called passes.
    expect(results.violations.map(v => ({ rule: v.id, impact: v.impact, help: v.help, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  });
}
