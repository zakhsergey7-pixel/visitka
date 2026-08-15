import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────
   Matrix Rain Canvas
───────────────────────────────────────── */
function MatrixRain({
  className, style: styleProp, opacity = 1, fontSize = 13,
  color = "#00ff41", trail = "rgba(0,0,0,0.05)", speed = 65,
}: {
  className?: string; style?: React.CSSProperties;
  opacity?: number; fontSize?: number; color?: string; trail?: string; speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const chars = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ<>/\\{}|·+—=".split("");
    let w = 0, h = 0, cols = 0, drops: number[] = [], raf = 0, last = 0;
    function resize() {
      const r = canvas!.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / fontSize));
      drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize));
    }
    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      if (t - last < speed) return; last = t;
      ctx.fillStyle = trail; ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillStyle = drops[i] * fontSize > h - fontSize * 3 ? "#ffffff" : color;
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.35 + Math.random() * 0.4;
      }
    }
    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [fontSize, color, trail, speed]);
  return <canvas ref={ref} className={className} style={{ opacity, display: "block", width: "100%", height: "100%", ...styleProp }} />;
}

/* ─────────────────────────────────────────
   CRT Noise Overlay — chunky static grain
───────────────────────────────────────── */
function NoiseOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const SIZE = 120;
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    function draw() {
      const d = ctx.createImageData(SIZE, SIZE);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() > 0.93 ? Math.floor(Math.random() * 200) : 0;
        d.data[i] = 0; d.data[i + 1] = v; d.data[i + 2] = 0; d.data[i + 3] = v;
      }
      ctx.putImageData(d, 0, 0);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", imageRendering: "pixelated" }} />;
}

/* ─────────────────────────────────────────
   Decrypt hook — characters scramble → resolve
───────────────────────────────────────── */
function useDecrypt(text: string, active: boolean, speed = 36) {
  const glyphs = "01ｱｲｳｴｵｶﾀﾁﾂ<>[]{}|\\!@#$%";
  const [out, setOut] = useState(() =>
    text.split("").map(c => (c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0])).join("")
  );
  const pos = useRef(0);
  useEffect(() => {
    if (!active) return;
    pos.current = 0;
    const id = setInterval(() => {
      pos.current += 1.6;
      const p = pos.current;
      setOut(text.split("").map((c, i) => {
        if (c === " ") return " ";
        if (i < p) return c;
        return glyphs[(Math.random() * glyphs.length) | 0];
      }).join(""));
      if (p >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, text, speed]);
  return out;
}

/* ─────────────────────────────────────────
   Glitch text — random corruption burst
───────────────────────────────────────── */
function Glitch({ children }: { children: string }) {
  const [glitching, setGlitching] = useState(false);
  const g = "01ｱｲｳｴｵ<>[]{}|\\";
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 110);
    }, 3400 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);
  if (!glitching) return <span>{children}</span>;
  return <span style={{ color: "#ff0040" }}>{children.split("").map(c => Math.random() > 0.55 ? g[(Math.random() * g.length) | 0] : c).join("")}</span>;
}

