export type ReturnUrlValidation =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function validateIntelReturnUrl(value: string | null): ReturnUrlValidation {
  if (!value) return { ok: false, reason: "Missing return URL." };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "Bad return URL." };
  }

  if (url.protocol !== "http:") return { ok: false, reason: "Return URL must use http." };
  if (url.username || url.password) return { ok: false, reason: "Return URL must not include user info." };

  const host = url.hostname.toLowerCase();
  if (isAllowedIpv4(host) || host.endsWith(".local")) return { ok: true, url };

  return { ok: false, reason: "Return URL must point to a LAN address." };
}

function isAllowedIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;

  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return Number.NaN;
    const value = Number(part);
    return value >= 0 && value <= 255 ? value : Number.NaN;
  });

  if (octets.some(Number.isNaN)) return false;

  const [a, b] = octets;
  return a === 10
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || a === 127;
}
