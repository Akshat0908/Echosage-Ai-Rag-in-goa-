import { useEffect, useRef, useState } from "react";
import { Mic, Square, ShieldCheck, ShieldAlert } from "lucide-react";

type Run = {
  question: string;
  transcriptRaw: string;
  transcript: string;
  passages: { id: string; score: number; snippet: string }[];
  support: number;
  verdict: "grounded" | "abstained";
  answer: string;
};

const RUNS: Run[] = [
  {
    question: "Which ocean current keeps the Goan coast warm in winter?",
    transcriptRaw: "which ocean… uh current jo Goan coast ko warm rakhta hai winter mein",
    transcript: "Which ocean current keeps the Goan coast warm in winter?",
    passages: [
      { id: "p_88214", score: 0.91, snippet: "North Indian Ocean monsoon gyre · surface flow" },
      { id: "p_31077", score: 0.78, snippet: "Arabian Sea winter thermal profile" },
      { id: "p_50412", score: 0.64, snippet: "Konkan coastline climate normals" },
      { id: "p_12903", score: 0.52, snippet: "Monsoon reversal mechanics" },
    ],
    support: 0.87,
    verdict: "grounded",
    answer:
      "The warm surface flow of the North Indian Ocean monsoon gyre keeps coastal temperatures mild through winter.",
  },
  {
    question: "Who won the 2031 world cup?",
    transcriptRaw: "who won the… 2031 world cup bhai",
    transcript: "Who won the 2031 world cup?",
    passages: [
      { id: "p_70551", score: 0.19, snippet: "Historic tournament results — pre-2020" },
      { id: "p_66120", score: 0.14, snippet: "Sporting venue capacity tables" },
    ],
    support: 0.12,
    verdict: "abstained",
    answer: "Not in the dataset — I'm not going to guess.",
  },
];

const STAGES = [
  { key: "capture", label: "Capture", ms: 12 },
  { key: "stt", label: "Sarvam STT", ms: 41 },
  { key: "embed", label: "Embed", ms: 18 },
  { key: "fuse", label: "RRF fuse", ms: 46 },
  { key: "rerank", label: "Rerank", ms: 33 },
  { key: "guard", label: "Guardrail", ms: 14 },
] as const;

const BUDGET = 200;
const TOTAL = STAGES.reduce((a, s) => a + s.ms, 0);

