import { useEffect, useRef, useState } from "react";

export type Member = {
  name: string;
  role: string;
  line: string;
  img: string;
};

export function Carousel3D({ members }: { members: Member[] }) {
  const n = members.length;
  const step = 360 / n;
  const radius = 380;
  const [angle, setAngle] = useState(0);
  const [auto, setAuto] = useState(true);
  const drag = useRef<{ x: number; a: number } | null>(null);

  useEffect(() => {
    if (!auto) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setAngle((a) => a + dt * 0.012);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const onDown = (x: number) => {
    setAuto(false);
    drag.current = { x, a: angle };
  };
  const onMove = (x: number) => {
    if (!drag.current) return;
    setAngle(drag.current.a + (x - drag.current.x) * 0.35);
  };
  const onUp = () => {
    drag.current = null;
  };

  const active = ((Math.round(-angle / step) % n) + n) % n;

  return (
    <div className="select-none">
      <div
        className="relative h-[420px] cursor-grab active:cursor-grabbing sm:h-[520px]"
        style={{ perspective: "1400px" }}
        onMouseDown={(e) => onDown(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0]!.clientX)}
        onTouchMove={(e) => onMove(e.touches[0]!.clientX)}
        onTouchEnd={onUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-${radius}px) rotateY(${angle}deg)`,
          }}
        >
          {members.map((m, i) => {
            const rot = (((angle + i * step) % 360) + 360) % 360;
            const c = Math.cos((rot * Math.PI) / 180);
            return (
            <div
              key={m.name}
              className="absolute top-1/2 left-1/2 w-[240px] sm:w-[280px]"
              style={{
                transformStyle: "preserve-3d",
                transform: `translate(-50%,-50%) rotateY(${i * step}deg) translateZ(${radius}px)`,
                opacity: c < -0.15 ? 0 : 0.45 + 0.55 * Math.max(0, c),
                pointerEvents: c < 0.4 ? "none" : "auto",
              }}
            >
              <div
                className={`gloss rounded-3xl border-2 border-ink bg-card p-5 text-center shadow-[0_14px_0_0_var(--ink),0_34px_44px_-26px_rgba(0,0,0,.55)] transition-colors ${
                  i === active ? "bg-sun" : ""
                }`}
              >
                <div className="mx-auto grid h-40 w-40 place-items-center rounded-2xl border-2 border-ink bg-sand shadow-[inset_0_-8px_0_0_rgba(0,0,0,.08)] sm:h-48 sm:w-48">
                  <img
                    src={m.img}
                    alt={`${m.name}, ${m.role}`}
                    width={768}
                    height={768}
                    loading="lazy"
                    className="h-full w-full object-contain drop-shadow-[0_14px_10px_rgba(0,0,0,.35)]"
                  />
                </div>
                <h3 className="mt-4 font-display text-2xl leading-none font-black">
                  {m.name}
                </h3>
                <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-primary uppercase">
                  {m.role}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {m.line}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            setAuto(false);
            setAngle((a) => a + step);
          }}
          className="rounded-full border-2 border-ink bg-card px-5 py-2 font-mono text-[11px] tracking-[0.2em] uppercase shadow-[0_4px_0_0_var(--ink)] active:translate-y-0.5"
        >
          prev
        </button>
        <button
          onClick={() => setAuto((v) => !v)}
          className="rounded-full border-2 border-ink bg-primary px-5 py-2 font-mono text-[11px] tracking-[0.2em] text-primary-foreground uppercase shadow-[0_4px_0_0_var(--ink)] active:translate-y-0.5"
        >
          {auto ? "pause" : "roll"}
        </button>
        <button
          onClick={() => {
            setAuto(false);
            setAngle((a) => a - step);
          }}
          className="rounded-full border-2 border-ink bg-card px-5 py-2 font-mono text-[11px] tracking-[0.2em] uppercase shadow-[0_4px_0_0_var(--ink)] active:translate-y-0.5"
        >
          next
        </button>
      </div>
    </div>
  );
}
