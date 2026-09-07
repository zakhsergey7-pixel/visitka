import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import iconNode from "../assets/icon-node.png";
import iconSpark from "../assets/icon-spark.png";
import iconWhale from "../assets/icon-whale.png";
import portfolioLanding from "../assets/portfolio-landing.jpg";

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
    let w = 0, h = 0, cols = 0, drops: number[] = [], raf = 0, last = 0, visible = true;
    function resize() {
      const r = canvas!.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height); canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cols = Math.max(1, Math.floor(w / fontSize)); drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize));
    }
    function tick(t: number) {
      raf = requestAnimationFrame(tick); if (t - last < speed) return; last = t; ctx.fillStyle = trail; ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) { const ch = chars[(Math.random() * chars.length) | 0]; ctx.fillStyle = drops[i] * fontSize > h - fontSize * 3 ? "#ffffff" : color; ctx.fillText(ch, i * fontSize, drops[i] * fontSize); if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0; drops[i] += 0.35 + Math.random() * 0.4; }
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    const ob = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }, { threshold: 0 });
    ob.observe(canvas);
    resize(); window.addEventListener("resize", resize); if (visible) start();
    return () => { stop(); ob.disconnect(); window.removeEventListener("resize", resize); };
  }, [fontSize, color, trail, speed]);
  return <canvas ref={ref} className={className} style={{ opacity, display: "block", width: "100%", height: "100%", ...styleProp }} />;
}

