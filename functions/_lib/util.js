/* Shared helpers for the BrightYard API (Cloudflare Pages Functions).
   Bindings and settings (Cloudflare dashboard > Pages project > Settings):
     DB              D1 database binding (tables in schema.sql). Optional: without it nothing is stored and there is no rate limit.
     RESEND_API_KEY  secret, for sending email through Resend. Without it the API answers 503 and the site offers link/print/mailto.
     MAIL_FROM       e.g. "BrightYard <blueprints@brightyard.in>" (the domain must be verified in Resend)
     TEAM_EMAIL      where lead notices go, e.g. hello@brightyard.in
     SITE_URL        e.g. https://brightyard.in/ (used to build the 3D blueprint link)
     MAIL_LOG        "1" only for local development: log emails instead of sending them */

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

export const fail = (error, status) => json({ ok: false, error }, status);

export const esc = s => String(s == null ? '' : s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

export const validEmail = e => typeof e === 'string' && e.length <= 254 && /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(e);

/* Trims, drops control characters, and keeps line breaks only in long free-text fields. */
export const clean = (v, max = 200) => {
  if (typeof v !== 'string') return '';
  let s = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (max <= 300) s = s.replace(/[\r\n\u2028\u2029]+/g, ' ');
  return s.trim().slice(0, max);
};

/* Reads a JSON body of at most `max` bytes. Returns null for anything else. */
export async function readBody(request, max = 16000) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.includes('application/json') && !type.includes('text/plain')) return null;
  const len = +(request.headers.get('Content-Length') || 0);
  if (len > max) return null;
  const text = await request.text();
  if (text.length > max) return null;
  try { const o = JSON.parse(text); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch { return null; }
}

/* Same-site check: browsers send Origin on POST; reject other sites. */
export function sameSite(request, env) {
  const o = request.headers.get('Origin');
  if (!o) return true;
  try {
    const host = new URL(o).host, self = new URL(request.url).host;
    const site = env.SITE_URL ? new URL(env.SITE_URL).host : '';
    return host === self || (site && (host === site || host === 'www.' + site || 'www.' + host === site));
  } catch { return false; }
}

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* Fixed-window rate limit per network. Stores only a salted hash of the IP that changes every hour. */
export async function limited(env, request, bucket, max, windowSec = 3600) {
  if (!env.DB) return false;
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const win = Math.floor(Date.now() / 1000 / windowSec);
  const key = bucket + ':' + (await sha256(ip + '|' + win + '|' + (env.RATE_SALT || 'by'))).slice(0, 32);
  try {
    const row = await env.DB.prepare(
      'INSERT INTO rate (k, win, n) VALUES (?1, ?2, 1) ON CONFLICT(k, win) DO UPDATE SET n = n + 1 RETURNING n'
    ).bind(key, win).first();
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM rate WHERE win < ?1').bind(win - 24).run();
    return row && row.n > max;
  } catch (e) { console.error('rate', e && e.message); return false; }
}

export async function saveLead(env, lead) {
  if (!env.DB) return '';
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      'INSERT INTO leads (id, kind, email, name, company, role, timing, message, brief, start_date, plan_title, weeks, page, parent_id, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)'
    ).bind(id, lead.kind, lead.email || '', lead.name || '', lead.company || '', lead.role || '', lead.timing || '', lead.message || '',
      lead.brief || '', lead.start || '', lead.title || '', lead.weeks || '', lead.page || '', lead.parent || '', new Date().toISOString()).run();
    return id;
  } catch (e) { console.error('lead', e && e.message); return ''; }
}

export class MailError extends Error { constructor(code) { super(code); this.code = code; } }

/* Sends through the Resend HTTP API. */
export async function sendMail(env, { to, subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY) {
    if (env.MAIL_LOG === '1') { console.log('[mail]', JSON.stringify({ to, subject, text: (text || '').slice(0, 400) })); return { id: 'logged' }; }
    throw new MailError('not_configured');
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM || 'BrightYard <onboarding@resend.dev>', to: [to], subject, html, text, reply_to: replyTo || env.TEAM_EMAIL || undefined })
  });
  if (!r.ok) { console.error('resend', r.status, (await r.text()).slice(0, 300)); throw new MailError('send_failed'); }
  return r.json();
}

/* Wraps body content in a simple, email-safe layout. */
export function layout(inner, footer) {
  return '<!doctype html><html><body style="margin:0;background:#F5F3FF;padding:24px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px">' +
    '<tr><td style="padding:28px 28px 8px;font:600 16px Inter,Arial,sans-serif;color:#1E1B4B">BrightYard</td></tr>' +
    '<tr><td style="padding:8px 28px 28px">' + inner + '</td></tr></table>' +
    '<p style="font:12px/1.5 Inter,Arial,sans-serif;color:#5B5887;max-width:600px;margin:14px auto 0">' + (footer || '') + '</p>' +
    '</td></tr></table></body></html>';
}