export function DemoConsole() {
  const [runIdx, setRunIdx] = useState(0);
  const [step, setStep] = useState(-1); // -1 idle, 0..STAGES.length-1 running, STAGES.length done
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);
  const run = RUNS[runIdx]!;
  const listening = step >= 0 && step < STAGES.length;
  const done = step >= STAGES.length;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = () => {
    clear();
    setStep(0);
    setElapsed(0);
    let acc = 0;
    STAGES.forEach((s, i) => {
      acc += s.ms;
      const at = acc;
      timers.current.push(
        window.setTimeout(() => {
          setStep(i + 1);
          setElapsed(at);
        }, acc * 6),
      );
    });
  };

  const reset = () => {
    clear();
    setStep(-1);
    setElapsed(0);
    setRunIdx((i) => (i + 1) % RUNS.length);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      {/* Left: copy + the key */}
      <div className="lg:col-span-5">
        <span className="inline-block border-b-2 border-ink pb-1 font-mono text-[11px] font-bold tracking-[0.24em] uppercase">
          [ demo ]
        </span>
        <h2 className="text-3d mt-5 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.86] font-black">
          Hold the mic.
          <br />
          Ask badly.
          <br />
          <span className="text-primary italic">It copes.</span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          Half-sentences, code-switched Hindi, background surf — the harness normalises
          the transcript, plans a retrieval call, and either cites or abstains. No
          confident nonsense.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-8">
          <MicOrb
            listening={listening}
            done={done}
            onClick={done || listening ? reset : start}
          />

          <div>
            <Waveform active={listening} />
            <p className="mt-3 font-mono text-[10px] font-bold tracking-[0.22em] uppercase opacity-70">
              {listening
                ? "listening…"
                : done
                  ? "tap for the next query"
                  : "tap to simulate a query"}
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
              48khz · 16-bit · vad on · {listening ? "stream open" : "stream idle"}
            </p>
          </div>
        </div>
      </div>

      {/* Right: the instrument */}
      <div className="relative lg:col-span-7">
        <div
          className="relative overflow-hidden rounded-[2rem] border-4 border-ink p-6 shadow-[8px_8px_0_0_var(--ink)] sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, var(--ink) 0%, color-mix(in oklab, var(--ink) 70%, black) 100%)",
          }}
        >
          <HudCorners />
          {listening && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="holo-sweep h-24 w-full"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, color-mix(in oklab, var(--sun) 22%, transparent), transparent)",
                }}
              />
            </div>
          )}
          {/* header */}
          <div className="flex items-center justify-between border-b border-primary/40 pb-5">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full border border-ink bg-coral" />
              <span className="h-3 w-3 rounded-full border border-ink bg-sun" />
              <span className="h-3 w-3 rounded-full border border-ink bg-primary" />
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-sand/50 uppercase">
              <span
                className={`h-2 w-2 rounded-full ${listening ? "hud-blink bg-sun" : "bg-sand/30"}`}
              />
              <span>trace · session 0{runIdx + 4}</span>
            </div>
          </div>

          <Telemetry step={step} listening={listening} done={done} />

          {/* latency rail */}
          <div className="mt-6">
            <div className="flex items-end justify-between font-mono text-[10px] tracking-[0.2em] text-sand/60 uppercase">
              <span>latency rail · budget {BUDGET}ms</span>
              <span className="font-display text-4xl leading-none font-black text-sun tabular-nums">
                {String(elapsed).padStart(3, "0")}
                <span className="ml-1 font-mono text-[11px] tracking-normal">ms</span>
              </span>
            </div>
            <div className="mt-3 flex gap-[3px]">
              {STAGES.map((s, i) => (
                <div
                  key={s.key}
                  className="h-9 overflow-hidden rounded-[4px] border border-primary/40"
                  style={{ width: `${(s.ms / BUDGET) * 100}%` }}
                  title={`${s.label} ${s.ms}ms`}
                >
                  <div
                    className="h-full transition-[width] duration-200 ease-out"
                    style={{
                      width: step > i ? "100%" : "0%",
                      background:
                        step > i
                          ? "var(--sun)"
                          : "transparent",
                    }}
                  />
                </div>
              ))}
              <div
                className="h-9 flex-1 rounded-[4px] border border-dashed border-sand/20"
                title="headroom"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] tracking-[0.14em] uppercase">
              {STAGES.map((s, i) => (
                <span
                  key={s.key}
                  className={
                    step > i
                      ? "text-sun"
                      : step === i
                        ? "animate-pulse text-sand"
                        : "text-sand/30"
                  }
                >
                  {s.label} {s.ms}
                </span>
              ))}
              <span className="text-sand/30">total {TOTAL}</span>
            </div>
          </div>

          {/* trace body */}
          <div className="mt-7 min-h-[300px] space-y-4">
            <Reveal on={step >= 0}>
              <div className="flex justify-end">
                <p className="max-w-[88%] rounded-2xl rounded-tr-none border-2 border-ink bg-sun px-5 py-3 text-[15px] font-medium text-sun-foreground shadow-[5px_5px_0_0_rgba(0,0,0,.45)]">
                  {run.question}
                </p>
              </div>
            </Reveal>

            <Reveal on={step >= 1}>
              <p className="font-mono text-[11px] leading-relaxed text-sand/45">
                <span className="text-coral">raw&gt;</span> {run.transcriptRaw}
              </p>
            </Reveal>
            <Reveal on={step >= 2}>
              <p className="font-mono text-[11px] leading-relaxed text-sand/80">
                <span className="text-sun">norm&gt;</span> {run.transcript}
              </p>
            </Reveal>

            <Reveal on={step >= 4}>
              <div className="space-y-1.5">
                <div className="mb-3 flex items-stretch gap-3">
                  <VectorRadar active={step >= 3} />
                  <div className="flex-1 space-y-1 font-mono text-[9px] leading-relaxed tracking-[0.14em] text-sand/45 uppercase">
                    <p className="text-sun">vector space · 768d → hnsw ef=96</p>
                    <p>candidates 2,048 · fused 4 · dropped 2,044</p>
                    <p>rrf k=60 · cross-encoder pass 1</p>
                    <p className="text-sand/70">index shard goa-02 · warm</p>
                  </div>
                </div>
                {run.passages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-primary/30 bg-black/20 px-3 py-2"
                  >
                    <span className="font-mono text-[10px] tracking-[0.14em] text-sun">
                      {p.id}
                    </span>
                    <span className="flex-1 truncate font-mono text-[10px] text-sand/60">
                      {p.snippet}
                    </span>
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-sand/15">
                      <span
                        className="block h-full bg-sun transition-[width] duration-500"
                        style={{ width: `${p.score * 100}%` }}
                      />
                    </span>
                    <span className="font-mono text-[10px] text-sand/70 tabular-nums">
                      {p.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal on={done}>
              <div
                className={`rounded-2xl rounded-tl-none border-2 p-5 ${
                  run.verdict === "grounded"
                    ? "border-primary/60 bg-black/25"
                    : "border-coral/60 bg-black/25"
                }`}
              >
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
                  {run.verdict === "grounded" ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-sun" />
                      <span className="text-sun">grounded · support {run.support}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4 text-coral" />
                      <span className="text-coral">
                        abstained · support {run.support} &lt; 0.55
                      </span>
                    </>
                  )}
                </div>
                <p
                  className={`text-[17px] leading-relaxed ${
                    run.verdict === "grounded" ? "text-sand" : "text-sand/65 italic"
                  }`}
                >
                  {run.answer}
                  {run.verdict === "grounded" && (
                    <span className="ml-2 rounded bg-primary/40 px-1.5 py-0.5 font-mono text-xs text-sun">
                      [{run.passages[0]!.id}]
                    </span>
                  )}
                </p>
              </div>
            </Reveal>
          </div>

          {/* scanlines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,.35) 50%)",
              backgroundSize: "100% 3px",
            }}
          />
        </div>

        <span className="absolute top-24 -left-[4.75rem] hidden -rotate-90 border-2 border-ink bg-sun px-3 py-1 font-mono text-[9px] font-bold tracking-[0.12em] text-sun-foreground uppercase shadow-[3px_3px_0_0_var(--ink)] 2xl:block">
          calibration active
        </span>
      </div>
    </div>
  );
}

function Reveal({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(8px)",
        pointerEvents: on ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

const BARS = 28;

function MicOrb({
  listening,
  done,
  onClick,
}: {
  listening: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => setT((v) => v + 1), 80);
    return () => window.clearInterval(id);
  }, [listening]);

  const RADIAL = 36;

  return (
    <div className="scene relative h-40 w-40 shrink-0">
      {/* orbit rings */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
        <span
          className={`absolute h-36 w-36 rounded-full border border-sun/50 ${listening ? "orbit-x" : ""}`}
          style={{ transform: "rotateX(72deg)" }}
        />
        <span
          className={`absolute h-32 w-32 rounded-full border border-primary/60 ${listening ? "orbit-y" : ""}`}
          style={{ transform: "rotateY(70deg)" }}
        />
      </div>

      {/* radial level meter */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {Array.from({ length: RADIAL }).map((_, i) => {
          const a = (i / RADIAL) * Math.PI * 2;
          const amp = listening
            ? 4 + Math.abs(Math.sin((i + t) * 0.55)) * 9
            : 2.5;
          const r0 = 36;
          const r1 = r0 + amp;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r0}
              y1={50 + Math.sin(a) * r0}
              x2={50 + Math.cos(a) * r1}
              y2={50 + Math.sin(a) * r1}
              stroke={i % 6 === 0 ? "var(--coral)" : "var(--sun)"}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={listening ? 0.95 : 0.35}
            />
          );
        })}
      </svg>

      {listening && (
        <span className="pulse-ring pointer-events-none absolute inset-3 rounded-full border-2 border-coral" />
      )}

      <button
        onClick={onClick}
        aria-pressed={listening}
        className="group absolute inset-6 grid place-items-center rounded-full border-4 border-ink text-sun-foreground shadow-[8px_8px_0_0_var(--ink)] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0_0_var(--ink)]"
        style={{
          background: listening
            ? "radial-gradient(circle at 32% 26%, color-mix(in oklab, var(--sun) 92%, white), var(--coral) 78%)"
            : "radial-gradient(circle at 32% 26%, color-mix(in oklab, var(--coral) 78%, white), var(--coral) 70%)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,.55) 0%, transparent 42%)",
          }}
        />
        {listening || done ? (
          <Square className="relative h-8 w-8 fill-current" />
        ) : (
          <Mic className="relative h-10 w-10" strokeWidth={2.4} />
        )}
      </button>

      <span className="absolute -right-1 -bottom-1 rounded-full border-2 border-ink bg-card px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.16em] uppercase">
        {listening ? "rec" : "idle"}
      </span>
    </div>
  );
}

