import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-[1264px] px-5 py-12 sm:py-20">
      <div className="max-w-[66ch]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-accent/80">
          EveDeck Intel login
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl">
          This site only signs your device into EveDeck Intel.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          EveDeck Intel now lives inside the EveDeck desktop app. The app can serve an intel page on
          your own network for a tablet or phone, and this site handles the EVE login for that local
          page.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          The intel feed itself never passes through intel.evedeck.space. Open the LAN page from the
          device you want to use; EveDeck sends you here only when it needs you to log in, then sends
          you back to your device.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted">
          You do not need to come here directly. Get the desktop app from{" "}
          <a
            href="https://evedeck.space"
            className="border-b border-accent/30 text-accent no-underline hover:border-accent/60"
          >
            evedeck.space
          </a>
          .
        </p>

        <div className="mt-8">
          <Link
            href="/privacy"
            className="rounded-xl border border-white/10 px-5 py-3 font-display text-sm font-semibold tracking-tight text-muted no-underline transition-colors hover:border-white/25 hover:text-text"
          >
            Privacy
          </Link>
        </div>
      </div>
    </section>
  );
}
