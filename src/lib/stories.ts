export type StoryNode = {
  id: string;
  speaker?: string;
  text: string;
  ending?: "win" | "lose" | "neutral";
  debrief?: { redFlags: string[]; safeAction: string; tech: string };
  choices?: { label: string; next: string; bad?: boolean }[];
};

export type Story = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  start: string;
  nodes: Record<string, StoryNode>;
};

export const STORIES: Story[] = [
  {
    id: "bank",
    title: "Fake Bank Login",
    emoji: "🏦",
    blurb: "An SMS from 'your bank' at 11pm.",
    start: "n1",
    nodes: {
      n1: { speaker: "SMS · BANK-Alert", text: "Unusual login from Russia. Verify within 30 min or account locked: https://yourbnk-secure.co/login",
        choices: [
          { label: "Tap the link", next: "n2", bad: true },
          { label: "Open the official bank app instead", next: "win1" },
          { label: "Call the number on my card", next: "win1" },
        ]},
      n2: { speaker: "PAGE", text: "Site looks identical to your bank. It asks for username, password, then SMS code.",
        choices: [
          { label: "Enter all three", next: "lose1", bad: true },
          { label: "Notice 'yourbnk' in the URL and close", next: "win2" },
        ]},
      lose1: { text: "30 seconds later, the attacker logs in and wires $4,200 to a mule account.", ending: "lose",
        debrief: { redFlags: ["Urgency ('30 min')", "Look-alike URL: yourbnk vs yourbank", "SMS asks you to log in via link"], safeAction: "Banks never ask you to log in via SMS link. Always open the app yourself.", tech: "Credential phishing → real-time relay attack (attacker uses your code while you type it)." }},
      win1: { text: "The bank app shows zero alerts. The SMS was a fake. You report it as spam.", ending: "win",
        debrief: { redFlags: ["Unsolicited SMS", "External link"], safeAction: "Verify out-of-band: open the official app, or call the number printed on your physical card.", tech: "Smishing — SMS-based phishing. Most banks publish a number to forward suspicious texts to (e.g., 7726)." }},
      win2: { text: "Tab closed. You change your password from the real app, just in case.", ending: "win",
        debrief: { redFlags: ["URL typo-squat"], safeAction: "Read the domain before typing anything.", tech: "Domain spoofing — visually similar characters fool the eye." }},
    },
  },
  {
    id: "ransom",
    title: "Ransomware in the Lab",
    emoji: "💻",
    blurb: "A 'urgent_assignment.docm' on a shared drive.",
    start: "n1",
    nodes: {
      n1: { speaker: "Lab PC", text: "You find 'urgent_assignment.docm' shared by 'Prof. Allen' on the lab drive. Word warns: Macros disabled.",
        choices: [
          { label: "Click 'Enable Content'", next: "n2", bad: true },
          { label: "Email the prof to confirm", next: "win" },
          { label: "Open it in Google Docs viewer instead", next: "win" },
        ]},
      n2: { speaker: "Word", text: "Document looks blank. PC fan spins up. Two minutes later, every file becomes .locked and a red wallpaper demands $800 in BTC.", ending: "lose",
        debrief: { redFlags: [".docm extension (macro-enabled)", "Generic filename", "Asks to enable macros"], safeAction: "Never enable macros from unverified files. Use a sandboxed viewer.", tech: "Macro dropper → ransomware payload encrypts files with AES, asks for crypto ransom." }},
      win: { text: "Prof. Allen replies: 'I didn't share that.' You report it to IT. Disaster averted.", ending: "win",
        debrief: { redFlags: ["Unexpected file", "Macro request"], safeAction: "Confirm files via a different channel (email, in person).", tech: "Social engineering via shared infrastructure." }},
    },
  },
  {
    id: "dm",
    title: "Instagram DM",
    emoji: "📱",
    blurb: "'Your account violates community guidelines.'",
    start: "n1",
    nodes: {
      n1: { speaker: "@meta_appeal_team", text: "Your account is scheduled for deletion in 24h. Appeal here: linktr.ee/meta-appeal-form",
        choices: [
          { label: "Open link & log in to appeal", next: "lose", bad: true },
          { label: "Check Settings → Help inside the app", next: "win" },
        ]},
      lose: { text: "Your password and 2FA backup codes are captured. The account is taken over and used to phish your followers.", ending: "lose",
        debrief: { redFlags: ["Random handle pretending to be Meta", "Linktree (not meta.com) hosting the form", "Threat of account loss"], safeAction: "Meta only contacts you inside the app under Settings → Notifications → Security.", tech: "Credential + 2FA phish. Backup codes bypass 2FA permanently — rotate them after any leak." }},
      win: { text: "There's no warning in the official Help center. The DM was fake. You block & report.", ending: "win",
        debrief: { redFlags: ["Off-platform link"], safeAction: "Trust only in-app official notices.", tech: "Brand impersonation phishing." }},
    },
  },
  {
    id: "qr",
    title: "QR Code at the Café",
    emoji: "📷",
    blurb: "A taped-on QR offers free Wi-Fi.",
    start: "n1",
    nodes: {
      n1: { speaker: "Sticker on table", text: "'Free Wi-Fi — scan to connect'. The QR is on a printed sticker over the original menu QR.",
        choices: [
          { label: "Scan and tap 'Connect'", next: "n2", bad: true },
          { label: "Ask the barista for the real Wi-Fi", next: "win" },
        ]},
      n2: { speaker: "Phone", text: "It opens a portal asking for your Apple ID to 'verify identity'.",
        choices: [
          { label: "Sign in", next: "lose", bad: true },
          { label: "Close — Apple never asks like this", next: "win" },
        ]},
      lose: { text: "Your Apple ID is hijacked. Find My is used to lock your devices and demand ransom.", ending: "lose",
        debrief: { redFlags: ["QR sticker over original", "Apple sign-in on a Wi-Fi portal", "Sticker physically suspicious"], safeAction: "Wi-Fi never needs your Apple ID. Use cellular if uncertain.", tech: "Quishing (QR phishing) → captive-portal credential theft." }},
      win: { text: "Real network name is 'CafeMocha-Guest'. The sticker was a scam aimed at tourists.", ending: "win",
        debrief: { redFlags: ["Suspicious physical placement"], safeAction: "Always verify Wi-Fi name with staff.", tech: "Physical/social hybrid attack." }},
    },
  },
];