/* ─────────────────────────────────────────
   Scroll reveal
───────────────────────────────────────── */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } }, { threshold: 0.08 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .9s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Signal bars — nav indicator
───────────────────────────────────────── */
function SignalBars() {
  const [level, setLevel] = useState(4);
  useEffect(() => {
    const id = setInterval(() => setLevel(Math.random() > 0.15 ? 4 : 3), 2800 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, marginLeft: 10 }}>
      {[1, 2, 3, 4].map(b => (
        <span key={b} style={{ width: 3, height: b * 3 + 1, background: b <= level ? "#00ff41" : "#003b00", display: "block", transition: "background .5s", boxShadow: b <= level ? "0 0 4px #00ff41" : "none" }} />
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────
   Nav
───────────────────────────────────────── */
const NAV_LINKS: [string, string][] = [["#services","Услуги"],["#ai","Консьерж"],["#price","Стоимость"],["#contact","Связаться"]];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 80, borderBottom: scrolled || open ? "1px solid rgba(0,255,65,.14)" : "1px solid transparent", background: scrolled || open ? "rgba(0,0,0,.93)" : "transparent", backdropFilter: scrolled || open ? "blur(12px)" : "none", transition: "background .4s,border-color .4s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px clamp(20px,5vw,90px)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <a href="#top" onClick={() => setOpen(false)} style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: "#00ff41", letterSpacing: ".1em", textDecoration: "none" }}>
            <span style={{ color: "#008f11" }}>[</span>З/С<span style={{ color: "#008f11" }}>]</span>
          </a>
          <SignalBars />
        </div>
        <nav className="nav-links" style={{ display: "flex", gap: "clamp(14px,2.8vw,28px)", ...mono }}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} style={{ color: "#008f11", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00ff41")}
              onMouseLeave={e => (e.currentTarget.style.color = "#008f11")}>{label}</a>
          ))}
        </nav>
        <button className="nav-toggle" onClick={() => setOpen(o => !o)} style={{ ...mono, display: "none", background: "transparent", border: "1px solid rgba(0,255,65,.35)", color: "#00ff41", padding: "6px 10px", cursor: "pointer" }}>
          [ {open ? "×" : "MENU"} ]
        </button>
      </div>
      {open && (
        <nav className="nav-mobile-panel" style={{ display: "flex", flexDirection: "column", padding: "4px clamp(20px,5vw,90px) 18px" }}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} style={{ ...mono, color: "#00ff41", textDecoration: "none", padding: "13px 0", borderTop: "1px solid rgba(0,255,65,.1)" }}>{label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────
   Hero
───────────────────────────────────────── */
const DEAD_PIXELS = [{ top: "28%", left: "9%" }, { top: "71%", left: "82%" }, { top: "44%", left: "58%" }, { top: "17%", left: "73%" }, { top: "88%", left: "22%" }];

function Hero() {
  const headline = useDecrypt("Сайт — это инструмент,\nа не просто картинка.", true);
  const [cur, setCur] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => { const id = setInterval(() => setCur(p => !p), 550); return () => clearInterval(id); }, []);
  const onMouseMove = (e: React.MouseEvent) => {
    const r = secRef.current?.getBoundingClientRect();
    if (r) setMouse({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
  };
  return (
    <section ref={secRef} onMouseMove={onMouseMove} style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(120px,18vh,200px) clamp(20px,5vw,90px) 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MatrixRain opacity={0.13} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.055)" speed={58} />
      </div>
      <NoiseOverlay />
      {/* Dead pixel artifacts */}
      {DEAD_PIXELS.map((p, i) => (
        <div key={i} style={{ position: "absolute", width: 2, height: 2, background: "#00ff41", boxShadow: "0 0 3px #00ff41", zIndex: 1, pointerEvents: "none", animation: `hudBlink ${3.5 + i * 1.4}s steps(1) infinite ${i * 0.8}s`, ...p }} />
      ))}
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)" }} />
      {/* HUD corners */}
      <div style={{ position: "absolute", top: "clamp(80px,13vh,140px)", left: "clamp(20px,5vw,90px)", right: "clamp(20px,5vw,90px)", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.28)", zIndex: 2, pointerEvents: "none" }}>
        <span>SYS.<span style={{ color: "#00ff41", animation: "hudBlink 8s steps(1) infinite" }}>ONLINE</span> · UPTIME 05Y</span>
        <span style={{ textAlign: "right" }}>55.7522° N · 37.6156° E<br />BUILD 2026.08</span>
      </div>
      {/* Mouse coordinates */}
      <div style={{ position: "absolute", bottom: "clamp(80px,12vh,120px)", right: "clamp(20px,5vw,90px)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".14em", color: "rgba(0,255,65,.22)", zIndex: 2, pointerEvents: "none", textTransform: "uppercase" }}>
        CURSOR [{mouse.x.toString().padStart(4, "0")}, {mouse.y.toString().padStart(4, "0")}]
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <h1 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(28px,5.4vw,86px)", lineHeight: 1.06, letterSpacing: "-.02em", color: "#00ff41", animation: "neonPulse 4.5s ease-in-out infinite", maxWidth: "22ch", whiteSpace: "pre-line" }}>
          {headline}<span style={{ opacity: cur ? 1 : 0 }}>_</span>
        </h1>
      </div>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "end", borderTop: "1px solid rgba(0,255,65,.16)", padding: "22px 0 26px", marginTop: "clamp(36px,8vh,80px)" }}>
        <p style={{ maxWidth: "44ch", fontSize: 13.5, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.65 }}>
          Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>Листайте</span>
          <span style={{ width: 48, height: 1, background: "#003b00", position: "relative", overflow: "hidden", display: "block" }}>
            <span style={{ position: "absolute", inset: 0, background: "#00ff41", animation: "slideBar 2s linear infinite" }} />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Decode Stream Divider — replaces Ticker
   Instead of a smooth oscilloscope curve,
   a flat row of matrix glyphs flickers at
   random and a "decode head" sweeps across,
   resolving nearby characters to solid bright
   green — same code-rain language as the rest
   of the site, laid on its side, no wave shape.
───────────────────────────────────────── */
function DecodeStreamDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const chars = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ<>/\\{}|·+—=".split("");
    const cell = 15;
    let w = 0, h = 0, cols = 0, cells: string[] = [], raf = 0, last = 0;

    function resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas!.offsetWidth; h = canvas!.offsetHeight;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / cell));
      cells = Array.from({ length: cols }, () => chars[(Math.random() * chars.length) | 0]);
    }

    function draw(t: number) {
      raf = requestAnimationFrame(draw);
      if (t - last < 60) return; last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cell - 2}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "middle";

      const span = cols + 40;
      headRef.current += 0.7;
      const headPos = (headRef.current % span) - 20;

      for (let i = 0; i < cols; i++) {
        if (Math.random() < 0.05) cells[i] = chars[(Math.random() * chars.length) | 0];
        const dist = Math.abs(i - headPos);
        const resolved = dist < 5;
        const near = dist < 13;
        ctx.shadowBlur = resolved ? 8 : 0;
        ctx.shadowColor = "#00ff41";
        ctx.fillStyle = resolved ? "#ffffff" : near ? "#00ff41" : "rgba(0,255,65,.2)";
        ctx.fillText(cells[i], i * cell + 2, h / 2);
      }
      ctx.shadowBlur = 0;

      const hx = headPos * cell;
      const grad = ctx.createLinearGradient(hx - 34, 0, hx + 34, 0);
      grad.addColorStop(0, "rgba(0,255,65,0)");
      grad.addColorStop(0.5, "rgba(0,255,65,.3)");
      grad.addColorStop(1, "rgba(0,255,65,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(hx - 34, 0, 68, h);

      if (readoutRef.current) {
        const pct = Math.max(0, Math.min(99.9, ((headRef.current % span) / span) * 100));
        const sync = Math.floor((headRef.current * 137) % 0xffff).toString(16).toUpperCase().padStart(4, "0");
        readoutRef.current.textContent = `PACKETS ${Math.floor(48213 + headRef.current * 37).toString().padStart(6, "0")} · SYNC 0x${sync} · INTEGRITY ${pct.toFixed(1)}%`;
      }
    }

    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".13em", textTransform: "uppercase" };
  return (
    <div style={{ position: "relative", height: 76, background: "#000", borderTop: "1px solid rgba(0,255,65,.13)", borderBottom: "1px solid rgba(0,255,65,.13)", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(20px,5vw,90px)", pointerEvents: "none" }}>
        <span style={{ ...mono, fontSize: 10, color: "rgba(0,255,65,.55)" }}>STREAM_IN ▶</span>
        <span ref={readoutRef} style={{ ...mono, fontSize: 9, color: "rgba(0,255,65,.28)" }}>PACKETS 048213 · SYNC 0x4F2A · INTEGRITY 0.0%</span>
        <span style={{ ...mono, fontSize: 10, color: "rgba(0,255,65,.55)" }}>▶ STREAM_OUT</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Mission — staggered manifesto
   Each line at a different x-offset,
   decrypts in on scroll entry.
───────────────────────────────────────── */
function Mission() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); ob.disconnect(); } }, { threshold: 0.15 });
    ob.observe(el); return () => ob.disconnect();
  }, []);

  const stmt = useDecrypt("Я превращаю бизнес\nв цифровой актив.", active, 30);
  const sub = useDecrypt("Один исполнитель — одна точка ответственности — один результат.", active && stmt.includes("актив"), 22);

  const lines = [
    { t: "Не картинка.", pad: "0" },
    { t: "Инструмент.", pad: "clamp(28px,5vw,80px)" },
    { t: "Который продаёт.", pad: "clamp(14px,2.5vw,40px)" },
    { t: "Пока вы спите.", pad: "clamp(42px,7vw,110px)" },
  ];
  const [shown, setShown] = useState<boolean[]>([false, false, false, false]);
  useEffect(() => {
    if (!active) return;
    lines.forEach((_, i) => setTimeout(() => setShown(p => { const n = [...p]; n[i] = true; return n; }), 600 + i * 220));
  }, [active]);

  return (
    <section style={{ padding: "clamp(90px,14vh,160px) clamp(20px,5vw,90px)", background: "#000", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.06} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.04)" speed={90} />
      </div>
      {/* Vertical label */}
      <div style={{ position: "absolute", left: "clamp(20px,5vw,90px)", top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "center center", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(0,255,65,.2)", whiteSpace: "nowrap", pointerEvents: "none" }}>
        МИССИЯ · MISSION · МИССИЯ
      </div>

      <div ref={ref} style={{ position: "relative", zIndex: 1, paddingLeft: "clamp(20px,4vw,60px)" }}>
        {/* Main decrypt statement */}
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(32px,6vw,96px)", lineHeight: 1.0, letterSpacing: "-.03em", color: "#00ff41", animation: active ? "neonPulse 5s ease-in-out infinite" : "none", whiteSpace: "pre-line", marginBottom: "clamp(40px,7vh,80px)" }}>
          {stmt}<span style={{ opacity: active && !stmt.includes("актив") ? 1 : 0 }}>_</span>
        </div>

        {/* Staggered manifesto lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px,1.2vh,14px)", marginBottom: "clamp(44px,8vh,90px)" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ paddingLeft: l.pad, opacity: shown[i] ? 1 : 0, transform: shown[i] ? "none" : "translateX(-16px)", transition: "opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: i % 2 === 0 ? 700 : 300, fontSize: "clamp(18px,2.8vw,42px)", color: i % 2 === 0 ? "#00ff41" : "transparent", WebkitTextStroke: i % 2 === 0 ? "0px" : "1px rgba(0,255,65,.6)", letterSpacing: "-.01em" }}>
                {l.t}
              </span>
            </div>
          ))}
        </div>

        {/* Sub-statement */}
        <div style={{ borderLeft: "2px solid rgba(0,255,65,.3)", paddingLeft: "clamp(16px,2.5vw,32px)", maxWidth: "55ch" }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(12px,1.3vw,16px)", color: "#008f11", lineHeight: 1.7, letterSpacing: ".02em" }}>
            {sub}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Process bar — block character fill
───────────────────────────────────────── */
function ProcessBar({ target, delay, animate }: { target: number; delay: number; animate: boolean }) {
  const [val, setVal] = useState(0);
  const TOTAL = 14;
  useEffect(() => {
    if (!animate) return;
    let interval: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setVal(v => {
          const next = Math.min(target, v + 2);
          if (next >= target) clearInterval(interval);
          return next;
        });
      }, 18);
    }, delay);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [animate, target, delay]);
  const filled = Math.round(val / 100 * TOTAL);
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: 1, color: val >= target ? "#00ff41" : "#008f11" }}>
      {"█".repeat(filled)}{"░".repeat(TOTAL - filled)}
    </span>
  );
}

