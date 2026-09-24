import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How intel.evedeck.space handles the EVE login for the EveDeck Intel LAN page."
};

const LAST_UPDATED = "24 September 2026";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy" kicker="PRIVACY">
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <h2>What this site does</h2>
      <p>
        intel.evedeck.space handles EVE SSO authentication for the EveDeck Intel page served by the
        EveDeck desktop app on your own network. The login requests no scopes, and this site does
        not read ESI data.
      </p>

      <h2>What this site sees</h2>
      <p>
        EVE returns the character id and character name you logged in with. This site uses those
        values once to sign a login token that goes back to your device.
      </p>

      <h2>What this site stores</h2>
      <p>
        Nothing. There is no database here, and login tokens are not logged. A short-lived httpOnly
        cookie holds the login state for up to 10 minutes while the SSO round trip completes.
      </p>

      <h2>What stays on your device</h2>
      <p>
        The signed token is stored in your device&apos;s browser storage by the LAN page served from
        EveDeck. It expires after 30 days.
      </p>
    </PageShell>
  );
}
