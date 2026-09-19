/**
 * The published release, in one place.
 *
 * Three pages quote the version, the file names and the sizes, and a release that updates two of
 * them is worse than one that updates none -- a download page disagreeing with itself is the kind
 * of thing that makes people assume the binary is wrong too.
 */
export const RELEASE_TAG = "intel-v0.3.1";
export const VERSION = "0.3.1";

/**
 * Bullets for this version, read by /api/version so the daemon and the tablet app can show what
 * changed -- update this alongside VERSION on every release, same source the GitHub release notes
 * came from.
 */
export const CHANGELOG: string[] = [
  "dscan.info and adashboard.info links pasted into intel channels are now clickable in the feed, on both the web client and the tablet app, instead of sitting there as inert text.",
  "Fixed a parser bug where a pilot's own name could get shredded if part of it happened to match ship shorthand (a name starting with a word like 'mega' could lose that word to a phantom Megathron and leave the rest as a mangled fragment) -- names are now correctly kept whole in that case, while genuine multi-entity lines (a system followed by a ship, a ship followed by a count) still parse exactly as before."
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
    sha256: "d2d6cb948a7f54e762852dfc25101dcacb0e0add430d1f300bb995a60563fcee",
    requirement: "Windows 10 or 11, 64-bit — ~150 MB RAM, near-idle CPU while running",
    detail:
      "Reads the chat logs and serves them to the tablet. Unzip and run — Java is bundled, so nothing has to be installed first.",
    virusTotalUrl: "https://www.virustotal.com/gui/file/d2d6cb948a7f54e762852dfc25101dcacb0e0add430d1f300bb995a60563fcee",
    virusTotalSummary: "0/74 flagged",
    virusTotalClean: true
  },
  {
    id: "apk",
    platform: "Android",
    title: "Tablet app",
    file: `EveDeckIntel-${VERSION}.apk`,
    href: `${BASE}/EveDeckIntel-${VERSION}.apk`,
    size: "4.5 MB",
    sha256: "101106de86b918fd95cf7e553297078aa95f357b807182bc94ee08afb026ce7a",
    requirement: "Android 8.0 or newer, tablet — ~170 MB RAM",
    detail:
      "The feed, the map and the alerts. Sideloaded, so Android asks once whether to allow installs from your browser.",
    virusTotalUrl: "https://www.virustotal.com/gui/file/101106de86b918fd95cf7e553297078aa95f357b807182bc94ee08afb026ce7a",
    virusTotalSummary: "0/74 flagged",
    virusTotalClean: true
  }
];
