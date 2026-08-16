import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, ArrowUpRight, Play, Github, Quote } from "lucide-react";
import heroBeach from "@/assets/hero-3d.jpg";
import chunk3d from "@/assets/chunk-3d.png";
import speed3d from "@/assets/speed-3d.png";
import { Tilt } from "@/components/site/tilt";
import {
  pipeline,
  strategies,
  latency,
  stages,
  harness,
  guardrails,
} from "@/components/site/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voice RAG on the Beach — HH Goa 2026 Task 2" },
      {
        name: "description",
        content:
          "A voice-in, cited-answer-out RAG pipeline on MSMARCO-XI: Sarvam STT, six chunking strategies, sub-200ms retrieval, a typed harness and real guardrails.",
      },
      { property: "og:title", content: "Voice RAG on the Beach — HH Goa 2026 Task 2" },
      {
        property: "og:description",
        content:
          "Speak a question, get a grounded, cited answer in under 200ms. Built for Hacker House Goa 2026 shortlisting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = [
  { label: "Pipeline", href: "#pipeline" },
  { label: "Demo", href: "#demo" },
  { label: "Chunking", href: "#chunking" },
  { label: "Latency", href: "#latency" },
  { label: "Guardrails", href: "#guardrails" },
];

const marquee = [
  "#RAGInGoa",
  "sub-200ms",
  "Sarvam STT",
  "MSMARCO-XI",
  "6 chunkers",
  "cited or silent",
];

