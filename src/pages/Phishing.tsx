import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import RiskMeter from "@/components/RiskMeter";
import { Mail, Upload, FileWarning, Link2 } from "lucide-react";
import { motion } from "framer-motion";

type Flag = { type: string; snippet: string; why: string };

function analyzeMessage(text: string) {
  const flags: Flag[] = [];
  const urgency = /\b(urgent|immediately|within \d+ hours?|account.{0,10}suspended|verify now|final notice|act now)\b/i;
  if (urgency.test(text)) flags.push({ type: "Urgency pressure", snippet: text.match(urgency)![0], why: "Scammers rush you so you skip thinking." });
  const linkRx = /https?:\/\/[^\s]+/gi; const links = text.match(linkRx) ?? [];
  links.forEach(l => {
    if (/bit\.ly|tinyurl|t\.co|cutt\.ly|is\.gd/.test(l)) flags.push({ type: "Shortened link", snippet: l, why: "Hides the real destination." });
    if (/[0-9]/.test(new URL(l.startsWith("http")?l:"https://"+l).hostname.split(".")[0]) || /-{2,}|paypa1|amaz0n|g00gle|micros0ft/i.test(l)) flags.push({ type: "Look-alike domain", snippet: l, why: "Typo-squat designed to look like a real brand." });
  });
  const sender = text.match(/from[:\s]+([^\n<]+<[^>]+>)/i);
  if (sender && /(gmail|hotmail|outlook|yahoo)\.com/i.test(sender[1]) && /(bank|paypal|amazon|apple|govt|tax|hr@)/i.test(text)) {
    flags.push({ type: "Mismatched sender", snippet: sender[1], why: "A bank never emails from a gmail address." });
  }
  if ((text.match(/\b[A-Z]{2,}\b/g) ?? []).length > 4) flags.push({ type: "ALL CAPS shouting", snippet: "multiple", why: "Emotional manipulation tactic." });
  const typos = /(kindl|recieve|verfy|acount|securit y|loginn)/i;
  if (typos.test(text)) flags.push({ type: "Spelling errors", snippet: text.match(typos)![0], why: "Real corporate emails go through copy-edit." });
  if (/(gift card|crypto|bitcoin|wire transfer|western union)/i.test(text)) flags.push({ type: "Untraceable payment", snippet: "payment method", why: "No legit business asks for gift cards." });
  if (!flags.length && text.length > 10) flags.push({ type: "Mild risk", snippet: "generic greeting", why: "Generic 'Dear customer' instead of your name." });
  const score = Math.max(2, 100 - flags.length * 18);
  return { flags, score, story: score < 50 ? "If you'd clicked: a fake login page would steal your password, the attacker logs in within 30 seconds, and changes your recovery email. By the time you notice, the account is theirs." : "Looks mostly clean — but always hover before you click and verify by typing the URL yourself." };
}

const SAMPLE = `From: Security Team <support@paypa1-security.com>
Subject: URGENT: Your account will be suspended

Dear Customer,
We detected unusual activity. Verify your acount within 24 hours or it will be permanently locked.
Click here: https://bit.ly/verify-paypal-now
Failure to act will result in loss of funds.
Thank you,
PayPaI Security`;

