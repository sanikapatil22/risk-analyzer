import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Camera, Eye, MapPin, Mail, Phone, Clock, User, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type Finding = { icon: any; label: string; value: string };

export default function Mirror() {
  const [img, setImg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [report, setReport] = useState<{ findings: Finding[]; pov: string; size: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    setName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImg(url);
      // fake "extraction" deterministic on filename
      const seed = [...f.name].reduce((a, c) => a + c.charCodeAt(0), 0);
      const findings: Finding[] = [];
      const possibleText = ["@gmail.com", "TechCorp ID #4421", "+1 415 555-0182", "MetaBank Statement"][seed % 4];
      findings.push({ icon: Eye, label: "Visible text", value: possibleText });
      findings.push({ icon: User, label: "Faces detected", value: `${(seed % 3) + 1}` });
      if (seed % 2) findings.push({ icon: MapPin, label: "GPS in EXIF", value: `37.77${seed%99},-122.41${seed%99}  (San Francisco)` });
      findings.push({ icon: Clock, label: "Timestamp", value: new Date(Date.now() - seed*60000).toLocaleString() });
      if (seed % 3) findings.push({ icon: Mail, label: "Possible email", value: `j.${f.name.split(".")[0].toLowerCase()}@gmail.com` });
      if (seed % 4) findings.push({ icon: Phone, label: "Possible phone", value: "+1 (415) 555-01" + (seed%99) });
      const pov = `Hi. I'm an attacker with internet access and 6 minutes.

From your photo I can already guess:
• You work somewhere near downtown SF (background skyline + office badge)
• Your morning coffee shop is in the same block
• Your full name is probably on LinkedIn under that workplace
• I have your phone number and a likely personal email
• I can send a 'HR document' as your boss within the hour

This wasn't a hack. You posted it.`;
      setReport({ findings, pov, size: (f.size/1024).toFixed(1) + " KB" });
    };
    reader.readAsDataURL(f);
  };

  const wipe = () => { setImg(null); setReport(null); setName(""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <>
      <PageHeader kicker="04 // Shared Mirror" accent="hot"
        title={<>What you posted. <span className="bg-foreground text-background px-2">What they see.</span></>}
        subtitle="Drop a selfie, screenshot, or document. We mirror back the attacker's view — then you delete it." />
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 grid lg:grid-cols-2 gap-6">
        <div>
          <label className="brutal-lg p-8 flex flex-col items-center justify-center min-h-[300px] cursor-pointer brutal-hover relative overflow-hidden bg-card">
            {img ? (
              <img src={img} alt="uploaded" className="max-h-[400px] object-contain" />
            ) : (
              <>
                <Camera className="w-12 h-12 mb-3" strokeWidth={3} />
                <div className="display text-2xl">UPLOAD AN IMAGE</div>
                <div className="mono text-xs opacity-60 mt-1">processed locally · auto-deleted</div>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          {img && (
            <button onClick={wipe} className="brutal-sm bg-danger text-danger-foreground px-4 py-2 mt-3 brutal-hover display flex items-center gap-2">
              <Trash2 className="w-4 h-4"/> WIPE NOW
            </button>
          )}
          {name && <div className="mono text-xs mt-2 opacity-70">{name} · {report?.size}</div>}
        </div>

        <div className="space-y-5">
          {!report && <div className="brutal p-8 text-center opacity-50 mono text-sm">drop something to see what leaks...</div>}
          {report && (
            <>
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="brutal p-5">
                <div className="display text-lg mb-3">EXTRACTED</div>
                <ul className="space-y-2">
                  {report.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 border-b border-foreground/20 pb-2">
                      <f.icon className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <div className="mono text-[11px] uppercase opacity-60">{f.label}</div>
                        <div className="font-bold text-sm">{f.value}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="brutal-lg p-5 bg-foreground text-background">
                <div className="display text-accent text-lg mb-3 glitch">ATTACKER POV</div>
                <pre className="whitespace-pre-wrap mono text-xs leading-relaxed">{report.pov}</pre>
              </motion.div>

              <div className="brutal p-5 bg-safe/30">
                <div className="display text-lg mb-3">PROTECT YOURSELF</div>
                <ul className="text-sm space-y-1.5">
                  <li>✂ Strip metadata before posting (most phones have a 'remove location' option in share menu)</li>
                  <li>🔲 Blur backgrounds, ID badges, screens, and street signs</li>
                  <li>🚫 Never post government IDs, boarding passes, or vaccine cards</li>
                  <li>📵 Turn off camera location: Settings → Camera → Location → Never</li>
                  <li>🪞 Re-check the mirror after editing — make sure the leaks are gone</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
