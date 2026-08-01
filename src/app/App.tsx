import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────
   Matrix Rain Canvas
───────────────────────────────────────── */
function MatrixRain({
  className,
  style: styleProp,
  opacity = 1,
  fontSize = 13,
  color = "#00ff41",
  trail = "rgba(0,0,0,0.05)",
  speed = 65,
}: {
  className?: string;
  style?: React.CSSProperties;
  opacity?: number;
  fontSize?: number;
  color?: string;
  trail?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const chars = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ<>/\\{}|·+—=".split("");
    let w = 0, h = 0, cols = 0, drops: number[] = [], raf = 0, last = 0;
    let activeFontSize = fontSize;
    function resize() {
      const r = canvas!.getBoundingClientRect();
      // На узких экранах (телефоны) считаем меньше столбцов и не берём
      // двойной DPR — картинка не теряется в качестве, но заметно легче
      // для слабых мобильных GPU/CPU и меньше сажает батарею.
      const isNarrow = window.innerWidth < 640;
      const dpr = Math.min(isNarrow ? 1 : 2, devicePixelRatio || 1);
      activeFontSize = isNarrow ? fontSize * 1.35 : fontSize;
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / activeFontSize));
      drops = Array.from({ length: cols }, () => Math.random() * (h / activeFontSize));
    }
    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      if (t - last < speed) return;
      last = t;
      ctx.fillStyle = trail;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${activeFontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        const isHead = drops[i] * activeFontSize > h - activeFontSize * 3;
        ctx.fillStyle = isHead ? "#ffffff" : color;
        ctx.fillText(ch, i * activeFontSize, drops[i] * activeFontSize);
        if (drops[i] * activeFontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.35 + Math.random() * 0.4;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [fontSize, color, trail, speed]);
  return (
    <canvas
      ref={ref}
      className={className}
      style={{ opacity, display: "block", width: "100%", height: "100%", ...styleProp }}
    />
  );
}

/* ─────────────────────────────────────────
   Typewriter hook
───────────────────────────────────────── */
function useTypewriter(text: string, speed = 40, start = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) return;
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return displayed;
}

/* ─────────────────────────────────────────
   Mask Reveal — построчная анимация текста,
   как на стартовой странице somyajain.com:
   каждая строка спрятана в контейнере с
   overflow:hidden и "выезжает" снизу вверх
   с небольшой задержкой между строками.
───────────────────────────────────────── */
function MaskReveal({
  lines,
  delayStep = 110,
  startDelay = 0,
  style,
}: {
  lines: string[];
  delayStep?: number;
  startDelay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVisible(true), startDelay);
          ob.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [startDelay]);

  return (
    <div ref={ref} style={style}>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "block",
              transform: visible ? "translateY(0%)" : "translateY(115%)",
              opacity: visible ? 1 : 0,
              transition: `transform 1s cubic-bezier(.16,1,.3,1) ${i * delayStep}ms, opacity .7s ease ${i * delayStep}ms`,
            }}
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Glitch text
───────────────────────────────────────── */
function Glitch({ children, className }: { children: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);
  const glyphs = "01ｱｲｳｴｵ<>[]{}|\\";
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 120);
    }, 3200 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);
  if (!glitching) return <span className={className}>{children}</span>;
  const corrupted = children.split("").map((c) =>
    Math.random() > 0.6 ? glyphs[(Math.random() * glyphs.length) | 0] : c
  ).join("");
  return <span className={className} style={{ color: "#ff0040" }}>{corrupted}</span>;
}

