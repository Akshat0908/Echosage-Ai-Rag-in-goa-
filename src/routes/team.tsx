import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Carousel3D, type Member } from "@/components/site/carousel3d";
import t1 from "@/assets/team-1.png";
import t2 from "@/assets/team-2.png";
import t3 from "@/assets/team-3.png";
import t4 from "@/assets/team-4.png";
import t5 from "@/assets/team-5.png";
import t6 from "@/assets/team-6.png";
import hero from "@/assets/hero-3d.jpg";

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

const members: Member[] = [
  {
    name: "Aarav",
    role: "retrieval",
    line: "Owns the six chunkers, the fusion ranker and every index rebuild.",
    img: t1,
  },
  {
    name: "Meera",
    role: "harness",
    line: "Typed tool calls, retries, structured IO — nothing raw reaches the model.",
    img: t2,
  },
  {
    name: "Kabir",
    role: "speech",
    line: "Sarvam STT streaming, noise handling, code-switched Hindi transcripts.",
    img: t3,
  },
  {
    name: "Isha",
    role: "guardrails",
    line: "Grounding checks and abstention logic. Cited or silent, no third option.",
    img: t4,
  },
  {
    name: "Rohan",
    role: "latency",
    line: "P50/P70/P100 benchmarking, cache warmth and the sub-200ms budget.",
    img: t5,
  },
  {
    name: "Tara",
    role: "design",
    line: "The look, the demo film and everything the judges actually see.",
    img: t6,
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

      <section className="relative overflow-hidden border-b-2 border-ink">
        <img
          src={hero}
          alt="Stone monument on a Goa beach"
          width={1920}
          height={1088}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            the crew
          </p>
          <h1 className="text-3d mt-4 font-display text-[clamp(2.8rem,8vw,6rem)] leading-[0.84] font-black">
            SIX HEADS.
            <br />
            <span className="text-primary italic">one pipeline.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
            Drag the carousel, or let it roll. Everyone here owns one hop of the voice →
            cited answer chain.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <Carousel3D members={members} />
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
