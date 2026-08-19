import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play } from "lucide-react";

export const Route = createFileRoute("/demo-video")({
  head: () => ({
    meta: [
      { title: "Demo Video — SandQuery Goa 2026" },
      {
        name: "description",
        content: "Watch our sub-200ms voice RAG pipeline in action.",
      },
    ],
  }),
  component: DemoVideoPage,
});

function DemoVideoPage() {
  return (
    <main className="grain min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-card shadow-[0_6px_0_0_var(--ink)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun font-display text-2xl leading-none font-black text-sun-foreground shadow-[0_6px_0_0_var(--ink)]">
              R
            </span>
            <span className="font-mono text-[11px] leading-tight tracking-[0.18em] uppercase">
              SandQuery
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

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Hacker House Goa 2026
          </p>
          <h1 className="text-3d mt-4 font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.84] font-black">
            PIPELINE IN <span className="text-primary italic">action.</span>
          </h1>
        </div>

        <div className="mx-auto mt-12 overflow-hidden rounded-3xl border-4 border-ink bg-ink shadow-[0_12px_0_0_var(--ink),0_30px_40px_-26px_rgba(0,0,0,.5)]">
          <div className="relative aspect-video w-full bg-black">
            <video
              src="/demo-video.mov"
              controls
              className="absolute inset-0 h-full w-full object-cover"
              poster="/poster.jpg" // Optional poster if you have one
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <p className="text-center font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            the only thing hallucinating in this demo is our sleep deprived team.
          </p>
          <p className="text-center font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            yes, this is an actual live recording, not a pre-scripted figma prototype.
          </p>
          <p className="text-center font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            853k chunks searched faster than you can say 'hacker house goa'.
          </p>
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
