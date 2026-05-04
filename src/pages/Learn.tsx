import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { KeyRound, Smartphone, Fish, Download, Globe2, Lock, Wifi, ChevronRight, PlayCircle } from "lucide-react";

type Topic = {
  id: string; icon: any; title: string; tagline: string; color: string;
  body: string; tips: string[]; storyId?: string;
};

const TOPICS: Topic[] = [
  { id: "passwords", icon: KeyRound, title: "Passwords", tagline: "Long > complex.", color: "accent",
    body: "A 20-character passphrase ('purple-tractor-eats-thursday') is harder to crack than 'P@ssw0rd!'. Use a manager so you don't have to remember any of them.",
    tips: ["Use a password manager (Bitwarden, 1Password, Apple Keychain).", "Never reuse the same password across sites.", "Replace passwords with passkeys when offered."] },
  { id: "2fa", icon: Smartphone, title: "Two-Factor (2FA)", tagline: "Adds a second lock.", color: "cyber",
    body: "If your password leaks, 2FA stops the attacker at the door. App-based codes (Authy, Google Authenticator) beat SMS codes — SIM-swap attacks make SMS unsafe.",
    tips: ["Prefer app codes over SMS.", "Save backup codes offline.", "Use a hardware key (YubiKey) for high-value accounts."], storyId: "bank" },
  { id: "phish", icon: Fish, title: "Phishing", tagline: "Slow down. Read the URL.", color: "danger",
    body: "Phishing works on emotion: urgency, fear, greed. The cure is friction — pause, read the domain, verify out-of-band.",
    tips: ["Hover before you click.", "Type bank/Insta URLs yourself.", "Forward suspicious SMS to 7726."], storyId: "dm" },
  { id: "downloads", icon: Download, title: "Safe Downloads", tagline: "Only from the source.", color: "warn",
    body: "Pirated installers and 'free PDF tools' are the #1 ransomware vector. Stick to official sites or app stores.",
    tips: ["Never enable macros in Office docs from strangers.", "Avoid .exe/.scr from email.", "Verify SHA hashes for sensitive downloads."], storyId: "ransom" },
  { id: "browser", icon: Globe2, title: "Browser Hygiene", tagline: "Less plugins, more privacy.", color: "hot",
    body: "Each extension is a tiny program with read-access to every page. One bad update can steal everything.",
    tips: ["Audit extensions monthly.", "Use uBlock Origin.", "Use a separate browser profile for banking."] },
  { id: "wifi", icon: Wifi, title: "Public Wi-Fi", tagline: "Treat it like a public toilet.", color: "cyber",
    body: "On open Wi-Fi, anyone on the same network can attempt MITM attacks. Use cellular or a trusted VPN.",
    tips: ["Avoid logins on open Wi-Fi.", "Verify the SSID with staff.", "Turn off auto-join for unknown networks."], storyId: "qr" },
  { id: "encryption", icon: Lock, title: "What is Encryption?", tagline: "A locked box only the receiver opens.", color: "safe",
    body: "End-to-end encryption (Signal, WhatsApp) means even the company can't read your messages. HTTPS does the same for web traffic.",
    tips: ["Look for the padlock + correct domain.", "Prefer Signal for sensitive chats.", "Encrypt your laptop disk (FileVault, BitLocker)."] },
];

export default function Learn() {
  const [open, setOpen] = useState<string | null>(null);
  const nav = useNavigate();
  return (
    <>
      <PageHeader kicker="06 // Learn Security" accent="cyber"
        title={<>30 seconds. <span className="bg-cyber px-2">One habit.</span> Less risk.</>}
        subtitle="Tiny lessons tied directly to attacks you just lived through. Read one, then go test it." />
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOPICS.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }}
            className="brutal-lg bg-card overflow-hidden">
            <button onClick={() => setOpen(open === t.id ? null : t.id)}
              className={`w-full p-5 text-left flex items-start gap-3 hover:bg-${t.color}/30 transition-colors`}>
              <div className={`w-12 h-12 bg-${t.color} border-[3px] border-foreground flex items-center justify-center shrink-0`}>
                <t.icon className="w-6 h-6" strokeWidth={3}/>
              </div>
              <div className="flex-1">
                <div className="display text-xl">{t.title}</div>
                <div className="mono text-xs opacity-70">{t.tagline}</div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${open === t.id ? "rotate-90" : ""}`}/>
            </button>
            <AnimatePresence>
              {open === t.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t-[3px] border-foreground">
                  <div className="p-5 space-y-3 text-sm">
                    <p>{t.body}</p>
                    <ul className="space-y-1">
                      {t.tips.map((tip, j) => <li key={j} className="flex gap-2"><span className="text-hot font-bold">▸</span> {tip}</li>)}
                    </ul>
                    {t.storyId && (
                      <button onClick={() => nav(`/stories/${t.storyId}`)}
                        className="brutal-sm bg-foreground text-background px-4 py-2 brutal-hover display flex items-center gap-2 mt-2">
                        <PlayCircle className="w-4 h-4"/> TRY A STORY ABOUT THIS
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </section>
    </>
  );
}
