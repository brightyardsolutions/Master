/* POST /api/event  { e }  Privacy-friendly counts: one row per event per day. No cookies, IPs or ids are stored. */
import { readBody, sameSite } from '../_lib/util.js';

const EVENTS = new Set(['bp_ch1', 'bp_ch2', 'bp_ch3', 'bp_ch4', 'bp_start_date', 'bp_take_open', 'bp_pack', 'bp_review', 'bp_share_copy', 'bp_print', 'bp_shared_open', 'bp_menu_brief']);
const none = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.DB || !sameSite(request, env)) return none();
  const b = await readBody(request, 200);
  if (!b || !EVENTS.has(b.e)) return none();
  const day = new Date().toISOString().slice(0, 10);
  try {
    await env.DB.prepare('INSERT INTO events (day, name, n) VALUES (?1, ?2, 1) ON CONFLICT(day, name) DO UPDATE SET n = n + 1').bind(day, b.e).run();
  } catch (e) { console.error('event', e && e.message); }
  return none();
}
