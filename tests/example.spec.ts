import { test, expect } from '@playwright/test';
import { detect } from 'langdetect';
import sitemapPages from './data/sitemap-urls.json';

const PAGES_TO_CHECK: { url: string; expectedLang: string }[] = sitemapPages;

// Selectors to extract text from — adjust to match your site structure
const CONTENT_SELECTORS = ['main', 'article', '#content', 'body'];

async function extractPageText(page: any): Promise<string> {
  for (const selector of CONTENT_SELECTORS) {
    const el = page.locator(selector).first();
    if ((await el.count()) > 0) {
      const text = await el.innerText();
      if (text.trim().length > 100) {
        return text.trim();
      }
    }
  }
  // Fallback: get all visible text from body
  return page.evaluate(() => document.body.innerText.trim());
}

for (const { url, expectedLang } of PAGES_TO_CHECK) {
  test(`Language on ${url} should be "${expectedLang}"`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // 1. Check <html lang="..."> attribute
    const declaredLang = await page.getAttribute('html', 'lang');
    console.log(`  Declared lang attribute: ${declaredLang}`);
    expect(
      declaredLang?.toLowerCase().startsWith(expectedLang),
      `<html lang> is "${declaredLang}", expected it to start with "${expectedLang}"`
    ).toBe(true);

    // 2. Extract visible text and detect actual language
    const text = await extractPageText(page);
    expect(text.length, 'Not enough text on the page to detect language reliably').toBeGreaterThan(
      100
    );

    const detectedLangs = detect(text); // returns array sorted by confidence
    const topLang = detectedLangs[0]?.lang;
    const confidence = detectedLangs[0]?.prob;

    console.log(`  Detected language: ${topLang} (confidence: ${(confidence * 100).toFixed(1)}%)`);
    console.log(`  All detections: ${JSON.stringify(detectedLangs.slice(0, 3))}`);

    expect(
      topLang?.startsWith(expectedLang),
      `Expected language "${expectedLang}" but detected "${topLang}" (confidence: ${(confidence * 100).toFixed(1)}%)`
    ).toBe(true);
  });
}
