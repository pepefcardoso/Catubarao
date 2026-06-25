import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Accessibility Checks', () => {
  const checkA11y = async (page: any, url: string) => {
    await page.goto(url);
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  };

  test('Public home page', async ({ page }) => {
    await checkA11y(page, '/');
  });

  test('Transparency portal', async ({ page }) => {
    await checkA11y(page, '/transparencia');
  });

  test('Sócio-Torcedor page', async ({ page }) => {
    await checkA11y(page, '/socios');
  });

  test('Signup page', async ({ page }) => {
    await checkA11y(page, '/signup');
  });
});