function HudCorners() {
  const base =
    "pointer-events-none absolute h-6 w-6 border-sun/50";
  return (
    <>
      <span className={`${base} top-3 left-3 border-t-2 border-l-2 rounded-tl-lg`} />
      <span className={`${base} top-3 right-3 border-t-2 border-r-2 rounded-tr-lg`} />
      <span className={`${base} bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg`} />
      <span className={`${base} right-3 bottom-3 border-r-2 border-b-2 rounded-br-lg`} />
    </>
  );
}

function Telemetry({
  step,
  listening,
  done,
}: {
  step: number;
  listening: boolean;
  done: boolean;
}) {
  const items = [
    { k: "gpu", v: listening ? "0.42 tflop" : "idle" },
    { k: "tok/s", v: done ? "312" : listening ? `${120 + step * 34}` : "000" },
    { k: "queue", v: listening ? "1" : "0" },
    { k: "cache", v: done ? "hit" : "warm" },
  ];
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {items.map((i) => (
        <div
          key={i.k}
          className="rounded-md border border-primary/30 bg-black/25 px-2 py-1.5"
        >
          <p className="font-mono text-[8px] tracking-[0.2em] text-sand/40 uppercase">
            {i.k}
          </p>
          <p className="font-mono text-[11px] text-sun tabular-nums">{i.v}</p>
        </div>
      ))}
    </div>
  );
}

