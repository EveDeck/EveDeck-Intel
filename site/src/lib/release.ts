/**
 * The published release, in one place.
 *
 * Three pages quote the version, the file names and the sizes, and a release that updates two of
 * them is worse than one that updates none -- a download page disagreeing with itself is the kind
 * of thing that makes people assume the binary is wrong too.
 */
export const RELEASE_TAG = "intel-v0.2.0";
export const VERSION = "0.2.0";

/**
 * Bullets for this version, read by /api/version so the daemon and the tablet app can show what
 * changed -- update this alongside VERSION on every release, same source the GitHub release notes
 * came from.
 */
export const CHANGELOG: string[] = [
  "Added a LAN web feed for anything that isn't Android -- open the daemon's own address in Safari or any browser and it mirrors the tablet app: same Intel/Map/Settings layout, ship icons, portraits, jump-distance badges and region-scoped map, installable via 'Add to Home Screen' with no App Store and no account.",
  "Region scope is now detected automatically per channel, straight from that channel's own MOTD, instead of one hand-typed list shared by every channel -- fixes abbreviations occasionally resolving to the wrong system or not at all when a channel's actual regions weren't in the old list.",
  "Fixed the daemon's Settings window showing a stale channel selection after the tablet changed it."
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
};

export const DOWNLOADS: Download[] = [
  {
    id: "daemon",
    platform: "Windows",
    title: "Intel daemon",
    file: `EveDeckIntel-daemon-${VERSION}-win-x64.zip`,
    href: `${BASE}/EveDeckIntel-daemon-${VERSION}-win-x64.zip`,
    size: "40 MB",
    sha256: "77ba7d5eed9bc0b8e91127f1454c4b6592197711cd44d1f6bfb5e561df3736c3",
    requirement: "Windows 10 or 11, 64-bit — ~150 MB RAM, near-idle CPU while running",
    detail:
      "Reads the chat logs and serves them to the tablet. Unzip and run — Java is bundled, so nothing has to be installed first."
  },
  {
    id: "apk",
    platform: "Android",
    title: "Tablet app",
    file: `EveDeckIntel-${VERSION}.apk`,
    href: `${BASE}/EveDeckIntel-${VERSION}.apk`,
    size: "15 MB",
    sha256: "58733666b49732c6bb61ebd1defd8c0e1c4e4bb71d795bc49c8dc8cf1b60c642",
    requirement: "Android 8.0 or newer, tablet — ~170 MB RAM",
    detail:
      "The feed, the map and the alerts. Sideloaded, so Android asks once whether to allow installs from your browser."
  }
];
