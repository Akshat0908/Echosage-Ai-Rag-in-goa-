import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, PartyPopper, Heart, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/delulu")({
  head: () => ({
    meta: [
      { title: "WE MADE IT — SandQuery Goa 2026" },
      {
        name: "description",
        content: "Thank you for shortlisting us! (We are completely delusional).",
      },
    ],
  }),
  component: DeluluPage,
});

function DeluluPage() {
  const [yesClicked, setYesClicked] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noClicks, setNoClicks] = useState(0);

  // The 'No' button runs away when hovered
  const handleNoHover = () => {
    setNoPosition({
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
    });
  };

  // Just in case they somehow manage to click it
  const handleNoClick = () => {
    setNoClicks((prev) => prev + 1);
    handleNoHover();
  };

  const handleYesClick = () => {
    setYesClicked(true);
    
    // Fire incredibly smooth confetti from both sides
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#F4845F', '#6BBF7A', '#6EB5FF', '#F9E2A8'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 50
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 50
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <main className="grain min-h-screen overflow-x-hidden bg-sun text-sun-foreground flex flex-col">
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-card shadow-[0_6px_0_0_var(--ink)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun font-display text-2xl leading-none font-black text-sun-foreground shadow-[0_6px_0_0_var(--ink)]">
              R
            </span>
            <span className="font-mono text-[11px] leading-tight tracking-[0.18em] text-foreground uppercase">
              SandQuery
              <br />
              <span className="text-primary">Goa 2026</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-primary px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-primary-foreground uppercase shadow-[0_4px_0_0_var(--ink)]"
          >
            Wake up <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center relative px-6 py-20 text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--sun-deep)_0%,transparent_50%)] opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
          {Array.from({ length: 15 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-4xl animate-[float_15s_ease-in-out_infinite]"
              style={{
                left: `${Math.random() * 100}vw`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
                opacity: 0.15 + Math.random() * 0.2,
              }}
            >
              {['🥺', '🙏', '🏖️', '✨', '👀'][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>

        {/* Fake CSS Confetti Background */}
        {yesClicked && (
          <div className="absolute inset-0 pointer-events-none opacity-50 text-4xl flex flex-wrap justify-around content-around z-0">
            <span>🎉</span><span>🏖️</span><span>🍻</span><span>🏄</span><span>🌴</span>
            <span>🎉</span><span>🏖️</span><span>🍻</span><span>🏄</span><span>🌴</span>
            <span>🎉</span><span>🏖️</span><span>🍻</span><span>🏄</span><span>🌴</span>
            <span>🎉</span><span>🏖️</span><span>🍻</span><span>🏄</span><span>🌴</span>
          </div>
        )}

        {/* Airplane Banner Animation */}
        <div className="absolute top-20 -left-64 flex items-center gap-2 animate-[fly_35s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap z-0 pointer-events-auto opacity-80 cursor-default">
          <Plane className="h-12 w-12 text-primary -scale-x-100" />
          <div className="bg-card px-5 py-2.5 border-2 border-ink font-mono text-sm font-bold tracking-widest text-foreground shadow-[4px_4px_0_0_var(--ink)]">
            AKSHAT ALREADY TOLD HIS PARENTS WE WON
          </div>
        </div>
        <div className="absolute top-44 -left-64 flex items-center gap-2 animate-[fly_45s_linear_infinite_10s] hover:[animation-play-state:paused] whitespace-nowrap z-0 pointer-events-auto opacity-80 cursor-default">
          <Plane className="h-12 w-12 text-sun -scale-x-100" />
          <div className="bg-card px-5 py-2.5 border-2 border-ink font-mono text-sm font-bold tracking-widest text-foreground shadow-[4px_4px_0_0_var(--ink)]">
            WE ALL TOOK LEAVES FOR THIS. SEND HELP.
          </div>
        </div>

        <style>{`
          @keyframes fly {
            from { transform: translateX(-100vw); }
            to { transform: translateX(200vw); }
          }
          @keyframes float {
            0% { transform: translateY(110vh) rotate(0deg) scale(0.8); }
            50% { transform: translateY(40vh) rotate(180deg) scale(1.2); }
            100% { transform: translateY(-20vh) rotate(360deg) scale(0.8); }
          }
          .bob-slow {
            animation: bob 4s ease-in-out infinite;
          }
          @keyframes bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>

        {!yesClicked ? (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-3d-sun font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] font-black mb-12 bob-slow">
              WILL YOU <span className="text-primary italic">shortlist us?</span>
            </h1>
            
            <div className="flex gap-8 relative items-center justify-center w-full h-40">
              <button 
                onClick={handleYesClick}
                className="z-20 inline-flex items-center gap-2 rounded-full border-4 border-ink bg-primary px-10 py-5 font-mono text-xl font-bold tracking-[0.2em] text-primary-foreground uppercase shadow-[0_8px_0_0_var(--ink)] transition-transform hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0px_0_0_var(--ink)] animate-[pulse_2s_infinite]"
              >
                YES
              </button>
              
              <button
                onMouseEnter={handleNoHover}
                onClick={handleNoClick}
                style={{ 
                  transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                  transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="z-20 inline-flex items-center gap-2 rounded-full border-4 border-ink bg-card px-10 py-5 font-mono text-xl font-bold tracking-[0.2em] text-foreground uppercase shadow-[0_8px_0_0_var(--ink)] absolute right-[25%]"
              >
                NO
              </button>
            </div>

            {noClicks > 0 && (
              <p className="mt-8 font-mono text-xs tracking-[0.2em] text-red-600 font-bold uppercase animate-pulse">
                nice try. you literally cannot click no.
              </p>
            )}
          </div>
        ) : (
          <div className="relative z-10 animate-in zoom-in duration-500">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-5 py-2 shadow-[0_4px_0_0_var(--ink)] mb-8">
              <PartyPopper className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase">
                (entering delulu mode)
              </span>
            </div>
            
            <h1 className="text-3d-sun mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.84] font-black">
              WE KNEW YOU HAD
              <br />
              <span className="text-primary italic">great taste.</span>
            </h1>
            
            <p className="mt-8 max-w-2xl mx-auto font-mono text-sm leading-relaxed tracking-wide text-sun-foreground/90">
              We are currently running around our rooms screaming. The flight tickets are booked. The swim trunks are packed. We already told our parents we made it (please don't make us liars). We took leaves from work for this. We promise to bring good vibes and zero hallucinations to the beach. 🏖️
            </p>

            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-card px-4 py-2 font-mono text-xs tracking-[0.16em] text-foreground uppercase shadow-[0_4px_0_0_var(--ink)]">
                <Heart className="h-4 w-4 text-coral" /> delulu is the solulu
              </span>
              <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-card px-4 py-2 font-mono text-xs tracking-[0.16em] text-foreground uppercase shadow-[0_4px_0_0_var(--ink)]">
                <Plane className="h-4 w-4 text-primary" /> see you in goa
              </span>
            </div>

            {/* The Diorama */}
            <Diorama />
          </div>
        )}
      </section>
    </main>
  );
}

function Diorama() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const dialog = [
    { speaker: "judge", text: "Welcome to Goa. You have 24 hours to build a scalable pipeline." },
    { speaker: "team", text: "Wait, we thought this was a buffet. We are team 'We Came For The Snacks'." },
    { speaker: "judge", text: "There are no snacks. Only high-stress coding and latency checks." },
    { speaker: "team", text: "This is false advertising. Can we run our RAG on a coconut at least?" },
    { speaker: "judge", text: "Only if the coconut returns citations in under 200ms." },
    { speaker: "team", text: "Challenge accepted. But we are expensing our own snacks." },
  ];

  const current = dialog[step] ?? dialog[0]!;

  return (
    <div className="mt-16 mx-auto w-full max-w-3xl border-2 border-ink bg-card rounded-2xl p-6 shadow-[0_8px_0_0_var(--ink)]">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-6 border-b-2 border-ink/10 pb-2">
        🔴 Live feed: Highly serious technical discussion in Goa
      </p>
      <div className="flex items-end justify-between relative h-32 px-4">
        
        {/* Team side */}
        <div className="relative flex flex-col items-center">
          {current.speaker === "team" && (
            <div className="absolute -top-16 left-0 w-48 bg-sun border-2 border-ink rounded-2xl rounded-bl-none p-3 shadow-[4px_4px_0_0_var(--ink)] animate-in fade-in zoom-in duration-300">
              <p className="font-mono text-[11px] font-bold text-sun-foreground">
                {current.text}
              </p>
            </div>
          )}
          <div className="text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">👨‍💻👨‍💻</div>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground text-center">We Came For<br/>The Snacks</p>
        </div>

        {/* Center Beach Elements */}
        <div className="text-6xl animate-[bob_3s_ease-in-out_infinite] pb-4">
          🏖️ 🍹
        </div>

        {/* Judge side */}
        <div className="relative flex flex-col items-center">
          {current.speaker === "judge" && (
            <div className="absolute -top-16 right-0 w-48 bg-primary border-2 border-ink rounded-2xl rounded-br-none p-3 shadow-[4px_4px_0_0_var(--ink)] animate-in fade-in zoom-in duration-300">
              <p className="font-mono text-[11px] font-bold text-primary-foreground">
                {current.text}
              </p>
            </div>
          )}
          <div className="text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] -scale-x-100">🧑‍⚖️🧑‍⚖️</div>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">HHG Judges</p>
        </div>
      </div>
    </div>
  );
}
