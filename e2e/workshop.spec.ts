import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('an instructor can compose a card set without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Turn a lecture');
  await page.getByRole('button', { name: 'Add a scenario card' }).click();
  await page.getByLabel('Short title').fill('A changing plan');
  await page.getByLabel('Discussion prompt').fill('What would your group do first?');
  await page.getByRole('button', { name: 'Add a card' }).click();
  await expect(page.locator('.concept-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Start round' }).click();
  await expect(page.locator('.timer')).not.toHaveText('15:00');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter(v => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});
