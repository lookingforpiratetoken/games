import { json, requireAdmin, sha256 } from "../../_utils.js";
const FIRST = ["purple","silent","blue","frozen","golden","rapid","silver","cosmic","tiny","brave","hidden","electric","lucky","velvet","crystal","wild","gentle","stormy","midnight","sunny","ancient","swift","mellow","bright","shadow","clever","icy","solar","mystic","neon","sleepy","royal"];
const SECOND = ["dinosaur","comet","volcano","panda","tiger","planet","falcon","dragon","otter","castle","rocket","forest","wizard","turtle","phoenix","island","meteor","badger","koala","eagle","coral","robot","whale","canyon","lantern","raven","monkey","nebula","penguin","sphinx","wolf","jellyfish"];
function pick(list) { return list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length]; }

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
  const rows = await env.DB.prepare(
    "SELECT id, status, created_at, redeemed_at FROM access_keys ORDER BY created_at DESC LIMIT 200"
  ).all();
  const counts = await env.DB.prepare(
    "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) AS unused, SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) AS used FROM access_keys"
  ).first();
  return json({ keys: rows.results || [], counts: counts || { total: 0, unused: 0, used: 0 } });
}
export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const count = Math.max(1, Math.min(50, Number.parseInt(body.count, 10) || 1));
  const created = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < count; i++) {
    let inserted = false;
    for (let attempt = 0; attempt < 8 && !inserted; attempt++) {
      const key = pick(FIRST) + pick(SECOND);
      const keyHash = await sha256(key);
      const id = crypto.randomUUID();
      const result = await env.DB.prepare(
        "INSERT OR IGNORE INTO access_keys (id, key_hash, status, created_at) VALUES (?, ?, 'unused', ?)"
      ).bind(id, keyHash, now).run();
      if (result.meta && result.meta.changes === 1) { created.push({ key, id }); inserted = true; }
    }
  }
  return json({ created });
}
