import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { STORIES, type Story } from "@/lib/stories";
import { ArrowLeft, AlertOctagon, ShieldCheck, RotateCcw } from "lucide-react";

export default function Stories() {
  const { id } = useParams();
  const story = STORIES.find(s => s.id === id);
  if (story) return <Player story={story} />;
  return <List />;
}

function List() {
  const nav = useNavigate();
  return (
    <>
      <PageHeader kicker="05 // Live Attacks" accent="cyber"
        title={<>Choose your <span className="bg-cyber px-2">disaster</span>.</>}
        subtitle="Short interactive stories. Real attacks. Your choices decide whether you keep your money." />
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STORIES.map((s, i) => (
          <motion.button key={s.id} onClick={() => nav(`/stories/${s.id}`)}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.08 }}
            className="brutal-lg p-5 text-left brutal-hover bg-card">
            <div className="text-5xl">{s.emoji}</div>
            <div className="display text-2xl mt-3">{s.title}</div>
            <div className="mono text-xs opacity-70 mt-1">{s.blurb}</div>
            <div className="tag bg-foreground text-background mt-4">PLAY ▶</div>
          </motion.button>
        ))}
      </section>
    </>
  );
}

function Player({ story }: { story: Story }) {
  const nav = useNavigate();
  const [path, setPath] = useState<string[]>([story.start]);
  const current = story.nodes[path[path.length - 1]];

  const choose = (next: string) => setPath([...path, next]);
  const restart = () => setPath([story.start]);

  return (
    <>
      <section className="border-b-[3px] border-foreground bg-foreground text-background">
        <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-6 flex items-center gap-4">
          <button onClick={() => nav("/stories")} className="brutal-sm bg-background text-foreground p-2 brutal-hover"><ArrowLeft className="w-4 h-4"/></button>
          <div>
            <div className="mono text-xs uppercase tracking-widest text-cyber">{story.emoji} live attack</div>
            <div className="display text-3xl">{story.title}</div>
          </div>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 lg:px-8 py-10 space-y-3">
        {path.map((nid, i) => {
          const n = story.nodes[nid];
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {n.speaker && <div className="mono text-[11px] uppercase tracking-widest opacity-60 mb-1 ml-1">{n.speaker}</div>}
              <div className={`brutal p-4 max-w-[85%] ${i % 2 ? "ml-auto bg-accent" : "bg-card"}`}>{n.text}</div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {current.choices && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-2 mt-4">
              {current.choices.map((c, i) => (
                <button key={i} onClick={() => choose(c.next)}
                  className={`brutal-sm p-3 text-left brutal-hover ${c.bad ? "bg-danger/20" : "bg-card"}`}>
                  <span className="mono text-[10px] uppercase opacity-60">option {String.fromCharCode(65+i)}</span>
                  <div className="font-bold">{c.label}</div>
                </button>
              ))}
            </motion.div>
          )}
          {current.ending && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={`brutal-lg p-5 mt-6 ${current.ending === "win" ? "bg-safe" : "bg-danger text-danger-foreground"}`}>
              <div className="display text-2xl flex items-center gap-2">
                {current.ending === "win" ? <><ShieldCheck className="w-7 h-7"/> ATTACK BLOCKED</> : <><AlertOctagon className="w-7 h-7"/> ATTACK SUCCEEDED</>}
              </div>
              {current.debrief && (
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                  <Debrief title="Red flags" items={current.debrief.redFlags} />
                  <Debrief title="Safe action" items={[current.debrief.safeAction]} />
                  <Debrief title="Tech-talk" items={[current.debrief.tech]} />
                </div>
              )}
              <button onClick={restart} className="brutal-sm bg-background text-foreground px-4 py-2 mt-5 brutal-hover display flex items-center gap-2">
                <RotateCcw className="w-4 h-4"/> PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
const Debrief = ({ title, items }: { title: string; items: string[] }) => (
  <div className="brutal-sm p-3 bg-background text-foreground">
    <div className="mono text-[10px] uppercase tracking-widest font-bold mb-1">{title}</div>
    <ul className="space-y-1">{items.map((x, i) => <li key={i}>• {x}</li>)}</ul>
  </div>
);
