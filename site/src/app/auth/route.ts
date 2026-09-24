import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName, encodeAuthCookie } from "@/lib/auth-cookie";
import { validateIntelReturnUrl } from "@/lib/auth-return";

export const dynamic = "force-dynamic";

const callbackUrl = "https://intel.evedeck.space/auth/callback";

export function GET(request: NextRequest) {
  const checked = validateIntelReturnUrl(request.nextUrl.searchParams.get("return"));
  if (!checked.ok) return plain(checked.reason, 400);

  const clientId = process.env.EVE_SSO_CLIENT_ID;
  if (!clientId) return plain("EVE SSO is not configured.", 500);

  const state = randomBytes(24).toString("base64url");
  const authorize = new URL("https://login.eveonline.com/v2/oauth/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", callbackUrl);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set({
    name: authCookieName,
    value: encodeAuthCookie({ returnUrl: checked.url.toString(), state }),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/auth",
    maxAge: 10 * 60
  });
  return response;
}

function plain(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  });
}
