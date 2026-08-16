import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CrewHero, type Crew } from "@/components/site/crew-hero";
import figAkshat from "@/assets/fig-akshat.png";
import figSuman from "@/assets/fig-suman.png";
import figSiddharth from "@/assets/fig-siddharth.png";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "The Crew — Voice RAG for HH Goa 2026" },
      {
        name: "description",
        content:
          "Meet the six builders behind our sub-200ms voice RAG pipeline: retrieval, STT, harness, guardrails, latency and design.",
      },
      { property: "og:title", content: "The Crew — Voice RAG for HH Goa 2026" },
      {
        property: "og:description",
        content:
          "Six builders, one pipeline: speech to cited answer in under 200ms. Spin the crew carousel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

const crew: Crew[] = [
  {
    name: "Akshat Agrawal",
    role: "Retrieval and chunking — six indexes, rank fusion, and every rebuild that keeps recall honest.",
    src: figAkshat,
    bg: "#F4845F",
  },
  {
    name: "Suman Bhandari",
    role: "Harness and guardrails — typed tool calls, retries, grounding checks. Cited or silent, no third option.",
    src: figSuman,
    bg: "#6BBF7A",
  },
  {
    name: "Siddharth Jaiswal",
    role: "Speech and latency — Sarvam STT streaming, code-switched transcripts, the sub-200ms budget.",
    src: figSiddharth,
    bg: "#6EB5FF",
  },
];

function TeamPage() {
  return (
    <main className="grain min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-card shadow-[0_6px_0_0_var(--ink)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun font-display text-2xl leading-none font-black text-sun-foreground shadow-[0_6px_0_0_var(--ink)]">
              R
            </span>
            <span className="font-mono text-[11px] leading-tight tracking-[0.18em] uppercase">
              Voice RAG
              <br />
              <span className="text-primary">Goa 2026</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-sun-foreground uppercase shadow-[0_4px_0_0_var(--ink)]"
          >
            Back to build <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="border-b-2 border-ink">
        <CrewHero crew={crew} />
      </section>

      <section id="crew-list" className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-3d font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.84] font-black">
          THREE HEADS.
          <br />
          <span className="text-primary italic">one pipeline.</span>
        </h1>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {crew.map((c) => (
            <article
              key={c.name}
              className="gloss rounded-3xl border-2 border-ink bg-card p-6 shadow-[0_12px_0_0_var(--ink),0_30px_40px_-26px_rgba(0,0,0,.5)]"
            >
              <div
                className="grid h-56 place-items-center rounded-2xl border-2 border-ink"
                style={{ backgroundColor: c.bg }}
              >
                <img
                  src={c.src}
                  alt={c.name}
                  width={768}
                  height={1280}
                  loading="lazy"
                  className="h-full w-full object-contain drop-shadow-[0_14px_10px_rgba(0,0,0,.35)]"
                />
              </div>
              <h2 className="mt-5 font-display text-2xl leading-none font-black">
                {c.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {c.role}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-sand">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-3d font-display text-[clamp(2.2rem,6vw,4rem)] leading-[0.85] font-black">
            BUILT ON <span className="text-primary italic">chai.</span>
          </p>
          <p className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase">
            Hacker House Goa 2026 · Task 2 · #RAGInGoa
          </p>
        </div>
      </footer>
    </main>
  );
}
