import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of your website
const BASE_URL = 'https://businfo.click';

// List of routes from App.js
const routes = [
  '/',
  '/routes',
  '/fares',
  '/highway-fares',
  '/contact',
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: BASE_URL });
  const writeStream = createWriteStream(path.join(__dirname, 'public', 'sitemap.xml'));

  sitemap.pipe(writeStream);

  routes.forEach((url) => {
    sitemap.write({ url, changefreq: 'weekly', priority: 0.8 });
  });

  sitemap.end();

  await streamToPromise(sitemap);

  console.log('✅ Sitemap generated successfully at /public/sitemap.xml');
}

generateSitemap();
