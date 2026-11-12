/* POST /api/contact  Receives the site's contact and request forms (SITE.formEndpoint). */
import { json, fail, readBody, sameSite, validEmail, clean, limited, saveLead, sendMail, layout, esc, MailError } from '../_lib/util.js';

const KNOWN = ['goal', 'name', 'email', 'company', 'interest', 'industry', 'kind', 'page', 'message', 'role', 'phone', 'size', 'timeline', 'budget', 'product'];

export async function onRequestPost({ request, env }) {
  if (!sameSite(request, env)) return fail('bad_origin', 403);
  const b = await readBody(request, 20000);
  if (!b) return fail('bad_request', 400);
  if (b.website) return json({ ok: true });
  const email = clean(b.email, 254).toLowerCase(), name = clean(b.name, 120);
  if (!validEmail(email)) return fail('bad_email', 400);
  if (!env.TEAM_EMAIL) return fail('not_configured', 503);
  if (await limited(env, request, 'contact', 6)) return fail('rate_limited', 429);

  /* keep every field the form sent, within limits, so new form fields don't need a code change */
  const rows = [];
  Object.keys(b).slice(0, 30).forEach(k => {
    if (k === 'website' || typeof b[k] !== 'string' && typeof b[k] !== 'boolean') return;
    const v = clean(String(b[k]), k === 'goal' || k === 'message' ? 5000 : 300);
    if (v) rows.push([k.replace(/[^a-z0-9_-]/gi, '').slice(0, 40), v]);
  });
  rows.sort((a, c) => (KNOWN.indexOf(a[0]) + 99) % 99 - (KNOWN.indexOf(c[0]) + 99) % 99);
  const kind = clean(b.kind, 40) || 'contact', company = clean(b.company, 160);

  try {
    await sendMail(env, {
      to: env.TEAM_EMAIL, replyTo: email,
      subject: 'Website ' + kind + ': ' + (name || email) + (company ? ', ' + company : ''),
      html: layout('<p style="font:600 15px Inter,Arial,sans-serif;color:#B42318;margin:0 0 10px">Reply within one business day.</p><table role="presentation" cellpadding="0" cellspacing="0" style="font:14px/1.5 Inter,Arial,sans-serif;color:#1E1B4B">' +
        rows.map(r => '<tr><td style="padding:3px 14px 3px 0;color:#5B5887;vertical-align:top">' + esc(r[0]) + '</td><td style="padding:3px 0;white-space:pre-wrap">' + esc(r[1]) + '</td></tr>').join('') + '</table>'),
      text: rows.map(r => r[0] + ': ' + r[1]).join('\n')
    });
  } catch (e) {
    return e instanceof MailError && e.code === 'not_configured' ? fail('not_configured', 503) : fail('send_failed', 502);
  }
  await saveLead(env, { kind, email, name, company, message: rows.map(r => r[0] + ': ' + r[1]).join('\n').slice(0, 8000), page: clean(b.page, 300) });
  return json({ ok: true });
}
