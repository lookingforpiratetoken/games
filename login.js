import { createSession, cookie, json, sameOrigin } from "../../_utils.js";
function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) diff |= (left[i] || 0) ^ (right[i] || 0);
  return diff === 0;
}
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    return json({ error: "Admin credentials have not been configured in Cloudflare yet." }, 503);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (!constantTimeEqual(body.username || "", env.ADMIN_USERNAME) ||
      !constantTimeEqual(body.password || "", env.ADMIN_PASSWORD)) {
    return json({ error: "Incorrect username or password." }, 401);
  }
  const token = await createSession(env, "admin", null, 604800);
  return json({ success: true }, 200, { "Set-Cookie": cookie("admin_session", token, 604800) });
}
