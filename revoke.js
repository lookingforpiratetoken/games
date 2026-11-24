import { json, requireAdmin } from "../../_utils.js";
export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const id = String(body.id || "");
  if (!id) return json({ error: "Missing key ID" }, 400);
  const key = await env.DB.prepare("SELECT session_id FROM access_keys WHERE id = ?").bind(id).first();
  if (!key) return json({ error: "Key not found" }, 404);
  await env.DB.prepare("UPDATE access_keys SET status = 'revoked' WHERE id = ?").bind(id).run();
  if (key.session_id) {
    await env.DB.prepare("UPDATE sessions SET revoked = 1 WHERE token_hash = ?").bind(key.session_id).run();
  }
  return json({ success: true });
}
