import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import iconNode from "../assets/icon-node.png";
import iconSpark from "../assets/icon-spark.png";
import iconWhale from "../assets/icon-whale.png";
import poseShout from "../assets/pose-shout.png";
import poseSitFront from "../assets/pose-sit-front.png";
import poseFront from "../assets/pose-front.png";
import poseFrontSide from "../assets/pose-frontside.png";
import poseSide from "../assets/pose-side.png";
import poseBackSide from "../assets/pose-backside.png";
import poseBack from "../assets/pose-back.png";
import poseTumble1 from "../assets/pose-tumble-1.png";
import poseTumble2 from "../assets/pose-tumble-2.png";
import poseTumble3 from "../assets/pose-tumble-3.png";
import poseDazed from "../assets/pose-dazed.png";
import poseClimb from "../assets/pose-climb.png";
import poseIdleThink from "../assets/pose-idle-think.png";
import poseIdleCheer from "../assets/pose-idle-cheer.png";
import poseCrouch from "../assets/pose-crouch.png";
import poseClimbReach from "../assets/pose-climb-reach.png";
import poseClimbCrest from "../assets/pose-climb-crest.png";
import posePeek from "../assets/pose-peek.png";

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
      const r = canvas!.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height); canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cols = Math.max(1, Math.floor(w / fontSize)); drops = Array.from({ length: cols }, () => Math.random() * (h / fontSize));
    }
    function tick(t: number) {
      raf = requestAnimationFrame(tick); if (t - last < speed) return; last = t; ctx.fillStyle = trail; ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) { const ch = chars[(Math.random() * chars.length) | 0]; ctx.fillStyle = drops[i] * fontSize > h - fontSize * 3 ? "#ffffff" : color; ctx.fillText(ch, i * fontSize, drops[i] * fontSize); if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0; drops[i] += 0.35 + Math.random() * 0.4; }
    }
    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(tick); return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [fontSize, color, trail, speed]);
  return <canvas ref={ref} className={className} style={{ opacity, display: "block", width: "100%", height: "100%", ...styleProp }} />;
}

