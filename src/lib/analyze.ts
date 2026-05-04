// Deterministic fake analysis — same input → same output. Pure client-side demo.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
function pick<T>(seed: number, arr: T[]): T { return arr[seed % arr.length]; }

const STACKS = [
  ["Next.js 14", "Vercel Edge", "Cloudflare", "Stripe.js"],
  ["WordPress 6.2", "PHP 7.4", "jQuery 1.12", "Google Tag Manager"],
  ["React 18", "Nginx", "AWS CloudFront", "Segment", "HotJar"],
  ["Shopify", "Liquid", "Klaviyo", "Meta Pixel", "TikTok Pixel"],
];
const TRACKERS = [
  ["Google Analytics", "Meta Pixel", "TikTok Pixel"],
  ["HotJar", "Mixpanel"],
  ["Segment", "Intercom", "Google Ads"],
  ["LinkedIn Insight", "Pinterest Tag", "Snap Pixel", "X Pixel"],
];

export type Issue = {
  id: string;
  severity: "low" | "med" | "high" | "crit";
  title: string;
  means: string;
  abuse: string;
  fixDev: string;
  fixUser: string;
};

const ISSUE_POOL: Issue[] = [
  {
    id: "csp",
    severity: "high",
    title: "No Content-Security-Policy header",
    means: "The site doesn't tell browsers which scripts are allowed to run.",
    abuse: "An attacker who injects script can run anything — steal your cookies, log keystrokes, swap the login form.",
    fixDev: "Set a strict CSP: `default-src 'self'; script-src 'self' 'nonce-...';`",
    fixUser: "Avoid logging in or paying on this site from a shared device.",
  },
  {
    id: "hsts",
    severity: "med",
    title: "Missing Strict-Transport-Security",
    means: "Your browser isn't forced to use HTTPS — first visit can be downgraded to HTTP.",
    abuse: "On public Wi-Fi an attacker can intercept the first request and read everything you type.",
    fixDev: "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.",
    fixUser: "Type the full https:// URL yourself, never click sketchy links to this site on café Wi-Fi.",
  },
  {
    id: "mixed",
    severity: "med",
    title: "Mixed content (http:// images)",
    means: "Page is HTTPS but loads some assets over plain HTTP.",
    abuse: "Lets an attacker swap an image for a phishing overlay or inject tracking.",
    fixDev: "Migrate every asset URL to https:// or use protocol-relative URLs.",
    fixUser: "Don't trust the green padlock here — it's only half-true.",
  },
  {
    id: "cookie",
    severity: "high",
    title: "Session cookies missing Secure / HttpOnly / SameSite",
    means: "Your login cookie can be read by any script on the page and sent over HTTP.",
    abuse: "Classic session hijack — attacker logs in as you without your password.",
    fixDev: "Set `Secure; HttpOnly; SameSite=Lax` on every session cookie.",
    fixUser: "Log out manually after using this site, especially on shared computers.",
  },
  {
    id: "trackers",
    severity: "low",
    title: "12+ third-party trackers on every page",
    means: "Your every click is shipped to ad networks within milliseconds.",
    abuse: "Builds a behavioral profile sold across data brokers — used for scam targeting.",
    fixDev: "Switch to first-party analytics; honor Do-Not-Track.",
    fixUser: "Use a tracker-blocker (uBlock Origin) and reject all cookies.",
  },
  {
    id: "api",
    severity: "crit",
    title: "Public API endpoint leaks user emails",
    means: "An open URL returns customer data without authentication.",
    abuse: "Anyone can scrape the customer list, then phish or credential-stuff them.",
    fixDev: "Require auth + rate limit. Audit every `/api/*` route.",
    fixUser: "If you've ever signed up here, watch for fake password-reset emails this month.",
  },
  {
    id: "xfo",
    severity: "low",
    title: "No X-Frame-Options / frame-ancestors",
    means: "The page can be embedded inside another site invisibly.",
    abuse: "Clickjacking — you 'click a kitten' and actually approve a payment.",
    fixDev: "Set `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`.",
    fixUser: "Be suspicious of pop-up windows that overlay this site.",
  },
];

export type SiteReport = {
  url: string;
  domain: string;
  ip: string;
  score: number;
  ssl: { valid: boolean; issuer: string; expires: string };
  stack: string[];
  trackers: string[];
  cookies: { name: string; secure: boolean; httpOnly: boolean }[];
  headers: Record<string, string | null>;
  issues: Issue[];
  timeline: { when: string; what: string; tone: "info" | "warn" | "bad" }[];
};

export function analyze(rawUrl: string): SiteReport {
  let url = rawUrl.trim();
  if (!/^https?:\/\//.test(url)) url = "https://" + url;
  let domain = url;
  try { domain = new URL(url).hostname; } catch {}
  const seed = hash(domain);
  const stack = pick(seed, STACKS);
  const trackers = pick(seed >> 3, TRACKERS);

  const issues = ISSUE_POOL.filter((_, i) => ((seed >> i) & 1) === 1).slice(0, 5);
  if (issues.length === 0) issues.push(ISSUE_POOL[0]);

  const sevWeight = { low: 4, med: 9, high: 18, crit: 30 };
  const penalty = issues.reduce((a, i) => a + sevWeight[i.severity], 0);
  const score = Math.max(8, Math.min(98, 100 - penalty - (trackers.length * 2)));

  const ip = `${(seed % 223) + 1}.${(seed >> 4) % 255}.${(seed >> 8) % 255}.${(seed >> 12) % 255}`;

  return {
    url, domain, ip, score, stack, trackers,
    ssl: {
      valid: (seed & 7) !== 0,
      issuer: pick(seed, ["Let's Encrypt", "Cloudflare Inc.", "DigiCert", "Sectigo"]),
      expires: new Date(Date.now() + ((seed % 300) - 30) * 86400000).toISOString().slice(0, 10),
    },
    cookies: [
      { name: "session_id", secure: !(seed & 2), httpOnly: !(seed & 4) },
      { name: "_ga", secure: true, httpOnly: false },
      { name: "ads_pref", secure: false, httpOnly: false },
    ],
    headers: {
      "Strict-Transport-Security": (seed & 2) ? "max-age=31536000" : null,
      "Content-Security-Policy": (seed & 1) ? null : "default-src 'self'",
      "X-Frame-Options": (seed & 8) ? "DENY" : null,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": (seed & 16) ? "strict-origin-when-cross-origin" : null,
    },
    issues,
    timeline: [
      { when: "0s — page load", what: `${trackers.length} trackers fingerprint your browser, fonts, and timezone.`, tone: "info" },
      { when: "5 min", what: "Your visit shows up in 3 ad-network bid requests. Retargeting starts.", tone: "info" },
      { when: "24 hr", what: score < 50 ? "If a session cookie leaked, an attacker is already logged in as you." : "Behavioral profile updated across data brokers.", tone: score < 50 ? "bad" : "warn" },
      { when: "1 week", what: score < 40 ? "Your email + interests appear in a phishing campaign tailored to you." : "You start seeing oddly specific ads on unrelated sites.", tone: score < 40 ? "bad" : "warn" },
    ],
  };
}

export function severityColor(s: Issue["severity"]) {
  return s === "crit" ? "bg-danger text-danger-foreground"
    : s === "high" ? "bg-hot text-hot-foreground"
    : s === "med" ? "bg-warn text-warn-foreground"
    : "bg-muted";
}