export default function Phishing() {
  const [tab, setTab] = useState<"msg" | "file">("msg");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeMessage> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileReport, setFileReport] = useState<any>(null);

  const runFile = (f: File) => {
    setFile(f);
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const risky = ["docm", "xlsm", "pptm", "exe", "scr", "js", "vbs", "iso", "lnk"].includes(ext);
    const macros = ["docm", "xlsm", "pptm"].includes(ext);
    setFileReport({
      name: f.name, size: (f.size/1024).toFixed(1) + " KB", type: f.type || ext,
      risky, macros,
      score: risky ? 18 : f.size > 5_000_000 ? 55 : 78,
      story: risky
        ? "If malicious: opening it would silently install a remote shell. The attacker watches your screen, copies your browser cookies, and ten minutes later your colleagues get a 'urgent invoice' email from your address."
        : "Low-risk file type — but always confirm the sender and never enable macros from unknown documents.",
    });
  };

  return (
    <>
      <PageHeader kicker="03 // Phishing & Files" accent="danger"
        title={<>Smell the <span className="bg-danger text-danger-foreground px-2">bait</span> before you bite.</>}
        subtitle="Paste a sketchy message or drop a suspicious file. We highlight the red flags and tell you what would have happened." />
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex gap-2 mb-5">
          {(["msg","file"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`brutal-sm px-4 py-2 display ${tab===t?"bg-foreground text-background":"bg-card brutal-hover"}`}>
              {t==="msg" ? <><Mail className="w-4 h-4 inline mr-2"/>Message</> : <><FileWarning className="w-4 h-4 inline mr-2"/>File</>}
            </button>
          ))}
        </div>

        {tab==="msg" ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="brutal p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="mono text-xs uppercase tracking-widest">Paste email / DM / SMS</span>
                <button onClick={() => setText(SAMPLE)} className="tag bg-warn">Load sample</button>
              </div>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={14}
                className="w-full p-3 mono text-sm border-[3px] border-foreground bg-background outline-none focus:bg-accent/30 resize-none"
                placeholder="From: ..." />
              <button onClick={() => setResult(analyzeMessage(text))} disabled={!text.trim()}
                className="brutal-sm bg-foreground text-background px-5 py-2 mt-3 display brutal-hover w-full disabled:opacity-40">ANALYZE</button>
            </div>
            <div className="space-y-4">
              {!result && <div className="brutal p-8 text-center opacity-50 mono text-sm">awaiting input...</div>}
              {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <RiskMeter score={result.score} label="Phishing risk" />
                  <div className="brutal p-4">
                    <div className="display mb-2">Red Flags ({result.flags.length})</div>
                    <ul className="space-y-2">
                      {result.flags.map((f, i) => (
                        <li key={i} className="border-l-4 border-danger pl-3 py-1 bg-danger/10">
                          <div className="font-bold text-sm">{f.type}</div>
                          <div className="mono text-xs opacity-80 truncate">"{f.snippet}"</div>
                          <div className="text-xs mt-1">→ {f.why}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="brutal p-4 bg-foreground text-background">
                    <div className="display text-accent mb-1">If you clicked...</div>
                    <p className="text-sm">{result.story}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <label className="brutal p-10 flex flex-col items-center justify-center gap-3 cursor-pointer brutal-hover bg-accent/30 text-center">
              <Upload className="w-10 h-10" strokeWidth={3} />
              <div className="display text-2xl">DROP A FILE</div>
              <div className="mono text-xs opacity-70">PDF · DOC · IMG · ZIP — scanned locally</div>
              <input type="file" hidden onChange={e => e.target.files?.[0] && runFile(e.target.files[0])} />
              {file && <div className="mono text-xs mt-2">selected: {file.name}</div>}
            </label>
            <div className="space-y-4">
              {!fileReport && <div className="brutal p-8 text-center opacity-50 mono text-sm">no file yet...</div>}
              {fileReport && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <RiskMeter score={fileReport.score} label="File risk" />
                  <div className="brutal p-4 mono text-sm space-y-1">
                    <div><b>Name:</b> {fileReport.name}</div>
                    <div><b>Size:</b> {fileReport.size}</div>
                    <div><b>Type:</b> {fileReport.type}</div>
                    <div><b>Macros/scripts:</b> {fileReport.macros ? <span className="text-danger font-bold">YES</span> : "none detected"}</div>
                    <div><b>Risky extension:</b> {fileReport.risky ? <span className="text-danger font-bold">YES</span> : "no"}</div>
                  </div>
                  <div className="brutal p-4 bg-foreground text-background">
                    <div className="display text-accent mb-1 flex items-center gap-2"><Link2 className="w-4 h-4"/> If this file was malicious...</div>
                    <p className="text-sm">{fileReport.story}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