function NoiseOverlay() { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = ref.current; if (!canvas) return; const SIZE = 120; canvas.width = SIZE; canvas.height = SIZE; const ctx = canvas.getContext("2d")!; let raf: number; function draw() { const d = ctx.createImageData(SIZE, SIZE); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() > 0.93 ? Math.floor(Math.random() * 200) : 0; d.data[i] = 0; d.data[i + 1] = v; d.data[i + 2] = 0; d.data[i + 3] = v; } ctx.putImageData(d, 0, 0); raf = requestAnimationFrame(draw); } raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf); }, []); return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", imageRendering: "pixelated" }} />; }
function useDecrypt(text: string, active: boolean, speed = 36) { const glyphs = "01ｱｲｳｴｵｶﾀﾁﾂ<>[]{}|\\!@#$%"; const [out, setOut] = useState(() => text.split("").map(c => c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]).join("")); const pos = useRef(0); useEffect(() => { if (!active) return; pos.current = 0; const id = setInterval(() => { pos.current += 1.6; const p = pos.current; setOut(text.split("").map((c, i) => c === " " ? " " : i < p ? c : glyphs[(Math.random() * glyphs.length) | 0]).join("")); if (p >= text.length) clearInterval(id); }, speed); return () => clearInterval(id); }, [active, text, speed]); return out; }
function Glitch({ children }: { children: string }) { const [glitching, setGlitching] = useState(false); const g = "01ｱｲｳｴｵ<>[]{}|\\"; useEffect(() => { const id = setInterval(() => { setGlitching(true); setTimeout(() => setGlitching(false), 110); }, 3400 + Math.random() * 5000); return () => clearInterval(id); }, []); if (!glitching) return <span>{children}</span>; return <span style={{ color: "#ff0040", textShadow: "-2px 0 #ff0040, 2px 0 #00ffff" }}>{children.split("").map(c => Math.random() > 0.55 ? g[(Math.random() * g.length) | 0] : c).join("")}</span>; }
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) { const ref = useRef<HTMLDivElement>(null); const [v, setV] = useState(false); useEffect(() => { const el = ref.current; if (!el) return; const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } }, { threshold: 0.08 }); ob.observe(el); return () => ob.disconnect(); }, []); return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", filter: v ? "blur(0px)" : "blur(7px)", transition: `opacity 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, filter 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>{children}</div>; }
function SignalBars() { const [level, setLevel] = useState(4); useEffect(() => { const id = setInterval(() => setLevel(Math.random() > 0.15 ? 4 : 3), 2800 + Math.random() * 2000); return () => clearInterval(id); }, []); return <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, marginLeft: 10 }}>{[1,2,3,4].map(b => <span key={b} style={{ width: 3, height: b * 3 + 1, background: b <= level ? "#00ff41" : "#003b00", display: "block", transition: "background .5s", boxShadow: b <= level ? "0 0 4px #00ff41" : "none" }} />)}</span>; }
const NAV_LINKS: [string,string][] = [["#services","Услуги"],["#ai","Консьерж"],["#price","Стоимость"],["#contact","Связаться"]];
function goToSection(id: string) {
  const main = document.getElementById("top");
  if (main && main.style.overflowX === "hidden") return; // boot-gate still up — scrollIntoView ignores overflow:hidden, so check explicitly
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
}
function Nav() { const [scrolled,setScrolled]=useState(false); const [open,setOpen]=useState(false); useEffect(()=>{const main=document.getElementById("top");if(!main)return;const h=()=>setScrolled(main.scrollLeft>60);main.addEventListener("scroll",h,{passive:true});return()=>main.removeEventListener("scroll",h)},[]); const mono:React.CSSProperties={fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:".14em",textTransform:"uppercase"}; const nav=(href:string)=>(e:React.MouseEvent)=>{e.preventDefault();setOpen(false);goToSection(href.slice(1))}; return <header style={{position:"fixed",top:0,left:0,right:0,zIndex:80,borderBottom:scrolled||open?"1px solid rgba(0,255,65,.14)":"1px solid transparent",background:scrolled||open?"rgba(0,0,0,.93)":"transparent",backdropFilter:scrolled||open?"blur(12px)":"none",transition:"background .4s,border-color .4s"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px clamp(20px,5vw,90px)"}}><SignalBars/><nav className="nav-links" style={{display:"flex",gap:"clamp(14px,2.8vw,28px)",...mono}}>{NAV_LINKS.map(([href,label])=><a key={href} href={href} onClick={nav(href)} className="link-nav" style={{color:"#008f11",textDecoration:"none",transition:"color .2s"}}>{label}</a>)}</nav><button className="nav-toggle" onClick={()=>setOpen(o=>!o)} style={{...mono,display:"none",background:"transparent",border:"1px solid rgba(0,255,65,.35)",color:"#00ff41",padding:"6px 10px",cursor:"pointer"}}>[ {open?"×":"MENU"} ]</button></div>{open&&<nav className="nav-mobile-panel" style={{display:"flex",flexDirection:"column",padding:"4px clamp(20px,5vw,90px) 18px"}}>{NAV_LINKS.map(([href,label])=><a key={href} href={href} onClick={nav(href)} style={{...mono,color:"#00ff41",textDecoration:"none",padding:"13px 0",borderTop:"1px solid rgba(0,255,65,.1)"}}>{label}</a>)}</nav>}</header>; }
const DEAD_PIXELS=[{top:"28%",left:"9%"},{top:"71%",left:"82%"},{top:"44%",left:"58%"},{top:"17%",left:"73%"},{top:"88%",left:"22%"}];
const STATUS_PHRASES=["Сайты, которые работают.","Без шаблонов.","Без посредников.","На связи в любое время."];
function HeroStatusLine(){const[idx,setIdx]=useState(0);const[dissolving,setDissolving]=useState(false);const text=useDecrypt(STATUS_PHRASES[idx],true,28);useEffect(()=>{const typeTime=STATUS_PHRASES[idx].length*28+1800;const t1=setTimeout(()=>setDissolving(true),typeTime);const t2=setTimeout(()=>{setIdx(i=>(i+1)%STATUS_PHRASES.length);setDissolving(false)},typeTime+450);return()=>{clearTimeout(t1);clearTimeout(t2)}},[idx]);return <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#008f11",display:"inline-block",opacity:dissolving?0:1,filter:dissolving?"blur(6px)":"blur(0px)",letterSpacing:dissolving?".3em":"0em",transition:"opacity .45s ease, filter .45s ease, letter-spacing .45s ease"}}>{text}</span>;}
function WhoAmICard() {
  const [cur, setCur] = useState(true);
  useEffect(() => { const id = setInterval(() => setCur(p => !p), 550); return () => clearInterval(id); }, []);
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" };
  const prompt: React.CSSProperties = { color: "#00ff41" };
  const out: React.CSSProperties = { color: "#008f11", paddingLeft: 12 };
  return (
    <TerminalBox title="zakharov.dev ~ terminal">
      <div style={{ ...mono, fontSize: 13, lineHeight: 1.75 }}>
        <p><span style={prompt}>$ </span>whoami</p>
        <p style={out}>sergey zakharov / web developer</p>
        <p style={{ marginTop: 10 }}><span style={prompt}>$ </span>AI stack.txt</p>
        <p style={out}>→ React, Vue.js, TypeScript</p>
        <p style={out}>→ PHP, WordPress, WooCommerce</p>
        <p style={out}>→ HTML, SCSS, Git, Figma</p>
        <p style={{ marginTop: 10 }}><span style={prompt}>$ </span>experience --years</p>
        <p style={out}>5+ лет</p>
        <p style={{ marginTop: 10 }}><span style={prompt}>$ </span>status</p>
        <p style={{ color: "#00ff41", paddingLeft: 12 }}>
          <span style={{ opacity: cur ? 1 : 0.35, transition: "opacity .2s" }}>●</span> online
        </p>
      </div>
    </TerminalBox>
  );
}
function Hero({mainRef}:{mainRef:React.RefObject<HTMLElement | null>}){const[active,setActive]=useState(false);const headline=useDecrypt("Сайт — это инструмент,\nа не просто картинка.",active);const[cur,setCur]=useState(true);const secRef=useRef<HTMLElement>(null);useEffect(()=>{const id=setInterval(()=>setCur(p=>!p),550);return()=>clearInterval(id)},[]);useEffect(()=>{const el=secRef.current;if(!el)return;const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setActive(true);ob.disconnect()}},{threshold:.3});ob.observe(el);return()=>ob.disconnect()},[]);const{scrollXProgress}=useScroll({target:secRef,container:mainRef,axis:"x",offset:["start start","end start"]});const xHeadline=useTransform(scrollXProgress,[0,1],[0,-60]);const xMatrix=useTransform(scrollXProgress,[0,1],[0,-90]);const xHud=useTransform(scrollXProgress,[0,1],[0,-120]);return <section id="hero" ref={secRef} style={{flexShrink:0,scrollSnapAlign:"start",position:"relative",width:"100vw",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"84px clamp(20px,5vw,90px) 20px",overflow:"hidden"}}><motion.div style={{position:"absolute",inset:0,zIndex:0,x:xMatrix}}><MatrixRain opacity={.32} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.055)" speed={58}/></motion.div><NoiseOverlay/>{DEAD_PIXELS.map((p,i)=><div key={i} style={{position:"absolute",width:2,height:2,background:"#00ff41",boxShadow:"0 0 3px #00ff41",zIndex:1,pointerEvents:"none",animation:`hudBlink ${3.5+i*1.4}s steps(1) infinite ${i*.8}s`,...p}}/>)}<div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)"}}/><motion.div className="hero-hud" style={{position:"absolute",top:64,left:"clamp(20px,5vw,90px)",right:"clamp(20px,5vw,90px)",display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(0,255,65,.28)",zIndex:2,pointerEvents:"none",x:xHud}}><span>SYS.<span style={{color:"#00ff41",animation:"hudBlink 8s steps(1) infinite"}}>ONLINE</span> · UPTIME 05Y</span><span style={{textAlign:"right"}}>55.7522° N · 37.6156° E<br/>BUILD 2026.08</span></motion.div><div className="hero-grid" style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr",gap:"clamp(20px,3vh,36px)",alignItems:"center",overflow:"hidden"}}><div><motion.h1 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(24px,4.4vh,64px)",lineHeight:1.06,letterSpacing:"-.02em",color:"#00ff41",animation:"neonPulse 4.5s ease-in-out infinite",maxWidth:"22ch",whiteSpace:"pre-line",x:xHeadline}}>{headline}<span style={{opacity:cur?1:0}}>_</span></motion.h1><div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:"clamp(18px,3vh,30px)"}}><a href="#contact" onClick={(e)=>{e.preventDefault();goToSection("contact")}} className="btn-hero-primary" style={{background:"#00ff41",color:"#000",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13,padding:"12px 22px",textDecoration:"none",letterSpacing:".02em",transition:"background .2s,box-shadow .2s"}}>./start_project.sh →</a><a href="#services" onClick={(e)=>{e.preventDefault();goToSection("services")}} className="btn-hero-secondary" style={{background:"transparent",border:"1px solid rgba(0,255,65,.4)",color:"#00ff41",fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"11px 20px",textDecoration:"none",transition:"border-color .2s,background .2s"}}>смотреть услуги</a></div></div><div className="hero-whoami" id="whoami-box"><WhoAmICard/></div></div><div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,borderTop:"1px solid rgba(0,255,65,.16)",padding:"14px 0"}}><HeroStatusLine/><span style={{width:48,height:1,background:"#003b00",position:"relative",overflow:"hidden",display:"block",flexShrink:0}}><span style={{position:"absolute",inset:0,background:"#00ff41",animation:"slideBar 2s linear infinite"}}/></span></div></section>;}

/* ─────────────────────────────────────────
   AI logo stream — three neon marks, cropped
   ahead of time (via canvas, pixel-perfect
   bounding boxes) out of the source sprite
   into their own transparent PNGs, each in
   a small bordered pixel chip.
───────────────────────────────────────── */
const AI_LOGO_ICONS = [iconNode, iconSpark, iconWhale];
function AILogoChip({ src }: { src: string }) {
  return (
    <div
      style={{
        width: "clamp(30px,6.5vw,38px)",
        height: "clamp(30px,6.5vw,38px)",
        flexShrink: 0,
        border: "1px solid rgba(0,255,65,.3)",
        backgroundColor: "#000",
        backgroundImage: `url(${src})`,
        backgroundPosition: "center",
        backgroundSize: "72%",
        backgroundRepeat: "no-repeat",
        boxShadow: "inset 0 0 12px rgba(0,255,65,.04)",
        filter: "drop-shadow(0 0 3px rgba(0,255,65,.4))",
      }}
    />
  );
}
function AIIconStream() {
  const row = (key: string) => (
    <div key={key} style={{ display: "flex", gap: "clamp(20px,5vw,40px)", paddingRight: "clamp(20px,5vw,40px)" }}>
      {AI_LOGO_ICONS.concat(AI_LOGO_ICONS).map((src, i) => <AILogoChip key={`${key}-${i}`} src={src} />)}
    </div>
  );
  return (
    <div className="ai-logo-stream" style={{ position: "absolute", inset: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", animation: "marqAnim 28s linear infinite" }}>
        {row("a")}{row("b")}
      </div>
    </div>
  );
}
// Was a thin horizontal strip between vertically-stacked sections; now a
// narrow vertical slit between horizontal panels. Same ticker, same
// AIIconStream, just viewed through a tall narrow window instead of a
// short wide one — the STREAM_IN/readout text doesn't fit at 90px wide
// so it's dropped, the ticker alone carries the divider's identity.
function DecodeStreamDivider(){return <div style={{flexShrink:0,scrollSnapAlign:"start",position:"relative",width:90,height:"100vh",background:"#000",borderLeft:"1px solid rgba(0,255,65,.13)",borderRight:"1px solid rgba(0,255,65,.13)",overflow:"hidden"}}><AIIconStream/><div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 82%,#000 100%)"}}/></div>;}
// Numbers kept deliberately conservative — each restates a claim already
// made elsewhere on the site (WhoAmICard/LiveConsole: 5 years; Services:
// one person end-to-end; HeroStatusLine: "на связи в любое время") rather
// than inventing project counts or turnaround times nobody's verified.
const STATS = [
  { value: 5, suffix: "", label: "лет опыта" },
  { value: 1, suffix: "", label: "человек на всех этапах" },
  { value: 24, suffix: "/7", label: "на связи" },
];
function useCountUp(target: number, active: boolean, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    function tick(t: number) {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return n;
}
function StatItem({ stat, active, delay }: { stat: typeof STATS[number]; active: boolean; delay: number }) {
  const [start, setStart] = useState(false);
  useEffect(() => { if (!active) return; const t = setTimeout(() => setStart(true), delay); return () => clearTimeout(t); }, [active, delay]);
  const n = useCountUp(stat.value, start);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'VT323',monospace", fontSize: "clamp(44px,8vh,86px)", color: "#00ff41", lineHeight: 1, textShadow: "0 0 16px rgba(0,255,65,.5)" }}>{n}{stat.suffix}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", marginTop: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>{stat.label}</div>
    </div>
  );
}
function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); ob.disconnect(); } }, { threshold: .4 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  return (
    <section style={{ flexShrink: 0, scrollSnapAlign: "start", width: 820, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(20px,4vw,60px)", background: "#000", position: "relative", overflow: "hidden" }}>
      <SectionRain opacity={.2} />
      <div ref={ref} style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: "clamp(16px,3vw,32px)", border: "1px solid rgba(0,255,65,.2)", padding: "clamp(24px,4vh,48px) clamp(16px,3vw,32px)", animation: "borderGlow 4s ease-in-out infinite" }}>
        {STATS.map((s, i) => <StatItem key={s.label} stat={s} active={active} delay={i * 200} />)}
      </div>
    </section>
  );
}

const MATRIX_WORD_GLYPHS = "01ｱｲｳｴｵｶﾀﾁﾂ<>[]{}|\\!@#$%";
function scrambleWord(text: string) { return text.split("").map(c => c === " " ? " " : MATRIX_WORD_GLYPHS[(Math.random() * MATRIX_WORD_GLYPHS.length) | 0]).join(""); }
// Each word flickers into matrix noise and resolves back on its own random
// timer, independently of its neighbours — a continuous, chaotic-order
// highlight rather than a one-time reveal that's easy to miss on scroll.
function useWordFlicker(text: string, active: boolean, initialDelay: number) {
  const [display, setDisplay] = useState(text);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let cancelled = false;
    let toId = 0, ivId = 0;
    function scheduleNext(delay: number) {
      toId = window.setTimeout(() => {
        if (cancelled) return;
        let ticks = 0; const max = 3 + ((Math.random() * 3) | 0);
        ivId = window.setInterval(() => {
          ticks++;
          if (ticks >= max) { window.clearInterval(ivId); setDisplay(text); setFlashKey(k => k + 1); scheduleNext(2200 + Math.random() * 4200); }
          else setDisplay(scrambleWord(text));
        }, 40);
      }, delay);
    }
    scheduleNext(initialDelay);
    return () => { cancelled = true; window.clearTimeout(toId); window.clearInterval(ivId); };
  }, [active, text, initialDelay]);
  return { display, flashKey };
}
function MatrixWord({ text, active, delay, style }: { text: string; active: boolean; delay: number; style?: React.CSSProperties }) {
  const { display, flashKey } = useWordFlicker(text, active, delay);
  return <span key={flashKey} style={{ display: "inline-block", animation: "matrixHighlight .6s ease-out", ...style }}>{display}</span>;
}
const MISSION_HEADLINE = [["Я", "превращаю", "бизнес"], ["в", "цифровой", "актив."]];
const MISSION_LINES = [
  { words: ["AI", "—", "инструмент,"], pad: "0" },
  { words: ["который", "оптимизирует", "бизнес."], pad: "clamp(28px,5vw,80px)" },
  { words: ["Код", "пишу", "и", "проверяю"], pad: "clamp(14px,2.5vw,40px)" },
  { words: ["я", "сам."], pad: "clamp(42px,7vw,110px)" },
];
function Mission(){const ref=useRef<HTMLDivElement>(null);const[active,setActive]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const ob=new IntersectionObserver(([e])=>{setActive(e.isIntersecting)},{threshold:.15});ob.observe(el);return()=>ob.disconnect()},[]);
  let wordSeq = 0;
  const nextDelay = () => { wordSeq += 1; return wordSeq * 140 + Math.random() * 260; };
  return <section style={{flexShrink:0,scrollSnapAlign:"start",width:"100vw",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"84px clamp(20px,5vw,90px) 20px",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.26} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.04)" speed={90}/></div><div style={{position:"absolute",left:"clamp(4px,1.4vw,16px)",top:"50%",width:0,height:0,pointerEvents:"none"}}><div style={{position:"absolute",top:0,left:0,width:340,height:20,overflow:"hidden",transform:"rotate(-90deg)",transformOrigin:"top left"}}><div style={{display:"inline-flex",gap:28,animation:"marqAnim 22s linear infinite",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(0,255,65,.55)",textShadow:"0 0 12px rgba(0,255,65,.35)",whiteSpace:"nowrap"}}><span>МИССИЯ · MISSION · МИССИЯ · </span><span>МИССИЯ · MISSION · МИССИЯ · </span></div></div></div><div style={{position:"relative",zIndex:1,paddingLeft:"clamp(46px,7vw,96px)"}}>
    <AppWindow skin={APP_SKINS.powershell} innerRef={ref}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(26px,6vh,64px)",lineHeight:1,letterSpacing:"-.03em",color:"#00ff41",animation:active?"neonPulse 5s ease-in-out infinite":"none",marginBottom:"clamp(18px,3vh,32px)"}}>
      {MISSION_HEADLINE.map((ln, li) => <div key={li}>{ln.map((w, wi) => <span key={wi}><MatrixWord text={w} active={active} delay={nextDelay()} />{wi < ln.length - 1 ? " " : ""}</span>)}</div>)}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"clamp(4px,.8vh,10px)"}}>
      {MISSION_LINES.map((l, i) => { const bold = i % 2 === 0; return <div key={i} style={{paddingLeft:l.pad}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:bold?700:300,fontSize:"clamp(15px,3vh,30px)",letterSpacing:"-.01em",display:"inline-block"}}>
        {l.words.map((w, wi) => {
          if (i === 0 && w === "AI") return <span key={wi}><Glitch>AI</Glitch>{wi < l.words.length - 1 ? " " : ""}</span>;
          const wordStyle: React.CSSProperties = bold
            ? { color: "#00ff41" }
            : { color: "transparent", WebkitTextStroke: "1px rgba(255,0,64,.75)" };
          return <span key={wi}><MatrixWord text={w} active={active} delay={nextDelay()} style={wordStyle} />{wi < l.words.length - 1 ? " " : ""}</span>;
        })}
      </span></div>; })}
    </div>
    </AppWindow>
  </div></section>;}
