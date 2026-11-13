// sitemap.xml for the site being built: every page except the not-found page.
import { SITES } from '../index.mjs';
const SITE = SITES[import.meta.env.SITE_KEY];
export function GET() {
  const urls = SITE.routes.filter(r => !r.noindex).map(r => `  <url><loc>${SITE.url}${r.path}</loc></url>\n`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
