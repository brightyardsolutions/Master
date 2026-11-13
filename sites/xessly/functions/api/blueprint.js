/* POST /api/blueprint  { email, brief, start, website }
   Emails the blueprint pack (3D link, one-page brief, full plan) and tells the team. */
import { json, fail, readBody, sameSite, validEmail, clean, limited, saveLead, sendMail, layout, esc, MailError } from '../_lib/util.js';
import { makePlan } from '../_lib/plan.js';

export async function onRequestPost({ request, env }) {
  if (!sameSite(request, env)) return fail('bad_origin', 403);
  const b = await readBody(request);
  if (!b) return fail('bad_request', 400);
  if (b.website) return json({ ok: true, id: '' });            // honeypot: pretend it worked
  const email = clean(b.email, 254).toLowerCase(), brief = clean(b.brief, 4000), start = clean(b.start, 10);
  if (!validEmail(email)) return fail('bad_email', 400);
  if (brief.length < 8) return fail('bad_brief', 400);
  if (await limited(env, request, 'pack', 8)) return fail('rate_limited', 429);

  let plan;
  try { plan = makePlan(env, request, brief, start); } catch (e) { console.error('engine', e && e.message); return fail('engine_error', 500); }
  if (!plan) return fail('unsupported', 422);
  const { M } = plan;

  try {
    await sendMail(env, {
      to: email,
      subject: 'Your Brightyard blueprint: ' + M.title,
      html: layout(
        '<p style="font:15px/1.55 Inter,Arial,sans-serif;color:#1E1B4B;margin:0 0 6px">Here is the blueprint you made on brightyard.in. Forward this email to anyone on your team; the link opens the interactive 3D model.</p>' +
        '<p style="margin:16px 0 22px"><a href="' + esc(plan.link) + '" style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;font:600 15px Inter,Arial,sans-serif;padding:12px 20px;border-radius:12px">Open the 3D blueprint</a></p>' +
        '<hr style="border:0;border-top:1px solid #E4E0FB;margin:0 0 6px">' + plan.onePage +
        '<hr style="border:0;border-top:1px solid #E4E0FB;margin:26px 0 0"><h2 style="font:600 18px Inter,Arial,sans-serif;color:#1E1B4B;margin:22px 0 0">The full plan</h2>' + plan.full +
        '<p style="font:14px/1.55 Inter,Arial,sans-serif;color:#1E1B4B;margin:26px 0 0"><b>Want an engineer to check it?</b> Reply to this email with your systems and timing. A senior engineer replies within one business day.</p>',
        'You are getting this because you asked for your blueprint on brightyard.in. We won\'t add you to a mailing list.'),
      text: plan.text + '\n\nWant an engineer to check it? Reply to this email. A senior engineer replies within one business day.'
    });
  } catch (e) {
    return e instanceof MailError && e.code === 'not_configured' ? fail('not_configured', 503) : fail('send_failed', 502);
  }

  const id = await saveLead(env, { kind: 'pack', email, brief, start, title: M.title, weeks: M.minW + '-' + M.maxW, page: clean(request.headers.get('Referer'), 300) });
  if (env.TEAM_EMAIL) {
    try {
      await sendMail(env, {
        to: env.TEAM_EMAIL, replyTo: email,
        subject: 'Blueprint pack sent: ' + M.title + ' (' + email + ')',
        html: layout('<p style="font:14px/1.5 Inter,Arial,sans-serif;color:#1E1B4B;margin:0 0 12px"><b>' + esc(email) + '</b> took their blueprint. No review requested yet.</p>' + plan.onePage),
        text: email + ' took their blueprint.\n\n' + plan.text
      });
    } catch (e) { /* the visitor's email went out; a missed notice is not their problem */ }
  }
  return json({ ok: true, id });
}
