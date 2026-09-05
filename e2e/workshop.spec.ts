import { chromium, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function clean(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test('an instructor can author cards with keyboard focus retained between fields and timer updates', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await clean(page);
  await page.getByRole('button', { name: 'Start a card set' }).click();
  await page.getByLabel('Short title').fill('A changing plan');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Discussion prompt')).toBeFocused();
  await page.getByLabel('Discussion prompt').fill('What would your group do first?');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.waitForTimeout(1100);
  await expect(page.getByRole('button', { name: 'Pause clock' })).toBeFocused();
  await expect(page.locator('.timer')).not.toHaveText('15:00');
  expect(errors).toEqual([]);
});

test('@claim:sample-sandbox loads a realistic sample separately and leaves real work unchanged', async ({ page }) => {
  await clean(page);
  await page.getByRole('button', { name: 'Start a card set' }).click();
  await page.getByLabel('Short title').fill('Real workshop title');
  await page.getByLabel('Short title').press('Tab');
  await expect(page.getByText('Real workshop title', { exact: true })).toBeVisible();
  const realBefore = await page.evaluate(() => localStorage.getItem('ccw:workshop:v1'));

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo status')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('.concept-card')).toHaveCount(4);
  await expect(page.getByText('Trail conditions: a reasoning round', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.concept-card')).toHaveCount(4);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Real workshop title', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ccw:workshop:v1'))).toBe(realBefore);
});

test('@claim:projection-join opens the same deck when a recipient pastes the join code', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.concept-card')).toHaveCount(4);
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open projection view' }).click();
  const projection = await popupPromise;
  await projection.waitForLoadState();
  await expect(projection.getByRole('heading', { level: 1 })).toHaveText('Trail conditions: a reasoning round');
  const code = await projection.getByLabel('Projection join code').inputValue();
  expect(code.startsWith('CCW1.')).toBeTruthy();
  await projection.close();

  await page.goto('/');
  await page.getByRole('button', { name: 'Join projection' }).click();
  await page.getByLabel('Join code or link').fill(code);
  await page.getByRole('button', { name: 'Open projection', exact: true }).click();
  await expect(page).toHaveURL(/\/project\?join=/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trail conditions: a reasoning round');
  await expect(page.locator('.projection-cards .concept-card')).toHaveCount(4);
});

test('@claim:browser-print opens printable cards with the authored content', async ({ page }) => {
  await page.goto('/demo');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Print cards' }).click();
  const printView = await popupPromise;
  await printView.waitForLoadState();
  await expect(printView.getByRole('heading', { level: 1 })).toHaveText('Trail conditions: a reasoning round');
  await expect(printView.locator('.card')).toHaveCount(4);
  await printView.close();
});

test('@claim:free-core lets an instructor make and print a card without a license', async ({ page }) => {
  await clean(page);
  await page.getByRole('button', { name: 'Start a card set' }).click();
  await page.getByLabel('Short title').fill('Free card');
  await page.getByLabel('Short title').press('Tab');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Print cards' }).click();
  const printView = await popupPromise;
  await expect(printView.getByRole('heading', { level: 1 })).toHaveText('Untitled workshop');
  await expect(printView.locator('.card')).toHaveCount(1);
  await printView.close();
});

test('@claim:timer-range sets a five to thirty minute facilitator clock', async ({ page }) => {
  await page.goto('/demo');
  const slider = page.getByLabel('Discussion time in minutes');
  await slider.fill('30');
  await slider.press('Tab');
  await expect(page.locator('.timer')).toHaveText('30:00');
  await slider.fill('5');
  await slider.press('Tab');
  await expect(page.locator('.timer')).toHaveText('05:00');
});

test('@claim:four-card-roles gives the sample one scenario, evidence, decision, and consequence card', async ({ page }) => {
  await page.goto('/demo');
  for (const role of ['Scenario', 'Evidence', 'Decision', 'Consequence']) {
    await expect(page.getByText(role, { exact: true }).first()).toBeVisible();
  }
  await expect(page.locator('.concept-card')).toHaveCount(4);
});

test('@claim:paid-pack-price presents the optional one-time pack details before checkout', async ({ page }) => {
  await clean(page);
  await page.getByRole('button', { name: 'See Offline Pack Templates' }).click();
  await expect(page.getByRole('heading', { name: 'Print-ready field kits for $12, once' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy one-time unlock' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/concept-card-workshop/checkout');
});

test('@claim:local-workshop sends no workshop data off-device during a free authoring session', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await clean(page);
  await page.getByRole('button', { name: 'Start a card set' }).click();
  await page.getByLabel('Short title').fill('Local only');
  await page.getByLabel('Short title').press('Tab');
  await page.getByRole('button', { name: 'Print cards' }).click();
  await page.waitForTimeout(100);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4174')).toBeTruthy();
});

test('@claim:offline-reload restores the demo after the first visit', async () => {
  const isolatedBrowser = await chromium.launch();
  const context = await isolatedBrowser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4174/demo');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect(page.getByLabel('Demo status')).toContainText('nothing is saved');
    await page.waitForLoadState('networkidle');
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Demo status')).toContainText('nothing is saved');
    await expect(page.locator('.concept-card')).toHaveCount(4);
  } finally {
    await context.close();
    await isolatedBrowser.close();
  }
});

test('malformed local data offers a recovery path instead of bricking the app', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('ccw:workshop:v1', '{}'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Saved workshop needs recovery');
  await page.getByRole('button', { name: 'Remove unreadable saved data' }).click();
  await expect(page.getByRole('heading', { name: 'Make discussion cards after a lecture' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('ccw:workshop:v1'))).toBeNull();
});

test('a returned license token is always verified, even after another fresh verdict', async ({ page }) => {
  const observed: string[] = [];
  page.on('request', request => observed.push(request.url()));
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:concept-card-workshop', 'OLDER');
    localStorage.setItem('sb_license_verdict:concept-card-workshop', JSON.stringify({ token: 'OLDER', valid: true, checked: Date.now() }));
  });
  await page.evaluate(async () => {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map(registration => registration.unregister()));
    await Promise.all((await caches.keys()).map(key => caches.delete(key)));
  });
  let calls = 0;
  await page.route(/https:\/\/api\.sociobot\.in\/api\/v1\/products\/concept-card-workshop\/verify\?license=NEW$/, async route => {
    calls += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/?license=NEW');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:concept-card-workshop'))).toBe('NEW');
  expect(observed.filter(url => url.includes('/verify')).length).toBe(1);
  await expect.poll(() => calls).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sb_license_verdict:concept-card-workshop') || '{}').token)).toBe('NEW');
  expect(await page.evaluate(() => location.search)).toBe('');
});

test('the main view and paid dialog have no serious or critical axe violations', async ({ page }) => {
  await clean(page);
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'See Offline Pack Templates' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([]);
});

test('mobile controls meet target size and 200 percent text does not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await clean(page);
  const tooSmall = await page.locator('button:visible,input:visible,select:visible,textarea:visible').evaluateAll(nodes => nodes.some(node => {
    const rect = node.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44;
  }));
  expect(tooSmall).toBeFalsy();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