const DOTS = Array.from({ length: 26 }).map((_, i) => ({
  x: 12 + ((i * 37) % 76),
  y: 12 + ((i * 53) % 76),
  hot: i % 7 === 0,
}));

function VectorRadar({ active }: { active: boolean }) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-primary/40 bg-black/30">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--sun)" strokeOpacity=".18" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="var(--sun)" strokeOpacity=".18" />
        <line x1="50" y1="4" x2="50" y2="96" stroke="var(--sun)" strokeOpacity=".12" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="var(--sun)" strokeOpacity=".12" />
        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.hot && active ? 2.6 : 1.4}
            fill={d.hot && active ? "var(--coral)" : "var(--sun)"}
            opacity={active ? (d.hot ? 1 : 0.5) : 0.22}
          />
        ))}
      </svg>
      {active && (
        <div
          className="radar-sweep pointer-events-none absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, color-mix(in oklab, var(--sun) 28%, transparent), transparent 32%)",
          }}
        />
      )}
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setSeed((s) => s + 1), 90);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="flex h-14 w-40 items-center gap-[3px] rounded-xl border-2 border-ink bg-card px-3 sm:w-52">
      {Array.from({ length: BARS }).map((_, i) => {
        const h = active
          ? 14 + Math.abs(Math.sin((i + seed) * 0.7)) * 30
          : 4 + (i % 3) * 2;
        return (
          <span
            key={i}
            className="flex-1 rounded-full bg-primary transition-all duration-100"
            style={{ height: `${h}%`, opacity: active ? 1 : 0.35 }}
          />
        );
      })}
    </div>
  );
}