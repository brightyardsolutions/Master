// robots.txt for the site being built.
import { SITES } from '../index.mjs';
const SITE = SITES[import.meta.env.SITE_KEY];
export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
