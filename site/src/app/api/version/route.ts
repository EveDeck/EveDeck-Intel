import { NextResponse } from "next/server";
import { VERSION, CHANGELOG, DOWNLOADS } from "@/lib/release";

export const dynamic = "force-static";

export function GET() {
  const daemon = DOWNLOADS.find((d) => d.id === "daemon");
  const apk = DOWNLOADS.find((d) => d.id === "apk");

  return NextResponse.json(
    {
      version: VERSION,
      daemonUrl: daemon?.href ?? null,
      apkUrl: apk?.href ?? null,
      whatsNew: CHANGELOG
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
      }
    }
  );
}
