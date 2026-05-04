import { NavLink, Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

const NAV = [
  { to: "/", label: "Analyze Website" },
  { to: "/compare", label: "Compare" },
  { to: "/phishing", label: "Phishing & Files" },
  { to: "/mirror", label: "Shared Mirror" },
  { to: "/stories", label: "Live Attacks" },
  { to: "/learn", label: "Learn Security" },
];

const Ticker = () => {
  const items = [
    "1.4M phishing sites detected this year",
    "73% of breaches start with a click",
    "Avg. data breach cost: $4.45M",
    "You leak ~5,000 data points per day",
    "Your photo metadata may include GPS",
    "92% of malware is delivered by email",
  ];
  return (
    <div className="overflow-hidden border-b-[3px] border-foreground bg-foreground text-background py-1.5">
      <div className="marquee-track flex gap-12 whitespace-nowrap mono text-xs font-bold uppercase tracking-widest">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="text-cyber">▲</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      <header className="sticky top-0 z-40 bg-background border-b-[3px] border-foreground">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: -8 }}
              className="w-10 h-10 bg-accent border-[3px] border-foreground flex items-center justify-center"
              style={{ boxShadow: "3px 3px 0 0 hsl(var(--foreground))" }}
            >
              <ShieldAlert className="w-5 h-5" strokeWidth={3} />
            </motion.div>
            <div>
              <div className="display text-xl leading-none">SHARED<span className="text-hot">/</span>MIRROR</div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">see.what.they.see</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 ml-auto flex-wrap">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 mono text-xs uppercase tracking-wider font-bold border-2 border-transparent transition-all ${
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "hover:bg-accent hover:border-foreground"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-[3px] border-foreground mt-16 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <div className="display text-2xl">SHARED/MIRROR</div>
            <p className="mono text-xs mt-2 opacity-70">A mirror reflects how risky the internet really is — then teaches you how to do better.</p>
          </div>
          <div className="mono text-xs space-y-1 opacity-80">
            <div>// not_a_real_av</div>
            <div>// educational_use_only</div>
            <div>// uploaded_files_processed_locally</div>
          </div>
          <div className="mono text-xs opacity-80">
            <div>v0.4.2 · build #{Math.floor(Math.random()*9000)+1000}</div>
            <div className="mt-1">© {new Date().getFullYear()} Shared Mirror</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
