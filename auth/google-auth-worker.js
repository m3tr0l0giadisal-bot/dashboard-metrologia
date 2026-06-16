const corsHeaders = {
  "Access-Control-Allow-Origin": "https://m3tr0l0giadisal-bot.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const { credential } = await request.json().catch(() => ({}));
    if (!credential) {
      return json({ error: "missing_credential" }, 400);
    }

    const tokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!tokenInfo.ok) {
      return json({ error: "invalid_google_token" }, 401);
    }

    const claims = await tokenInfo.json();
    const email = String(claims.email || "").trim().toLowerCase();
    const audience = String(claims.aud || "");
    const verified = String(claims.email_verified || "").toLowerCase() === "true";

    if (!verified || audience !== env.GOOGLE_CLIENT_ID) {
      return json({ error: "invalid_google_claims" }, 401);
    }

    const adminEmail = String(env.ADMIN_EMAIL || "").trim().toLowerCase();
    const allowedDomain = String(env.ALLOWED_DOMAIN || "grupodisal.com.ar").trim().toLowerCase();
    const domainAllowed = email.endsWith(`@${allowedDomain}`);
    const role = email === adminEmail ? "admin" : domainAllowed ? "readOnly" : "";

    if (!role) {
      return json({ error: "unauthorized_email" }, 403);
    }

    return json({ email, role });
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