function NoiseOverlay() { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = ref.current; if (!canvas) return; const SIZE = 120; canvas.width = SIZE; canvas.height = SIZE; const ctx = canvas.getContext("2d")!; let raf: number; function draw() { const d = ctx.createImageData(SIZE, SIZE); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() > 0.93 ? Math.floor(Math.random() * 200) : 0; d.data[i] = 0; d.data[i + 1] = v; d.data[i + 2] = 0; d.data[i + 3] = v; } ctx.putImageData(d, 0, 0); raf = requestAnimationFrame(draw); } raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf); }, []); return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", imageRendering: "pixelated" }} />; }
function useDecrypt(text: string, active: boolean, speed = 36) { const glyphs = "01ｱｲｳｴｵｶﾀﾁﾂ<>[]{}|\\!@#$%"; const [out, setOut] = useState(() => text.split("").map(c => c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]).join("")); const pos = useRef(0); useEffect(() => { if (!active) return; pos.current = 0; const id = setInterval(() => { pos.current += 1.6; const p = pos.current; setOut(text.split("").map((c, i) => c === " " ? " " : i < p ? c : glyphs[(Math.random() * glyphs.length) | 0]).join("")); if (p >= text.length) clearInterval(id); }, speed); return () => clearInterval(id); }, [active, text, speed]); return out; }
function Glitch({ children }: { children: string }) { const [glitching, setGlitching] = useState(false); const g = "01ｱｲｳｴｵ<>[]{}|\\"; useEffect(() => { const id = setInterval(() => { setGlitching(true); setTimeout(() => setGlitching(false), 110); }, 3400 + Math.random() * 5000); return () => clearInterval(id); }, []); if (!glitching) return <span>{children}</span>; return <span style={{ color: "#ff0040", textShadow: "-2px 0 #ff0040, 2px 0 #00ffff" }}>{children.split("").map(c => Math.random() > 0.55 ? g[(Math.random() * g.length) | 0] : c).join("")}</span>; }
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) { const ref = useRef<HTMLDivElement>(null); const [v, setV] = useState(false); useEffect(() => { const el = ref.current; if (!el) return; const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } }, { threshold: 0.08 }); ob.observe(el); return () => ob.disconnect(); }, []); return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", filter: v ? "blur(0px)" : "blur(7px)", transition: `opacity 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, filter 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>{children}</div>; }
function SignalBars() { const [level, setLevel] = useState(4); useEffect(() => { const id = setInterval(() => setLevel(Math.random() > 0.15 ? 4 : 3), 2800 + Math.random() * 2000); return () => clearInterval(id); }, []); return <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, marginLeft: 10 }}>{[1,2,3,4].map(b => <span key={b} style={{ width: 3, height: b * 3 + 1, background: b <= level ? "#00ff41" : "#003b00", display: "block", transition: "background .5s", boxShadow: b <= level ? "0 0 4px #00ff41" : "none" }} />)}</span>; }
const NAV_LINKS: [string,string][] = [["#services","Услуги"],["#portfolio","Работы"],["#ai","Консьерж"],["#stack","Инструменты"],["#price","Стоимость"],["#contact","Связаться"]];
function Nav() { const [scrolled,setScrolled]=useState(false); const [open,setOpen]=useState(false); useEffect(()=>{const h=()=>setScrolled(window.scrollY>60);window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h)},[]); const mono:React.CSSProperties={fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:".14em",textTransform:"uppercase"}; return <header style={{position:"fixed",top:0,left:0,right:0,zIndex:80,borderBottom:scrolled||open?"1px solid rgba(0,255,65,.14)":"1px solid transparent",background:scrolled||open?"rgba(0,0,0,.93)":"transparent",backdropFilter:scrolled||open?"blur(12px)":"none",transition:"background .4s,border-color .4s"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px clamp(20px,5vw,90px)"}}><SignalBars/><nav className="nav-links" style={{display:"flex",gap:"clamp(14px,2.8vw,28px)",...mono}}>{NAV_LINKS.map(([href,label])=><a key={href} href={href} className="link-nav" style={{color:"#008f11",textDecoration:"none",transition:"color .2s"}}>{label}</a>)}</nav><button className="nav-toggle" onClick={()=>setOpen(o=>!o)} style={{...mono,display:"none",background:"transparent",border:"1px solid rgba(0,255,65,.35)",color:"#00ff41",padding:"6px 10px",cursor:"pointer"}}>[ {open?"×":"MENU"} ]</button></div>{open&&<nav className="nav-mobile-panel" style={{display:"flex",flexDirection:"column",padding:"4px clamp(20px,5vw,90px) 18px"}}>{NAV_LINKS.map(([href,label])=><a key={href} href={href} onClick={()=>setOpen(false)} style={{...mono,color:"#00ff41",textDecoration:"none",padding:"13px 0",borderTop:"1px solid rgba(0,255,65,.1)"}}>{label}</a>)}</nav>}</header>; }
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
function Hero(){const[active,setActive]=useState(false);const headline=useDecrypt("Сайт — это инструмент,\nа не просто картинка.",active);const[cur,setCur]=useState(true);const[mouse,setMouse]=useState({x:0,y:0});const secRef=useRef<HTMLElement>(null);useEffect(()=>{const id=setInterval(()=>setCur(p=>!p),550);return()=>clearInterval(id)},[]);useEffect(()=>{const el=secRef.current;if(!el)return;const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setActive(true);ob.disconnect()}},{threshold:.3});ob.observe(el);return()=>ob.disconnect()},[]);const onMouseMove=(e:React.MouseEvent)=>{const r=secRef.current?.getBoundingClientRect();if(r)setMouse({x:Math.round(e.clientX-r.left),y:Math.round(e.clientY-r.top)})};const{scrollYProgress}=useScroll({target:secRef,offset:["start start","end start"]});const yHeadline=useTransform(scrollYProgress,[0,1],[0,110]);const yMatrix=useTransform(scrollYProgress,[0,1],[0,165]);const yHud=useTransform(scrollYProgress,[0,1],[0,220]);return <section id="hero" ref={secRef} onMouseMove={onMouseMove} style={{position:"relative",minHeight:"100svh",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"clamp(120px,18vh,200px) clamp(20px,5vw,90px) 0",overflow:"hidden"}}><motion.div style={{position:"absolute",inset:0,zIndex:0,y:yMatrix}}><MatrixRain opacity={.32} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.055)" speed={58}/></motion.div><NoiseOverlay/>{DEAD_PIXELS.map((p,i)=><div key={i} style={{position:"absolute",width:2,height:2,background:"#00ff41",boxShadow:"0 0 3px #00ff41",zIndex:1,pointerEvents:"none",animation:`hudBlink ${3.5+i*1.4}s steps(1) infinite ${i*.8}s`,...p}}/>)}<div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)"}}/><motion.div style={{position:"absolute",top:"clamp(80px,13vh,140px)",left:"clamp(20px,5vw,90px)",right:"clamp(20px,5vw,90px)",display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(0,255,65,.28)",zIndex:2,pointerEvents:"none",y:yHud}}><span>SYS.<span style={{color:"#00ff41",animation:"hudBlink 8s steps(1) infinite"}}>ONLINE</span> · UPTIME 05Y</span><span style={{textAlign:"right"}}>55.7522° N · 37.6156° E<br/>BUILD 2026.08</span></motion.div><div className="hero-grid" style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr",gap:"clamp(28px,5vw,48px)",alignItems:"center"}}><motion.h1 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(28px,5.4vw,86px)",lineHeight:1.06,letterSpacing:"-.02em",color:"#00ff41",animation:"neonPulse 4.5s ease-in-out infinite",maxWidth:"22ch",whiteSpace:"pre-line",y:yHeadline}}>{headline}<span style={{opacity:cur?1:0}}>_</span></motion.h1><div className="hero-whoami" id="whoami-box"><WhoAmICard/></div></div><div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,borderTop:"1px solid rgba(0,255,65,.16)",padding:"22px 0 26px",marginTop:"clamp(36px,8vh,80px)"}}><HeroStatusLine/><span style={{width:48,height:1,background:"#003b00",position:"relative",overflow:"hidden",display:"block",flexShrink:0}}><span style={{position:"absolute",inset:0,background:"#00ff41",animation:"slideBar 2s linear infinite"}}/></span></div></section>;}

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
function DecodeStreamDivider(){const readoutRef=useRef<HTMLSpanElement>(null);useEffect(()=>{let t=0;const id=setInterval(()=>{t+=1;if(readoutRef.current){const pct=(t*1.7)%100;const sync=Math.floor((t*733)%0xffff).toString(16).toUpperCase().padStart(4,"0");readoutRef.current.textContent=`PACKETS ${Math.floor(48213+t*37).toString().padStart(6,"0")} · SYNC 0x${sync} · INTEGRITY ${pct.toFixed(1)}%`;}},220);return()=>clearInterval(id)},[]);const pixel:React.CSSProperties={fontFamily:"'Silkscreen',monospace",letterSpacing:".08em",textTransform:"uppercase"};return <div style={{position:"relative",height:76,background:"#000",borderTop:"1px solid rgba(0,255,65,.13)",borderBottom:"1px solid rgba(0,255,65,.13)",overflow:"hidden"}}><AIIconStream/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 clamp(20px,5vw,90px)",pointerEvents:"none",background:"linear-gradient(90deg,#000 0%,rgba(0,0,0,.7) 16%,rgba(0,0,0,0) 32%,rgba(0,0,0,0) 68%,rgba(0,0,0,.7) 84%,#000 100%)"}}><span style={{...pixel,fontSize:10,color:"rgba(0,255,65,.6)"}}>STREAM_IN ▶</span><span ref={readoutRef} className="stream-readout" style={{...pixel,fontSize:9,color:"rgba(0,255,65,.32)"}}>PACKETS 048213 · SYNC 0x4F2A · INTEGRITY 0.0%</span><span style={{...pixel,fontSize:10,color:"rgba(0,255,65,.6)"}}>▶ STREAM_OUT</span></div></div>;}

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
  return <section style={{padding:"clamp(90px,14vh,160px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.26} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.04)" speed={90}/></div><div style={{position:"absolute",left:"clamp(4px,1.4vw,16px)",top:"50%",width:0,height:0,pointerEvents:"none"}}><div style={{position:"absolute",top:0,left:0,width:340,height:20,overflow:"hidden",transform:"rotate(-90deg)",transformOrigin:"top left"}}><div style={{display:"inline-flex",gap:28,animation:"marqAnim 22s linear infinite",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(0,255,65,.55)",textShadow:"0 0 12px rgba(0,255,65,.35)",whiteSpace:"nowrap"}}><span>МИССИЯ · MISSION · МИССИЯ · </span><span>МИССИЯ · MISSION · МИССИЯ · </span></div></div></div><div ref={ref} style={{position:"relative",zIndex:1,paddingLeft:"clamp(46px,7vw,96px)"}}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(32px,6vw,96px)",lineHeight:1,letterSpacing:"-.03em",color:"#00ff41",animation:active?"neonPulse 5s ease-in-out infinite":"none",marginBottom:"clamp(40px,7vh,80px)"}}>
      {MISSION_HEADLINE.map((ln, li) => <div key={li}>{ln.map((w, wi) => <span key={wi}><MatrixWord text={w} active={active} delay={nextDelay()} />{wi < ln.length - 1 ? " " : ""}</span>)}</div>)}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"clamp(6px,1.2vh,14px)",marginBottom:"clamp(44px,8vh,90px)"}}>
      {MISSION_LINES.map((l, i) => { const bold = i % 2 === 0; return <div key={i} style={{paddingLeft:l.pad}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:bold?700:300,fontSize:"clamp(18px,2.8vw,42px)",letterSpacing:"-.01em",display:"inline-block"}}>
        {l.words.map((w, wi) => {
          if (i === 0 && w === "AI") return <span key={wi}><Glitch>AI</Glitch>{wi < l.words.length - 1 ? " " : ""}</span>;
          const wordStyle: React.CSSProperties = bold
            ? { color: "#00ff41" }
            : { color: "transparent", WebkitTextStroke: "1px rgba(0,255,65,.6)" };
          return <span key={wi}><MatrixWord text={w} active={active} delay={nextDelay()} style={wordStyle} />{wi < l.words.length - 1 ? " " : ""}</span>;
        })}
      </span></div>; })}
    </div>
  </div></section>;}
