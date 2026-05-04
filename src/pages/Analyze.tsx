import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import RiskMeter from "@/components/RiskMeter";
import { analyze, severityColor, type SiteReport } from "@/lib/analyze";
import { Search, Globe, Server, Lock, Cookie, Code2, Zap, ChevronDown, AlertTriangle, Clock } from "lucide-react";

const SAMPLES = ["nytimes.com", "myshoppingdeals.shop", "bank-of-meta.io"];

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<SiteReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [openIssue, setOpenIssue] = useState<string | null>(null);

  const run = (u: string) => {
    if (!u.trim()) return;
    setUrl(u); setScanning(true); setReport(null);
    setTimeout(() => { setReport(analyze(u)); setScanning(false); }, 900);
  };

  return (
    <>
      <PageHeader
        kicker="01 // Analyze"
        title={<>You see a  <span className="bg-accent px-2">website.</span> They see a  <span className="bg-accent px-2">target.</span> </>}
        subtitle="Paste any URL. We mirror back its tech stack, headers, cookies, trackers, and what could go wrong in the next week."
      />

      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <form onSubmit={(e) => { e.preventDefault(); run(url); }} className="brutal-lg p-2 flex flex-col md:flex-row gap-2 bg-card">
          <div className="flex items-center gap-2 px-3 mono text-sm border-r-0 md:border-r-[3px] border-foreground">
            <Globe className="w-5 h-5" /> https://
          </div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com"
            className="flex-1 px-4 py-3 bg-transparent outline-none text-lg mono placeholder:opacity-40"
          />
          <button type="submit" className="brutal-hover bg-foreground text-background px-6 py-3 display text-lg flex items-center gap-2 justify-center">
            <Search className="w-5 h-5" strokeWidth={3} /> SCAN
          </button>
        </form>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className="mono text-xs uppercase opacity-60">Try:</span>
          {SAMPLES.map(s => (
            <button key={s} onClick={() => run(s)} className="tag bg-muted hover:bg-accent">{s}</button>
          ))}
        </div>

        <AnimatePresence>
          {scanning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-8 brutal-lg p-8 bg-foreground text-background relative overflow-hidden scanline">
              <div className="mono text-sm space-y-1">
                <div>$ resolving DNS...</div>
                <div>$ fetching headers...</div>
                <div>$ enumerating cookies & trackers...</div>
                <div>$ scoring exposure<span className="animate-blink">_</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <RiskMeter score={report.score} label={report.domain} />
              <div className="brutal p-5 space-y-3">
                <div className="display text-lg flex items-center gap-2"><Server className="w-5 h-5"/> Identity</div>
                <Row k="Domain" v={report.domain} />
                <Row k="IP" v={report.ip} />
                <Row k="SSL" v={`${report.ssl.valid ? "✓ valid" : "✗ broken"} · ${report.ssl.issuer}`} />
                <Row k="Expires" v={report.ssl.expires} />
              </div>
              <div className="brutal p-5">
                <div className="display text-lg flex items-center gap-2 mb-3"><Code2 className="w-5 h-5"/> Tech Stack</div>
                <div className="flex flex-wrap gap-2">{report.stack.map(t => <span key={t} className="tag bg-cyber">{t}</span>)}</div>
              </div>
              <div className="brutal p-5">
                <div className="display text-lg flex items-center gap-2 mb-3"><Zap className="w-5 h-5"/> Trackers ({report.trackers.length})</div>
                <div className="flex flex-wrap gap-2">{report.trackers.map(t => <span key={t} className="tag bg-hot">{t}</span>)}</div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="brutal p-5">
                <div className="display text-lg flex items-center gap-2 mb-3"><Lock className="w-5 h-5"/> Security Headers</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {Object.entries(report.headers).map(([k, v]) => (
                    <div key={k} className={`p-2 border-2 border-foreground mono text-xs ${v ? "bg-safe/30" : "bg-danger/20"}`}>
                      <div className="font-bold">{k}</div>
                      <div className="opacity-80">{v ?? "✗ missing"}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="brutal p-5">
                <div className="display text-lg flex items-center gap-2 mb-3"><Cookie className="w-5 h-5"/> Cookies</div>
                <table className="w-full mono text-sm">
                  <thead><tr className="border-b-2 border-foreground"><th className="text-left py-1">Name</th><th>Secure</th><th>HttpOnly</th></tr></thead>
                  <tbody>{report.cookies.map(c => (
                    <tr key={c.name} className="border-b border-foreground/20"><td className="py-1">{c.name}</td>
                      <td className="text-center">{c.secure ? "✓" : <span className="text-danger font-bold">✗</span>}</td>
                      <td className="text-center">{c.httpOnly ? "✓" : <span className="text-danger font-bold">✗</span>}</td>
                    </tr>))}
                  </tbody>
                </table>
              </div>

              <div className="brutal p-5">
                <div className="display text-lg flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5"/> Issues ({report.issues.length})</div>
                <div className="space-y-2">
                  {report.issues.map(i => (
                    <div key={i.id} className="border-[3px] border-foreground">
                      <button onClick={() => setOpenIssue(openIssue === i.id ? null : i.id)}
                        className="w-full p-3 flex items-center gap-3 text-left hover:bg-accent">
                        <span className={`tag ${severityColor(i.severity)}`}>{i.severity}</span>
                        <span className="font-bold flex-1">{i.title}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${openIssue === i.id ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {openIssue === i.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t-[3px] border-foreground">
                            <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
                              <Block label="What it means" body={i.means} />
                              <Block label="How an attacker abuses it" body={i.abuse} accent="danger" />
                              <Block label="Fix (devs)" body={i.fixDev} accent="cyber" mono />
                              <Block label="Fix (normal users)" body={i.fixUser} accent="safe" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className="brutal p-5 bg-foreground text-background">
                <div className="display text-lg flex items-center gap-2 mb-4 text-accent"><Clock className="w-5 h-5"/> If you visit this site...</div>
                <ol className="space-y-3">
                  {report.timeline.map((t, i) => (
                    <li key={i} className="flex gap-3 mono text-sm">
                      <span className="display text-2xl text-accent w-12 shrink-0">{i+1}</span>
                      <div>
                        <div className="text-accent uppercase text-xs tracking-widest">{t.when}</div>
                        <div className="opacity-90">{t.what}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between mono text-sm border-b border-foreground/20 pb-1">
    <span className="opacity-60">{k}</span><span className="font-bold">{v}</span>
  </div>
);
const Block = ({ label, body, accent, mono }: { label: string; body: string; accent?: string; mono?: boolean }) => (
  <div className={`p-3 border-2 border-foreground ${accent ? `bg-${accent}/20` : "bg-muted"}`}>
    <div className="text-[10px] uppercase tracking-widest font-bold mb-1">{label}</div>
    <div className={mono ? "mono text-xs" : ""}>{body}</div>
  </div>
);