/* ─────────────────────────────────────────
   Scroll reveal
───────────────────────────────────────── */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } }, { threshold: 0.1 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .9s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Preloader
───────────────────────────────────────── */
function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const lines = ["> INITIALIZING SYSTEM...", "> LOADING KERNEL MODULES...", "> ESTABLISHING SECURE CONNECTION...", "> DECRYPTING PAYLOAD...", "> ACCESS GRANTED."];
  useEffect(() => {
    const t = setInterval(() => {
      setN(prev => {
        const next = Math.min(100, prev + Math.ceil((100 - prev) * 0.16) + 1);
        if (next >= 100) { clearInterval(t); setTimeout(() => { setOut(true); setTimeout(onDone, 700); }, 400); }
        return next;
      });
    }, 55);
    const lt = setInterval(() => setLineIdx(p => Math.min(p + 1, lines.length - 1)), 600);
    return () => { clearInterval(t); clearInterval(lt); };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", transform: out ? "translateY(-101%)" : "none", transition: "transform .7s cubic-bezier(.76,0,.24,1)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.35} fontSize={14} color="#00ff41" trail="rgba(0,0,0,0.08)" speed={50} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 32, padding: 40 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(12px,1.4vw,15px)", color: "#008f11", width: "min(480px,90vw)", lineHeight: 2 }}>
          {lines.slice(0, lineIdx + 1).map((l, i) => (
            <div key={i} style={{ color: i === lineIdx ? "#00ff41" : "#008f11" }}>{l}</div>
          ))}
        </div>
        <div style={{ width: "min(480px,90vw)" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#008f11", letterSpacing: "0.16em", marginBottom: 8 }}>
            LOADING [{n.toString().padStart(3, "0")}%]
          </div>
          <div style={{ height: 2, background: "#001a00", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${n}%`, background: "#00ff41", boxShadow: "0 0 12px #00ff41", transition: "width .05s" }} />
          </div>
        </div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(60px,14vw,160px)", color: "#00ff41", textShadow: "0 0 40px rgba(0,255,65,.5)", lineHeight: 1 }}>
          {n}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Nav
───────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px clamp(20px,5vw,90px)", borderBottom: scrolled ? "1px solid rgba(0,255,65,.15)" : "1px solid transparent", background: scrolled ? "rgba(0,0,0,.92)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", transition: "all .4s" }}>
      <a href="#top" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: "#00ff41", letterSpacing: ".1em", textDecoration: "none" }}>
        <span style={{ color: "#008f11" }}>[</span>З/С<span style={{ color: "#008f11" }}>]</span>
      </a>
      <nav style={{ display: "flex", gap: "clamp(14px,2.8vw,28px)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>
        {[["#services","Услуги"],["#price","Стоимость"],["#process","Процесс"],["#contact","Связаться"]].map(([href, label]) => (
          <a key={href} href={href} style={{ color: "#008f11", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00ff41")}
            onMouseLeave={e => (e.currentTarget.style.color = "#008f11")}>{label}</a>
        ))}
      </nav>
    </header>
  );
}

/* ─────────────────────────────────────────
   Split-text reveal: слова разлетаются и
   собираются на месте при входе в вьюпорт
───────────────────────────────────────── */
function SplitReveal({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } },
      { threshold: 0.4 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const words = text.split(" ");
  function rand(i: number, seed: number) {
    const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.32em" }}>
      {words.map((w, i) => {
        const dx = (rand(i, 1) - 0.5) * 260;
        const dy = (rand(i, 2) - 0.5) * 180;
        const rot = (rand(i, 3) - 0.5) * 46;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: visible ? "none" : `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`,
              opacity: visible ? 1 : 0,
              filter: visible ? "blur(0px)" : "blur(7px)",
              transition: `transform 1s cubic-bezier(.16,1,.3,1) ${i * 70}ms, opacity .7s ease ${i * 70}ms, filter .7s ease ${i * 70}ms`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Второй блок — появляется сразу после того,
   как голова полностью повернулась к анфасу
───────────────────────────────────────── */
function SignalBlock() {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
        background: "#000",
        borderTop: "1px solid rgba(0,255,65,.18)",
        padding: "clamp(90px,16vh,180px) clamp(20px,5vw,90px)",
        // Наезжает на хвост предыдущего блока (те же 28% скролла,
        // за которые растворяется лицо) — второй блок "накрывает"
        // первый как штора, а не выезжает снизу отдельным куском,
        // из-за чего был виден обычный "лист" страницы.
        marginTop: "-28vh",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.1} fontSize={13} color="#00ff41" trail="rgba(0,0,0,.05)" speed={80} />
      </div>
      <div style={{ position: "relative", zIndex: 1, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(28px,6.2vw,92px)", lineHeight: 1.05, letterSpacing: "-.03em", color: "#00ff41", textShadow: "0 0 30px rgba(0,255,65,.35)", textAlign: "center" }}>
        <SplitReveal text="Каждый пиксель — на своём месте." />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Hero
───────────────────────────────────────── */
function Hero() {
  const headlineLines = ["Сайт — это", "инструмент,", "а не просто", "картинка."];
  return (
    <section style={{ position: "relative", minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(120px,18vh,200px) clamp(20px,5vw,90px) 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MatrixRain opacity={0.12} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.06)" speed={60} />
      </div>
      {/* scanlines */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)" }} />
      {/* HUD */}
      <div style={{ position: "absolute", top: "clamp(80px,13vh,140px)", left: "clamp(20px,5vw,90px)", right: "clamp(20px,5vw,90px)", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.3)", zIndex: 2, pointerEvents: "none" }}>
        <span>SYS.<span style={{ color: "#00ff41" }}>ONLINE</span> · UPTIME 05Y</span>
        <span style={{ textAlign: "right" }}>55.7522° N · 37.6156° E<br />BUILD 2026.08</span>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <h1 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(30px,5.6vw,88px)", lineHeight: 1.05, letterSpacing: "-.02em", color: "#00ff41", textShadow: "0 0 30px rgba(0,255,65,.4)", maxWidth: "20ch" }}>
          <MaskReveal lines={headlineLines} delayStep={110} />
        </h1>
      </div>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "end", borderTop: "1px solid rgba(0,255,65,.18)", padding: "22px 0 26px", marginTop: "clamp(36px,8vh,80px)" }}>
        <p style={{ maxWidth: "44ch", fontSize: 14, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
          Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}>Листайте</span>
          <span style={{ width: 56, height: 1, background: "#003b00", position: "relative", overflow: "hidden", display: "block" }}>
            <span style={{ position: "absolute", inset: 0, background: "#00ff41", animation: "slideBar 2s linear infinite" }} />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   3D Portrait — scroll-driven rotation
   Simulates a full 180° turntable via
   CSS perspective + rotateY driven by
   IntersectionObserver + scroll progress.
───────────────────────────────────────── */
function Portrait() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const dissolveRef = useRef<HTMLDivElement>(null);

  const caps = [
    "Пять лет в вёрстке и дизайне.",
    "Работаю один: без менеджеров и потерянных писем.",
    "Каждый проект — с нуля, без готовых шаблонов.",
    "Сдаю сайт, которым вы управляете сами.",
  ];

  // Крупный текст поверх фото — как на референсе, идёт прямо над лицом
  const bigCaps = [
    "Сайт — это",
    "не просто картинка.",
    "Это инструмент,",
    "который продаёт.",
  ];

  // Реальная последовательность кадров: 001 = затылок (размыто), 073 = анфас (чётко)
  const FRAME_COUNT = 73;
  const frameUrl = (n: number) => `${import.meta.env.BASE_URL}turntable/frame_${String(n).padStart(3, "0")}.jpg`;

  useEffect(() => {
    // предзагрузка всех кадров, чтобы вращение было плавным без подгрузок на скролле
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const im = new Image();
      im.src = frameUrl(i);
      imgs.push(im);
    }

    const section = sectionRef.current;
    const card = cardRef.current;
    const scan = scanRef.current;
    const imgEl = imgRef.current;
    if (!section || !card || !imgEl) return;

    let raf = 0;
    let lastCap = -1;
    let lastFrame = -1;
    let lastBigIdx = -1;

    function renderBigWords(text: string) {
      const big = bigRef.current;
      if (!big) return;
      // Важно: внутри flex-контейнера текстовый узел из одних пробелов
      // считается "пустым" и схлопывается в 0 — слова слипаются
      // ("Это инструмент," превращается в "Этоинструмент,").
      // &nbsp; не схлопывается, поэтому пробел между словами сохраняется.
      big.innerHTML = text
        .split(" ")
        .map((w) => `<span style="display:inline-block;will-change:transform">${w}</span>`)
        .join("&nbsp;");
    }

    function bigTextFrame(p: number) {
      const big = bigRef.current;
      if (!big) return;
      const segments = bigCaps.length;
      const segLen = 1 / segments;
      const idx = Math.min(segments - 1, Math.floor(p * segments));
      if (idx !== lastBigIdx) {
        lastBigIdx = idx;
        renderBigWords(bigCaps[idx]);
      }
      const localP = (p - idx * segLen) / segLen;

      let scale: number, blur: number, opacity: number, rotX: number, spread = 0;
      const isLastSegment = idx === segments - 1;
      if (localP < 0.3) {
        const q = localP / 0.3;
        scale = 0.55 + q * 0.45; blur = (1 - q) * 14; opacity = q; rotX = (1 - q) * 18;
      } else if (localP < 0.7 || isLastSegment) {
        // Последняя фраза не рассыпается и не гаснет — она остаётся
        // на экране, пока лицо растворяется позади неё (см. update()),
        // и именно эта фраза "передаёт" сцену следующему блоку.
        scale = 1; blur = 0; opacity = 1; rotX = 0;
      } else {
        const q2 = (localP - 0.7) / 0.3;
        scale = 1 + q2 * 0.5; blur = q2 * 10; opacity = 1 - q2; rotX = -q2 * 10;
        spread = q2 * 70;
      }
      big.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      big.style.filter = `blur(${blur.toFixed(2)}px)`;
      big.style.opacity = opacity.toFixed(3);

      const spans = big.querySelectorAll<HTMLSpanElement>("span");
      const n = spans.length;
      spans.forEach((el, i) => {
        const offset = i - (n - 1) / 2;
        el.style.transform = `translateX(${(offset * spread).toFixed(1)}px)`;
      });
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    function update() {
      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = section!.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -rect.top / total));

      // Поворот на 180°: от затылка (размыто) к анфасу (чётко) —
      // качество только нарастает по мере скролла, без отката назад
      const frameIdx = 1 + Math.round(p * (FRAME_COUNT - 1));
      if (frameIdx !== lastFrame) {
        lastFrame = frameIdx;
        imgEl!.src = frameUrl(frameIdx);
      }

      const blur = (1 - p) * 9;
      const scale = 0.88 + p * 0.12;

      // Лицо полностью растворяется в последние 28% скролла блока —
      // остаётся только текст, из которого "проступает" следующий блок,
      // как на somyajain.com.
      const faceOut = Math.min(1, Math.max(0, (p - 0.72) / 0.28));
      const faceOpacity = 1 - faceOut;

      card!.style.transform = `scale(${scale.toFixed(3)})`;
      imgEl!.style.filter = `blur(${blur.toFixed(2)}px) contrast(1.06)`;
      imgEl!.style.opacity = faceOpacity.toFixed(3);

      // Дождь из символов проступает по мере того, как гаснет фото —
      // лицо буквально "рассыпается" на матричный код
      if (dissolveRef.current) dissolveRef.current.style.opacity = faceOut.toFixed(3);

      const tintEl = card!.querySelector<HTMLDivElement>(".portrait-tint");
      if (tintEl) tintEl.style.opacity = String((((1 - p) * 0.45) * faceOpacity).toFixed(3));

      // Рамка/уголки/скан-линия гаснут вместе с лицом — весь "фото-блок"
      // растворяется целиком, а не только картинка внутри него
      const frameEls = card!.querySelectorAll<HTMLDivElement>(".portrait-frame-el");
      frameEls.forEach((el) => { el.style.opacity = faceOpacity.toFixed(3); });

      // scan line
      if (scan) {
        scan.style.transform = `translateY(${(p * 500 % 100).toFixed(2)}%)`;
        scan.style.opacity = p > 0.95 ? "0" : (0.7 * faceOpacity).toFixed(3);
      }

      // percent counter
      if (pctRef.current) pctRef.current.textContent = Math.round(p * 100) + "%";

      // caption cycling
      const idx = Math.min(caps.length - 1, Math.floor(p * caps.length));
      if (idx !== lastCap && capRef.current) {
        lastCap = idx;
        capRef.current.textContent = caps[idx];
      }

      bigTextFrame(p);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} style={{ position: "relative", zIndex: 1, height: "200vh", background: "#000" }}>
      {/* Sticky stage */}
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", display: "grid", placeItems: "center" }}>
        {/* Full-bleed matrix rain */}
        <div style={{ position: "absolute", inset: 0 }}>
          <MatrixRain opacity={0.22} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.07)" speed={55} />
        </div>

        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,65,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,.05) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

        {/* Scanlines */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)" }} />

        {/* Background word */}
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(60px,16vw,240px)", lineHeight: 1, letterSpacing: "-.05em", color: "transparent", WebkitTextStroke: "1px rgba(0,255,65,.08)", whiteSpace: "nowrap", userSelect: "none" }}>
          DESIGN · CODE · LAUNCH · WEB ·
        </div>

        {/* The 3D card — теперь настоящая последовательность кадров */}
        <div ref={cardRef} style={{ position: "relative", width: "min(90vw,680px)", aspectRatio: "3/4", willChange: "transform", zIndex: 4 }}>
          {/* Кадры вращения */}
          <img
            ref={imgRef}
            src={frameUrl(1)}
            alt="Сергей Захаров — веб-разработчик"
            draggable={false}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              display: "block", userSelect: "none", pointerEvents: "none",
              maskImage: "radial-gradient(160% 155% at 50% 42%,#000 48%,rgba(0,0,0,.35) 76%,transparent 100%)",
              WebkitMaskImage: "radial-gradient(160% 155% at 50% 42%,#000 48%,rgba(0,0,0,.35) 76%,transparent 100%)",
            }}
          />

          {/* Матричный "растворитель" — закрыт той же маской, что и фото,
              так что дождь из символов проступает ровно по силуэту лица
              и нарастает по мере того, как фото гаснет (см. update()) */}
          <div
            ref={dissolveRef}
            style={{
              position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0,
              maskImage: "radial-gradient(160% 155% at 50% 42%,#000 48%,rgba(0,0,0,.35) 76%,transparent 100%)",
              WebkitMaskImage: "radial-gradient(160% 155% at 50% 42%,#000 48%,rgba(0,0,0,.35) 76%,transparent 100%)",
            }}
          >
            <MatrixRain opacity={1} fontSize={11} color="#00ff41" trail="rgba(0,0,0,.12)" speed={35} />
          </div>

          {/* Крупный текст поверх фото — размыто→чётко→расходится */}
          <div
            ref={bigRef}
            style={{
              position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              textAlign: "center", padding: "0 6%",
              fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
              fontSize: "clamp(22px,4.4vw,42px)", lineHeight: 1.15, letterSpacing: "-.02em",
              color: "#00ff41", textShadow: "0 0 24px rgba(0,255,65,.55), 0 4px 30px rgba(0,0,0,.6)",
            }}
          />

          {/* Green matrix colour-grade tint */}
          <div className="portrait-tint" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,255,65,.0) 0%, rgba(0,255,65,.55) 100%)", mixBlendMode: "color", opacity: 0.45, pointerEvents: "none" }} />

          {/* Scan line */}
          <div ref={scanRef} style={{ position: "absolute", left: 0, right: 0, height: 2, background: "#00ff41", boxShadow: "0 0 24px 4px rgba(0,255,65,.7)", top: 0, opacity: 0.7, willChange: "transform" }} />

          {/* Corner brackets */}
          {[
            { top: 0, left: 0, borderTop: "1px solid #00ff41", borderLeft: "1px solid #00ff41" },
            { top: 0, right: 0, borderTop: "1px solid #00ff41", borderRight: "1px solid #00ff41" },
            { bottom: 0, left: 0, borderBottom: "1px solid #00ff41", borderLeft: "1px solid #00ff41" },
            { bottom: 0, right: 0, borderBottom: "1px solid #00ff41", borderRight: "1px solid #00ff41" },
          ].map((s, i) => (
            <div key={i} className="portrait-frame-el" style={{ position: "absolute", width: 20, height: 20, ...s }} />
          ))}
        </div>

        {/* HUD overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", padding: "clamp(16px,3vh,40px) clamp(20px,5vw,60px)", display: "grid", gridTemplateRows: "auto 1fr auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11", zIndex: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Захаров Сергей</span>
            <span>Разработчик · Москва</span>
          </div>
          <div />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span ref={capRef} style={{ maxWidth: "30ch", textTransform: "none", letterSpacing: ".02em", fontSize: 13, color: "#00ff41", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.4 }}>
              Пять лет в вёрстке и дизайне.
            </span>
            <span>Готовность <span ref={pctRef} style={{ color: "#00ff41" }}>0%</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Ticker
───────────────────────────────────────── */
function Ticker() {
  const items = ["Landing Pages", "Сайты-Визитки", "Каталоги", "Редизайн", "Поддержка", "Terminal_UI", "Web_Dev"];
  return (
    <div style={{ background: "#00ff41", color: "#000", padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", gap: 40, animation: "marqAnim 28s linear infinite", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(15px,2vw,25px)", letterSpacing: "-.02em" }}>
        {[0, 1].map(rep => (
          <span key={rep} style={{ display: "inline-flex", alignItems: "center", gap: 40 }}>
            {items.map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 40 }}>
                {item}<span style={{ color: "#003b00", fontSize: ".6em" }}>◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Terminal window wrapper
───────────────────────────────────────── */
function TerminalBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(0,255,65,.25)", background: "#050f05", fontFamily: "'JetBrains Mono',monospace" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "1px solid rgba(0,255,65,.18)", background: "#0a1a0a" }}>
        {["#ff5f57","#ffbd2e","#28c840"].map((c,i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />)}
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
    <section id="services" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", position: "relative" }}>
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
      <span style={{ color: hi ? "#7dffaa" : "#00ff41" }}>→</span>
      <span>{text}</span>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(0,255,65,.12)", border: "1px solid rgba(0,255,65,.18)" }}>
            {/* Base */}
            <div style={{ background: "#050f05", padding: "clamp(22px,4vw,42px)", display: "flex", flexDirection: "column", gap: 20, transition: "background .4s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0a1a0a")}
              onMouseLeave={e => (e.currentTarget.style.background = "#050f05")}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#008f11" }}><span>Пакет «База»</span><span>2 недели</span></div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(30px,5vw,68px)", lineHeight: .9, color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,.3)" }}>
                50 000 ₽<small style={{ display: "block", fontSize: ".3em", fontWeight: 400, color: "#008f11", marginTop: 10 }}>Сайт-визитка или лендинг</small>
              </div>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: "#00ff41", letterSpacing: "-.01em" }}>Когда нужен рабочий сайт, а не выставка</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#008f11", fontFamily: "'JetBrains Mono',monospace", padding: 0 }}>
                {["До 5 экранов на одной странице","Индивидуальный дизайн, без готовых тем","Адаптив под телефон и планшет","Форма заявки на почту или в Telegram","Подключение домена и хостинга","Базовая настройка SEO и метрики","2 круга правок"].map(t => li(t))}
              </ul>
              <a href="#contact" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(0,255,65,.18)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#00ff41", textDecoration: "none" }}>Обсудить проект <span>→</span></a>
            </div>
            {/* Full */}
            <div style={{ background: "#003b00", padding: "clamp(22px,4vw,42px)", display: "flex", flexDirection: "column", gap: 20, transition: "background .4s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#004d00")}
              onMouseLeave={e => (e.currentTarget.style.background = "#003b00")}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#7dffaa" }}><span>Пакет «Полный»</span><span>3–4 недели</span></div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(30px,5vw,68px)", lineHeight: .9, color: "#00ff41", textShadow: "0 0 30px rgba(0,255,65,.5)" }}>
                100 000 ₽<small style={{ display: "block", fontSize: ".3em", fontWeight: 400, color: "#7dffaa", marginTop: 10 }}>Многостраничный сайт или каталог</small>
              </div>
              <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: "#00ff41", letterSpacing: "-.01em" }}>Когда сайт — основной канал продаж</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#c8ffe0", fontFamily: "'JetBrains Mono',monospace", padding: 0 }}>
                {["Всё из пакета «База»","До 10 страниц или каталог с фильтрами","Админка: сами меняете тексты, цены, фото","Анимации и проработанные состояния","Копирайтинг основных страниц","Интеграции: CRM, оплата, мессенджеры","Месяц поддержки после запуска"].map(t => li(t, true))}
              </ul>
              <a href="#contact" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#00ff41", textDecoration: "none" }}>Обсудить проект <span>→</span></a>
            </div>
          </div>
        </Reveal>
        <p style={{ marginTop: 22, fontSize: 13, color: "#008f11", maxWidth: "60ch", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
          Цены — за проект целиком, без почасовки и «доплатите за ещё один блок». Работаю по предоплате 50%. Если задача не укладывается в эти два формата, посчитаю отдельно после разговора.
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
          <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(26px,5vw,70px)", lineHeight: .97, letterSpacing: "-.04em", color: "#00ff41", marginTop: 20, marginBottom: 20, textShadow: "0 0 30px rgba(0,255,65,.3)" }}>
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
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#7dffaa"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,65,.4)"; }}
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
        <div style={{ display: "inline-flex", gap: 40, animation: "marqAnim 36s linear infinite", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(34px,9vw,128px)", letterSpacing: "-.05em", lineHeight: 1, color: "transparent", WebkitTextStroke: "1px rgba(0,255,65,.2)" }}>
          <span>SERGEI ZAKHAROV — WEB DESIGN — SERGEI ZAKHAROV — </span>
          <span>SERGEI ZAKHAROV — WEB DESIGN — SERGEI ZAKHAROV — </span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "22px clamp(20px,5vw,90px) 28px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: "#008f11" }}>
        <span>© 2026 Захаров Сергей</span>
        <span>Разработка сайтов на заказ</span>
        <a href="#top" style={{ color: "#00ff41", textDecoration: "none" }}>Наверх ↑</a>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   Global keyframes (injected once)
───────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes slideBar   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes marqAnim   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes pulse      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.65)} }
  @keyframes flicker    { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.4} 94%{opacity:1} 96%{opacity:.7} 97%{opacity:1} }
`;

/* ─────────────────────────────────────────
   App root
───────────────────────────────────────── */
export default function App() {
  const [ready, setReady] = useState(false);
  return (
    <div style={{ background: "#000", color: "#00ff41", minHeight: "100vh", animation: "flicker 9s infinite" }}>
      <style>{KEYFRAMES}</style>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Nav />
      <main id="top">
        <Portrait />
        <SignalBlock />
        <Hero />
        <Ticker />
        <Services />
        <Price />
        <Process />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
