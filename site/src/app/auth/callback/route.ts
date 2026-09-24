import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName, decodeAuthCookie } from "@/lib/auth-cookie";
import { mintIntelToken } from "@/lib/intel-token";

export const dynamic = "force-dynamic";

const callbackUrl = "https://intel.evedeck.space/auth/callback";
const jwks = createRemoteJWKSet(new URL("https://login.eveonline.com/oauth/jwks"));

export async function GET(request: NextRequest) {
  const cookie = decodeAuthCookie(request.cookies.get(authCookieName)?.value);
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");

  if (!cookie || !state || state !== cookie.state) return errorPage("The EVE login session expired or did not match.", cookie?.returnUrl);
  if (!code) return errorPage("EVE did not return an authorization code.", cookie.returnUrl);

  try {
    const accessToken = await exchangeCode(code);
    const identity = await verifyEveAccessToken(accessToken);
    const token = mintIntelToken(identity);
    const target = new URL(cookie.returnUrl);
    target.hash = `token=${encodeURIComponent(token)}`;

    const response = NextResponse.redirect(target);
    response.cookies.set({
      name: authCookieName,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/auth",
      maxAge: 0
    });
    return response;
  } catch {
    return errorPage("EVE login failed. Please try again.", cookie.returnUrl);
  }
}

async function exchangeCode(code: string): Promise<string> {
  const clientId = process.env.EVE_SSO_CLIENT_ID;
  const clientSecret = process.env.EVE_SSO_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("EVE SSO is not configured.");

  const response = await fetch("https://login.eveonline.com/v2/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl
    }),
    cache: "no-store"
  });

  if (!response.ok) throw new Error("EVE token exchange failed.");
  const body = (await response.json()) as { access_token?: unknown };
  if (typeof body.access_token !== "string") throw new Error("EVE token response was missing access_token.");
  return body.access_token;
}

async function verifyEveAccessToken(accessToken: string) {
  const { payload } = await jwtVerify(accessToken, jwks, { audience: "EVE Online" });
  if (payload.iss !== "https://login.eveonline.com" && payload.iss !== "login.eveonline.com") {
    throw new Error("Unexpected EVE token issuer.");
  }

  const sub = typeof payload.sub === "string" ? /^CHARACTER:EVE:(\d+)$/.exec(payload.sub) : null;
  if (!sub) throw new Error("Unexpected EVE token subject.");

  const characterId = Number(sub[1]);
  if (!Number.isSafeInteger(characterId)) throw new Error("Unexpected EVE character id.");

  return {
    characterId,
    name: typeof payload.name === "string" ? payload.name : "Test Pilot"
  };
}

function errorPage(message: string, returnUrl?: string) {
  const href = returnUrl ? `/auth?return=${encodeURIComponent(returnUrl)}` : "/";
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>EveDeck Intel login</title></head><body><p>${escapeHtml(message)}</p><p><a href="${href}">Try again</a></p></body></html>`,
    {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
    }
  );
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