function Index() {
  return (
    <main className="grain min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <Pipeline />
      <Demo />
      <Chunking />
      <Latency />
      <Guardrails />
      <Deliverables />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-card shadow-[0_6px_0_0_var(--ink)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun font-display text-2xl leading-none font-black text-sun-foreground shadow-[0_6px_0_0_var(--ink)]">
            R
          </span>
          <span className="font-mono text-[11px] leading-tight tracking-[0.18em] uppercase">
            Voice RAG
            <br />
            <span className="text-primary">Goa 2026</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="font-mono text-[11px] tracking-[0.2em] uppercase transition-colors hover:text-primary"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/team"
            className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase transition-colors hover:opacity-70"
          >
            Team
          </Link>
        </nav>
        <a
          href="#demo"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-sun-foreground uppercase shadow-[0_4px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          Try it <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setP({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section id="top" className="scene relative overflow-hidden border-b-2 border-ink">
      <img
        src={heroBeach}
        alt="Giant mossy stone letters spelling VOICE RAG on a Goa beach with palms and surfboards"
        width={1920}
        height={1088}
        className="pointer-events-none absolute inset-0 h-[112%] w-[112%] max-w-none object-cover"
        style={{
          transform: `translate3d(${p.x * 22 - 24}px, ${p.y * 16 - 22}px, 0) scale(1.03)`,
          transition: "transform 400ms cubic-bezier(.2,.8,.2,1)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_88%,transparent)_34%,transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="relative grid min-h-[620px] items-center lg:min-h-[740px] lg:grid-cols-[52%_48%]">
        <div
          className="relative z-10 px-6 pt-20 pb-14 lg:pl-16"
          style={{
            transform: `translate3d(${p.x * -18}px, ${p.y * -12}px, 0)`,
            transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            HH Goa 2026 · Shortlisting Task 2
          </p>
          <h1 className="text-3d mt-5 font-display text-[clamp(3.2rem,8vw,6.2rem)] leading-[0.82] font-black tracking-tight">
            SPEAK.
            <br />
            RETRIEVE.
            <br />
            <span className="text-primary italic">answer.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            A voice-in, cited-answer-out RAG pipeline over MSMARCO-XI. Six chunking
            strategies, a typed harness, and guardrails that would rather say nothing than
            make something up.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border-2 border-primary/40 px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase">
              197ms worst case
            </span>
            <span className="rounded-full border-2 border-primary/40 px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase">
              500 test queries
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-primary px-6 py-3 font-mono text-xs tracking-[0.2em] text-primary-foreground uppercase shadow-[0_5px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" /> Watch demo
            </a>
            <a
              href="#deliverables"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase shadow-[0_5px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5"
            >
              <Github className="h-4 w-4" /> Repo
            </a>
          </div>
        </div>

        <div className="relative h-[34vh] lg:h-full">
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              transform: `translate3d(${p.x * -46}px, ${p.y * -32}px, 0)`,
              transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div className="bob absolute bottom-16 left-6 rounded-2xl border-2 border-ink bg-card/95 px-5 py-4 shadow-[0_14px_0_0_var(--ink),0_30px_40px_-18px_rgba(0,0,0,.5)] backdrop-blur">
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                live trace
              </p>
              <p className="mt-1 font-display text-4xl leading-none font-black">
                118<span className="text-lg">ms</span>
              </p>
              <p className="font-mono text-[10px] tracking-[0.16em] text-primary uppercase">
                voice → cited answer
              </p>
            </div>
            <div
              className="bob absolute top-28 right-10 rounded-2xl border-2 border-ink bg-sun px-5 py-3 shadow-[0_12px_0_0_var(--sun-deep),0_26px_36px_-18px_rgba(0,0,0,.5)]"
              style={{ ["--tilt" as string]: "-6deg", animationDelay: "1.2s" }}
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-sun-foreground uppercase">
                grounded · cited
              </p>
            </div>
            <div
              className="bob absolute top-1/2 right-1/3 rounded-full border-2 border-ink bg-coral px-4 py-2 shadow-[0_10px_0_0_var(--ink)]"
              style={{ ["--tilt" as string]: "8deg", animationDelay: "0.6s" }}
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-primary-foreground uppercase">
                abstains
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee, ...marquee, ...marquee];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-sun py-3">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {items.map((m, i) => (
          <span
            key={i}
            className="font-mono text-xs tracking-[0.3em] text-sun-foreground uppercase"
          >
            {m} <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
        {kicker}
      </p>
      <h2 className="text-3d mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.9] font-black">
        {title}
      </h2>
    </div>
  );
}

function Pipeline() {
  return (
    <section id="pipeline" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead kicker="the shape of it" title="Six hops, one breath." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pipeline.map((p, i) => (
          <Tilt key={p.label}>
            <div className="gloss rounded-2xl border-2 border-ink bg-card p-6 shadow-[0_10px_0_0_var(--ink),0_26px_36px_-24px_rgba(0,0,0,.55)]">
              <div className="flex items-center justify-between">
                <span className="layer-pop grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_6px_0_0_var(--ink)]">
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-none font-black">
                {p.label}
              </h3>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{p.note}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

const transcript = [
  { who: "you", text: "Which ocean current keeps the Goan coast warm in winter?" },
  { who: "sys", text: "STT 41ms · retrieved 4 passages · support 0.87" },
  {
    who: "ai",
    text: "The warm surface flow of the North Indian Ocean monsoon gyre keeps coastal temperatures mild through winter. [p_88214]",
  },
  { who: "you", text: "Who won the 2031 world cup?" },
  { who: "ai", text: "Not in the dataset — I'm not going to guess. (abstained)" },
];

function Demo() {
  const [listening, setListening] = useState(false);
  return (
    <section id="demo" className="border-y-2 border-ink bg-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2">
        <div>
          <SectionHead kicker="demo" title="Hold the mic. Ask badly. It copes." />
          <p className="max-w-md leading-relaxed text-muted-foreground">
            Half-sentences, code-switched Hindi, background surf — the harness normalises
            the transcript, plans a retrieval call, and either cites or abstains. No
            confident nonsense.
          </p>
          <button
            onClick={() => setListening((v) => !v)}
            className="relative mt-10 inline-flex h-28 w-28 items-center justify-center rounded-full border-2 border-ink bg-coral text-primary-foreground shadow-[0_8px_0_0_var(--ink)] transition-transform active:translate-y-1"
            aria-pressed={listening}
          >
            {listening && (
              <span className="pulse-ring absolute inset-0 rounded-full border-2 border-coral" />
            )}
            <Mic className="h-9 w-9" />
          </button>
          <p className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase">
            {listening ? "listening…" : "tap to simulate a query"}
          </p>
        </div>

        <Tilt max={6} lift={6}>
        <div className="rounded-3xl border-2 border-ink bg-ink p-6 shadow-[0_16px_0_0_var(--primary),0_40px_50px_-28px_rgba(0,0,0,.6)]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <span className="h-3 w-3 rounded-full bg-sun" />
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-sand uppercase">
              trace · session 04
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {transcript.map((t, i) => (
              <div
                key={i}
                className={
                  t.who === "sys"
                    ? "font-mono text-[11px] tracking-wide text-sun"
                    : t.who === "you"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-sun px-4 py-3 text-sm text-sun-foreground"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm border border-sand/30 px-4 py-3 text-sm text-sand"
                }
              >
                {t.text}
              </div>
            ))}
          </div>
        </div>
        </Tilt>
      </div>
    </section>
  );
}

function Chunking() {
  return (
    <section id="chunking" className="relative mx-auto max-w-7xl px-6 py-24">
      <img
        src={chunk3d}
        alt="3D stack of stone slabs split into layers"
        width={1024}
        height={1024}
        loading="lazy"
        className="bob pointer-events-none absolute -top-6 right-2 hidden w-64 drop-shadow-[0_24px_18px_rgba(0,0,0,.28)] lg:block xl:w-80"
      />
      <SectionHead kicker="chunking" title="Not one splitter. Six, fused." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((s) => (
          <Tilt key={s.tag} max={8}>
            <article className="gloss h-full rounded-2xl border-2 border-ink bg-card p-6 shadow-[0_10px_0_0_var(--ink),0_26px_36px_-24px_rgba(0,0,0,.5)]">
              <span className="inline-block rounded-md border-2 border-ink bg-sun px-2 py-0.5 font-mono text-xs tracking-[0.2em] text-sun-foreground shadow-[0_4px_0_0_var(--sun-deep)]">
                {s.tag}
              </span>
              <h3 className="mt-4 font-display text-2xl leading-none font-black">
                {s.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </article>
          </Tilt>
        ))}
      </div>
      <p className="mt-8 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
        Candidates from all six indexes are merged with reciprocal-rank fusion, deduped on
        span overlap, then reranked — the retriever votes, it doesn't guess.
      </p>
    </section>
  );
}

function Latency() {
  return (
    <section id="latency" className="border-y-2 border-ink bg-ink text-sand">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-mono text-[11px] tracking-[0.28em] text-sun uppercase">
          measured, not vibed
        </p>
        <h2 className="text-3d-sun mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.9] font-black text-sand">
          500 queries. Everything under 200ms.
        </h2>
        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <img
            src={speed3d}
            alt="3D gauge dial with a surfboard"
            width={1024}
            height={1024}
            loading="lazy"
            className="bob pointer-events-none absolute -top-40 right-0 hidden w-52 drop-shadow-[0_26px_20px_rgba(0,0,0,.5)] xl:block"
          />
          {latency.map((l) => (
            <Tilt key={l.label} max={9}>
              <div className="gloss rounded-2xl border-2 border-sand/30 bg-white/5 p-7 shadow-[0_12px_0_0_rgba(0,0,0,.35)]">
                <p className="font-mono text-xs tracking-[0.25em] text-sun uppercase">
                  {l.label}
                </p>
                <p className="text-3d-sun layer-pop mt-3 font-display text-6xl leading-none font-black text-sand">
                  {l.value}
                  <span className="text-2xl">ms</span>
                </p>
                <p className="mt-2 font-mono text-[11px] text-sand/70">{l.note}</p>
              </div>
            </Tilt>
          ))}
        </div>
        <div className="mt-12 space-y-4">
          {stages.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="w-40 shrink-0 font-mono text-[11px] tracking-[0.14em] uppercase">
                {s.name}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-sand/15">
                <div
                  className="h-full rounded-full bg-sun"
                  style={{ width: `${s.pct * 3}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs text-sun">{s.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Guardrails() {
  return (
    <section id="guardrails" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead kicker="harness + guardrails" title="Structured, or it doesn't ship." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Tilt max={6} lift={8}>
        <div className="gloss h-full rounded-3xl border-2 border-ink bg-card p-8 shadow-[0_14px_0_0_var(--ink),0_34px_44px_-28px_rgba(0,0,0,.5)]">
          <h3 className="font-display text-3xl leading-none font-black">The harness</h3>
          <ul className="mt-6 space-y-4">
            {harness.map((h) => (
              <li key={h} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{h}</span>
              </li>
            ))}
          </ul>
        </div>
        </Tilt>
        <Tilt max={6} lift={8}>
        <div className="gloss h-full rounded-3xl border-2 border-ink bg-primary p-8 text-primary-foreground shadow-[0_14px_0_0_var(--ink),0_34px_44px_-28px_rgba(0,0,0,.5)]">
          <h3 className="font-display text-3xl leading-none font-black">The guardrails</h3>
          <ul className="mt-6 space-y-4">
            {guardrails.map((g) => (
              <li key={g} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun" />
                <span className="opacity-90">{g}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex gap-3 border-t border-primary-foreground/20 pt-6 font-mono text-xs">
            <Quote className="h-4 w-4 shrink-0 text-sun" />
            Knowing when not to answer is the feature.
          </p>
        </div>
        </Tilt>
      </div>
    </section>
  );
}

const deliverables = [
  { label: "GitHub repo", note: "pipeline, benchmarks, harness tests" },
  { label: "Live link", note: "voice demo running on the deployed build" },
  { label: "Team video", note: "90s — how we work, not what we built" },
  { label: "Demo video", note: "end-to-end run, mic to cited answer" },
];

function Deliverables() {
  return (
    <section id="deliverables" className="border-y-2 border-ink bg-sand">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead kicker="submission" title="Everything the form asks for." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deliverables.map((d) => (
            <Tilt key={d.label} max={8}>
              <div className="gloss h-full rounded-2xl border-2 border-ink bg-card p-6 shadow-[0_10px_0_0_var(--ink),0_24px_34px_-24px_rgba(0,0,0,.5)]">
                <h3 className="font-display text-2xl leading-none font-black">
                  {d.label}
                </h3>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  {d.note}
                </p>
              </div>
            </Tilt>
          ))}
        </div>
        <p className="mt-8 font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
          deadline · 22 aug 2026, 11:59 pm · every post tagged #RAGInGoa
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-3d font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.85] font-black">
            SEE YOU
            <br />
            <span className="text-primary italic">in goa.</span>
          </p>
          <p className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase">
            Hacker House Goa 2026 · Task 2 · #RAGInGoa
          </p>
        </div>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3 font-mono text-xs tracking-[0.2em] text-sun-foreground uppercase shadow-[0_5px_0_0_var(--ink)]"
        >
          Back to top <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
