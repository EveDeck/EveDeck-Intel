import { createPrivateKey, sign } from "node:crypto";

const tokenAudience = "evedeck-intel-lan";
const tokenLifetimeSeconds = 30 * 24 * 60 * 60;

export type EveIdentity = {
  characterId: number;
  name: string;
};

export function mintIntelToken(identity: EveIdentity, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const encodedKey = process.env.INTEL_TOKEN_SIGNING_KEY;
  if (!encodedKey) throw new Error("INTEL_TOKEN_SIGNING_KEY is not configured.");

  const payload = {
    v: 1,
    aud: tokenAudience,
    cid: identity.characterId,
    name: identity.name,
    iat: nowSeconds,
    exp: nowSeconds + tokenLifetimeSeconds
  };

  const payloadSegment = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const key = createPrivateKey({
    key: Buffer.from(encodedKey, "base64"),
    format: "der",
    type: "pkcs8"
  });
  const signature = sign("sha256", Buffer.from(payloadSegment, "ascii"), {
    key,
    dsaEncoding: "ieee-p1363"
  });

  return `${payloadSegment}.${base64url(signature)}`;
}

function base64url(bytes: Buffer): string {
  return bytes.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