/* ─────────────────────────────────────────
   AI Консьерж — htop process viewer
   Completely original: services rendered
   as a live terminal process list with
   animated block-char progress bars.
───────────────────────────────────────── */
function AIConsierge() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); ob.disconnect(); } }, { threshold: 0.18 });
    ob.observe(el); return () => ob.disconnect();
  }, []);

  const procs = [
    { pid: "001", name: "захват_брифа............", fill: 100, delay: 0,    status: "DONE  ✓", desc: "AI разбирает ваш бизнес на части, до начала работы" },
    { pid: "002", name: "анализ_конкурентов......", fill: 100, delay: 280,  status: "DONE  ✓", desc: "Понимаем контекст рынка, а не работаем в вакууме" },
    { pid: "003", name: "персональный_дизайн.....", fill: 76,  delay: 560,  status: "ACTIVE", desc: "Решение под вас — без шаблонов из общего доступа" },
    { pid: "004", name: "итерации_без_лимита.....", fill: 51,  delay: 840,  status: "RUNNING", desc: "Правки до результата, без доплат за каждый круг" },
    { pid: "005", name: "поддержка_после_запуска.", fill: 22,  delay: 1120, status: "QUEUED", desc: "Остаюсь на связи — сайт живёт, а не стоит" },
  ];

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" };
  const statusColor = (s: string) => s.startsWith("DONE") ? "#00ff41" : s === "ACTIVE" ? "#7dffaa" : s === "RUNNING" ? "#008f11" : "rgba(0,255,65,.35)";

  return (
    <section id="ai" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      {/* Decorative giant "AI" behind content */}
      <div style={{ position: "absolute", top: "50%", left: "-3%", transform: "translateY(-50%)", ...mono, fontWeight: 700, fontSize: "clamp(160px,26vw,380px)", lineHeight: 0.82, color: "transparent", WebkitTextStroke: "1px rgba(0,255,65,.05)", letterSpacing: "-.04em", userSelect: "none", pointerEvents: "none" }}>
        AI
      </div>

      <div ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "flex", gap: "clamp(16px,4vw,60px)", alignItems: "start", borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: "clamp(36px,6vh,64px)" }}>
            <span style={{ ...mono, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11", whiteSpace: "nowrap" }}>00 / Уникальность</span>
            <div>
              <h2 style={{ ...mono, fontWeight: 700, fontSize: "clamp(20px,3.4vw,50px)", letterSpacing: "-.02em", color: "#00ff41", lineHeight: 1.05, animation: "neonPulse 5s ease-in-out infinite 0.8s" }}>
                AI-консьерж сервис —<br />уровень крупного агентства<br />
                <span style={{ color: "#ff0040", WebkitTextStroke: "0px" }}>для одного клиента.</span>
              </h2>
              <p style={{ ...mono, fontSize: 13, color: "#008f11", lineHeight: 1.7, maxWidth: "52ch", marginTop: 16 }}>
                Каждый проект проходит через AI-анализ брифа — я вижу задачу глубже, чем вы её описываете. Никаких шаблонов, никаких очередей.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Terminal process viewer */}
        <Reveal delay={100}>
          <div style={{ border: "1px solid rgba(0,255,65,.2)", animation: "borderGlow 4s ease-in-out infinite" }}>
            {/* Terminal chrome */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid rgba(0,255,65,.15)", background: "#0a1a0a" }}>
              <div style={{ display: "flex", gap: 7 }}>
                {["#ff5f57","#ffbd2e","#28c840"].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "block" }} />)}
                <span style={{ ...mono, fontSize: 10, color: "#008f11", letterSpacing: ".14em", marginLeft: 8 }}>~/ai-concierge/ps_aux</span>
              </div>
              <span style={{ ...mono, fontSize: 10, color: "#ff0040", letterSpacing: ".1em" }}>VER 2.0 ●</span>
            </div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "10px 16px 8px", borderBottom: "1px solid rgba(0,255,65,.1)", ...mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.35)" }}>
              <span>PID</span><span>СЕРВИС</span><span>ПРОГРЕСС</span><span>СТАТУС</span>
            </div>
            {/* Process rows */}
            {procs.map((p, i) => (
              <div key={p.pid} style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "14px 16px", borderBottom: i < procs.length - 1 ? "1px solid rgba(0,255,65,.07)" : "none", alignItems: "center", background: i % 2 === 0 ? "rgba(0,255,65,.015)" : "transparent", transition: "background .3s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,65,.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,255,65,.015)" : "transparent")}>
                <span style={{ ...mono, fontSize: 11, color: "rgba(0,255,65,.35)" }}>{p.pid}</span>
                <div>
                  <span style={{ ...mono, fontSize: 12, color: "#008f11" }}>{p.name}</span>
                  <div style={{ ...mono, fontSize: 11, color: "rgba(0,255,65,.3)", marginTop: 3 }}>{p.desc}</div>
                </div>
                <ProcessBar target={p.fill} delay={p.delay} animate={animate} />
                <span style={{ ...mono, fontSize: 10, color: statusColor(p.status), letterSpacing: ".06em" }}>{p.status}</span>
              </div>
            ))}
            {/* Footer line */}
            <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(0,255,65,.1)", ...mono, fontSize: 10, color: "rgba(0,255,65,.3)", letterSpacing: ".12em", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
              <span>5 SERVICES · UPTIME 5 YRS</span>
              <span>EXIT CODE: 0 · MEMORY: 0 LEAKED</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Terminal window wrapper
