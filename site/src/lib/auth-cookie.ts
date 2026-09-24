export const authCookieName = "ed_intel_auth";

export type AuthCookie = {
  returnUrl: string;
  state: string;
};

export function encodeAuthCookie(value: AuthCookie): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeAuthCookie(value: string | undefined): AuthCookie | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<AuthCookie>;
    if (typeof parsed.returnUrl !== "string" || typeof parsed.state !== "string") return null;
    return { returnUrl: parsed.returnUrl, state: parsed.state };
  } catch {
    return null;
  }
}
