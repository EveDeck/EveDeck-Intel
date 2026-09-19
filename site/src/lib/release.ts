/**
 * The published release, in one place.
 *
 * Three pages quote the version, the file names and the sizes, and a release that updates two of
 * them is worse than one that updates none -- a download page disagreeing with itself is the kind
 * of thing that makes people assume the binary is wrong too.
 */
export const RELEASE_TAG = "intel-v0.3.2";
export const VERSION = "0.3.2";

/**
 * Bullets for this version, read by /api/version so the daemon and the tablet app can show what
 * changed -- update this alongside VERSION on every release, same source the GitHub release notes
 * came from.
 */
export const CHANGELOG: string[] = [
  "Pilot names in the feed are now links to their zkillboard profile, opening in the browser on both the web client and the tablet app.",
  "Fixed a bug where a tablet or browser connecting fresh never saw already-known pilots' portraits or corp/alliance info -- the daemon's connect-time snapshot only carried newly-resolved lookups going forward, so anyone already in its cache from before that connection stayed blank until (if ever) they were looked up again. The snapshot now includes everything already known.",
  "Fixed a parser bug where a fleet-size count (\"+10\", \"5x\", a bare number) could get misread as a digit-based system name before the parser ever checked whether it looked like a count -- counts are now checked first, so a real digit-led system name is still the only thing that can match as a system."
];

const BASE = `https://github.com/EveDeck/EveDeck-Intel/releases/download/${RELEASE_TAG}`;

export const RELEASE_PAGE = `https://github.com/EveDeck/EveDeck-Intel/releases/tag/${RELEASE_TAG}`;
export const SOURCE_URL = "https://github.com/EveDeck/EveDeck-Intel";

export type Download = {
  id: string;
  platform: string;
  title: string;
  file: string;
  href: string;
  size: string;
  sha256: string;
  requirement: string;
  detail: string;
  virusTotalUrl?: string;
  virusTotalSummary?: string;
  virusTotalClean?: boolean;
};

export const DOWNLOADS: Download[] = [
  {
    id: "daemon",
    platform: "Windows",
    title: "Intel daemon",
    file: `EveDeckIntel-daemon-${VERSION}-win-x64.zip`,
    href: `${BASE}/EveDeckIntel-daemon-${VERSION}-win-x64.zip`,
    size: "40 MB",
    sha256: "1517f08867ac281739623fde23a6541ca9881ba5fd5c7b12a955c04b0688225f",
    requirement: "Windows 10 or 11, 64-bit — ~150 MB RAM, near-idle CPU while running",
    detail:
      "Reads the chat logs and serves them to the tablet. Unzip and run — Java is bundled, so nothing has to be installed first.",
    virusTotalUrl: "https://www.virustotal.com/gui/file/1517f08867ac281739623fde23a6541ca9881ba5fd5c7b12a955c04b0688225f",
    virusTotalSummary: "pending scan",
    virusTotalClean: false
  },
  {
    id: "apk",
    platform: "Android",
    title: "Tablet app",
    file: `EveDeckIntel-${VERSION}.apk`,
    href: `${BASE}/EveDeckIntel-${VERSION}.apk`,
    size: "4.5 MB",
    sha256: "97d53f68c8d1560e3114576695f4f3163afeab46261c1c7dc2a71e148a4a04fe",
    requirement: "Android 8.0 or newer, tablet — ~170 MB RAM",
    detail:
      "The feed, the map and the alerts. Sideloaded, so Android asks once whether to allow installs from your browser.",
    virusTotalUrl: "https://www.virustotal.com/gui/file/97d53f68c8d1560e3114576695f4f3163afeab46261c1c7dc2a71e148a4a04fe",
    virusTotalSummary: "pending scan",
    virusTotalClean: false
  }
];
