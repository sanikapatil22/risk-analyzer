import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { analyze, type SiteReport } from "@/lib/analyze";
import { Plus, X, GitCompare } from "lucide-react";
import { motion } from "framer-motion";

function verdictLine(r: SiteReport) {
  if (r.score >= 75) return "Solid. Reading, browsing, even shopping should be fine.";
  if (r.score >= 50) return "Okay for reading. Think twice before payments or accounts.";
  if (r.score >= 30) return "Shaky. Don't reuse a password here.";
  return "Avoid logging in. Cookie + exposure risk is high.";
}

export default function Compare() {
  const [urls, setUrls] = useState<string[]>(["github.com", "myshoppingdeals.shop"]);
  const [reports, setReports] = useState<SiteReport[] | null>(null);

  const run = () => setReports(urls.filter(u => u.trim()).map(u => analyze(u)));

  const subBars = (r: SiteReport) => {
    const headers = Math.round((Object.values(r.headers).filter(Boolean).length / 5) * 100);
    const tls = r.ssl.valid ? 90 : 20;
    const cookies = Math.round((r.cookies.filter(c => c.secure && c.httpOnly).length / r.cookies.length) * 100);
    const exposure = Math.max(10, 100 - r.trackers.length * 18);
    return { Headers: headers, TLS: tls, Cookies: cookies, Exposure: exposure };
  };

  return (
    <>
      <PageHeader kicker="02 // Compare" accent="hot"
        title={<>Two sites enter. <span className="bg-hot text-hot-foreground px-2">One is safer.</span></>}
        subtitle="Stack 2–3 URLs side by side and see which one earns your password." />
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <div className="brutal-lg p-5 space-y-3">
          {urls.map((u, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="display text-2xl w-8">{String.fromCharCode(65+i)}</span>
              <input value={u} onChange={e => setUrls(urls.map((x, j) => j===i ? e.target.value : x))}
                placeholder="domain.com"
                className="flex-1 px-3 py-2 mono border-[3px] border-foreground bg-background outline-none focus:bg-accent" />
              {urls.length > 2 && (
                <button onClick={() => setUrls(urls.filter((_, j) => j !== i))} className="brutal-sm p-2 brutal-hover bg-danger text-danger-foreground"><X className="w-4 h-4"/></button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            {urls.length < 3 && (
              <button onClick={() => setUrls([...urls, ""])} className="brutal-sm px-3 py-2 brutal-hover flex items-center gap-1 text-sm font-bold"><Plus className="w-4 h-4"/> Add site</button>
            )}
            <button onClick={run} className="brutal-sm bg-foreground text-background px-5 py-2 brutal-hover ml-auto display flex items-center gap-2"><GitCompare className="w-4 h-4"/> COMPARE</button>
          </div>
        </div>

        {reports && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((r, i) => {
              const bars = subBars(r);
              const color = r.score >= 75 ? "safe" : r.score >= 50 ? "warn" : r.score >= 30 ? "hot" : "danger";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }}
                  className="brutal-lg p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="display text-3xl">{String.fromCharCode(65+i)}</span>
                    <span className={`tag bg-${color} ${color==="danger"?"text-danger-foreground":""}`}>{r.score}/100</span>
                  </div>
                  <div className="mono text-sm font-bold mt-1 truncate">{r.domain}</div>
                  <div className="mt-4 space-y-2">
                    {Object.entries(bars).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between mono text-[11px] uppercase tracking-wider"><span>{k}</span><span>{v}</span></div>
                        <div className="h-2 border-2 border-foreground bg-background"><div className={`h-full bg-${v>=70?"safe":v>=40?"warn":"danger"}`} style={{ width: `${v}%`}}/></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 border-[3px] border-foreground bg-accent text-sm font-bold">
                    "{verdictLine(r)}"
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
