import { clearCookie, findSession, json, readCookie, sameOrigin, sha256 } from "../../_utils.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  const session = await findSession(request, env, "admin_session", "admin");
  if (session) {
    const token = readCookie(request, "admin_session");
    await env.DB.prepare("UPDATE sessions SET revoked = 1 WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  return json({ success: true }, 200, { "Set-Cookie": clearCookie("admin_session") });
}
