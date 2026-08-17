import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Crew = {
  name: string;
  role: string;
  src: string;
  bg: string;
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")";

const EASE = "cubic-bezier(0.4,0,0.2,1)";

export function CrewHero({ crew }: { crew: Crew[] }) {
  const n = crew.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    crew.forEach((c) => {
      const img = new Image();
      img.src = c.src;
    });
  }, [crew]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navigate = (dir: "next" | "prev") => {
    if (lock.current) return;
    lock.current = true;
    setActiveIndex((p) => (dir === "next" ? (p + 1) % n : (p + n - 1) % n));
    window.setTimeout(() => {
      lock.current = false;
    }, 650);
  };

  const roleOf = (i: number): "center" | "left" | "right" | "back" => {
    if (i === activeIndex) return "center";
    if (i === (activeIndex + 1) % n) return "right";
    if (i === (activeIndex + n - 1) % n) return "left";
    return "back";
  };

  const styleFor = (role: string): CSSProperties => {
    if (role === "center")
      return {
        left: "50%",
        bottom: isMobile ? "22%" : 0,
        height: isMobile ? "60%" : "92%",
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: "none",
        opacity: 1,
        zIndex: 20,
      };
    if (role === "back")
      return {
        left: "50%",
        bottom: isMobile ? "32%" : "12%",
        height: isMobile ? "13%" : "22%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(4px)",
        opacity: 1,
        zIndex: 5,
      };
    return {
      left: role === "left" ? (isMobile ? "20%" : "30%") : isMobile ? "80%" : "70%",
      bottom: isMobile ? "32%" : "12%",
      height: isMobile ? "16%" : "28%",
      transform: "translateX(-50%) scale(1)",
      filter: "blur(2px)",
      opacity: 0.85,
      zIndex: 10,
    };
  };

  const active = crew[activeIndex]!;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: active.bg,
        transition: `background-color 650ms ${EASE}`,
      }}
    >
      <div className="relative w-full" style={{ height: "100vh", overflow: "hidden" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 50,
            backgroundImage: GRAIN,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
            opacity: 0.4,
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center select-none"
          style={{ zIndex: 2, top: "18%" }}
        >
          <span
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(90px, 22vw, 340px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            THE CREW
          </span>
        </div>

        <div className="absolute top-6 left-4 sm:left-8" style={{ zIndex: 60 }}>
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: "#fff", opacity: 0.9, letterSpacing: "0.18em" }}
          >
            Voice RAG · Goa 2026
          </span>
        </div>

        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {crew.map((c, i) => {
            const role = roleOf(i);
            return (
              <div
                key={c.name}
                style={{
                  position: "absolute",
                  aspectRatio: "0.6 / 1",
                  ...styleFor(role),
                  transition: `transform 650ms ${EASE}, filter 650ms ${EASE}, opacity 650ms ${EASE}, left 650ms ${EASE}, height 650ms ${EASE}, bottom 650ms ${EASE}`,
                  willChange: "transform, filter, opacity",
                }}
              >
                <img
                  src={c.src}
                  alt={`${c.name} — ${c.role}`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <h2
            className="mb-2 text-base font-bold tracking-widest uppercase sm:mb-3 sm:text-[22px]"
            style={{ color: "#fff", opacity: 0.95, letterSpacing: "0.02em" }}
          >
            {active.name}
          </h2>
          <p
            className="mb-4 hidden text-xs sm:mb-5 sm:block sm:text-sm"
            style={{ color: "#fff", opacity: 0.85, lineHeight: 1.6 }}
          >
            {active.role}
          </p>
          <div className="flex gap-3">
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => navigate(dir)}
                aria-label={dir === "prev" ? "Previous crew member" : "Next crew member"}
                className="grid h-12 w-12 place-items-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: "transparent",
                  border: "2px solid #fff",
                  color: "#fff",
                  transition: "transform 150ms, background-color 150ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {dir === "prev" ? (
                  <ArrowLeft size={26} strokeWidth={2.25} />
                ) : (
                  <ArrowRight size={26} strokeWidth={2.25} />
                )}
              </button>
            ))}
          </div>
        </div>

        <a
          href="#crew-list"
          className="absolute right-4 bottom-6 flex items-center gap-2 sm:right-10 sm:bottom-20"
          style={{
            zIndex: 60,
            fontFamily: "Anton, sans-serif",
            fontSize: "clamp(20px, 4vw, 56px)",
            fontWeight: 400,
            color: "#fff",
            opacity: 0.95,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 200ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.95")}
        >
          Discover it
          <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.25} />
        </a>
      </div>
    </div>
  );
}
