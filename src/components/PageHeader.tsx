import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function PageHeader({ kicker, title, subtitle, accent = "accent" }: { kicker: string; title: ReactNode; subtitle?: string; accent?: "accent" | "hot" | "cyber" | "danger" }) {
  return (
    <section className="border-b-[3px] border-foreground">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className={`tag bg-${accent}`}>{kicker}</span>
          <h1 className="display text-5xl md:text-7xl mt-4 leading-[0.95]">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg opacity-80">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
}
