import { motion } from "framer-motion";

export default function RiskMeter({ score, label }: { score: number; label?: string }) {
  const color =
    score >= 75 ? "hsl(var(--safe))" : score >= 50 ? "hsl(var(--warn))" : score >= 25 ? "hsl(var(--hot))" : "hsl(var(--danger))";
  const verdict = score >= 75 ? "SOLID" : score >= 50 ? "MEH" : score >= 25 ? "SHAKY" : "AVOID";
  return (
    <div className="brutal p-4 bg-card">
      <div className="flex items-baseline justify-between mb-2">
        <span className="mono text-xs uppercase tracking-widest">{label ?? "Risk Score"}</span>
        <span className="tag" style={{ background: color }}>{verdict}</span>
      </div>
      <div className="flex items-end gap-3">
        <div className="display text-6xl leading-none">{score}</div>
        <div className="mono text-xs pb-2 opacity-70">/ 100</div>
      </div>
      <div className="mt-3 h-3 border-2 border-foreground bg-background relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: color, height: "100%" }}
        />
      </div>
    </div>
  );
}
