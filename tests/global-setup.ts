import { writeFileSync, mkdirSync } from 'fs';

const SITEMAP_INDEX_URL = 'https://www.unitcity.nl/sitemap_index.xml';

// BCP 47 code → URL path prefixes (most match 1:1; 'ind' in URLs maps to BCP 47 'id')
const LANG_PREFIXES: Record<string, string[]> = {
  bg:  ['/bg/'],
  bn:  ['/bn/'],
  cs:  ['/cs/'],
  de:  ['/de/'],
  es:  ['/es/'],
  et:  ['/et/'],
  fi:  ['/fi/'],
  fr:  ['/fr/'],
  hi:  ['/hi/'],
  hu:  ['/hu/'],
  id:  ['/ind/'],
  it:  ['/it/'],
  ja:  ['/ja/'],
  ka:  ['/ka/'],
  kk:  ['/kk/'],
  ko:  ['/ko/'],
  ky:  ['/ky/'],
  lt:  ['/lt/'],
  lv:  ['/lv/'],
  nl:  ['/nl/'],
  pt:  ['/pt/'],
  ro:  ['/ro/'],
  ru:  ['/ru/'],
  sr:  ['/sr/'],
  tr:  ['/tr/'],
  uk:  ['/uk/'],
  uz:  ['/uz/'],
  zh:  ['/zh/', '/zh-hans/'],
};

const ALL_LANGUAGES = Object.keys(LANG_PREFIXES);

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

function detectLangFromUrl(url: string, langs: string[]): string | null {
  const path = new URL(url).pathname;
  for (const lang of langs) {
    for (const prefix of LANG_PREFIXES[lang]) {
      if (path.startsWith(prefix)) return lang;
    }
  }
  return null;
}

export default async function globalSetup() {
  const requestedLocales = process.env.LOCALES
    ? process.env.LOCALES.split(',').map((s) => s.trim()).filter((s) => ALL_LANGUAGES.includes(s))
    : ALL_LANGUAGES;

  console.log(`Locales to test: ${requestedLocales.join(', ')}`);
  console.log('Fetching sitemap index...');

  const indexXml = await fetchText(SITEMAP_INDEX_URL);
  const childSitemapUrls = extractLocs(indexXml);
  console.log(`Found ${childSitemapUrls.length} child sitemaps`);

  const results: { url: string; expectedLang: string }[] = [];

  for (const sitemapUrl of childSitemapUrls) {
    console.log(`Fetching ${sitemapUrl}`);
    const xml = await fetchText(sitemapUrl);
    for (const loc of extractLocs(xml)) {
      const lang = detectLangFromUrl(loc, requestedLocales);
      if (lang) results.push({ url: loc, expectedLang: lang });
    }
  }

  console.log(`Collected ${results.length} pages`);
  mkdirSync('tests/data', { recursive: true });
  writeFileSync('tests/data/sitemap-urls.json', JSON.stringify(results, null, 2));
}