function SectionRain({ opacity = 0.3, speed = 85 }: { opacity?: number; speed?: number }) {
  return <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}><MatrixRain opacity={opacity} fontSize={13} color="#00ff41" trail="rgba(0,0,0,.05)" speed={speed} /></div>;
}
function TerminalBox({title,children,accent}:{title:string;children:React.ReactNode;accent?:boolean}){return <div style={{border:accent?"1px solid rgba(0,255,65,.45)":"1px solid rgba(0,255,65,.25)",background:"#050f05",fontFamily:"'JetBrains Mono',monospace",animation:accent?"borderGlow 3.2s ease-in-out infinite":"none",boxShadow:accent?"0 0 26px rgba(0,255,65,.1)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:"1px solid rgba(0,255,65,.18)",background:"#0a1a0a"}}>{["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:0,background:c,display:"block",imageRendering:"pixelated"}}/>)}<span style={{marginLeft:8,fontSize:11,color:accent?"#00ff41":"#008f11",letterSpacing:".14em",textShadow:accent?"0 0 8px rgba(0,255,65,.55)":"none"}}>{title}</span>{accent&&<span style={{marginLeft:"auto",width:6,height:6,background:"#00ff41",boxShadow:"0 0 6px #00ff41",animation:"hudBlink 2.4s steps(1) infinite"}}/>}</div><div style={{padding:"20px 24px"}}>{children}</div></div>;}
const CONSOLE_INTRO={cmd:"AI about.txt",out:"Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками."};const CONSOLE_LOOP=[{cmd:"AI services.list",out:"визитка · лендинг · каталог · редизайн"},{cmd:"./launch.sh --client=вы",out:"бриф принят. приступаю."}];
function LiveConsole(){const[phase,setPhase]=useState<"intro"|"loop">("intro");const[idx,setIdx]=useState(0);const[step,setStep]=useState(0);const[cur,setCur]=useState(true);useEffect(()=>{const id=setInterval(()=>setStep(s=>s+1),30);return()=>clearInterval(id)},[]);useEffect(()=>{const id=setInterval(()=>setCur(c=>!c),500);return()=>clearInterval(id)},[]);useEffect(()=>{const locked=phase==="intro";document.documentElement.style.overflow=locked?"hidden":"";document.body.style.overflow=locked?"hidden":"";return()=>{document.documentElement.style.overflow="";document.body.style.overflow=""}},[phase]);const entry=phase==="intro"?CONSOLE_INTRO:CONSOLE_LOOP[idx];const PAUSE=8,HOLD=46,cmdLen=entry.cmd.length,outStart=cmdLen+PAUSE,outLen=entry.out.length,total=outStart+outLen+HOLD,introDone=phase==="intro"&&step>outStart+outLen;useEffect(()=>{if(phase==="loop"&&step>=total){setStep(0);setIdx(i=>(i+1)%CONSOLE_LOOP.length)}},[phase,step,total]);const cmdText=entry.cmd.slice(0,Math.min(step,cmdLen)),typingCmd=step<=cmdLen,showOut=step>outStart,outText=showOut?entry.out.slice(0,Math.max(0,Math.min(step-outStart,outLen))):"",typingOut=showOut&&step<outStart+outLen;const handleNext=()=>{setPhase("loop");setIdx(0);setStep(0);window.dispatchEvent(new CustomEvent("char:next"));setTimeout(()=>document.getElementById("hero")?.scrollIntoView({behavior:"smooth"}),30)};return <section style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(40px,6vh,64px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.3} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.05)" speed={60}/></div><div id="console-box" style={{position:"relative",zIndex:1,width:"100%",maxWidth:640}}><TerminalBox title="~/console"><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,minHeight:44}}><div><span style={{color:"#00ff41"}}>$ </span><span style={{color:"#00ff41"}}>{cmdText}</span>{typingCmd&&<span style={{opacity:cur?1:0}}>_</span>}</div>{showOut&&<div style={{color:"#008f11",marginTop:8,lineHeight:1.6}}>{outText}{typingOut&&<span style={{opacity:cur?1:0}}>_</span>}</div>}{introDone&&<button onClick={handleNext} className="btn-next" style={{marginTop:18,background:"transparent",border:"1px solid rgba(0,255,65,.4)",color:"#00ff41",padding:"9px 18px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:".12em",textTransform:"uppercase",cursor:"pointer"}}>▶ Дальше</button>}</div></TerminalBox></div></section>;}
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
    <section id="ai" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.28} fontSize={13} color="#00ff41" trail="rgba(5,15,5,.06)" speed={85} />
      </div>
      <div ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
            <span style={{ ...mono, fontSize: 11, color: "#008f11" }}>00 / Уникальность</span>
            <h2 style={{ ...mono, fontWeight: 700, fontSize: "clamp(20px,3.4vw,50px)", color: "#00ff41", lineHeight: 1.05, marginTop: 18 }}>
              AI-консьерж сервис — уровень крупного агентства для одного клиента.
            </h2>
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
            <div className="ai-table-head" style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "10px 16px 8px", borderBottom: "1px solid rgba(0,255,65,.1)", ...mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.35)" }}>
              <span>PID</span><span>СЕРВИС</span><span>ПРОГРЕСС</span><span>СТАТУС</span>
            </div>
            {procs.map((p, i) => {
              const glow = rowGlow(p.status);
              return (
                <div key={p.pid} className="row-ai ai-table-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 210px 90px", gap: "0 clamp(12px,2vw,28px)", padding: "14px 16px", borderBottom: i < procs.length - 1 ? "1px solid rgba(0,255,65,.07)" : "none", alignItems: "center", animation: `${glow.anim} ${glow.dur}s ease-in-out infinite`, animationDelay: `${i * 0.3}s`, transition: "padding-left .3s" }}>
                  <span style={{ ...mono, fontSize: 11, color: "rgba(0,255,65,.4)" }}>{p.pid}</span>
                  <div>
                    <span style={{ ...mono, fontSize: 13, color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,.35)" }}>{p.name}</span>
                    <div style={{ ...mono, fontSize: 12, color: "rgba(0,255,65,.62)", marginTop: 4, lineHeight: 1.5 }}>{p.desc}</div>
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
function Services() {
  const services = [
    { id: "A", name: "Сайт-визитка", desc: "Компактный сайт о вас и вашей услуге: кто вы, что делаете, сколько стоит, как связаться. Открывается быстро, читается с телефона." },
    { id: "B", name: "Лендинг", desc: "Одна страница под одну задачу — заявки. Структура строится под ваше предложение и возражения клиентов, а не по универсальному шаблону." },
    { id: "C", name: "Каталог и многостраничник", desc: "Товары или услуги с фильтрами, страницами разделов и админкой, в которой вы сами меняете тексты и цены без моей помощи." },
    { id: "D", name: "Редизайн и доработка", desc: "Сайт есть, но выглядит на десять лет старше вашего бизнеса. Разбираю, чиню, обновляю — без переезда на новый домен." },
  ];
  return (
    <section id="services" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>01 / Что делаю</span>
            <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", color: "#00ff41", marginTop: 18 }}>Один человек отвечает за весь результат.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(0,255,65,.14)", border: "1px solid rgba(0,255,65,.14)" }}>
            {services.map((svc) => (
              <div key={svc.id} className="card-service" style={{ background: "#000", padding: "clamp(24px,4vw,44px)", transition: "background .3s" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{svc.id}</span>
                <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(18px,2.2vw,26px)", color: "#00ff41", margin: "14px 0 10px" }}>{svc.name}</h3>
                <p style={{ color: "#008f11", fontSize: 13, lineHeight: 1.65, fontFamily: "'JetBrains Mono',monospace" }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const PORTFOLIO_ITEMS = [
  { id: "01", tag: "визитка", name: "Сайт-визитка", hue: 205 },
  { id: "02", tag: "лендинг", name: "Лендинг", hue: 24 },
  { id: "03", tag: "каталог", name: "Каталог", hue: 275 },
  { id: "04", tag: "редизайн", name: "Редизайн", hue: 150 },
];
function PortfolioShot({ hue }: { hue: number }) {
  return (
    <div className="portfolio-shot" style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", filter: "saturate(.2) hue-rotate(90deg)", transition: "filter .5s ease" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(155deg, hsl(${hue},70%,32%), hsl(${hue + 40},65%,16%))` }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "14%", background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.4)" }} />)}
      </div>
      <div style={{ position: "absolute", top: "26%", left: "8%", width: "55%", height: "10%", background: "rgba(255,255,255,.55)", borderRadius: 2 }} />
      <div style={{ position: "absolute", top: "42%", left: "8%", width: "35%", height: "6%", background: "rgba(255,255,255,.3)", borderRadius: 2 }} />
      <div style={{ position: "absolute", top: "54%", left: "8%", width: "24%", height: "10%", background: `hsl(${hue},80%,55%)`, borderRadius: 2 }} />
      <div style={{ position: "absolute", right: "6%", bottom: "8%", width: "32%", height: "40%", background: "rgba(255,255,255,.15)", borderRadius: 4 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,255,65,.24)", mixBlendMode: "color", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,rgba(0,0,0,.35) 0,rgba(0,0,0,.35) 1px,transparent 1px,transparent 3px)", pointerEvents: "none" }} />
    </div>
  );
}
function Portfolio() {
  return (
    <section id="portfolio" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>02 / Проекты</span>
            <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", color: "#00ff41", marginTop: 18 }}>Формат разный — подход один.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="portfolio-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(0,255,65,.14)", border: "1px solid rgba(0,255,65,.14)" }}>
            {PORTFOLIO_ITEMS.map(p => (
              <div key={p.id} style={{ background: "#000" }}>
                <PortfolioShot hue={p.hue} />
                <div style={{ padding: "clamp(16px,2.6vw,22px)" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{p.id} · {p.tag}</span>
                  <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(16px,2vw,22px)", color: "#00ff41", marginTop: 8 }}>{p.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
function Stack() {
  const pills = ["HTML", "SCSS", "JavaScript", "TypeScript", "React", "Vue.js", "PHP", "WordPress", "WooCommerce", "Git", "Figma"];
  const groups = [
    { label: "Frontend", items: "React, Vue.js, TypeScript" },
    { label: "Backend & CMS", items: "PHP, WordPress, WooCommerce" },
    { label: "Вёрстка & Инструменты", items: "HTML, SCSS, Git, Figma" },
  ];
  return (
    <section id="stack" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>03 / Инструменты</span>
            <h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", color: "#00ff41", marginTop: 18 }}>Стек, на котором собираю сайты.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
            {pills.map((p) => (
              <span key={p} className="pill-stack" style={{ border: "1px solid rgba(0,255,65,.25)", color: "#008f11", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", padding: "9px 15px", transition: "color .2s,border-color .2s" }}>
                {p}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="stack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(0,255,65,.14)", border: "1px solid rgba(0,255,65,.14)" }}>
            {groups.map((g) => (
              <div key={g.label} style={{ background: "#050f05", padding: "clamp(22px,3.4vw,34px)" }}>
                <h3 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#00ff41", marginBottom: 12 }}>{g.label}</h3>
                <p style={{ color: "#008f11", fontSize: 13, lineHeight: 1.7, fontFamily: "'JetBrains Mono',monospace" }}>{g.items}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
function Price(){return <section id="price" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",background:"#050f05",position:"relative",overflow:"hidden"}}><SectionRain/><div style={{position:"relative",zIndex:1}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>04 / Стоимость</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#00ff41",marginTop:18}}>Два формата. Цена фиксируется до старта.</h2></div><div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginTop:50,background:"rgba(0,255,65,.12)"}}><div style={{background:"#050f05",padding:"clamp(22px,5vw,40px)",fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#008f11",fontSize:11}}>ПАКЕТ «БАЗА»</div><strong style={{display:"block",fontSize:"clamp(30px,7vw,52px)",color:"#00ff41",margin:"clamp(14px,3vw,25px) 0",whiteSpace:"nowrap"}}>50 000 ₽</strong><p style={{color:"#008f11"}}>Сайт-визитка или лендинг.</p></div><div style={{background:"#003b00",padding:"clamp(22px,5vw,40px)",fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#7dffaa",fontSize:11}}>ПАКЕТ «ПОЛНЫЙ»</div><strong style={{display:"block",fontSize:"clamp(30px,7vw,52px)",color:"#00ff41",margin:"clamp(14px,3vw,25px) 0",whiteSpace:"nowrap"}}>100 000 ₽</strong><p style={{color:"#c8ffe0"}}>Многостраничный сайт или каталог.</p></div></div></Reveal></div></section>;}
const PROCESS_STEPS = [
  { n: "01", name: "Бриф", desc: "Обсуждаем бизнес, задачу и кто клиент — до старта понятно, что должен делать сайт." },
  { n: "02", name: "Прототип", desc: "Собираю структуру и черновой дизайн, показываю вам раньше, чем начинаю вёрстку." },
  { n: "03", name: "Разработка", desc: "Верстаю и программирую сам, без передачи задачи фрилансерам на аутсорс." },
  { n: "04", name: "Запуск", desc: "Тестирую на устройствах, публикую сайт и показываю, как редактировать самому." },
];
function Process(){return <section style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",position:"relative",overflow:"hidden"}}><SectionRain/><div style={{position:"relative",zIndex:1}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20,marginBottom:40}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>05 / Процесс</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#00ff41",marginTop:18}}>Четыре шага. Вы видите результат на каждом.</h2></div></Reveal><Reveal delay={80}><div className="process-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"rgba(0,255,65,.14)",border:"1px solid rgba(0,255,65,.14)"}}>{PROCESS_STEPS.map((s)=><div key={s.n} className="card-service" style={{background:"#000",padding:"clamp(22px,3.4vw,32px)",transition:"background .3s"}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11",letterSpacing:".14em"}}>{s.n}</span><h3 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(16px,1.8vw,20px)",color:"#00ff41",margin:"12px 0 8px"}}>{s.name}</h3><p style={{color:"#008f11",fontSize:13,lineHeight:1.6,fontFamily:"'JetBrains Mono',monospace"}}>{s.desc}</p></div>)}</div></Reveal></div></section>;}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const field = CONTACT_FIELDS[step];
  useEffect(() => { if (step > 0) (field?.multiline ? taRef.current : inputRef.current)?.focus(); }, [step, field]);
  function commit() {
    if (!field) return;
    if (!current.trim() && field.key !== "task") return;
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
        <div style={{ display: "flex", alignItems: field.multiline ? "flex-start" : "center", color: "#00ff41" }}>
          <span style={{ flexShrink: 0, whiteSpace: "nowrap", marginRight: 8 }}>{"> "}{field.label}:</span>
          {field.multiline ? (
            <textarea ref={taRef} value={current} onChange={e => setCurrent(e.target.value)} onKeyDown={onKeyDown} rows={2}
              style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#00ff41", caretColor: "#00ff41", resize: "none", padding: 0, ...mono }} />
          ) : (
            <>
              <input ref={inputRef} value={current} onChange={e => setCurrent(e.target.value)} onKeyDown={onKeyDown}
                style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: "#00ff41", caretColor: "#00ff41", padding: 0, ...mono }} />
              <span style={{ display: "inline-block", width: 8, height: 15, background: "#00ff41", animation: "termCursorBlink 1s step-end infinite", flexShrink: 0 }} />
            </>
          )}
        </div>
      )}
      {field && <div style={{ color: "rgba(0,255,65,.3)", fontSize: 11, marginTop: 2 }}>[Enter ↵] {field.multiline ? "чтобы отправить, Shift+Enter — новая строка" : "далее"}</div>}
      {!field && <div style={{ marginTop: 10, color: "#00ff41" }}>{sent ? "✓ Заявка собрана. Открываю почтовый клиент..." : ""}</div>}
    </div>
  );
}
function Contact(){return <section id="contact" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",borderTop:"1px solid rgba(0,255,65,.18)",position:"relative",overflow:"hidden"}}><SectionRain/><div className="contact-grid" style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:60}}><div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>06 / Связаться</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(26px,5vw,70px)",color:"#00ff41",marginTop:20}}>Расскажите,<br/>что нужно<br/>сделать.</h2></div><TerminalBox title="~/contact/form.sh" accent><TerminalContactForm/></TerminalBox></div></section>;}
function Footer(){return <footer style={{background:"#050f05",borderTop:"1px solid rgba(0,255,65,.18)",padding:"22px clamp(20px,5vw,90px)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11",display:"flex",justifyContent:"space-between",position:"relative",overflow:"hidden"}}><SectionRain opacity={.26} speed={100}/><span style={{position:"relative",zIndex:1}}>© 2026 Захаров Сергей</span><a href="#top" style={{position:"relative",zIndex:1,color:"#00ff41",textDecoration:"none"}}>Наверх ↑</a></footer>;}
/* ─────────────────────────────────────────
   Walking character — a small narrative +
   roaming state machine, not a flat pace:

   1. "introSit"  → sits on the ~/console box
      (right side of its header) from the
      moment the page loads, legs hanging
      over the front, while the boot gate is
      up.
   2. On "Дальше" → "fallShout": screams and
      falls from the console over to the
      zakharov.dev terminal card (or, if that
      card is hidden on narrow screens, to
      the bottom of the viewport).
   3. "landBounce" → a quick recovery shake
      ("dusts off" — no dedicated frame, so
      approximated with a wobble).
   4. "landSit" → sits on that block for a
      few seconds.
   5. "roam" → the ongoing loop: walks to
      random spots (turning through the
      5-pose turnaround like a mini 3D
      turntable instead of flipping), stops
      to look at the viewer, or climbs onto a
      nearby block/heading and actually sits
      on it (front/side sit poses) for a
      while before hopping down.

   Positions are tracked in raw viewport
   pixels (not percent) so it can dock
   precisely to specific elements.
───────────────────────────────────────── */
const CHAR_SECTION_IDS = ["hero", "ai", "services", "portfolio", "stack", "price", "process", "contact"];
const CHAR_TALK_PHRASES = [
  "hi, i'm ai agent", "ai-pixel here", "01001000 01001001", "system.exe running",
  "просто прохожу мимо", "не тыкай, я работаю", "заряжен на 87%", "сижу, смотрю на тебя",
  "compiling thoughts...", "я не баг, я фича", "matrix has you", "нажми ещё раз",
  "loading personality...", "печатаю твой сайт",
];
const CHAR_STAND = [poseFront, poseFrontSide, poseSide, poseBackSide, poseBack];
const CHAR_STAND_RATIO = [211 / 500, 201 / 500, 119 / 500, 201 / 500, 215 / 500];
const CHAR_SIT_RATIO = 206 / 343;
const CHAR_SIT_HIP_FRACTION = 0.58;
const CHAR_SHOUT_RATIO = 288 / 237;
const CHAR_TUMBLE = [poseTumble1, poseTumble2, poseTumble3];
const CHAR_TUMBLE_RATIO = [106 / 136, 98 / 103, 117 / 104];
const CHAR_DAZED_RATIO = 138 / 175;
const CHAR_CLIMB_RATIO = 103 / 143;
const CHAR_IDLE_LOOK = [
  { src: poseFront, ratio: CHAR_STAND_RATIO[0] },
  { src: poseIdleThink, ratio: 76 / 148 },
  { src: poseIdleCheer, ratio: 89 / 160 },
];
const CHAR_CROUCH_RATIO = 126 / 178;
const CHAR_PEEK_RATIO = 74 / 88;
// A real multi-stage climb instead of one held frame: each entry takes over
// once the eased vertical rise passes `at`, so the character visibly coils at
// the base, jumps for the ledge, hauls himself up and finally swings a knee
// over the top edge before settling into the sit.
const CHAR_CLIMB_FRAMES = [
  { at: 0, src: poseCrouch, ratio: CHAR_CROUCH_RATIO },
  { at: 0.12, src: poseClimbReach, ratio: 130 / 158 },
  { at: 0.42, src: poseClimb, ratio: CHAR_CLIMB_RATIO },
  { at: 0.76, src: poseClimbCrest, ratio: 79 / 118 },
];
const CHAR_CLIMB_MS = 1180;
const CHAR_CLIMB_SWAY_PX = 9;
// boxes wide/tall enough to actually disappear behind
const CHAR_HIDE_SELECTOR = ".card-service, .card-price-base, .card-price-full, .pill-stack";
const CHAR_HIDE_CLIP_PCT = 52;
const CHAR_PERCH_SELECTOR = "h1, h2, .pill-stack, .card-service, .card-price-base, .card-price-full";
const CHAR_HEIGHT_PX = 84;
function charBoxHeightPx() { return Math.min(84, Math.max(64, window.innerWidth * 0.135)); }
function sitSeatOffsetPx() { return charBoxHeightPx() * CHAR_SIT_HIP_FRACTION; }

type CharPhase = "introSit" | "fallShout" | "landBounce" | "landSit" | "roam";
type CharActivity =
  | "walk" | "walkToExamine" | "examine" | "look"
  | "perchMove" | "perchLook" | "perchClimb" | "perchHold"
  | "hideMove" | "hideDuck" | "hiding";

function WalkingCharacter() {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState<number | null>(null);
  const [onFloor, setOnFloor] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [sprite, setSprite] = useState<{ src: string; ratio: number }>({ src: poseSitFront, ratio: CHAR_SIT_RATIO });
  const [shake, setShake] = useState(0);
  const [fallToken, setFallToken] = useState(0);
  const [tumbling, setTumbling] = useState(false);
  const [ready, setReady] = useState(false);
  const [bubble, setBubble] = useState<{ text: string; key: number } | null>(null);
  const [clipPct, setClipPct] = useState(0);

  useEffect(() => {
    if (!bubble) return;
    const id = window.setTimeout(() => setBubble(b => (b && b.key === bubble.key ? null : b)), 2600);
    return () => clearTimeout(id);
  }, [bubble]);

  function handleTalk() {
    const text = CHAR_TALK_PHRASES[(Math.random() * CHAR_TALK_PHRASES.length) | 0];
    setBubble({ text, key: Date.now() });
    window.dispatchEvent(new CustomEvent("char:talk"));
  }

  useEffect(() => {
    const consoleBox = document.getElementById("console-box");
    if (!consoleBox) { setReady(true); return; }
    const r = consoleBox.getBoundingClientRect();
    setLeft(r.left + r.width * 0.8);
    setTop(r.top - sitSeatOffsetPx());
    setOnFloor(false);
    setSprite({ src: poseSitFront, ratio: CHAR_SIT_RATIO });
    setMirror(false);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const phaseRef: { v: CharPhase } = { v: "introSit" };
    const activityRef: { v: CharActivity } = { v: "walk" };
    const leftRef = { v: left };
    const topRef = { v: top ?? 0 };
    const poseRef = { v: 2 };
    const mirrorRef = { v: false };
    const targetXRef = { v: left };
    const untilRef = { v: 0 };
    const perchElRef: { v: HTMLElement | null } = { v: null };
    const lookVariantRef = { v: false };
    const climbStartRef = { v: 0 };
    const climbFromRef = { v: 0 };
    const climbFrameRef = { v: -1 };
    const hideSideRef: { v: 1 | -1 } = { v: 1 };
    let lastPoseStep = 0;
    let raf = 0;
    let transitionTimer = 0;
    let tumbleTimer = 0;

    function floorLeftBounds() { return [24, window.innerWidth - 24]; }
    function floorTopPx() { return window.innerHeight - 24 - CHAR_HEIGHT_PX; }

    function pickPerchTarget(): HTMLElement | null {
      const els = Array.from(document.querySelectorAll(CHAR_PERCH_SELECTOR)) as HTMLElement[];
      const vis = els.filter(el => {
        const r = el.getBoundingClientRect();
        const isHeading = el.tagName === "H1" || el.tagName === "H2";
        const maxW = isHeading ? window.innerWidth - 48 : 520;
        return r.top > 90 && r.bottom < window.innerHeight - 60 && r.width > 26 && r.width < maxW && r.height < 260;
      });
      return vis.length ? vis[(Math.random() * vis.length) | 0] : null;
    }

    // for wide headings, land somewhere along the phrase rather than dead
    // center — reads as climbing onto "some word" rather than the middle
    function perchLandingX(el: HTMLElement, r: DOMRect): number {
      const isHeading = el.tagName === "H1" || el.tagName === "H2";
      if (!isHeading) return r.left + r.width / 2;
      const margin = Math.min(r.width * 0.15, 60);
      return r.left + margin + Math.random() * Math.max(1, r.width - margin * 2);
    }

    function pickExamineTarget(): HTMLElement | null {
      const el = document.getElementById("whoami-box");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.top < 90 || r.bottom > window.innerHeight - 60) return null;
      return el;
    }

    // something wide/tall enough that ducking behind its edge reads as hiding
    function pickHideTarget(): HTMLElement | null {
      const els = Array.from(document.querySelectorAll(CHAR_HIDE_SELECTOR)) as HTMLElement[];
      const vis = els.filter(el => {
        const r = el.getBoundingClientRect();
        return r.top > 90 && r.bottom < window.innerHeight - 40 && r.width > 110 && r.height > 54;
      });
      return vis.length ? vis[(Math.random() * vis.length) | 0] : null;
    }

    function startWalkAnywhere(t: number) {
      const [lo, hi] = floorLeftBounds();
      targetXRef.v = lo + Math.random() * (hi - lo);
      activityRef.v = "walk";
      untilRef.v = t + 2200 + Math.random() * 2400;
    }

    function decideNext(t: number) {
      setClipPct(0);
      const roll = Math.random();
      if (roll < 0.36) {
        activityRef.v = "look";
        lookVariantRef.v = false;
        untilRef.v = t + 2200 + Math.random() * 2400;
      } else if (roll < 0.46) {
        const el = pickExamineTarget();
        if (el) {
          const r = el.getBoundingClientRect();
          const side = leftRef.v < r.left + r.width / 2 ? -1 : 1;
          perchElRef.v = el;
          targetXRef.v = Math.min(window.innerWidth - 24, Math.max(24, r.left + (side === 1 ? r.width + 30 : -30)));
          activityRef.v = "walkToExamine";
          untilRef.v = t + 6000;
        } else { startWalkAnywhere(t); }
      } else if (roll < 0.58) {
        const el = pickHideTarget();
        if (el) {
          const r = el.getBoundingClientRect();
          // duck behind the near edge, so he doesn't cross the whole box first
          hideSideRef.v = leftRef.v < r.left + r.width / 2 ? -1 : 1;
          perchElRef.v = el;
          targetXRef.v = Math.min(window.innerWidth - 24, Math.max(24, hideSideRef.v === 1 ? r.right : r.left));
          activityRef.v = "hideMove";
          untilRef.v = t + 6000;
        } else { startWalkAnywhere(t); }
      } else if (roll < 0.84) {
        const el = pickPerchTarget();
        if (el) {
          perchElRef.v = el;
          const r = el.getBoundingClientRect();
          targetXRef.v = Math.min(window.innerWidth - 24, Math.max(24, perchLandingX(el, r)));
          activityRef.v = "perchMove";
          untilRef.v = t + 6000;
        } else { startWalkAnywhere(t); }
      } else {
        startWalkAnywhere(t);
      }
    }

    function stepPoseToward(desiredIdx: number, desiredMirror: boolean, t: number): boolean {
      if (poseRef.v === desiredIdx && mirrorRef.v === desiredMirror) return true;
      if (t - lastPoseStep < 95) return false;
      lastPoseStep = t;
      if (mirrorRef.v !== desiredMirror) {
        if (poseRef.v > 0) { poseRef.v -= 1; if (poseRef.v === 0) mirrorRef.v = desiredMirror; }
        else { mirrorRef.v = desiredMirror; }
      } else if (poseRef.v < desiredIdx) poseRef.v += 1;
      else if (poseRef.v > desiredIdx) poseRef.v -= 1;
      setSprite({ src: CHAR_STAND[poseRef.v], ratio: CHAR_STAND_RATIO[poseRef.v] });
      setMirror(mirrorRef.v);
      return poseRef.v === desiredIdx && mirrorRef.v === desiredMirror;
    }

    let fallStart = 0;
    let fallSettled = false;

    function fallTarget(): { tx: number; ty: number; onFloorNext: boolean } {
      const whoami = document.getElementById("whoami-box");
      const wr = whoami ? whoami.getBoundingClientRect() : null;
      if (wr && wr.width > 20 && wr.top > -200 && wr.top < window.innerHeight + 400) {
        return { tx: wr.left + wr.width / 2, ty: wr.top - sitSeatOffsetPx(), onFloorNext: false };
      }
      return { tx: window.innerWidth / 2, ty: floorTopPx(), onFloorNext: true };
    }

    function startFall() {
      phaseRef.v = "fallShout";
      fallStart = performance.now();
      fallSettled = false;
      setMirror(fallTarget().tx < leftRef.v);
      setSprite({ src: poseShout, ratio: CHAR_SHOUT_RATIO });
      setOnFloor(false);
      transitionTimer = window.setTimeout(() => {
        let tIdx = 0;
        setSprite({ src: CHAR_TUMBLE[0], ratio: CHAR_TUMBLE_RATIO[0] });
        setTumbling(true);
        tumbleTimer = window.setInterval(() => {
          tIdx = (tIdx + 1) % CHAR_TUMBLE.length;
          setSprite({ src: CHAR_TUMBLE[tIdx], ratio: CHAR_TUMBLE_RATIO[tIdx] });
        }, 150);
      }, 260);
    }

    function proceedToLand(onFloorNext: boolean) {
      clearInterval(tumbleTimer);
      phaseRef.v = "landBounce";
      setTumbling(false);
      setSprite({ src: poseDazed, ratio: CHAR_DAZED_RATIO });
      setShake(s => s + 1);
      setOnFloor(onFloorNext);
      clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        phaseRef.v = "landSit";
        setSprite({ src: poseSitFront, ratio: CHAR_SIT_RATIO });
        transitionTimer = window.setTimeout(() => {
          phaseRef.v = "roam";
          poseRef.v = 2; mirrorRef.v = false;
          setSprite({ src: CHAR_STAND[2], ratio: CHAR_STAND_RATIO[2] });
          setTop(null); setOnFloor(true);
          const [lo, hi] = floorLeftBounds();
          leftRef.v = Math.min(hi, Math.max(lo, leftRef.v));
          targetXRef.v = lo + Math.random() * (hi - lo);
          activityRef.v = "walk";
          untilRef.v = performance.now() + 3000 + Math.random() * 3000;
        }, 2800 + Math.random() * 1400);
      }, 420);
    }

    function onNext() { if (phaseRef.v === "introSit") startFall(); }
    window.addEventListener("char:next", onNext);

    function onTalk() {
      if (phaseRef.v !== "roam") return;
      const until = performance.now() + 2500;
      if (activityRef.v !== "walk" && activityRef.v !== "look" && activityRef.v !== "examine") return;
      if (activityRef.v !== "look") lookVariantRef.v = false;
      activityRef.v = "look";
      untilRef.v = Math.max(untilRef.v, until);
    }
    window.addEventListener("char:talk", onTalk);

    function tick(t: number) {
      raf = requestAnimationFrame(tick);

      if (phaseRef.v === "introSit") {
        const consoleBox = document.getElementById("console-box");
        if (consoleBox) {
          const r = consoleBox.getBoundingClientRect();
          leftRef.v = r.left + r.width * 0.8;
          topRef.v = r.top - sitSeatOffsetPx();
          setLeft(leftRef.v); setTop(topRef.v);
        }
        return;
      }
      if (phaseRef.v === "fallShout") {
        if (fallSettled) return;
        const { tx, ty, onFloorNext } = fallTarget();
        const elapsed = t - fallStart;
        leftRef.v += (tx - leftRef.v) * 0.16;
        topRef.v += (ty - topRef.v) * 0.16;
        setLeft(leftRef.v); setTop(topRef.v);
        const close = Math.abs(tx - leftRef.v) < 3 && Math.abs(ty - topRef.v) < 3;
        if ((close && elapsed > 500) || elapsed > 1500) {
          fallSettled = true;
          leftRef.v = tx; topRef.v = ty;
          setLeft(tx); setTop(ty);
          proceedToLand(onFloorNext);
        }
        return;
      }
      if (phaseRef.v !== "roam") return;
      const activity = activityRef.v;

      if (activity === "walk" || activity === "perchMove" || activity === "walkToExamine" || activity === "hideMove") {
        const dx = targetXRef.v - leftRef.v;
        if (Math.abs(dx) < 2) {
          if (activity === "perchMove") {
            const el = perchElRef.v;
            if (el) {
              // stand at the foot of the block and size it up before climbing
              topRef.v = floorTopPx();
              setTop(topRef.v); setOnFloor(false);
              const r = el.getBoundingClientRect();
              mirrorRef.v = leftRef.v < r.left + r.width / 2;
              setMirror(mirrorRef.v);
              setSprite({ src: posePeek, ratio: CHAR_PEEK_RATIO });
              activityRef.v = "perchLook";
              untilRef.v = t + 560 + Math.random() * 360;
            } else { decideNext(t); }
          } else if (activity === "hideMove") {
            const el = perchElRef.v;
            if (el) {
              topRef.v = floorTopPx();
              setTop(topRef.v); setOnFloor(false);
              mirrorRef.v = hideSideRef.v === 1;
              setMirror(mirrorRef.v);
              setSprite({ src: poseCrouch, ratio: CHAR_CROUCH_RATIO });
              climbStartRef.v = t;
              climbFromRef.v = topRef.v;
              activityRef.v = "hideDuck";
            } else { decideNext(t); }
          } else if (activity === "walkToExamine") {
            const el = perchElRef.v;
            if (el) {
              const r = el.getBoundingClientRect();
              const faceRight = leftRef.v < r.left + r.width / 2;
              stepPoseToward(2, faceRight, t);
              activityRef.v = "examine";
              untilRef.v = t + 2600 + Math.random() * 2200;
            } else { decideNext(t); }
          } else { decideNext(t); }
        } else {
          const dir = dx > 0 ? 1 : -1;
          const ready2 = stepPoseToward(2, dir === 1, t);
          if (ready2) {
            leftRef.v = Math.max(24, Math.min(window.innerWidth - 24, leftRef.v + dir * 110 * (1 / 60)));
            setLeft(leftRef.v);
          }
          // every directed walk has a deadline too, so an unreachable target
          // (element clipped to the screen edge) can never wedge him in place
          if (t > untilRef.v) { perchElRef.v = null; decideNext(t); }
        }
      } else if (activity === "perchLook") {
        const el = perchElRef.v;
        if (!el) { setOnFloor(true); decideNext(t); }
        else if (t > untilRef.v) {
          climbStartRef.v = t;
          climbFromRef.v = topRef.v;
          climbFrameRef.v = -1;
          activityRef.v = "perchClimb";
        }
      } else if (activity === "perchClimb") {
        const el = perchElRef.v;
        if (el) {
          const r = el.getBoundingClientRect();
          const targetTop = r.top - sitSeatOffsetPx();
          const p = Math.min(1, (t - climbStartRef.v) / CHAR_CLIMB_MS);
          // smoothstep: slow coil at the base, fast haul, soft crest
          const eased = p * p * (3 - 2 * p);
          topRef.v = climbFromRef.v + (targetTop - climbFromRef.v) * eased;
          setTop(topRef.v);
          // lean into the block while hauling, then settle back over the edge
          const sway = Math.sin(p * Math.PI) * CHAR_CLIMB_SWAY_PX * (mirrorRef.v ? 1 : -1);
          setLeft(leftRef.v + sway);
          let idx = 0;
          while (idx + 1 < CHAR_CLIMB_FRAMES.length && p >= CHAR_CLIMB_FRAMES[idx + 1].at) idx++;
          if (idx !== climbFrameRef.v) {
            climbFrameRef.v = idx;
            const f = CHAR_CLIMB_FRAMES[idx];
            setSprite({ src: f.src, ratio: f.ratio });
          }
          if (p >= 1) {
            topRef.v = targetTop; setTop(targetTop); setLeft(leftRef.v); setOnFloor(false);
            setSprite({ src: poseSitFront, ratio: CHAR_SIT_RATIO });
            // deliberately no charFall replay here: he climbed up under his own
            // power, so he must settle into the sit from the crest frame rather
            // than pop 160px into the air and drop back onto the block
            activityRef.v = "perchHold";
            untilRef.v = t + 3000 + Math.random() * 2600;
          }
        } else { setOnFloor(true); decideNext(t); }
      } else if (activity === "hideDuck" || activity === "hiding") {
        const el = perchElRef.v;
        const r = el ? el.getBoundingClientRect() : null;
        if (!el || !r || r.width < 10 || r.top < 40 || r.bottom > window.innerHeight - 10) {
          setClipPct(0); setTop(null); setOnFloor(true); perchElRef.v = null; setFallToken(v => v + 1); decideNext(t);
        } else {
          // hug the box's near edge: only the head/shoulder side stays visible
          leftRef.v = hideSideRef.v === 1 ? r.right : r.left;
          setLeft(leftRef.v);
          const targetTop = r.bottom - charBoxHeightPx();
          if (activity === "hideDuck") {
            const p = Math.min(1, (t - climbStartRef.v) / 420);
            topRef.v = climbFromRef.v + (targetTop - climbFromRef.v) * (p * p * (3 - 2 * p));
            setTop(topRef.v);
            if (p >= 1) {
              setSprite({ src: posePeek, ratio: CHAR_PEEK_RATIO });
              setClipPct(CHAR_HIDE_CLIP_PCT);
              activityRef.v = "hiding";
              untilRef.v = t + 2400 + Math.random() * 2200;
            }
          } else {
            topRef.v = targetTop;
            setTop(topRef.v);
            if (t > untilRef.v) {
              setClipPct(0); setTop(null); setOnFloor(true); perchElRef.v = null; setFallToken(v => v + 1); decideNext(t);
            }
          }
        }
      } else if (activity === "examine") {
        const el = perchElRef.v;
        if (el) {
          const r = el.getBoundingClientRect();
          const faceRight = leftRef.v < r.left + r.width / 2;
          stepPoseToward(2, faceRight, t);
        }
        if (t > untilRef.v) decideNext(t);
      } else if (activity === "look") {
        const turned = stepPoseToward(0, mirrorRef.v, t);
        if (turned && !lookVariantRef.v) {
          lookVariantRef.v = true;
          const variant = CHAR_IDLE_LOOK[(Math.random() * CHAR_IDLE_LOOK.length) | 0];
          setSprite(variant);
        }
        if (t > untilRef.v) decideNext(t);
      } else if (activity === "perchHold") {
        const el = perchElRef.v;
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top < 60 || r.top > window.innerHeight - 40 || r.width < 10) {
            setTop(null); setOnFloor(true); perchElRef.v = null; setFallToken(v => v + 1); decideNext(t);
          } else {
            topRef.v = r.top - sitSeatOffsetPx();
            setTop(topRef.v);
            if (t > untilRef.v) { setTop(null); setOnFloor(true); perchElRef.v = null; setFallToken(v => v + 1); decideNext(t); }
          }
        } else { decideNext(t); }
      }
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(transitionTimer); clearInterval(tumbleTimer); window.removeEventListener("char:next", onNext); window.removeEventListener("char:talk", onTalk); };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const els = CHAR_SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    let current = "";
    const ob = new IntersectionObserver((entries) => {
      let best: IntersectionObserverEntry | null = null;
      for (const en of entries) if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      if (best && best.target.id !== current) { if (current) setFallToken(v => v + 1); current = best.target.id; }
    }, { threshold: [0.3, 0.5, 0.7] });
    els.forEach(el => ob.observe(el));
    return () => ob.disconnect();
  }, [ready]);

  if (!ready) return null;
  const posStyle: React.CSSProperties = onFloor ? { bottom: 24 } : { top: top ?? 0 };
  return (
    <div style={{ position: "fixed", left, ...posStyle, transform: `translateX(-50%) scaleX(${mirror ? -1 : 1})`, zIndex: 60, pointerEvents: "none" }}>
      <div key={shake} style={{ animation: "charShake .42s ease-in-out" }}>
        <div key={fallToken} style={{ animation: "charFall .75s cubic-bezier(.34,1.4,.4,1) both" }}>
          <div style={{ animation: tumbling ? "none" : "charBob .6s ease-in-out infinite" }}>
            <div style={{ animation: tumbling ? "charFlail .3s ease-in-out infinite" : "none" }}>
              <div style={{ position: "relative", width: "clamp(80px,17vw,105px)", height: "clamp(64px,13.5vw,84px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                {bubble && (
                  <div key={bubble.key} style={{ position: "absolute", bottom: "100%", left: "50%", marginBottom: 8, transform: `translateX(-50%) scaleX(${mirror ? -1 : 1})`, zIndex: 61 }}>
                    <div style={{ position: "relative", background: "#050f05", border: "1px solid rgba(0,255,65,.55)", boxShadow: "0 0 14px rgba(0,255,65,.22)", color: "#00ff41", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".02em", padding: "7px 11px", whiteSpace: "nowrap", animation: "bubblePop .22s cubic-bezier(.34,1.4,.4,1) both, bubbleFade .3s ease-in 2.2s forwards" }}>
                      {bubble.text}
                      <span style={{ position: "absolute", bottom: -5, left: "50%", width: 9, height: 9, background: "#050f05", borderRight: "1px solid rgba(0,255,65,.55)", borderBottom: "1px solid rgba(0,255,65,.55)", transform: "translateX(-50%) rotate(45deg)" }} />
                    </div>
                  </div>
                )}
                <img
                  src={sprite.src}
                  onClick={handleTalk}
                  style={{ display: "block", maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", filter: "drop-shadow(0 6px 6px rgba(0,0,0,.5))", pointerEvents: "auto", cursor: "pointer", clipPath: clipPct ? `inset(0 ${clipPct}% 0 0)` : "none", transition: "clip-path .25s ease" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 2, height: "100vh", zIndex: 90, background: "rgba(0,255,65,.1)", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${pct}%`, background: "#00ff41", boxShadow: "0 0 8px rgba(0,255,65,.7)", transition: "height .1s linear" }} />
      <span style={{ position: "absolute", top: `${pct}%`, right: -3, transform: "translateY(-50%)", color: "#00ff41", fontSize: 9, textShadow: "0 0 6px rgba(0,255,65,.9)", transition: "top .1s linear" }}>◆</span>
    </div>
  );
}

const KEYFRAMES=`@keyframes slideBar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes marqAnim{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes neonPulse{0%,100%{text-shadow:0 0 10px rgba(0,255,65,.4),0 0 28px rgba(0,255,65,.18)}50%{text-shadow:0 0 20px rgba(0,255,65,.85),0 0 52px rgba(0,255,65,.4)}} @keyframes hudBlink{0%,93%,100%{opacity:1}94%,96%{opacity:0}95%,97%{opacity:1}98%,99%{opacity:.3}} @keyframes borderGlow{0%,100%{border-color:rgba(0,255,65,.2)}50%{border-color:rgba(0,255,65,.5)}} @keyframes rowGlowDone{0%,100%{background:rgba(0,255,65,.02)}50%{background:rgba(0,255,65,.07)}} @keyframes rowGlowActive{0%,100%{background:rgba(0,255,65,.04)}50%{background:rgba(0,255,65,.14)}} @keyframes rowGlowRunning{0%,100%{background:rgba(0,255,65,.03)}50%{background:rgba(0,255,65,.10)}} @keyframes rowGlowQueued{0%,100%{background:rgba(0,255,65,.015)}50%{background:rgba(0,255,65,.05)}} @keyframes charFall{0%{transform:translateY(-160px);opacity:0}55%{transform:translateY(14px);opacity:1}75%{transform:translateY(-8px)}100%{transform:translateY(0)}} @keyframes charBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @keyframes charShake{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-7deg)}40%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(3deg)}} @keyframes charFlail{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}} @keyframes bubblePop{0%{opacity:0;transform:scale(.7) translateY(4px)}100%{opacity:1;transform:scale(1) translateY(0)}} @keyframes bubbleFade{0%{opacity:1}100%{opacity:0}} @keyframes matrixHighlight{0%{text-shadow:0 0 2px rgba(0,255,65,.25)}30%{text-shadow:0 0 16px rgba(0,255,65,1),0 0 34px rgba(0,255,65,.65)}100%{text-shadow:0 0 6px rgba(0,255,65,.35)}} @keyframes rippleOut{0%{transform:translate(-50%,-50%) scale(.5);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1);opacity:0}} @keyframes termCursorBlink{0%,49%{opacity:1}50%,100%{opacity:0}} @media (hover:hover) and (pointer:fine){.link-nav:hover{color:#00ff41}.btn-next:hover{background:rgba(0,255,65,.12)}.card-service:hover{background:#0a1a0a}.pill-stack:hover{color:#00ff41;border-color:rgba(0,255,65,.6)}.row-ai:hover{padding-left:22px}.portfolio-shot:hover{filter:none}} @media (min-width:1024px){.hero-grid{grid-template-columns:3fr 2fr!important}} @media (max-width:900px){.stack-grid{grid-template-columns:1fr!important}.process-grid{grid-template-columns:1fr 1fr!important}} @media (max-width:640px){.nav-links{display:none!important}.nav-toggle{display:inline-flex!important}.contact-grid{grid-template-columns:1fr!important}.services-grid{grid-template-columns:1fr!important}.portfolio-grid{grid-template-columns:1fr!important}.process-grid{grid-template-columns:1fr!important}.price-grid{grid-template-columns:1fr!important}.stream-readout{display:none!important}.ai-table-head{display:none!important}.ai-table-row{grid-template-columns:28px 1fr!important}.ai-table-row>*:nth-child(3){grid-column:1/-1!important;margin-top:8px}.ai-table-row>*:nth-child(4){grid-column:1/-1!important;margin-top:4px}}`;
export default function App(){return <div style={{background:"#000",color:"#00ff41",minHeight:"100vh"}}><style>{KEYFRAMES}</style><ScrollProgress/><ClickRipple/><Nav/><main id="top"><LiveConsole/><Hero/><DecodeStreamDivider/><Mission/><AIConsierge/><Services/><Portfolio/><Stack/><Price/><Process/><Contact/><Footer/></main><WalkingCharacter/></div>;}
