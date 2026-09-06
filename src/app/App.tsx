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
const NAV_LINKS: [string,string][] = [["#services","Услуги"],["#ai","Консьерж"],["#tools","Инструменты"],["#price","Стоимость"],["#contact","Связаться"]];
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
function SectionRain({ opacity = 0.3, speed = 85, color = "#00ff41" }: { opacity?: number; speed?: number; color?: string }) {
  return <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}><MatrixRain opacity={opacity} fontSize={13} color={color} trail="rgba(0,0,0,.05)" speed={speed} /></div>;
}
function TerminalBox({title,children,accent}:{title:string;children:React.ReactNode;accent?:boolean}){return <div style={{border:accent?"1px solid rgba(0,255,65,.45)":"1px solid rgba(0,255,65,.25)",background:"#050f05",fontFamily:"'JetBrains Mono',monospace",animation:accent?"borderGlow 3.2s ease-in-out infinite":"none",boxShadow:accent?"0 0 26px rgba(0,255,65,.1)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:"1px solid rgba(0,255,65,.18)",background:"#0a1a0a"}}>{["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:0,background:c,display:"block",imageRendering:"pixelated"}}/>)}<span style={{marginLeft:8,fontSize:11,color:accent?"#00ff41":"#008f11",letterSpacing:".14em",textShadow:accent?"0 0 8px rgba(0,255,65,.55)":"none"}}>{title}</span>{accent&&<span style={{marginLeft:"auto",width:6,height:6,background:"#00ff41",boxShadow:"0 0 6px #00ff41",animation:"hudBlink 2.4s steps(1) infinite"}}/>}</div><div style={{padding:"20px 24px"}}>{children}</div></div>;}
const CONSOLE_INTRO={cmd:"AI about.txt",out:"Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками."};const CONSOLE_LOOP=[{cmd:"AI services.list",out:"визитка · лендинг · каталог · редизайн"},{cmd:"./launch.sh --client=вы",out:"бриф принят. приступаю."}];
function LiveConsole(){const[phase,setPhase]=useState<"intro"|"loop">("intro");const[idx,setIdx]=useState(0);const[step,setStep]=useState(0);const[cur,setCur]=useState(true);useEffect(()=>{const id=setInterval(()=>setStep(s=>s+1),30);return()=>clearInterval(id)},[]);useEffect(()=>{const id=setInterval(()=>setCur(c=>!c),500);return()=>clearInterval(id)},[]);useEffect(()=>{const locked=phase==="intro";document.documentElement.style.overflow=locked?"hidden":"";document.body.style.overflow=locked?"hidden":"";return()=>{document.documentElement.style.overflow="";document.body.style.overflow=""}},[phase]);const entry=phase==="intro"?CONSOLE_INTRO:CONSOLE_LOOP[idx];const PAUSE=8,HOLD=46,cmdLen=entry.cmd.length,outStart=cmdLen+PAUSE,outLen=entry.out.length,total=outStart+outLen+HOLD,introDone=phase==="intro"&&step>outStart+outLen;useEffect(()=>{if(phase==="loop"&&step>=total){setStep(0);setIdx(i=>(i+1)%CONSOLE_LOOP.length)}},[phase,step,total]);const cmdText=entry.cmd.slice(0,Math.min(step,cmdLen)),typingCmd=step<=cmdLen,showOut=step>outStart,outText=showOut?entry.out.slice(0,Math.max(0,Math.min(step-outStart,outLen))):"",typingOut=showOut&&step<outStart+outLen;const handleNext=()=>{setPhase("loop");setIdx(0);setStep(0);window.dispatchEvent(new CustomEvent("char:next"));setTimeout(()=>document.getElementById("hero")?.scrollIntoView({behavior:"smooth"}),30)};return <section style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(40px,6vh,64px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.3} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.05)" speed={60}/></div><div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)"}}/><div style={{position:"absolute",top:"clamp(80px,13vh,140px)",left:"clamp(20px,5vw,90px)",right:"clamp(20px,5vw,90px)",display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(0,255,65,.28)",zIndex:2,pointerEvents:"none"}}><span>SYS.<span style={{color:"#00ff41",animation:"hudBlink 6s steps(1) infinite"}}>BOOT</span> · ZAKHAROV.DEV</span><span>BUILD 2026.08</span></div><div id="console-box" style={{position:"relative",zIndex:1,width:"100%",maxWidth:"clamp(560px,62vw,720px)"}}><TerminalBox title="~/console"><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,minHeight:44}}><div><span style={{color:"#00ff41"}}>$ </span><span style={{color:"#00ff41"}}>{cmdText}</span>{typingCmd&&<span style={{opacity:cur?1:0}}>_</span>}</div>{showOut&&<div style={{color:"#008f11",marginTop:8,lineHeight:1.6}}>{outText}{typingOut&&<span style={{opacity:cur?1:0}}>_</span>}</div>}{introDone&&<button onClick={handleNext} className="btn-next" style={{marginTop:18,background:"transparent",border:"1px solid rgba(0,255,65,.4)",color:"#00ff41",padding:"9px 18px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:".12em",textTransform:"uppercase",cursor:"pointer"}}>▶ Дальше</button>}</div></TerminalBox></div></section>;}
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
    <section id="services" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", position: "relative", overflow: "hidden" }}>
      <SectionRain />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>01 / Что делаю</span>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(22px,3.6vw,52px)", color: "#f2f2f2", marginTop: 18 }}>Один человек отвечает за весь результат.</h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(0,255,65,.14)", border: "1px solid rgba(0,255,65,.14)" }}>
            {SERVICE_ITEMS.map((svc) => (
              <div key={svc.id} className="card-service" style={{ background: "#000", transition: "background .3s" }}>
                {svc.photo ? <Portfolio3DPhoto src={svc.photo} /> : <PortfolioShot lines={svc.code!} />}
                <div style={{ padding: "clamp(24px,4vw,44px)" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11", letterSpacing: ".14em" }}>{svc.id}</span>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "clamp(18px,2.2vw,26px)", color: "#f2f2f2", margin: "14px 0 10px" }}>{svc.name}</h3>
                  <p style={{ color: "#9a9a9a", fontSize: 14, lineHeight: 1.65, fontFamily: "'Space Grotesk',sans-serif" }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const TOOLS = [
  { id: "console", label: "~/console", dots: true, bg: "#000", border: "rgba(0,255,65,.25)", headerBg: "#0a1a0a", headerBorder: "rgba(0,255,65,.18)", labelColor: "#008f11", glow: "rgba(0,255,65,.4)",
    lines: [{ t: "$ git push origin main", c: "#00ff41" }, { t: "→ 3 files changed", c: "#008f11" }] },
  { id: "powershell", label: "Windows PowerShell", bg: "#012456", border: "rgba(255,255,255,.28)", headerBg: "rgba(255,255,255,.07)", headerBorder: "rgba(255,255,255,.16)", labelColor: "#eaf1ff", glow: "rgba(62,166,255,.4)",
    lines: [{ t: "PS C:\\projects> ./deploy.ps1", c: "#eaf1ff" }, { t: "Deploying to production...", c: "#7ec8e3" }] },
  { id: "opencode", label: "opencode", bg: "#12181a", border: "rgba(45,212,191,.3)", headerBg: "rgba(45,212,191,.06)", headerBorder: "rgba(45,212,191,.2)", labelColor: "#2dd4bf", glow: "rgba(45,212,191,.35)",
    lines: [{ t: "opencode> refactor auth module", c: "#2dd4bf" }, { t: "12 files updated · 0 errors", c: "#6b8b87" }] },
  { id: "claude", label: "claude code", bg: "#faf3ea", border: "rgba(61,57,41,.14)", headerBg: "rgba(61,57,41,.04)", headerBorder: "rgba(61,57,41,.1)", labelColor: "#3d3929", glow: "rgba(217,119,87,.35)",
    lines: [{ t: "добавь форму записи на сайт", c: "#3d3929", icon: true }, { t: "правки внесены, деплой готов", c: "#8a8272" }] },
];
function ToolCard({ tool, active }: { tool: typeof TOOLS[number]; active: boolean }) {
  return (
    <div className="tool-card" style={{ flexShrink: 0, width: 300, scrollSnapAlign: "center", transform: `scale(${active ? 1.12 : 0.9})`, opacity: active ? 1 : 0.55, transition: "transform .35s cubic-bezier(.16,1,.3,1), opacity .35s" }}>
      <div style={{ background: tool.bg, border: `1px solid ${tool.border}`, height: 220, boxSizing: "border-box", boxShadow: active ? `0 0 46px ${tool.glow}, 0 24px 40px rgba(0,0,0,.5)` : "none", transition: "box-shadow .35s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: tool.headerBg, borderBottom: `1px solid ${tool.headerBorder}` }}>
          {tool.dots && ["#ff5f57", "#ffbd2e", "#28c840"].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          <span style={{ marginLeft: tool.dots ? 6 : 0, fontSize: 11, color: tool.labelColor, fontFamily: "'JetBrains Mono',monospace" }}>{tool.label}</span>
        </div>
        <div style={{ padding: 18, fontSize: 13, lineHeight: 1.9, fontFamily: "'JetBrains Mono',monospace" }}>
          {tool.lines.map((l, i) => (
            <div key={i} style={{ color: l.c, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 7 }}>
              {l.icon && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" fill="#d97757" /></svg>}
              {l.t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Tools() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    function updateActive() {
      const cards = Array.from(el!.querySelectorAll<HTMLElement>(".tool-card"));
      const center = el!.getBoundingClientRect().left + el!.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - center);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      setActive(best);
    }
    function onScroll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateActive); }
    updateActive();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el!.scrollLeft <= 0;
      const atEnd = el!.scrollLeft >= el!.scrollWidth - el!.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); el.removeEventListener("wheel", onWheel); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section id="tools" style={{ padding: "clamp(80px,12vh,140px) 0", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <SectionRain opacity={.18} />
      <div style={{ position: "relative", zIndex: 1, padding: "0 clamp(20px,5vw,90px)" }}>
        <Reveal>
          <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>02 / Инструменты</span>
              <h2 style={{ fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: "clamp(22px,3.6vw,44px)", color: "#f2f2f2", marginTop: 18, maxWidth: 560 }}>Открыто на экране, пока я работаю.</h2>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,255,65,.4)", whiteSpace: "nowrap" }}>&larr; прокрутите &rarr;</span>
          </div>
        </Reveal>
      </div>
      <Reveal delay={80}>
        <div style={{ position: "relative", marginTop: 60 }}>
          <div ref={scrollerRef} className="tools-scroller" style={{ display: "flex", gap: 34, overflowX: "auto", overflowY: "hidden", scrollSnapType: "x proximity", padding: "30px calc(50vw - 150px) 10px" }}>
            {TOOLS.map((t, i) => <ToolCard key={t.id} tool={t} active={i === active} />)}
          </div>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 60, background: "linear-gradient(90deg,#050f05,transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 60, background: "linear-gradient(270deg,#050f05,transparent)", pointerEvents: "none" }} />
        </div>
      </Reveal>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 26 }}>
        {TOOLS.map((t, i) => <span key={t.id} style={{ width: 6, height: 6, borderRadius: "50%", background: i === active ? "#00ff41" : "rgba(0,255,65,.25)", boxShadow: i === active ? "0 0 6px #00ff41" : "none", transition: "background .3s" }} />)}
      </div>
    </section>
  );
}
const PRICE_CTA_STYLE:React.CSSProperties={display:"block",marginTop:20,padding:"10px 0",border:"1px solid rgba(0,255,65,.35)",color:"#00ff41",textAlign:"center",fontSize:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",textDecoration:"none",transition:"background .2s,border-color .2s"};
const PRICE_FEATURES:{base:string[];full:string[]}={
  base:["До 5 экранов на одной странице","Адаптивная вёрстка: телефон, планшет, десктоп","Форма заявки с уведомлением на почту","Базовое SEO: title, description, OG-теги","1 круг правок после сдачи"],
  full:["Каталог с фильтрами и страницами разделов","Админка — сами меняете тексты, цены и товары","До 10 страниц сайта","Расширенное SEO + подключение аналитики","2 круга правок после сдачи"],
};
function PriceFeatureList({items,color}:{items:string[];color:string}){return <ul style={{margin:"18px 0 0",padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:8,fontFamily:"'Space Grotesk',sans-serif"}}>{items.map((f)=><li key={f} style={{display:"flex",gap:8,fontSize:13,lineHeight:1.5,color}}><span style={{color:"#00ff41",flexShrink:0}}>›</span>{f}</li>)}</ul>;}
function Price(){return <section id="price" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><SectionRain/><div style={{position:"relative",zIndex:1}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>03 / Стоимость</span><h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#f2f2f2",marginTop:18}}>Два формата. Цена фиксируется до старта.</h2></div><div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginTop:50,background:"rgba(0,255,65,.12)"}}><div style={{background:"#050f05",padding:"clamp(22px,5vw,40px)",fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#008f11",fontSize:11}}>ПАКЕТ «БАЗА»</div><strong style={{display:"block",fontSize:"clamp(30px,7vw,52px)",color:"#00ff41",margin:"clamp(14px,3vw,25px) 0",whiteSpace:"nowrap"}}>50 000 ₽</strong><p style={{color:"#9a9a9a",fontFamily:"'Space Grotesk',sans-serif",fontSize:15}}>Сайт-визитка или лендинг.</p><PriceFeatureList items={PRICE_FEATURES.base} color="#9a9a9a"/><a href="#contact" className="btn-price-cta" style={PRICE_CTA_STYLE}>Обсудить →</a></div><div style={{background:"#003b00",padding:"clamp(22px,5vw,40px)",fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#7dffaa",fontSize:11}}>ПАКЕТ «ПОЛНЫЙ»</div><strong style={{display:"block",fontSize:"clamp(30px,7vw,52px)",color:"#00ff41",margin:"clamp(14px,3vw,25px) 0",whiteSpace:"nowrap"}}>100 000 ₽</strong><p style={{color:"#c8ffe0",fontFamily:"'Space Grotesk',sans-serif",fontSize:15}}>Многостраничный сайт или каталог.</p><PriceFeatureList items={PRICE_FEATURES.full} color="#c8ffe0"/><a href="#contact" className="btn-price-cta" style={{...PRICE_CTA_STYLE,borderColor:"rgba(0,255,65,.55)"}}>Обсудить →</a></div></div></Reveal></div></section>;}
const PROCESS_STEPS = [
  { n: "01", name: "Бриф", desc: "Обсуждаем бизнес, задачу и кто клиент — до старта понятно, что должен делать сайт." },
  { n: "02", name: "Прототип", desc: "Собираю структуру и черновой дизайн, показываю вам раньше, чем начинаю вёрстку." },
  { n: "03", name: "Разработка", desc: "Верстаю и программирую сам, без передачи задачи фрилансерам на аутсорс." },
  { n: "04", name: "Запуск", desc: "Тестирую на устройствах, публикую сайт и показываю, как редактировать самому." },
];
function Process(){return <section style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",position:"relative",overflow:"hidden"}}><SectionRain/><div style={{position:"relative",zIndex:1}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20,marginBottom:40}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>04 / Процесс</span><h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#f2f2f2",marginTop:18}}>Четыре шага. Вы видите результат на каждом.</h2></div></Reveal><Reveal delay={80}><div className="process-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"rgba(0,255,65,.14)",border:"1px solid rgba(0,255,65,.14)"}}>{PROCESS_STEPS.map((s)=><div key={s.n} className="card-service" style={{background:"#000",padding:"clamp(22px,3.4vw,32px)",transition:"background .3s"}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11",letterSpacing:".14em"}}>{s.n}</span><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:"clamp(16px,1.8vw,20px)",color:"#f2f2f2",margin:"12px 0 8px"}}>{s.name}</h3><p style={{color:"#9a9a9a",fontSize:14,lineHeight:1.6,fontFamily:"'Space Grotesk',sans-serif"}}>{s.desc}</p></div>)}</div></Reveal></div></section>;}
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
      {field && <div style={{ color: "rgba(0,255,65,.3)", fontSize: 11, marginTop: 2 }}>[Enter ↵] {field.multiline ? "чтобы отправить, Shift+Enter — новая строка" : "далее"}</div>}
      {!field && <div style={{ marginTop: 10, color: "#00ff41" }}>{sent ? "✓ Заявка собрана. Открываю почтовый клиент..." : ""}</div>}
    </div>
  );
}
function Contact(){return <section id="contact" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",background:"#050f05",borderTop:"1px solid rgba(0,255,65,.18)",position:"relative",overflow:"hidden"}}><SectionRain/><div className="contact-grid" style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:60}}><div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>05 / Связаться</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(26px,5vw,70px)",color:"#00ff41",marginTop:20}}>Расскажите,<br/>что нужно<br/>сделать.</h2></div><TerminalBox title="~/contact/form.sh" accent><TerminalContactForm/></TerminalBox></div></section>;}
const FOOTER_LINKS:[string,string][]=[["https://t.me/Must_D1e","Telegram"],["https://github.com/zakhsergey7-pixel","GitHub"],["mailto:zakhsergey7@gmail.com","Email"]];
function Footer(){return <footer style={{background:"#050f05",borderTop:"1px solid rgba(0,255,65,.18)",padding:"22px clamp(20px,5vw,90px)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#8a8a8a",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:14,position:"relative",overflow:"hidden"}}><SectionRain opacity={.26} speed={100}/><span style={{position:"relative",zIndex:1}}>© 2026 Захаров Сергей</span><div style={{position:"relative",zIndex:1,display:"flex",flexWrap:"wrap",gap:18}}>{FOOTER_LINKS.map(([href,label])=><a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined} className="link-footer" style={{color:"#00ff41",textDecoration:"none",transition:"opacity .2s"}}>{label}</a>)}</div><a href="#top" style={{position:"relative",zIndex:1,color:"#00ff41",textDecoration:"none"}}>Наверх ↑</a></footer>;}
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

const KEYFRAMES=`a:focus-visible,button:focus-visible{outline:2px solid rgba(0,255,65,.6);outline-offset:2px}.input-terminal:focus-visible{outline:none;box-shadow:0 0 0 1px rgba(0,255,65,.55);background:rgba(0,255,65,.06)}@keyframes slideBar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes marqAnim{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes neonPulse{0%,100%{text-shadow:0 0 10px rgba(0,255,65,.4),0 0 28px rgba(0,255,65,.18)}50%{text-shadow:0 0 20px rgba(0,255,65,.85),0 0 52px rgba(0,255,65,.4)}} @keyframes hudBlink{0%,93%,100%{opacity:1}94%,96%{opacity:0}95%,97%{opacity:1}98%,99%{opacity:.3}} @keyframes borderGlow{0%,100%{border-color:rgba(0,255,65,.2)}50%{border-color:rgba(0,255,65,.5)}} @keyframes rowGlowDone{0%,100%{background:rgba(0,255,65,.02)}50%{background:rgba(0,255,65,.07)}} @keyframes rowGlowActive{0%,100%{background:rgba(0,255,65,.04)}50%{background:rgba(0,255,65,.14)}} @keyframes rowGlowRunning{0%,100%{background:rgba(0,255,65,.03)}50%{background:rgba(0,255,65,.10)}} @keyframes rowGlowQueued{0%,100%{background:rgba(0,255,65,.015)}50%{background:rgba(0,255,65,.05)}} @keyframes matrixHighlight{0%{text-shadow:0 0 2px rgba(0,255,65,.25)}30%{text-shadow:0 0 16px rgba(0,255,65,1),0 0 34px rgba(0,255,65,.65)}100%{text-shadow:0 0 6px rgba(0,255,65,.35)}} @keyframes rippleOut{0%{transform:translate(-50%,-50%) scale(.5);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1);opacity:0}} @keyframes termCursorBlink{0%,49%{opacity:1}50%,100%{opacity:0}} .tools-scroller{scrollbar-width:none}.tools-scroller::-webkit-scrollbar{display:none}@media (hover:hover) and (pointer:fine){.link-nav:hover{color:#00ff41}.btn-next:hover{background:rgba(0,255,65,.12)}.card-service:hover{background:#0a1a0a}.row-ai:hover{padding-left:22px}.portfolio-shot:hover{background:#111}.btn-price-cta:hover{background:rgba(0,255,65,.12)}.link-footer:hover{opacity:.7}} @media (min-width:1024px){.hero-grid{grid-template-columns:3fr 2fr!important}} @media (max-width:900px){.process-grid{grid-template-columns:1fr 1fr!important}} @media (max-width:640px){.nav-links{display:none!important}.nav-toggle{display:inline-flex!important}.contact-grid{grid-template-columns:1fr!important}.services-grid{grid-template-columns:1fr!important}.process-grid{grid-template-columns:1fr!important}.price-grid{grid-template-columns:1fr!important}.stream-readout{display:none!important}.ai-table-head{display:none!important}.ai-table-row{grid-template-columns:28px 1fr!important}.ai-table-row>*:nth-child(3){grid-column:1/-1!important;margin-top:8px}.ai-table-row>*:nth-child(4){grid-column:1/-1!important;margin-top:4px}}`;
export default function App(){return <div style={{background:"#000",color:"#00ff41",minHeight:"100vh"}}><style>{KEYFRAMES}</style><ScrollProgress/><ClickRipple/><Nav/><main id="top"><LiveConsole/><Hero/><DecodeStreamDivider/><Mission/><AIConsierge/><Services/><Tools/><Price/><Process/><Contact/><Footer/></main></div>;}