───────────────────────────────────────── */
function TerminalBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(0,255,65,.25)", background: "#050f05", fontFamily: "'JetBrains Mono',monospace" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "1px solid rgba(0,255,65,.18)", background: "#0a1a0a" }}>
        {["#ff5f57","#ffbd2e","#28c840"].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{title}</span>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Services
───────────────────────────────────────── */
function Services() {
  const services = [
    { id: "A", name: "Сайт-визитка", desc: "Компактный сайт о вас и вашей услуге: кто вы, что делаете, сколько стоит, как связаться. Открывается быстро, читается с телефона." },
    { id: "B", name: "Лендинг", desc: "Одна страница под одну задачу — заявки. Структура строится под ваше предложение и возражения клиентов, а не по универсальному шаблону." },
    { id: "C", name: "Каталог и многостраничник", desc: "Товары или услуги с фильтрами, страницами разделов и админкой, в которой вы сами меняете тексты и цены без моей помощи." },
    { id: "D", name: "Редизайн и доработка", desc: "Сайт есть, но выглядит на десять лет старше вашего бизнеса. Разбираю, чиню, обновляю — без переезда на новый домен." },
  ];
  return (
    <section id="services" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)" }}>
      <Reveal>
        <div style={{ display: "flex", gap: "clamp(16px,4vw,60px)", alignItems: "start", borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: "clamp(40px,7vh,72px)" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11", whiteSpace: "nowrap" }}>01 / Что делаю</span>
          <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", letterSpacing: "-.02em", color: "#00ff41", lineHeight: 1.05 }}>
            Один человек отвечает за <span style={{ textDecorationLine: "underline", textDecorationColor: "rgba(0,255,65,.4)" }}>весь</span> результат.
          </h2>
        </div>
      </Reveal>
      <div style={{ borderTop: "1px solid rgba(0,255,65,.12)" }}>
        {services.map((svc, i) => (
          <Reveal key={svc.id} delay={i * 80}>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1.4fr", gap: "clamp(14px,3vw,44px)", padding: "28px 0", borderBottom: "1px solid rgba(0,255,65,.12)", alignItems: "baseline", transition: "background .3s,padding-left .3s", cursor: "default" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,255,65,.04)"; (e.currentTarget as HTMLElement).style.paddingLeft = "12px"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.paddingLeft = "0"; }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{svc.id}</span>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 400, fontSize: "clamp(16px,2.1vw,27px)", color: "#00ff41", letterSpacing: "-.02em" }}><Glitch>{svc.name}</Glitch></h3>
              <p style={{ color: "#008f11", fontSize: 14, lineHeight: 1.6, fontFamily: "'JetBrains Mono',monospace" }}>{svc.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Price
───────────────────────────────────────── */
function Price() {
  const li = (text: string, hi?: boolean) => (
    <li key={text} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10 }}>
      <span style={{ color: hi ? "#7dffaa" : "#00ff41" }}>→</span><span>{text}</span>
    </li>
  );
  return (
    <section id="price" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.07} fontSize={13} color="#00ff41" trail="rgba(5,15,5,.06)" speed={80} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ display: "flex", gap: "clamp(16px,4vw,60px)", alignItems: "start", borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: "clamp(40px,7vh,72px)" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11", whiteSpace: "nowrap" }}>02 / Стоимость</span>
            <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", letterSpacing: "-.02em", color: "#00ff41", lineHeight: 1.05 }}>
              Два формата. Цена <span style={{ textDecorationLine: "underline", textDecorationColor: "rgba(0,255,65,.4)" }}>фиксируется</span> до старта.
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(0,255,65,.12)", border: "1px solid rgba(0,255,65,.18)", animation: "borderGlow 4.5s ease-in-out infinite" }}>
            <div style={{ background: "#050f05", padding: "clamp(22px,4vw,42px)", display: "flex", flexDirection: "column", gap: 20, transition: "background .4s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0a1a0a")}
              onMouseLeave={e => (e.currentTarget.style.background = "#050f05")}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}><span>Пакет «База»</span><span>2 недели</span></div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(28px,4.8vw,66px)", lineHeight: .9, color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,.3)" }}>
                50 000 ₽<small style={{ display: "block", fontSize: ".3em", fontWeight: 400, color: "#008f11", marginTop: 10 }}>Сайт-визитка или лендинг</small>
              </div>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15, color: "#00ff41" }}>Когда нужен рабочий сайт, а не выставка</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", padding: 0 }}>
                {["До 5 экранов на одной странице","Индивидуальный дизайн, без готовых тем","Адаптив под телефон и планшет","Форма заявки на почту или в Telegram","Подключение домена и хостинга","Базовая настройка SEO и метрики","2 круга правок"].map(t => li(t))}
              </ul>
              <a href="#contact" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(0,255,65,.18)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#00ff41", textDecoration: "none" }}>Обсудить проект <span>→</span></a>
            </div>
            <div style={{ background: "#003b00", padding: "clamp(22px,4vw,42px)", display: "flex", flexDirection: "column", gap: 20, transition: "background .4s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#004d00")}
              onMouseLeave={e => (e.currentTarget.style.background = "#003b00")}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7dffaa" }}><span>Пакет «Полный»</span><span>3–4 недели</span></div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(28px,4.8vw,66px)", lineHeight: .9, color: "#00ff41", textShadow: "0 0 30px rgba(0,255,65,.5)" }}>
                100 000 ₽<small style={{ display: "block", fontSize: ".3em", fontWeight: 400, color: "#7dffaa", marginTop: 10 }}>Многостраничный сайт или каталог</small>
              </div>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15, color: "#00ff41" }}>Когда сайт — основной канал продаж</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#c8ffe0", fontFamily: "'JetBrains Mono',monospace", padding: 0 }}>
                {["Всё из пакета «База»","До 10 страниц или каталог с фильтрами","Админка: сами меняете тексты, цены, фото","Анимации и проработанные состояния","Копирайтинг основных страниц","Интеграции: CRM, оплата, мессенджеры","Месяц поддержки после запуска"].map(t => li(t, true))}
              </ul>
              <a href="#contact" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#00ff41", textDecoration: "none" }}>Обсудить проект <span>→</span></a>
            </div>
          </div>
        </Reveal>
        <p style={{ marginTop: 22, fontSize: 13, color: "#008f11", maxWidth: "60ch", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
          Цены — за проект целиком, без почасовки и «доплатите за ещё один блок». Работаю по предоплате 50%.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Process
───────────────────────────────────────── */
function Process() {
  const steps = [
    { n: "01", title: "Разговор", desc: "Полчаса о вашем бизнесе, клиентах и том, что должно случиться после захода на сайт. По итогу — смета и срок.", t: "День 1" },
    { n: "02", title: "Структура", desc: "Собираю прототип: что за чем идёт и почему. Правки на этом шаге бесплатны и почти ничего не стоят по времени.", t: "Дни 2–4" },
    { n: "03", title: "Дизайн и вёрстка", desc: "Показываю макет, согласуем, верстаю. Промежуточную версию открываете по ссылке в любой момент.", t: "Дни 5–12" },
    { n: "04", title: "Запуск", desc: "Домен, хостинг, метрика, проверка на реальных телефонах. Показываю, как самому менять контент.", t: "Дни 13–14" },
  ];
  return (
    <section id="process" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)" }}>
      <Reveal>
        <div style={{ display: "flex", gap: "clamp(16px,4vw,60px)", alignItems: "start", borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: "clamp(40px,7vh,72px)" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11", whiteSpace: "nowrap" }}>03 / Процесс</span>
          <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", letterSpacing: "-.02em", color: "#00ff41", lineHeight: 1.05 }}>
            Четыре шага. Вы видите результат <span style={{ textDecorationLine: "underline", textDecorationColor: "rgba(0,255,65,.4)" }}>на каждом</span>.
          </h2>
        </div>
      </Reveal>
      <Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(0,255,65,.1)", borderTop: "1px solid rgba(0,255,65,.18)", borderBottom: "1px solid rgba(0,255,65,.18)" }}>
          {steps.map(step => (
            <div key={step.n} style={{ background: "#000", padding: "28px 22px 32px", display: "flex", flexDirection: "column", gap: 11, minHeight: 220, transition: "background .3s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#050f05")}
              onMouseLeave={e => (e.currentTarget.style.background = "#000")}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", color: "#00ff41" }}>{step.n}</span>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 400, fontSize: 18, color: "#00ff41", letterSpacing: "-.02em" }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.55 }}>{step.desc}</p>
              <span style={{ marginTop: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(0,255,65,.35)" }}>{step.t}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────────────────────
   Contact
───────────────────────────────────────── */
function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = `Имя: ${d.get("name")||""}\nКонтакт: ${d.get("contact")||""}\n\nЗадача:\n${d.get("task")||""}`;
    window.location.href = `mailto:mail@example.ru?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(body)}`;
  };
  const inp: React.CSSProperties = { background: "transparent", border: 0, borderBottom: "1px solid rgba(0,255,65,.25)", padding: "10px 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: "#00ff41", width: "100%", outline: "none", transition: "border-color .3s" };
  return (
    <section id="contact" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", borderTop: "1px solid rgba(0,255,65,.18)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.06} fontSize={13} color="#00ff41" trail="rgba(0,0,0,.05)" speed={90} />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: "clamp(30px,6vw,80px)" }}>
        <Reveal>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>04 / Связаться</span>
          <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(26px,5vw,70px)", lineHeight: .97, letterSpacing: "-.04em", color: "#00ff41", marginTop: 20, marginBottom: 20, animation: "neonPulse 4.5s ease-in-out infinite .5s" }}>
            Расскажите,<br />что нужно<br /><span style={{ textDecorationLine: "underline", textDecorationColor: "rgba(0,255,65,.3)" }}>сделать.</span>
          </h2>
          <p style={{ maxWidth: "40ch", color: "#008f11", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.6 }}>
            Отвечаю в течение дня. Если проект не мой — честно скажу и подскажу, к кому пойти.
          </p>
          <div style={{ marginTop: 32, borderTop: "1px solid rgba(0,255,65,.18)" }}>
            {[
              { href: "https://t.me/username", label: "Telegram", sub: "@username" },
              { href: "tel:+70000000000", label: "Телефон", sub: "+7 000 000-00-00" },
              { href: "mailto:mail@example.ru", label: "Почта", sub: "mail@example.ru" },
            ].map(ch => (
              <a key={ch.href} href={ch.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(0,255,65,.18)", fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(14px,1.8vw,20px)", letterSpacing: "-.02em", color: "#00ff41", textDecoration: "none", transition: "padding-left .3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingLeft = "10px"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingLeft = "0"; }}>
                {ch.label}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>{ch.sub}</span>
              </a>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <TerminalBox title="~/contact/form.sh">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ id: "f-name", name: "name", label: "Как вас зовут", type: "text" }, { id: "f-contact", name: "contact", label: "Telegram или телефон", type: "text" }].map(f => (
                <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor={f.id} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>
                    <span style={{ color: "#00ff41" }}>$ </span>{f.label}
                  </label>
                  <input id={f.id} name={f.name} type={f.type} required style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00ff41")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,255,65,.25)")} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="f-task" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>
                  <span style={{ color: "#00ff41" }}>$ </span>Что за проект
                </label>
                <textarea id="f-task" name="task" placeholder="Пара предложений о бизнесе и задаче"
                  style={{ ...inp, resize: "vertical", minHeight: 76 } as React.CSSProperties}
                  onFocus={e => (e.currentTarget.style.borderColor = "#00ff41")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,255,65,.25)")} />
              </div>
              <button type="submit" style={{ marginTop: 10, background: "#00ff41", color: "#000", padding: "15px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", border: "none", fontWeight: 700, transition: "background .3s,box-shadow .3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#7dffaa"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(0,255,65,.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#00ff41"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <span>./send_request.sh</span><span>→</span>
              </button>
              <p style={{ fontSize: 12, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.5 }}>Форма откроет ваш почтовый клиент с готовым письмом.</p>
            </form>
          </TerminalBox>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Footer
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "#050f05", borderTop: "1px solid rgba(0,255,65,.18)" }}>
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderBottom: "1px solid rgba(0,255,65,.12)", padding: "18px 0" }}>
        <div style={{ display: "inline-flex", gap: 40, animation: "marqAnim 36s linear infinite", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(32px,9vw,124px)", letterSpacing: "-.05em", lineHeight: 1, color: "transparent", WebkitTextStroke: "1px rgba(0,255,65,.18)" }}>
          <span>SERGEI ZAKHAROV — WEB DESIGN — AI CONCIERGE — SERGEI ZAKHAROV — </span>
          <span>SERGEI ZAKHAROV — WEB DESIGN — AI CONCIERGE — SERGEI ZAKHAROV — </span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "22px clamp(20px,5vw,90px) 28px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: "#008f11" }}>
        <span>© 2026 Захаров Сергей</span>
        <span>Разработка сайтов · AI консьерж · 5 лет</span>
        <a href="#top" style={{ color: "#00ff41", textDecoration: "none" }}>Наверх ↑</a>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   Keyframes
───────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes slideBar  { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes marqAnim  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes neonPulse {
    0%,100% { text-shadow: 0 0 10px rgba(0,255,65,.4), 0 0 28px rgba(0,255,65,.18); }
    50%     { text-shadow: 0 0 20px rgba(0,255,65,.85), 0 0 52px rgba(0,255,65,.4), 0 0 88px rgba(0,255,65,.12); }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 0 rgba(0,255,65,0);    border-color: rgba(0,255,65,.2); }
    50%     { box-shadow: 0 0 20px rgba(0,255,65,.2); border-color: rgba(0,255,65,.48); }
  }
  @keyframes hudBlink {
    0%,93%,100% { opacity:1 }
    94%,96%     { opacity:0 }
    95%,97%     { opacity:1 }
    98%,99%     { opacity:.3 }
  }

  @media (max-width: 640px) {
    .nav-links   { display: none !important; }
    .nav-toggle  { display: inline-flex !important; }
  }
`;

/* ─────────────────────────────────────────
   App
───────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: "#000", color: "#00ff41", minHeight: "100vh" }}>
      <style>{KEYFRAMES}</style>
      <Nav />
      <main id="top">
        <Hero />
        <DecodeStreamDivider />
        <Mission />
        <AIConsierge />
        <Services />
        <Price />
        <Process />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
