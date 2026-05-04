import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Camera, Eye, MapPin, Mail, Phone, Clock, User, Trash2, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Finding = { icon: LucideIcon; label: string; value: string };
type ImageReport = { findings: Finding[]; pov: string; size: string; summary: string };

const HF_TOKEN = "";
const HF_MODEL = "";
const HF_API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const ICONS = { Eye, User, MapPin, Mail, Phone, Clock } as const;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

const mapIcon = (name: unknown): LucideIcon => {
  if (typeof name !== "string") return Eye;
  return ICONS[name as keyof typeof ICONS] ?? Eye;
};

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const readErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message ?? payload?.message ?? `AI request failed (${response.status})`;
  } catch {
    return `AI request failed (${response.status})`;
  }
};

const extractJson = (value: string) => {
  const trimmed = value.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI returned a non-JSON response.");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as Partial<ImageReport> & { findings?: Array<{ icon?: string; label?: string; value?: string }> };
};

const buildPayload = (imageUrl: string) => ({
  inputs: `<image>${imageUrl}</image> Inspect this image and return JSON with: summary (1 sentence), findings (4-6 items with icon, label, value), pov (attacker perspective). Return only valid JSON.`,
});

const requestAnalysis = async (imageUrl: string) => {
  const response = await fetch(`${HF_API_URL}/api/analyze-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as Array<{ generated_text?: string }> | { error?: string };
  if (Array.isArray(payload)) {
    const content = payload[0]?.generated_text;
    if (!content) throw new Error("AI returned an empty response.");
    return extractJson(content);
  }
  throw new Error("Invalid response format from AI.");
};

const analyzeImage = async (file: File): Promise<ImageReport> => {
  const imageUrl = await fileToDataUrl(file);
  const parsed = await requestAnalysis(imageUrl).catch(async (error) => {
    const message = error instanceof Error ? error.message : "AI request failed.";
    if (/429|rate limit|quota|insufficient/i.test(message)) {
      await delay(1200);
      return requestAnalysis(imageUrl);
    }
    throw error;
  });

  const findings = Array.isArray(parsed.findings)
    ? parsed.findings.slice(0, 6).map((finding) => ({
        icon: mapIcon(finding.icon),
        label: finding.label?.trim() || "Finding",
        value: finding.value?.trim() || "No detail provided.",
      }))
    : [];

  if (findings.length === 0) {
    findings.push({ icon: Eye, label: "Summary", value: "The model did not return any concrete findings." });
  }

  return {
    summary: parsed.summary?.trim() || "AI analysis completed.",
    pov: parsed.pov?.trim() || "I can use what this image reveals to narrow down who you are and what to target next.",
    findings,
    size: `${(file.size / 1024).toFixed(1)} KB`,
  };
};

export default function Mirror() {
  const [img, setImg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [report, setReport] = useState<ImageReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    setName(f.name);
    setError(null);
    setAnalyzing(true);
    setReport(null);

    try {
      const imageUrl = await fileToDataUrl(f);
      setImg(imageUrl);
      const aiReport = await analyzeImage(f);
      setReport(aiReport);
    } catch (err) {
      setReport(null);
      setImg(null);
      setName("");
      setError(err instanceof Error ? err.message : "Image analysis failed.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setAnalyzing(false);
    }
  };

  const wipe = () => { setImg(null); setReport(null); setName(""); setError(null); if (inputRef.current) inputRef.current.value = ""; };

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
            {error && <div className="brutal-sm bg-danger/20 border-2 border-foreground px-3 py-2 mt-3 mono text-xs">{error}</div>}
        </div>

        <div className="space-y-5">
            {!report && !analyzing && !error && <div className="brutal p-8 text-center opacity-50 mono text-sm">drop something to see what leaks...</div>}
            {analyzing && <div className="brutal p-8 text-center mono text-sm bg-foreground text-background">AI is reading the image for clues...</div>}
          {report && (
            <>
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="brutal p-5">
                <div className="display text-lg mb-3">EXTRACTED</div>
                  <p className="mono text-xs uppercase tracking-widest opacity-60 mb-3">{report.summary}</p>
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
