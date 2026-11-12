/* POST /api/blueprint/review  { id, email, name, company, role, timing, brief, start, website }
   Asks a senior engineer to check the blueprint. The team gets the full plan; the visitor gets a confirmation. */
import { json, fail, readBody, sameSite, validEmail, clean, limited, saveLead, sendMail, layout, esc, MailError } from '../../_lib/util.js';
import { makePlan } from '../../_lib/plan.js';

export async function onRequestPost({ request, env }) {
  if (!sameSite(request, env)) return fail('bad_origin', 403);
  const b = await readBody(request);
  if (!b) return fail('bad_request', 400);
  if (b.website) return json({ ok: true });
  const f = {
    email: clean(b.email, 254).toLowerCase(), name: clean(b.name, 120), company: clean(b.company, 160),
    role: clean(b.role, 80), timing: clean(b.timing, 60), brief: clean(b.brief, 4000), start: clean(b.start, 10), parent: clean(b.id, 40)
  };
  if (!validEmail(f.email)) return fail('bad_email', 400);
  if (!f.name || !f.company || !f.role || !f.timing) return fail('missing_fields', 400);
  if (f.brief.length < 8) return fail('bad_brief', 400);
  if (!env.TEAM_EMAIL) return fail('not_configured', 503);
  if (await limited(env, request, 'review', 5)) return fail('rate_limited', 429);

  let plan;
  try { plan = makePlan(env, request, f.brief, f.start); } catch (e) { return fail('engine_error', 500); }
  if (!plan) return fail('unsupported', 422);
  const { M } = plan;

  const who = [['Name', f.name], ['Email', f.email], ['Company', f.company], ['Role', f.role], ['Wants to start', f.timing], ['Plan start date', M.start || 'not set']];
  try {
    await sendMail(env, {
      to: env.TEAM_EMAIL, replyTo: f.email,
      subject: 'Review request (reply within 1 business day): ' + f.company + ', ' + M.title,
      html: layout('<p style="font:600 15px Inter,Arial,sans-serif;color:#B42318;margin:0 0 10px">Reply within one business day.</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" style="font:14px/1.5 Inter,Arial,sans-serif;color:#1E1B4B;margin:0 0 14px">' +
        who.map(r => '<tr><td style="padding:2px 14px 2px 0;color:#5B5887">' + r[0] + '</td><td style="padding:2px 0"><b>' + esc(r[1]) + '</b></td></tr>').join('') + '</table>' +
        '<p style="margin:0 0 18px"><a href="' + esc(plan.link) + '" style="color:#4F46E5;font:600 14px Inter,Arial,sans-serif">Open their 3D blueprint</a></p>' + plan.onePage + plan.full),
      text: who.map(r => r[0] + ': ' + r[1]).join('\n') + '\n\n' + plan.text
    });
  } catch (e) {
    return e instanceof MailError && e.code === 'not_configured' ? fail('not_configured', 503) : fail('send_failed', 502);
  }
  await saveLead(env, { kind: 'review', ...f, title: M.title, weeks: M.minW + '-' + M.maxW, page: clean(request.headers.get('Referer'), 300) });
  try {
    await sendMail(env, {
      to: f.email,
      subject: 'We\'ll check your blueprint: ' + M.title,
      html: layout('<p style="font:15px/1.55 Inter,Arial,sans-serif;color:#1E1B4B;margin:0">Thanks, ' + esc(f.name) + '. A senior engineer is reviewing your blueprint for <b>' + esc(M.title) + '</b> and will reply within one business day.</p>' +
        '<p style="font:15px/1.55 Inter,Arial,sans-serif;color:#1E1B4B;margin:14px 0 0">If you can, reply with the systems involved and anything that must not change. It makes the review sharper.</p>' +
        '<p style="margin:18px 0 0"><a href="' + esc(plan.link) + '" style="color:#4F46E5;font:600 14px Inter,Arial,sans-serif">Your 3D blueprint</a></p>'),
      text: 'Thanks, ' + f.name + '. A senior engineer is reviewing your blueprint for ' + M.title + ' and will reply within one business day.\n\nYour 3D blueprint: ' + plan.link
    });
  } catch (e) { /* the team has it; the confirmation is a courtesy */ }
  return json({ ok: true });
}
