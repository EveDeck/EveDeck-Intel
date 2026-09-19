/**
 * The published release, in one place.
 *
 * Three pages quote the version, the file names and the sizes, and a release that updates two of
 * them is worse than one that updates none -- a download page disagreeing with itself is the kind
 * of thing that makes people assume the binary is wrong too.
 */
export const RELEASE_TAG = "intel-v0.3.0";
export const VERSION = "0.3.0";

/**
 * Bullets for this version, read by /api/version so the daemon and the tablet app can show what
 * changed -- update this alongside VERSION on every release, same source the GitHub release notes
 * came from.
 */
export const CHANGELOG: string[] = [
  "The tablet app is now a thin native shell around the same web feed the daemon serves over LAN, instead of a separate hand-built UI -- one interface to keep in sync instead of two, about 10 MB smaller, and it inherits web-feed improvements without needing a new APK.",
  "Fixed the screen timing out on both the web feed and the tablet app: the browser's Wake Lock API silently does nothing over plain LAN http (it needs a secure origin), so the web feed now falls back to a technique that works regardless, and the tablet app holds the screen on natively.",
  "The web feed can now go fullscreen/borderless for use as a dedicated panel display -- a button (or double-tap) hides the browser chrome, and it's installable via 'Add to Home Screen'.",
  "Fixed hostile alerts going silent mid-burst: posting one notification per message could hit the platform's notification rate limit during a busy report, after which further alerts vanished with no error. Alerts now coalesce into a summary instead of spamming one per line.",
  "The parser now recognises systems typed as bare-letter shorthand (dropping the usual digit/hyphen), matched against the channel's own region scope, on top of the digit/hyphen abbreviations it already understood."
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
    sha256: "735f556cf1b6684c1b731aec69ef6cacaadb72f0c1c0f04e1902f19f84dd5f7d",
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
    size: "4.5 MB",
    sha256: "9374547e5687b0ead4de8f90594cab3d7b70adea454c1c89240e9053f0e830b5",
    requirement: "Android 8.0 or newer, tablet — ~170 MB RAM",
    detail:
      "The feed, the map and the alerts. Sideloaded, so Android asks once whether to allow installs from your browser."
  }
];
