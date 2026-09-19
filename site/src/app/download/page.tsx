import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { DOWNLOADS, RELEASE_PAGE, SOURCE_URL, VERSION } from "@/lib/release";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download EveDeck Intel: the Windows daemon and the Android tablet app, with checksums. Both halves are needed."
};

function VtBadge({
  url,
  summary,
  clean,
}: {
  url: string;
  summary?: string;
  clean?: boolean;
}) {
  const flagged = clean === false;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
        flagged
          ? "border-warn/28 bg-warn/10 text-warn hover:border-warn/44 hover:bg-warn/16"
          : "border-ok/24 bg-ok/10 text-ok hover:border-ok/40 hover:bg-ok/16"
      }`}
    >
      🛡️ VirusTotal: {summary ?? "view report"}
    </a>
  );
}

export default function DownloadPage() {
  const anyFlagged = DOWNLOADS.some((item) => item.virusTotalClean === false);
  return (
    <PageShell
      title={`Download ${VERSION}`}
      kicker="BOTH HALVES"
      intro="The daemon runs on the PC you play on. The app runs on the tablet. They find each other over your LAN, so you need both."
    >
      <p className="mt-2 text-sm text-muted/80">
        On an iPad, iPhone, or anything that isn&apos;t Android, skip the tablet app — the daemon
        alone serves the same feed as a web page, no second download needed. See{" "}
        <Link href="/setup">setting it up</Link> for the address to open.
      </p>
      <div className="not-prose mt-2 grid gap-4 sm:grid-cols-2">
        {DOWNLOADS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-b from-panel/92 to-panel-2/84 p-5 transition-colors hover:border-accent/25"
          >
            <a href={item.href} className="group flex flex-1 flex-col no-underline">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[.18em] text-muted/70">
                  {item.platform}
                </span>
                <span className="text-xs text-muted/70">{item.size}</span>
              </div>
              <h2 className="mt-2 font-display text-lg font-bold tracking-tight text-text group-hover:text-accent">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 text-[.92rem] leading-relaxed text-muted">{item.detail}</p>
              <p className="mt-3 text-xs text-muted/70">{item.requirement}</p>
              <p className="mt-3 break-all font-mono text-[.66rem] leading-relaxed text-muted/50">
                {item.file}
                <br />
                sha256 {item.sha256}
              </p>
            </a>
            {item.virusTotalUrl && (
              <VtBadge url={item.virusTotalUrl} summary={item.virusTotalSummary} clean={item.virusTotalClean} />
            )}
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted/80">
        Both files are also on the{" "}
        <a href={RELEASE_PAGE}>{VERSION} release page</a>, which is where the checksums above come
        from. Next step: <Link href="/setup">setting it up</Link>.
      </p>

      {anyFlagged && (
        <p className="max-w-[560px] text-[.85rem] leading-relaxed text-muted/60">
          Compiled from public source and published straight to GitHub Releases — nothing hidden
          between commit and download. A flag is almost always one trigger-happy engine reacting to
          an unsigned, freshly-built binary rather than a signature match. Open the report above to
          see which engine flagged it. EveDeck Intel is open source — read the code or build it
          yourself if you want certainty; running it is at your own risk either way.
        </p>
      )}

      <h2>Verifying what you downloaded</h2>
      <p>
        You do not have to, but it costs one line. In PowerShell, run{" "}
        <code>Get-FileHash .\EveDeckIntel-daemon-{VERSION}-win-x64.zip</code> and compare the result
        with the checksum on the card above. If they differ, the file is not the one we published —
        delete it.
      </p>

      <h2>What the warnings mean</h2>
      <p>
        Neither download carries a certificate from a certificate authority, because a code-signing
        certificate costs more per year than this project costs to run. Two consequences, and both
        are cosmetic rather than a sign of anything wrong:
      </p>
      <ul>
        <li>
          <strong>Windows SmartScreen</strong> will interrupt the first launch of the daemon with a
          blue &ldquo;unrecognised app&rdquo; panel. Choose <em>More info</em>, then{" "}
          <em>Run anyway</em>. It stops once the file has enough reputation.
        </li>
        <li>
          <strong>Android</strong> treats any sideloaded app as unknown and asks whether to allow
          installs from whatever app you downloaded it with. The APK <em>is</em> signed, with a key
          we hold — that signature is what lets a later version upgrade an installed one rather than
          forcing a reinstall.
        </li>
      </ul>
      <p>
        If you would rather not trust a binary at all, the whole thing builds from source: the
        repository is <a href={SOURCE_URL}>public</a>, and the daemon is a Gradle project like any
        other.
      </p>

      <h2>Updating</h2>
      <p>
        Neither half updates itself. The daemon is a folder — unzip a newer one over it and keep your{" "}
        <code>eveintel.properties</code>. The APK installs over the previous version.
      </p>

      <hr />
      <p className="text-sm">
        EveDeck Intel is free and open source, released under the same licence as EveDeck itself.
        EVE Online and all related material are the property of Fenris Creations hf. This is
        independent work and is not endorsed by or affiliated with them.
      </p>
    </PageShell>
  );
}