function SectionRain({ opacity = 0.3, speed = 85, color = "#00ff41" }: { opacity?: number; speed?: number; color?: string }) {
  return <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}><MatrixRain opacity={opacity} fontSize={13} color={color} trail="rgba(0,0,0,.05)" speed={speed} /></div>;
}
function TerminalBox({title,children,accent}:{title:string;children:React.ReactNode;accent?:boolean}){return <div style={{border:accent?"1px solid rgba(0,255,65,.45)":"1px solid rgba(0,255,65,.25)",background:"#050f05",fontFamily:"'JetBrains Mono',monospace",animation:accent?"borderGlow 3.2s ease-in-out infinite":"none",boxShadow:accent?"0 0 26px rgba(0,255,65,.1)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:"1px solid rgba(0,255,65,.18)",background:"#0a1a0a"}}>{["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:0,background:c,display:"block",imageRendering:"pixelated"}}/>)}<span style={{marginLeft:8,fontSize:11,color:accent?"#00ff41":"#008f11",letterSpacing:".14em",textShadow:accent?"0 0 8px rgba(0,255,65,.55)":"none"}}>{title}</span>{accent&&<span style={{marginLeft:"auto",width:6,height:6,background:"#00ff41",boxShadow:"0 0 6px #00ff41",animation:"hudBlink 2.4s steps(1) infinite"}}/>}</div><div style={{padding:"20px 24px"}}>{children}</div></div>;}
const CONSOLE_INTRO={cmd:"AI about.txt",out:"Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками."};const CONSOLE_LOOP=[{cmd:"AI services.list",out:"визитка · лендинг · каталог · редизайн"},{cmd:"./launch.sh --client=вы",out:"бриф принят. приступаю."}];
function LiveConsole(){const[phase,setPhase]=useState<"intro"|"loop">("intro");const[idx,setIdx]=useState(0);const[step,setStep]=useState(0);const[cur,setCur]=useState(true);useEffect(()=>{const id=setInterval(()=>setStep(s=>s+1),10);return()=>clearInterval(id)},[]);useEffect(()=>{const id=setInterval(()=>setCur(c=>!c),500);return()=>clearInterval(id)},[]);useEffect(()=>{const main=document.getElementById("top");if(!main)return;const locked=phase==="intro";main.style.overflowX=locked?"hidden":"auto";return()=>{main.style.overflowX="auto"}},[phase]);const entry=phase==="intro"?CONSOLE_INTRO:CONSOLE_LOOP[idx];const PAUSE=8,HOLD=46,cmdLen=entry.cmd.length,outStart=cmdLen+PAUSE,outLen=entry.out.length,total=outStart+outLen+HOLD,introDone=phase==="intro"&&step>outStart+outLen;useEffect(()=>{if(phase==="loop"&&step>=total){setStep(0);setIdx(i=>(i+1)%CONSOLE_LOOP.length)}},[phase,step,total]);const cmdText=entry.cmd.slice(0,Math.min(step,cmdLen)),typingCmd=step<=cmdLen,showOut=step>outStart,outText=showOut?entry.out.slice(0,Math.max(0,Math.min(step-outStart,outLen))):"",typingOut=showOut&&step<outStart+outLen;const handleNext=()=>{setPhase("loop");setIdx(0);setStep(0);setTimeout(()=>goToSection("hero"),30)};return <section style={{flexShrink:0,scrollSnapAlign:"start",width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.3} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.05)" speed={60}/></div><div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)"}}/><div style={{position:"absolute",top:"clamp(80px,13vh,140px)",left:"clamp(20px,5vw,90px)",right:"clamp(20px,5vw,90px)",display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(0,255,65,.28)",zIndex:2,pointerEvents:"none"}}><span>SYS.<span style={{color:"#00ff41",animation:"hudBlink 6s steps(1) infinite"}}>BOOT</span> · ZAKHAROV.DEV</span><span>BUILD 2026.08</span></div><div id="console-box" style={{position:"relative",zIndex:1,width:"100%",maxWidth:"clamp(560px,62vw,720px)"}}><TerminalBox title="~/console"><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,minHeight:44}}><div><span style={{color:"#00ff41"}}>$ </span><span style={{color:"#00ff41"}}>{cmdText}</span>{typingCmd&&<span style={{opacity:cur?1:0}}>_</span>}</div>{showOut&&<div style={{color:"#008f11",marginTop:8,lineHeight:1.6}}>{outText}{typingOut&&<span style={{opacity:cur?1:0}}>_</span>}</div>}{introDone&&<button onClick={handleNext} className="btn-next" style={{marginTop:18,background:"transparent",border:"1px solid rgba(0,255,65,.4)",color:"#00ff41",padding:"9px 18px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:".12em",textTransform:"uppercase",cursor:"pointer"}}>▶ Дальше</button>}</div></TerminalBox></div></section>;}
function ProcessBar({ target, delay, animate, scanSpeed }: { target: number; delay: number; animate: boolean; scanSpeed: number }) {
  const [fill, setFill] = useState(0);
  const [scan, setScan] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setFill(target), delay);
    return () => clearTimeout(t);
  }, [animate, target, delay]);
  useEffect(() => {
    const id = setInterval(() => setScan(s => s + 1), scanSpeed);
    return () => clearInterval(id);
  }, [scanSpeed]);
  const total = 15;
  const filled = Math.round((fill / 100) * total);
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, letterSpacing: "-.05em", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10 }}>
      <span>
        {Array.from({ length: total }, (_, i) => {
          const isFilled = i < filled;
          const isCursor = isFilled && filled > 0 && i === scan % filled;
          return <span key={i} style={{ color: !isFilled ? "rgba(0,255,65,.15)" : isCursor ? "#ffffff" : "#00ff41", textShadow: isCursor ? "0 0 6px #fff" : "none", transition: "color .25s" }}>█</span>;
        })}
      </span>
      <span style={{ fontSize: 10, color: "rgba(0,255,65,.4)" }}>{fill}%</span>
    </div>
  );
}
function AIConsierge() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); ob.disconnect(); } }, { threshold: 0.18 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  const procs = [
    { pid: "001", name: "захват_брифа", fill: 100, delay: 0, status: "DONE ✓", desc: "AI разбирает ваш бизнес на части, до начала работы" },
    { pid: "002", name: "анализ_конкурентов", fill: 100, delay: 280, status: "DONE ✓", desc: "Понимаем контекст рынка, а не работаем в вакууме" },
    { pid: "003", name: "персональный_дизайн", fill: 76, delay: 560, status: "ACTIVE", desc: "Решение под вас — без шаблонов из общего доступа" },
    { pid: "004", name: "итерации_без_лимита", fill: 51, delay: 840, status: "RUNNING", desc: "Правки до результата, без доплат за каждый круг" },
    { pid: "005", name: "поддержка_после_запуска", fill: 22, delay: 1120, status: "QUEUED", desc: "Остаюсь на связи — сайт живёт, а не стоит" },
  ];
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" };
  const statusColor = (s: string) => s.startsWith("DONE") ? "#00ff41" : s === "ACTIVE" ? "#7dffaa" : s === "RUNNING" ? "#3dde6e" : "rgba(0,255,65,.5)";
  const rowGlow = (s: string) => s.startsWith("DONE") ? { anim: "rowGlowDone", dur: 11 } : s === "ACTIVE" ? { anim: "rowGlowActive", dur: 4.5 } : s === "RUNNING" ? { anim: "rowGlowRunning", dur: 6.5 } : { anim: "rowGlowQueued", dur: 8.5 };
  const scanSpeed = (s: string) => s === "ACTIVE" ? 90 : s === "RUNNING" ? 140 : s.startsWith("DONE") ? 340 : 260;
  return (
    <section id="ai" style={{ flexShrink: 0, scrollSnapAlign: "start", width: "1100px", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "84px clamp(20px,5vw,60px) 20px", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.28} fontSize={13} color="#00ff41" trail="rgba(5,15,5,.06)" speed={85} />
      </div>
      <div ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ marginBottom: 24 }}>
            <AppWindow skin={APP_SKINS.claude}>
              <span style={{ ...mono, fontSize: 11, color: "#008f11" }}>00 / Уникальность</span>
              <h2 style={{ ...mono, fontWeight: 700, fontSize: "clamp(18px,4vh,36px)", color: "#00ff41", lineHeight: 1.05, marginTop: 14 }}>
                AI-консьерж сервис — уровень крупного агентства для одного клиента.
              </h2>
            </AppWindow>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ border: "1px solid rgba(0,255,65,.2)", animation: "borderGlow 4s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid rgba(0,255,65,.15)", background: "#0a1a0a" }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => <span key={i} style={{ width: 9, height: 9, background: c, display: "block" }} />)}
                <span style={{ ...mono, fontSize: 10, color: "#008f11", letterSpacing: ".14em", marginLeft: 8 }}>~/ai-concierge/ps_aux</span>
              </div>
              <span style={{ ...mono, fontSize: 10, color: "#ff0040", letterSpacing: ".1em" }}>VER 2.0 ●</span>
            </div>
            <div className="ai-table-head" style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "8px 16px 6px", borderBottom: "1px solid rgba(0,255,65,.1)", ...mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.35)" }}>
              <span>PID</span><span>СЕРВИС</span><span>ПРОГРЕСС</span><span>СТАТУС</span>
            </div>
            {procs.map((p, i) => {
              const glow = rowGlow(p.status);
              return (
                <div key={p.pid} className="row-ai ai-table-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "8px 16px", borderBottom: i < procs.length - 1 ? "1px solid rgba(0,255,65,.07)" : "none", alignItems: "center", animation: `${glow.anim} ${glow.dur}s ease-in-out infinite`, animationDelay: `${i * 0.3}s`, transition: "padding-left .3s" }}>
                  <span style={{ ...mono, fontSize: 11, color: "rgba(0,255,65,.4)" }}>{p.pid}</span>
                  <div>
                    <span style={{ ...mono, fontSize: 13, color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,.35)" }}>{p.name}</span>
                    <div style={{ ...mono, fontSize: 12, color: "rgba(0,255,65,.62)", marginTop: 2, lineHeight: 1.4 }}>{p.desc}</div>
                  </div>
                  <ProcessBar target={p.fill} delay={p.delay} animate={animate} scanSpeed={scanSpeed(p.status)} />
                  <span style={{ ...mono, fontSize: 10, color: statusColor(p.status), letterSpacing: ".04em" }}>{p.status}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const CODE_TUNNEL_LINES = [
  "float x = boost::lexical_cast<float>(item->Attribute(\"x\"));",
  "GroupDesc::ElementDesc elDesc;",
  "unsigned layer = 50; // default",
  "if (item->Attribute(\"layer\") != NULL)",
  "elDesc.spriteName_ = spritename;",
];
function Portfolio3DPhoto({ src }: { src: string }) {
  const rows = [
    { z: -70, size: 10, speed: 30, opacity: .35 },
    { z: -25, size: 12, speed: 22, opacity: .55 },
    { z: 20, size: 15, speed: 15, opacity: .8 },
    { z: 65, size: 19, speed: 9, opacity: 1 },
  ];
  return (
    <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#000" }}>
      <img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.15) brightness(.32)" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,rgba(0,0,0,.4) 0,rgba(0,0,0,.4) 1px,transparent 1px,transparent 3px)", mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, perspective: 420, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8%", pointerEvents: "none" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ overflow: "hidden", whiteSpace: "nowrap", transform: `rotateX(30deg) translateZ(${r.z}px)`, opacity: r.opacity }}>
            <div style={{ display: "inline-flex", animation: `marqAnim ${r.speed}s linear infinite` }}>
              {[0, 1].map(k => (
                <span key={k} style={{ display: "inline-flex", gap: 36, paddingRight: 36, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: r.size, color: "#eaeaea", textShadow: "0 0 8px rgba(255,255,255,.35)" }}>
                  {CODE_TUNNEL_LINES.map((l, li) => <span key={li}>{l}</span>)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,.22)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, zIndex: 2, pointerEvents: "none" }}>
        {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <span key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: .8 }} />)}
      </div>
      <div style={{ position: "absolute", top: 10, right: 12, zIndex: 2, pointerEvents: "none", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".1em", color: "rgba(255,255,255,.6)" }}>3D · LIVE</div>
    </div>
  );
}
function PortfolioShot({ lines }: { lines: string[] }) {
  return (
    <div className="portfolio-shot" style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#0a0a0a" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "14%", background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 6, padding: "0 10px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <span key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: .5 }} />)}
      </div>
      <div style={{ position: "absolute", inset: 0, top: "14%", padding: "clamp(14px,3vw,22px)", fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(10px,1.1vw,12px)", lineHeight: 1.9, whiteSpace: "pre" }}>
        {lines.map((l, i) => {
          const trimmed = l.trimStart();
          const color = trimmed.startsWith("-") ? "#a86a6a" : trimmed.startsWith("+") ? "#7dffaa" : i === 0 ? "#e5e5e5" : "#8a8a8a";
          return <div key={i} style={{ color }}>{l}</div>;
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0,rgba(0,0,0,.35) 1px,transparent 1px,transparent 3px)", pointerEvents: "none" }} />
    </div>
  );
}
const SERVICE_ITEMS = [
  { id: "A", name: "Сайт-визитка", desc: "Компактный сайт о вас и вашей услуге: кто вы, что делаете, сколько стоит, как связаться. Открывается быстро, читается с телефона.", code: [
    "const contact = {",
    "  name: \"Иван Петров\",",
    "  role: \"Мастер маникюра\",",
    "  phone: \"+7 900 123-45-67\",",
    "};",
  ] },
  { id: "B", name: "Лендинг", desc: "Одна страница под одну задачу — заявки. Структура строится под ваше предложение и возражения клиентов, а не по универсальному шаблону.", photo: portfolioLanding },
  { id: "C", name: "Каталог и многостраничник", desc: "Товары или услуги с фильтрами, страницами разделов и админкой, в которой вы сами меняете тексты и цены без моей помощи.", code: [
    "const products = await db",
    "  .collection(\"catalog\")",
    "  .find({ inStock: true })",
    "  .sort({ price: 1 });",
  ] },
  { id: "D", name: "Редизайн и доработка", desc: "Сайт есть, но выглядит на десять лет старше вашего бизнеса. Разбираю, чиню, обновляю — без переезда на новый домен.", code: [
    "- <table class=\"layout-1998\">",
    "-   <tr><td>Меню</td></tr>",
    "+ <nav className=\"flex gap-6\">",
    "+   <NavLink to=\"/catalog\" />",
    "+ </nav>",
  ] },
];
function Services() {
  return (
    <section id="services" style={{ flexShrink: 0, scrollSnapAlign: "start", width: "1500px", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "84px clamp(20px,4vw,60px) 20px", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ marginBottom: 24 }}>
            <AppWindow skin={APP_SKINS.console}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>01 / Что делаю</span>
              <h2 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4.4vh,40px)", color: "#f2f2f2", marginTop: 14 }}>Один человек отвечает за весь результат.</h2>
            </AppWindow>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(0,255,65,.14)", border: "1px solid rgba(0,255,65,.14)" }}>
            {SERVICE_ITEMS.map((svc) => (
              <div key={svc.id} className="card-service" style={{ background: "#000", transition: "background .3s" }}>
                {svc.photo ? <Portfolio3DPhoto src={svc.photo} /> : <PortfolioShot lines={svc.code!} />}
                <div style={{ padding: "clamp(14px,2.4vh,22px)" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{svc.id}</span>
                  <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: "clamp(15px,2vh,19px)", color: "#f2f2f2", margin: "8px 0 6px" }}>{svc.name}</h3>
                  <p style={{ color: "#9a9a9a", fontSize: 12.5, lineHeight: 1.5, fontFamily: "'Montserrat',sans-serif" }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
// Каждый смысловой блок теперь сам "открыт как окно" одного из инструментов
// с прошлого экрана Tools (той секции больше нет как отдельной витрины) —
// AppWindow даёт хромированный заголовок конкретного приложения вокруг
// заголовочного блока секции, а содержимое ниже остаётся в родной палитре
// секции (сигнатурный зелёный не переопределяется цветом приложения).
type AppSkin = { label: string; dots?: boolean; icon?: boolean; border: string; headerBg: string; headerBorder: string; labelColor: string };
const APP_SKINS: Record<"console" | "powershell" | "opencode" | "claude", AppSkin> = {
  console: { label: "~/console", dots: true, border: "rgba(0,255,65,.25)", headerBg: "#0a1a0a", headerBorder: "rgba(0,255,65,.18)", labelColor: "#008f11" },
  powershell: { label: "Windows PowerShell", border: "rgba(255,255,255,.28)", headerBg: "#012456", headerBorder: "rgba(255,255,255,.16)", labelColor: "#eaf1ff" },
  opencode: { label: "opencode", border: "rgba(45,212,191,.3)", headerBg: "rgba(45,212,191,.06)", headerBorder: "rgba(45,212,191,.2)", labelColor: "#2dd4bf" },
  claude: { label: "claude code", icon: true, border: "rgba(61,57,41,.16)", headerBg: "rgba(61,57,41,.05)", headerBorder: "rgba(61,57,41,.12)", labelColor: "#d97757" },
};
function AppWindow({ skin, innerRef, children }: { skin: AppSkin; innerRef?: React.Ref<HTMLDivElement>; children: React.ReactNode }) {
  return (
    <div ref={innerRef} style={{ width: "fit-content", maxWidth: "100%", border: `1px solid ${skin.border}`, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: skin.headerBg, borderBottom: `1px solid ${skin.headerBorder}` }}>
        {skin.dots && ["#ff5f57", "#ffbd2e", "#28c840"].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
        {skin.icon && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" fill="#d97757" /></svg>}
        <span style={{ marginLeft: (skin.dots || skin.icon) ? 6 : 0, fontSize: 11, color: skin.labelColor, fontFamily: "'JetBrains Mono',monospace" }}>{skin.label}</span>
      </div>
      <div style={{ padding: "clamp(14px,2.2vh,22px) clamp(18px,3vw,30px)" }}>{children}</div>
    </div>
  );
}
const PRICE_CTA_STYLE:React.CSSProperties={display:"block",marginTop:20,padding:"10px 0",border:"1px solid rgba(0,255,65,.35)",color:"#00ff41",textAlign:"center",fontSize:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",textDecoration:"none",transition:"background .2s,border-color .2s"};
const PRICE_FEATURES:{base:string[];full:string[]}={
  base:["До 5 экранов на одной странице","Адаптивная вёрстка: телефон, планшет, десктоп","Форма заявки с уведомлением на почту","Базовое SEO: title, description, OG-теги","1 круг правок после сдачи"],
  full:["Каталог с фильтрами и страницами разделов","Админка — сами меняете тексты, цены и товары","До 10 страниц сайта","Расширенное SEO + подключение аналитики","2 круга правок после сдачи"],
};
function PriceFeatureList({items,color}:{items:string[];color:string}){return <ul style={{margin:"10px 0 0",padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:5,fontFamily:"'Montserrat',sans-serif"}}>{items.map((f)=><li key={f} style={{display:"flex",gap:8,fontSize:12.5,lineHeight:1.4,color}}><span style={{color:"#00ff41",flexShrink:0}}>›</span>{f}</li>)}</ul>;}
function Price(){return <section id="price" style={{flexShrink:0,scrollSnapAlign:"start",width:"1000px",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"84px clamp(20px,4vw,60px) 20px",background:"#000",position:"relative",overflow:"hidden"}}><SectionRain/><div style={{position:"relative",zIndex:1}}><Reveal><AppWindow skin={APP_SKINS.opencode}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>03 / Стоимость</span><h2 style={{fontFamily:"'Montserrat',sans-serif",fontWeight:700,fontSize:"clamp(20px,4.4vh,40px)",color:"#f2f2f2",marginTop:14}}>Два формата. Цена фиксируется до старта.</h2></AppWindow><div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginTop:24,background:"rgba(0,255,65,.12)"}}><div style={{background:"#050f05",padding:"clamp(16px,3vh,28px)",fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#008f11",fontSize:11}}>ПАКЕТ «БАЗА»</div><strong style={{display:"block",fontFamily:"'Share Tech Mono',monospace",fontSize:"clamp(24px,5.5vh,38px)",color:"#00ff41",margin:"clamp(8px,1.6vh,14px) 0",whiteSpace:"nowrap"}}>50 000 ₽</strong><p style={{color:"#9a9a9a",fontFamily:"'Montserrat',sans-serif",fontSize:13.5}}>Сайт-визитка или лендинг.</p><PriceFeatureList items={PRICE_FEATURES.base} color="#9a9a9a"/><a href="#contact" className="btn-price-cta" style={PRICE_CTA_STYLE}>Обсудить →</a></div><div style={{background:"#003b00",padding:"clamp(16px,3vh,28px)",fontFamily:"'JetBrains Mono',monospace",position:"relative"}}><span style={{position:"absolute",top:0,right:0,background:"#ff0040",color:"#fff",fontSize:9.5,fontWeight:700,letterSpacing:".08em",padding:"5px 10px",textTransform:"uppercase"}}>Популярный выбор</span><div style={{color:"#7dffaa",fontSize:11}}>ПАКЕТ «ПОЛНЫЙ»</div><strong style={{display:"block",fontFamily:"'Share Tech Mono',monospace",fontSize:"clamp(24px,5.5vh,38px)",color:"#00ff41",margin:"clamp(8px,1.6vh,14px) 0",whiteSpace:"nowrap"}}>100 000 ₽</strong><p style={{color:"#c8ffe0",fontFamily:"'Montserrat',sans-serif",fontSize:13.5}}>Многостраничный сайт или каталог.</p><PriceFeatureList items={PRICE_FEATURES.full} color="#c8ffe0"/><p style={{color:"rgba(200,255,224,.55)",fontFamily:"'Montserrat',sans-serif",fontSize:11.5,fontStyle:"italic",margin:"10px 0 0"}}>Один привлечённый клиент окупает сайт.</p><a href="#contact" className="btn-price-cta" style={{...PRICE_CTA_STYLE,borderColor:"rgba(0,255,65,.55)"}}>Обсудить →</a></div></div></Reveal></div></section>;}
// Rendered as a sequential terminal log rather than a card grid, echoing
// the htop aesthetic already established in AIConsierge (same ProcessBar,
// same status vocabulary/row-glow keyframes) for visual consistency across
// the site. Statuses are illustrative of "how the process unfolds", not a
// live tracker of any specific client's project.
const PROCESS_STEPS = [
  { n: "01", name: "Бриф", desc: "Обсуждаем бизнес, задачу и кто клиент — до старта понятно, что должен делать сайт.", status: "DONE", fill: 100, delay: 0 },
  { n: "02", name: "Прототип", desc: "Собираю структуру и черновой дизайн, показываю вам раньше, чем начинаю вёрстку.", status: "ACTIVE", fill: 68, delay: 280 },
  { n: "03", name: "Разработка", desc: "Верстаю и программирую сам, без передачи задачи фрилансерам на аутсорс.", status: "PENDING", fill: 30, delay: 560 },
  { n: "04", name: "Запуск", desc: "Тестирую на устройствах, публикую сайт и показываю, как редактировать самому.", status: "QUEUED", fill: 8, delay: 840 },
];
function Process(){
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); ob.disconnect(); } }, { threshold: .2 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace" };
  const statusColor = (s: string) => s === "DONE" ? "#00ff41" : s === "ACTIVE" ? "#7dffaa" : s === "PENDING" ? "#3dde6e" : "rgba(0,255,65,.5)";
  const rowGlow = (s: string) => s === "DONE" ? { anim: "rowGlowDone", dur: 11 } : s === "ACTIVE" ? { anim: "rowGlowActive", dur: 4.5 } : s === "PENDING" ? { anim: "rowGlowRunning", dur: 6.5 } : { anim: "rowGlowQueued", dur: 8.5 };
  const scanSpeed = (s: string) => s === "ACTIVE" ? 90 : s === "PENDING" ? 140 : s === "DONE" ? 340 : 260;
  return (
    <section id="process" style={{ flexShrink: 0, scrollSnapAlign: "start", width: 1100, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "84px clamp(20px,4vw,60px) 20px", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 24 }}>
            <span style={{ ...mono, fontSize: 11, color: "#008f11" }}>04 / Процесс</span>
            <h2 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "clamp(20px,4.4vh,40px)", color: "#f2f2f2", marginTop: 14 }}>Четыре шага. Вы видите результат на каждом.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div ref={ref} style={{ border: "1px solid rgba(0,255,65,.2)", animation: "borderGlow 4s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderBottom: "1px solid rgba(0,255,65,.15)", background: "#0a1a0a" }}>
              {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <span key={c} style={{ width: 9, height: 9, background: c, display: "block" }} />)}
              <span style={{ ...mono, fontSize: 10, color: "#008f11", letterSpacing: ".14em", marginLeft: 8 }}>~/process/pipeline.log</span>
            </div>
            {PROCESS_STEPS.map((s, i) => {
              const glow = rowGlow(s.status);
              return (
                <div key={s.n} style={{ padding: "clamp(10px,1.8vh,16px) 16px", borderBottom: i < PROCESS_STEPS.length - 1 ? "1px solid rgba(0,255,65,.07)" : "none", animation: `${glow.anim} ${glow.dur}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontFamily: "'VT323',monospace", fontSize: 16, color: "rgba(0,255,65,.4)", flexShrink: 0 }}>[00:0{i}.{String(i * 23).padStart(3, "0")}]</span>
                    <span style={{ ...mono, fontSize: 13, color: "#00ff41", flexShrink: 0 }}>$ {s.name.toLowerCase()}.sh</span>
                    <span style={{ flex: 1, minWidth: 24, height: 0, borderBottom: "1px dotted rgba(0,255,65,.15)", alignSelf: "center" }} />
                    <ProcessBar target={s.fill} delay={s.delay} animate={animate} scanSpeed={scanSpeed(s.status)} />
                    <span style={{ ...mono, fontSize: 10, color: statusColor(s.status), letterSpacing: ".04em", flexShrink: 0 }}>{s.status}</span>
                  </div>
                  <div style={{ color: "#9a9a9a", fontSize: 12, lineHeight: 1.5, fontFamily: "'Montserrat',sans-serif", marginTop: 6, paddingLeft: 2 }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const CONTACT_FIELDS: { key: "name" | "contact" | "task"; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Ваше имя" },
  { key: "contact", label: "Telegram или телефон" },
  { key: "task", label: "Что нужно сделать", multiline: true },
];
function TerminalContactForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const field = CONTACT_FIELDS[step];
  useEffect(() => { if (step > 0) (field?.multiline ? taRef.current : inputRef.current)?.focus(); }, [step, field]);
  function commit() {
    if (!field) return;
    if (!current.trim() && field.key !== "task") {
      setError(true);
      window.setTimeout(() => setError(false), 500);
      return;
    }
    setError(false);
    const next = { ...values, [field.key]: current };
    setValues(next);
    setCurrent("");
    if (step < CONTACT_FIELDS.length - 1) { setStep(step + 1); return; }
    const body = `Имя: ${next.name || ""}\nКонтакт: ${next.contact || ""}\n\nЗадача:\n${next.task || ""}`;
    window.location.href = `mailto:zakhsergey7@gmail.com?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setStep(step + 1);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !(field?.multiline && e.shiftKey)) { e.preventDefault(); commit(); }
  }
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 14 };
  return (
    <div style={{ ...mono, lineHeight: 2 }} onClick={() => (field?.multiline ? taRef.current : inputRef.current)?.focus()}>
      <div style={{ color: "#00ff41" }}>$ ./contact --new</div>
      {CONTACT_FIELDS.slice(0, step).map(f => (
        <div key={f.key} style={{ color: "#008f11", whiteSpace: "pre-wrap" }}>
          <span style={{ color: "#00ff41" }}>{"> "}</span>{f.label}: {values[f.key]}
        </div>
      ))}
      {field && (
        <div style={{ display: "flex", alignItems: field.multiline ? "flex-start" : "center", color: "#00ff41", animation: error ? "fieldError .3s ease" : "none" }}>
          <span style={{ flexShrink: 0, whiteSpace: "nowrap", marginRight: 8, color: error ? "#ff0040" : "#00ff41" }}>{"> "}{field.label}:</span>
          {field.multiline ? (
            <textarea ref={taRef} className="input-terminal" value={current} onChange={e => setCurrent(e.target.value)} onKeyDown={onKeyDown} rows={2}
              style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#00ff41", caretColor: "#00ff41", resize: "none", padding: 0, ...mono }} />
          ) : (
            <>
              <input ref={inputRef} className="input-terminal" value={current} onChange={e => setCurrent(e.target.value)} onKeyDown={onKeyDown}
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#00ff41", caretColor: "#00ff41", padding: 0, ...mono }} />
              <span style={{ display: "inline-block", width: 8, height: 15, background: "#00ff41", animation: "termCursorBlink 1s step-end infinite", flexShrink: 0 }} />
            </>
          )}
        </div>
      )}
      {field && <div style={{ color: error ? "#ff0040" : "rgba(0,255,65,.3)", fontSize: 11, marginTop: 2 }}>{error ? "поле обязательно для заполнения" : <>[Enter ↵] {field.multiline ? "чтобы отправить, Shift+Enter — новая строка" : "далее"}</>}</div>}
      {!field && <div style={{ marginTop: 10, color: "#00ff41" }}>{sent ? "✓ Заявка собрана. Открываю почтовый клиент..." : ""}</div>}
    </div>
  );
}
function Contact(){return <section id="contact" style={{flexShrink:0,scrollSnapAlign:"start",width:"1100px",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"84px clamp(20px,4vw,60px) 20px",background:"#050f05",borderLeft:"1px solid rgba(0,255,65,.18)",position:"relative",overflow:"hidden"}}><SectionRain/><div className="contact-grid" style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:44,alignItems:"center"}}><div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>05 / Связаться</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(22px,6vh,48px)",color:"#00ff41",marginTop:14}}>Расскажите,<br/>что нужно<br/>сделать.</h2></div><TerminalBox title="~/contact/form.sh" accent><TerminalContactForm/></TerminalBox></div></section>;}
const FOOTER_LINKS:[string,string][]=[["https://t.me/Must_D1e","Telegram"],["https://github.com/zakhsergey7-pixel","GitHub"],["mailto:zakhsergey7@gmail.com","Email"]];
function Footer(){const toStart=(e:React.MouseEvent)=>{e.preventDefault();document.getElementById("top")?.scrollTo({left:0,behavior:"smooth"})};return <footer style={{flexShrink:0,scrollSnapAlign:"start",width:"min(360px,80vw)",height:"100vh",borderLeft:"1px solid rgba(0,255,65,.18)",padding:"84px clamp(24px,4vw,50px) 40px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#8a8a8a",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden",background:"#050f05"}}><SectionRain opacity={.26} speed={100}/><div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:14}}>{FOOTER_LINKS.map(([href,label])=><a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined} className="link-footer" style={{color:"#00ff41",textDecoration:"none",transition:"opacity .2s"}}>{label}</a>)}</div><div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:10}}><span>© {new Date().getFullYear()} Захаров Сергей</span><a href="#top" onClick={toStart} style={{color:"#00ff41",textDecoration:"none"}}>← Наверх</a></div></footer>;}
const RIPPLE_CHARS = "01ｱｲｳｴｵｶﾀﾁﾂ<>[]{}|/\\+—";
function RippleBurst({ x, y }: { x: number; y: number }) {
  const n = 10;
  return (
    <div style={{ position: "fixed", left: x, top: y, width: 0, height: 0, zIndex: 200, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 42 + Math.random() * 14;
        const ch = RIPPLE_CHARS[(Math.random() * RIPPLE_CHARS.length) | 0];
        return (
          <span
            key={i}
            style={{
              "--tx": `${Math.cos(angle) * dist}px`,
              "--ty": `${Math.sin(angle) * dist}px`,
              position: "absolute", left: 0, top: 0,
              fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700,
              color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,.8)",
              animation: "rippleOut .4s ease-out forwards",
            } as React.CSSProperties}
          >{ch}</span>
        );
      })}
    </div>
  );
}
function ClickRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const id = Date.now() + Math.random();
      setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 420);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  return <>{ripples.map(r => <RippleBurst key={r.id} x={r.x} y={r.y} />)}</>;
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const main = document.getElementById("top");
    if (!main) return;
    function onScroll() {
      const w = main!.scrollWidth - main!.clientWidth;
      setPct(w > 0 ? Math.min(100, Math.max(0, (main!.scrollLeft / w) * 100)) : 0);
    }
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { main.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, width: "100vw", height: 2, zIndex: 90, background: "rgba(0,255,65,.1)", pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "#00ff41", boxShadow: "0 0 8px rgba(0,255,65,.7)", transition: "width .1s linear" }} />
      <span style={{ position: "absolute", left: `${pct}%`, bottom: -3, transform: "translateX(-50%)", color: "#00ff41", fontSize: 9, textShadow: "0 0 6px rgba(0,255,65,.9)", transition: "left .1s linear" }}>◆</span>
    </div>
  );
}

const KEYFRAMES=`a:focus-visible,button:focus-visible{outline:2px solid rgba(0,255,65,.6);outline-offset:2px}.input-terminal:focus-visible{outline:none;box-shadow:0 0 0 1px rgba(0,255,65,.55);background:rgba(0,255,65,.06)}@keyframes slideBar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes marqAnim{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes neonPulse{0%,100%{text-shadow:0 0 10px rgba(0,255,65,.4),0 0 28px rgba(0,255,65,.18)}50%{text-shadow:0 0 20px rgba(0,255,65,.85),0 0 52px rgba(0,255,65,.4)}} @keyframes hudBlink{0%,93%,100%{opacity:1}94%,96%{opacity:0}95%,97%{opacity:1}98%,99%{opacity:.3}} @keyframes borderGlow{0%,100%{border-color:rgba(0,255,65,.2)}50%{border-color:rgba(0,255,65,.5)}} @keyframes rowGlowDone{0%,100%{background:rgba(0,255,65,.02)}50%{background:rgba(0,255,65,.07)}} @keyframes rowGlowActive{0%,100%{background:rgba(0,255,65,.04)}50%{background:rgba(0,255,65,.14)}} @keyframes rowGlowRunning{0%,100%{background:rgba(0,255,65,.03)}50%{background:rgba(0,255,65,.10)}} @keyframes rowGlowQueued{0%,100%{background:rgba(0,255,65,.015)}50%{background:rgba(0,255,65,.05)}} @keyframes matrixHighlight{0%{text-shadow:0 0 2px rgba(0,255,65,.25)}30%{text-shadow:0 0 16px rgba(0,255,65,1),0 0 34px rgba(0,255,65,.65)}100%{text-shadow:0 0 6px rgba(0,255,65,.35)}} @keyframes rippleOut{0%{transform:translate(-50%,-50%) scale(.5);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1);opacity:0}} @keyframes termCursorBlink{0%,49%{opacity:1}50%,100%{opacity:0}} @keyframes fieldError{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}} @media (hover:hover) and (pointer:fine){.link-nav:hover{color:#00ff41}.btn-next:hover{background:rgba(0,255,65,.12)}.card-service:hover{background:#0a1a0a}.row-ai:hover{padding-left:22px}.portfolio-shot:hover{background:#111}.btn-price-cta:hover{background:rgba(0,255,65,.12)}.link-footer:hover{opacity:.7}.btn-hero-primary:hover{background:#7dffaa;box-shadow:0 0 24px rgba(0,255,65,.5)}.btn-hero-secondary:hover{border-color:rgba(0,255,65,.8);background:rgba(0,255,65,.08)}} @media (min-width:1024px){.hero-grid{grid-template-columns:3fr 2fr!important}} @media (max-width:640px){.nav-links{display:none!important}.nav-toggle{display:inline-flex!important}.hero-hud{display:none!important}.ai-table-head{display:none!important}.ai-table-row{grid-template-columns:28px 1fr!important}.ai-table-row>*:nth-child(3){grid-column:1/-1!important;margin-top:8px}.ai-table-row>*:nth-child(4){grid-column:1/-1!important;margin-top:4px}}`;
// The whole site scrolls on the X axis: <main> is the single scrolling
// element (flex row, overflow-x:auto, height:100vh), every top-level
// section is a fixed-height flex child with its own width. A native
// wheel listener (passive:false — React's onWheel can't preventDefault)
// redirects vertical wheel input into main.scrollLeft so a normal mouse
// still "scrolls" the page; touch/trackpad already scroll horizontally
// natively. Anything that used to read window.scrollY reads main's
// scrollLeft instead — there's exactly one scroll container on the page,
// found via document.getElementById("top"), rather than threading a ref
// through every component that needs scroll position.
const TAB_TITLE_LURE = ["[З/С] · Захаров Сергей", "[●] Новый проект?"];
function useTabTitleCycle() {
  useEffect(() => {
    const original = document.title;
    let interval = 0, idx = 0;
    function onVisibility() {
      if (document.hidden) {
        interval = window.setInterval(() => { idx = (idx + 1) % TAB_TITLE_LURE.length; document.title = TAB_TITLE_LURE[idx]; }, 4000);
      } else {
        clearInterval(interval);
        document.title = original;
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); clearInterval(interval); document.title = original; };
  }, []);
}
function useMainWheelRedirect() {
  useEffect(() => {
    const main = document.getElementById("top");
    if (!main) return;
    function onWheel(e: WheelEvent) {
      // overflow:hidden (set during the LiveConsole boot-gate) blocks native
      // scroll input, but not a script-driven scrollLeft write like this one
      // — check the lock explicitly so the redirect can't bypass the gate.
      if (main!.style.overflowX === "hidden") return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = main!.scrollLeft <= 0;
      const atEnd = main!.scrollLeft >= main!.scrollWidth - main!.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      main!.scrollLeft += e.deltaY;
    }
    main.addEventListener("wheel", onWheel, { passive: false });
    return () => main.removeEventListener("wheel", onWheel);
  }, []);
}
export default function App(){
  useMainWheelRedirect();
  useTabTitleCycle();
  const mainRef = useRef<HTMLElement>(null);
  return <div style={{background:"#000",color:"#00ff41",height:"100vh",overflow:"hidden"}}><style>{KEYFRAMES}</style><ScrollProgress/><ClickRipple/><Nav/><main id="top" ref={mainRef} style={{display:"flex",flexDirection:"row",height:"100%",overflowX:"auto",overflowY:"hidden"}}><LiveConsole/><Hero mainRef={mainRef}/><StatsBand/><DecodeStreamDivider/><Mission/><AIConsierge/><Services/><Price/><Process/><Contact/><Footer/></main></div>;
}
