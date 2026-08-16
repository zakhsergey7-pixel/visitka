import { useEffect, useRef, useState } from "react";
import iconNode from "../assets/icon-node.png";
import iconSpark from "../assets/icon-spark.png";
import iconWhale from "../assets/icon-whale.png";
import poseFront from "../assets/pose-front.png";
import poseFrontSide from "../assets/pose-frontside.png";
import poseSide from "../assets/pose-side.png";
import poseBackSide from "../assets/pose-backside.png";
import poseBack from "../assets/pose-back.png";

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
function Glitch({ children }: { children: string }) { const [glitching, setGlitching] = useState(false); const g = "01ｱｲｳｴｵ<>[]{}|\\"; useEffect(() => { const id = setInterval(() => { setGlitching(true); setTimeout(() => setGlitching(false), 110); }, 3400 + Math.random() * 5000); return () => clearInterval(id); }, []); if (!glitching) return <span>{children}</span>; return <span style={{ color: "#ff0040" }}>{children.split("").map(c => Math.random() > 0.55 ? g[(Math.random() * g.length) | 0] : c).join("")}</span>; }
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) { const ref = useRef<HTMLDivElement>(null); const [v, setV] = useState(false); useEffect(() => { const el = ref.current; if (!el) return; const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } }, { threshold: 0.08 }); ob.observe(el); return () => ob.disconnect(); }, []); return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", filter: v ? "blur(0px)" : "blur(7px)", transition: `opacity 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms, filter 1.15s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>{children}</div>; }
function SignalBars() { const [level, setLevel] = useState(4); useEffect(() => { const id = setInterval(() => setLevel(Math.random() > 0.15 ? 4 : 3), 2800 + Math.random() * 2000); return () => clearInterval(id); }, []); return <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, marginLeft: 10 }}>{[1,2,3,4].map(b => <span key={b} style={{ width: 3, height: b * 3 + 1, background: b <= level ? "#00ff41" : "#003b00", display: "block", transition: "background .5s", boxShadow: b <= level ? "0 0 4px #00ff41" : "none" }} />)}</span>; }
const NAV_LINKS: [string,string][] = [["#services","Услуги"],["#ai","Консьерж"],["#stack","Инструменты"],["#price","Стоимость"],["#contact","Связаться"]];
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
function Hero(){const[active,setActive]=useState(false);const headline=useDecrypt("Сайт — это инструмент,\nа не просто картинка.",active);const[cur,setCur]=useState(true);const[mouse,setMouse]=useState({x:0,y:0});const secRef=useRef<HTMLElement>(null);useEffect(()=>{const id=setInterval(()=>setCur(p=>!p),550);return()=>clearInterval(id)},[]);useEffect(()=>{const el=secRef.current;if(!el)return;const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setActive(true);ob.disconnect()}},{threshold:.3});ob.observe(el);return()=>ob.disconnect()},[]);const onMouseMove=(e:React.MouseEvent)=>{const r=secRef.current?.getBoundingClientRect();if(r)setMouse({x:Math.round(e.clientX-r.left),y:Math.round(e.clientY-r.top)})};return <section id="hero" ref={secRef} onMouseMove={onMouseMove} style={{position:"relative",minHeight:"100svh",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"clamp(120px,18vh,200px) clamp(20px,5vw,90px) 0",overflow:"hidden"}}><div style={{position:"absolute",inset:0,zIndex:0}}><MatrixRain opacity={.13} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.055)" speed={58}/></div><NoiseOverlay/>{DEAD_PIXELS.map((p,i)=><div key={i} style={{position:"absolute",width:2,height:2,background:"#00ff41",boxShadow:"0 0 3px #00ff41",zIndex:1,pointerEvents:"none",animation:`hudBlink ${3.5+i*1.4}s steps(1) infinite ${i*.8}s`,...p}}/>)}<div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)"}}/><div style={{position:"absolute",top:"clamp(80px,13vh,140px)",left:"clamp(20px,5vw,90px)",right:"clamp(20px,5vw,90px)",display:"flex",justifyContent:"space-between",fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(0,255,65,.28)",zIndex:2,pointerEvents:"none"}}><span>SYS.<span style={{color:"#00ff41",animation:"hudBlink 8s steps(1) infinite"}}>ONLINE</span> · UPTIME 05Y</span><span style={{textAlign:"right"}}>55.7522° N · 37.6156° E<br/>BUILD 2026.08</span></div><div className="hero-grid" style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr",gap:"clamp(28px,5vw,48px)",alignItems:"center"}}><h1 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(28px,5.4vw,86px)",lineHeight:1.06,letterSpacing:"-.02em",color:"#00ff41",animation:"neonPulse 4.5s ease-in-out infinite",maxWidth:"22ch",whiteSpace:"pre-line"}}>{headline}<span style={{opacity:cur?1:0}}>_</span></h1><div className="hero-whoami" style={{display:"none"}}><WhoAmICard/></div></div><div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,borderTop:"1px solid rgba(0,255,65,.16)",padding:"22px 0 26px",marginTop:"clamp(36px,8vh,80px)"}}><HeroStatusLine/><span style={{width:48,height:1,background:"#003b00",position:"relative",overflow:"hidden",display:"block",flexShrink:0}}><span style={{position:"absolute",inset:0,background:"#00ff41",animation:"slideBar 2s linear infinite"}}/></span></div></section>;}

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

function Mission(){const ref=useRef<HTMLDivElement>(null);const[active,setActive]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setActive(true);ob.disconnect()}},{threshold:.15});ob.observe(el);return()=>ob.disconnect()},[]);const stmt=useDecrypt("Я превращаю бизнес\nв цифровой актив.",active,30);const lines=[{t:"AI — инструмент,",pad:"0"},{t:"который оптимизирует бизнес.",pad:"clamp(28px,5vw,80px)"},{t:"Код пишу и проверяю",pad:"clamp(14px,2.5vw,40px)"},{t:"я сам.",pad:"clamp(42px,7vw,110px)"}];const[shown,setShown]=useState<boolean[]>([false,false,false,false]);useEffect(()=>{if(!active)return;lines.forEach((_,i)=>setTimeout(()=>setShown(p=>{const n=[...p];n[i]=true;return n}),600+i*220))},[active]);return <section style={{padding:"clamp(90px,14vh,160px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.06} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.04)" speed={90}/></div><div style={{position:"absolute",left:"clamp(4px,1.4vw,16px)",top:"50%",width:0,height:0,pointerEvents:"none"}}><div style={{position:"absolute",top:0,left:0,width:340,height:20,overflow:"hidden",transform:"rotate(-90deg)",transformOrigin:"top left"}}><div style={{display:"inline-flex",gap:28,animation:"marqAnim 22s linear infinite",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13,letterSpacing:".28em",textTransform:"uppercase",color:"rgba(0,255,65,.55)",textShadow:"0 0 12px rgba(0,255,65,.35)",whiteSpace:"nowrap"}}><span>МИССИЯ · MISSION · МИССИЯ · </span><span>МИССИЯ · MISSION · МИССИЯ · </span></div></div></div><div ref={ref} style={{position:"relative",zIndex:1,paddingLeft:"clamp(46px,7vw,96px)"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(32px,6vw,96px)",lineHeight:1,letterSpacing:"-.03em",color:"#00ff41",animation:active?"neonPulse 5s ease-in-out infinite":"none",whiteSpace:"pre-line",marginBottom:"clamp(40px,7vh,80px)"}}>{stmt}</div><div style={{display:"flex",flexDirection:"column",gap:"clamp(6px,1.2vh,14px)",marginBottom:"clamp(44px,8vh,90px)"}}>{lines.map((l,i)=><div key={i} style={{paddingLeft:l.pad,opacity:shown[i]?1:0,transform:shown[i]?"none":"translateX(-16px)",transition:"opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)"}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:i%2===0?700:300,fontSize:"clamp(18px,2.8vw,42px)",color:i%2===0?"#00ff41":"transparent",WebkitTextStroke:i%2===0?"0px":"1px rgba(0,255,65,.6)",letterSpacing:"-.01em",display:"inline-block",animation:i%2===0&&shown[i]?"neonPulse 4.5s ease-in-out infinite":"none"}}>{i===0?<><Glitch>AI</Glitch> — инструмент,</>:l.t}</span></div>)}</div></div></section>;}
function TerminalBox({title,children}:{title:string;children:React.ReactNode}){return <div style={{border:"1px solid rgba(0,255,65,.25)",background:"#050f05",fontFamily:"'JetBrains Mono',monospace"}}><div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:"1px solid rgba(0,255,65,.18)",background:"#0a1a0a"}}>{["#ff5f57","#ffbd2e","#28c840"].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:0,background:c,display:"block",imageRendering:"pixelated"}}/>)}<span style={{marginLeft:8,fontSize:11,color:"#008f11",letterSpacing:".14em"}}>{title}</span></div><div style={{padding:"20px 24px"}}>{children}</div></div>;}
const CONSOLE_INTRO={cmd:"AI about.txt",out:"Меня зовут Сергей Захаров. Пять лет делаю сайты для малого бизнеса — от визитки на один экран до многостраничного каталога. Дизайн, вёрстка, запуск и поддержка: со мной, а не с шестью подрядчиками."};const CONSOLE_LOOP=[{cmd:"AI services.list",out:"визитка · лендинг · каталог · редизайн"},{cmd:"./launch.sh --client=вы",out:"бриф принят. приступаю."}];
function LiveConsole(){const[phase,setPhase]=useState<"intro"|"loop">("intro");const[idx,setIdx]=useState(0);const[step,setStep]=useState(0);const[cur,setCur]=useState(true);useEffect(()=>{const id=setInterval(()=>setStep(s=>s+1),30);return()=>clearInterval(id)},[]);useEffect(()=>{const id=setInterval(()=>setCur(c=>!c),500);return()=>clearInterval(id)},[]);useEffect(()=>{const locked=phase==="intro";document.documentElement.style.overflow=locked?"hidden":"";document.body.style.overflow=locked?"hidden":"";return()=>{document.documentElement.style.overflow="";document.body.style.overflow=""}},[phase]);const entry=phase==="intro"?CONSOLE_INTRO:CONSOLE_LOOP[idx];const PAUSE=8,HOLD=46,cmdLen=entry.cmd.length,outStart=cmdLen+PAUSE,outLen=entry.out.length,total=outStart+outLen+HOLD,introDone=phase==="intro"&&step>outStart+outLen;useEffect(()=>{if(phase==="loop"&&step>=total){setStep(0);setIdx(i=>(i+1)%CONSOLE_LOOP.length)}},[phase,step,total]);const cmdText=entry.cmd.slice(0,Math.min(step,cmdLen)),typingCmd=step<=cmdLen,showOut=step>outStart,outText=showOut?entry.out.slice(0,Math.max(0,Math.min(step-outStart,outLen))):"",typingOut=showOut&&step<outStart+outLen;const handleNext=()=>{setPhase("loop");setIdx(0);setStep(0);setTimeout(()=>document.getElementById("hero")?.scrollIntoView({behavior:"smooth"}),30)};return <section style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(40px,6vh,64px) clamp(20px,5vw,90px)",background:"#000",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0}}><MatrixRain opacity={.1} fontSize={14} color="#00ff41" trail="rgba(0,0,0,.05)" speed={60}/></div><div style={{position:"relative",zIndex:1,width:"100%",maxWidth:640}}><TerminalBox title="~/console"><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,minHeight:44}}><div><span style={{color:"#00ff41"}}>$ </span><span style={{color:"#00ff41"}}>{cmdText}</span>{typingCmd&&<span style={{opacity:cur?1:0}}>_</span>}</div>{showOut&&<div style={{color:"#008f11",marginTop:8,lineHeight:1.6}}>{outText}{typingOut&&<span style={{opacity:cur?1:0}}>_</span>}</div>}{introDone&&<button onClick={handleNext} className="btn-next" style={{marginTop:18,background:"transparent",border:"1px solid rgba(0,255,65,.4)",color:"#00ff41",padding:"9px 18px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:".12em",textTransform:"uppercase",cursor:"pointer"}}>▶ Дальше</button>}</div></TerminalBox></div></section>;}
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
  const statusColor = (s: string) => s.startsWith("DONE") ? "#00ff41" : s === "ACTIVE" ? "#7dffaa" : s === "RUNNING" ? "#008f11" : "rgba(0,255,65,.35)";
  const rowGlow = (s: string) => s.startsWith("DONE") ? { anim: "rowGlowDone", dur: 11 } : s === "ACTIVE" ? { anim: "rowGlowActive", dur: 4.5 } : s === "RUNNING" ? { anim: "rowGlowRunning", dur: 6.5 } : { anim: "rowGlowQueued", dur: 8.5 };
  const scanSpeed = (s: string) => s === "ACTIVE" ? 90 : s === "RUNNING" ? 140 : s.startsWith("DONE") ? 340 : 260;
  return (
    <section id="ai" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <MatrixRain opacity={0.05} fontSize={13} color="#00ff41" trail="rgba(5,15,5,.06)" speed={85} />
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
                    <span style={{ ...mono, fontSize: 12, color: "#008f11" }}>{p.name}</span>
                    <div style={{ ...mono, fontSize: 11, color: "rgba(0,255,65,.3)", marginTop: 3 }}>{p.desc}</div>
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
    <section id="services" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", position: "relative" }}>
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
    <section id="stack" style={{ padding: "clamp(80px,12vh,140px) clamp(20px,5vw,90px)", background: "#050f05" }}>
      <Reveal>
        <div style={{ borderTop: "1px solid rgba(0,255,65,.18)", paddingTop: 20, marginBottom: 40 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#008f11" }}>02 / Инструменты</span>
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
    </section>
  );
}
function Price(){return <section id="price" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",background:"#050f05"}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>03 / Стоимость</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#00ff41",marginTop:18}}>Два формата. Цена фиксируется до старта.</h2></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginTop:50,background:"rgba(0,255,65,.12)"}}><div style={{background:"#050f05",padding:40,fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#008f11",fontSize:11}}>ПАКЕТ «БАЗА»</div><strong style={{display:"block",fontSize:52,color:"#00ff41",margin:"25px 0"}}>50 000 ₽</strong><p style={{color:"#008f11"}}>Сайт-визитка или лендинг.</p></div><div style={{background:"#003b00",padding:40,fontFamily:"'JetBrains Mono',monospace"}}><div style={{color:"#7dffaa",fontSize:11}}>ПАКЕТ «ПОЛНЫЙ»</div><strong style={{display:"block",fontSize:52,color:"#00ff41",margin:"25px 0"}}>100 000 ₽</strong><p style={{color:"#c8ffe0"}}>Многостраничный сайт или каталог.</p></div></div></Reveal></section>;}
function Process(){return <section style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)"}}><Reveal><div style={{borderTop:"1px solid rgba(0,255,65,.18)",paddingTop:20}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>04 / Процесс</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(22px,3.6vw,52px)",color:"#00ff41",marginTop:18}}>Четыре шага. Вы видите результат на каждом.</h2></div></Reveal></section>;}
function Contact(){const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();const d=new FormData(e.currentTarget);const body=`Имя: ${d.get("name")||""}\nКонтакт: ${d.get("contact")||""}\n\nЗадача:\n${d.get("task")||""}`;window.location.href=`mailto:zakhsergey7@gmail.com?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(body)}`};return <section id="contact" style={{padding:"clamp(80px,12vh,140px) clamp(20px,5vw,90px)",borderTop:"1px solid rgba(0,255,65,.18)"}}><div className="contact-grid" style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:60}}><div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11"}}>05 / Связаться</span><h2 style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"clamp(26px,5vw,70px)",color:"#00ff41",marginTop:20}}>Расскажите,<br/>что нужно<br/>сделать.</h2></div><TerminalBox title="~/contact/form.sh"><form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}><input name="name" placeholder="Ваше имя" required style={{background:"transparent",border:0,borderBottom:"1px solid rgba(0,255,65,.25)",padding:10,color:"#00ff41"}}/><input name="contact" placeholder="Telegram или телефон" required style={{background:"transparent",border:0,borderBottom:"1px solid rgba(0,255,65,.25)",padding:10,color:"#00ff41"}}/><textarea name="task" placeholder="Что нужно сделать" style={{background:"transparent",border:0,borderBottom:"1px solid rgba(0,255,65,.25)",padding:10,color:"#00ff41",minHeight:100}}/><button type="submit" style={{background:"#00ff41",color:"#000",padding:15,border:0,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>./send_request.sh →</button></form></TerminalBox></div></section>;}
function Footer(){return <footer style={{background:"#050f05",borderTop:"1px solid rgba(0,255,65,.18)",padding:"22px clamp(20px,5vw,90px)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#008f11",display:"flex",justifyContent:"space-between"}}><span>© 2026 Захаров Сергей</span><a href="#top" style={{color:"#00ff41",textDecoration:"none"}}>Наверх ↑</a></footer>;}
/* ─────────────────────────────────────────
   Walking character — appears once the
   visitor clicks past the console gate and
   "falls" onto the Hero section. Fixed to
   the viewport, so it rides along as you
   scroll, replaying the fall/land bounce
   whenever a new section becomes dominant.

   Behaviour is a small state machine, not a
   flat left-right pace:
   - "walk"  → picks a random spot and heads
     there, turning through the 5-pose
     turnaround (front → 3/4 → side → 3/4 →
     back, mirrored) like a mini 3D turntable
     instead of flipping instantly.
   - "look"  → stops and turns to face the
     viewer for a moment.
   - "perch" → climbs onto a nearby small
     block (a stack pill, a price/service
     card) and stands on its top edge a
     while before hopping back down.
   No sitting/leg-swing frame exists in the
   source art, so "sitting on a block" is
   approximated as standing on its edge.
───────────────────────────────────────── */
const CHAR_SECTION_IDS = ["hero", "ai", "services", "stack", "price", "process", "contact"];
const CHAR_POSES = [poseFront, poseFrontSide, poseSide, poseBackSide, poseBack];
const CHAR_POSE_RATIO = [211 / 500, 201 / 500, 119 / 500, 201 / 500, 215 / 500];
const CHAR_PERCH_SELECTOR = ".pill-stack, .card-service, .card-price-base, .card-price-full";
const CHAR_HEIGHT_PX = 88;

type CharActivity = "walk" | "look" | "perchMove" | "perchHold";

function WalkingCharacter() {
  const [visible, setVisible] = useState(false);
  const [fallToken, setFallToken] = useState(0);
  const [x, setX] = useState(50);
  const [poseIdx, setPoseIdx] = useState(2);
  const [mirror, setMirror] = useState(false);
  const [perchTop, setPerchTop] = useState<number | null>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold: 0.25 });
    ob.observe(hero);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const xRef = { v: 50 };
    const poseRef = { v: 2 };
    const mirrorRef = { v: false };
    const activityRef: { v: CharActivity } = { v: "walk" };
    const targetXRef = { v: 50 };
    const untilRef = { v: 0 };
    const perchElRef: { v: HTMLElement | null } = { v: null };
    let lastPoseStep = 0;
    let raf = 0;

    function pickPerchTarget(): HTMLElement | null {
      const els = Array.from(document.querySelectorAll(CHAR_PERCH_SELECTOR)) as HTMLElement[];
      const vis = els.filter(el => {
        const r = el.getBoundingClientRect();
        return r.top > 90 && r.bottom < window.innerHeight - 60 && r.width > 26 && r.width < 260 && r.height < 160;
      });
      return vis.length ? vis[(Math.random() * vis.length) | 0] : null;
    }

    function decideNext(t: number) {
      const roll = Math.random();
      if (roll < 0.22) {
        activityRef.v = "look";
        untilRef.v = t + 1700 + Math.random() * 1800;
      } else if (roll < 0.4) {
        const el = pickPerchTarget();
        if (el) {
          perchElRef.v = el;
          const r = el.getBoundingClientRect();
          targetXRef.v = Math.min(94, Math.max(6, ((r.left + r.width / 2) / window.innerWidth) * 100));
          activityRef.v = "perchMove";
        } else {
          targetXRef.v = 6 + Math.random() * 88;
          activityRef.v = "walk";
          untilRef.v = t + 4500 + Math.random() * 4500;
        }
      } else {
        targetXRef.v = 6 + Math.random() * 88;
        activityRef.v = "walk";
        untilRef.v = t + 4500 + Math.random() * 4500;
      }
    }
    untilRef.v = performance.now() + 2000 + Math.random() * 2000;
    targetXRef.v = 6 + Math.random() * 88;

    function stepPoseToward(desiredIdx: number, desiredMirror: boolean, t: number): boolean {
      if (poseRef.v === desiredIdx && mirrorRef.v === desiredMirror) return true;
      if (t - lastPoseStep < 95) return false;
      lastPoseStep = t;
      if (mirrorRef.v !== desiredMirror) {
        // wrong mirror: retreat toward front (0) first, flip there, then advance
        if (poseRef.v > 0) { poseRef.v -= 1; if (poseRef.v === 0) mirrorRef.v = desiredMirror; }
        else { mirrorRef.v = desiredMirror; }
      } else if (poseRef.v < desiredIdx) poseRef.v += 1;
      else if (poseRef.v > desiredIdx) poseRef.v -= 1;
      setPoseIdx(poseRef.v);
      setMirror(mirrorRef.v);
      return poseRef.v === desiredIdx && mirrorRef.v === desiredMirror;
    }

    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      const activity = activityRef.v;

      if (activity === "walk" || activity === "perchMove") {
        const dx = targetXRef.v - xRef.v;
        if (Math.abs(dx) < 1) {
          if (activity === "perchMove") {
            const el = perchElRef.v;
            if (el) {
              const r = el.getBoundingClientRect();
              setPerchTop(r.top);
              stepPoseToward(0, mirrorRef.v, t);
              activityRef.v = "perchHold";
              untilRef.v = t + 2600 + Math.random() * 2400;
            } else { decideNext(t); }
          } else { decideNext(t); }
        } else {
          const dir = dx > 0 ? 1 : -1;
          const ready = stepPoseToward(2, dir === 1, t);
          if (ready) {
            xRef.v = Math.max(4, Math.min(96, xRef.v + dir * 15 * (1 / 60)));
            setX(xRef.v);
          }
          if (activity === "walk" && t > untilRef.v) decideNext(t);
        }
      } else if (activity === "look") {
        stepPoseToward(0, mirrorRef.v, t);
        if (t > untilRef.v) decideNext(t);
      } else if (activity === "perchHold") {
        const el = perchElRef.v;
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top < 60 || r.top > window.innerHeight - 40 || r.width < 10) {
            setPerchTop(null); perchElRef.v = null; decideNext(t);
          } else {
            setPerchTop(r.top);
            if (t > untilRef.v) { setPerchTop(null); perchElRef.v = null; decideNext(t); }
          }
        } else { decideNext(t); }
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const els = CHAR_SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    let current = "";
    const ob = new IntersectionObserver((entries) => {
      let best: IntersectionObserverEntry | null = null;
      for (const en of entries) if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      if (best && best.target.id !== current) { current = best.target.id; setFallToken(t => t + 1); }
    }, { threshold: [0.3, 0.5, 0.7] });
    els.forEach(el => ob.observe(el));
    return () => ob.disconnect();
  }, [visible]);

  if (!visible) return null;
  const posStyle: React.CSSProperties = perchTop != null
    ? { top: Math.max(8, perchTop - CHAR_HEIGHT_PX + 14) }
    : { bottom: "clamp(8px,2.6vh,26px)" };
  return (
    <div style={{ position: "fixed", left: `${x}%`, ...posStyle, transform: `translateX(-50%) scaleX(${mirror ? -1 : 1})`, zIndex: 60, pointerEvents: "none", transition: "top .4s cubic-bezier(.34,1.2,.4,1)" }}>
      <div key={fallToken} style={{ animation: "charFall .75s cubic-bezier(.34,1.4,.4,1) both" }}>
        <div style={{ animation: "charBob .6s ease-in-out infinite" }}>
          <img src={CHAR_POSES[poseIdx]} style={{ display: "block", height: "clamp(66px,14vw,88px)", width: "auto", aspectRatio: `${CHAR_POSE_RATIO[poseIdx]}`, filter: "drop-shadow(0 6px 6px rgba(0,0,0,.5))" }} />
        </div>
      </div>
    </div>
  );
}

const KEYFRAMES=`@keyframes slideBar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes marqAnim{from{transform:translateX(0)}to{transform:translateX(-50%)}} @keyframes neonPulse{0%,100%{text-shadow:0 0 10px rgba(0,255,65,.4),0 0 28px rgba(0,255,65,.18)}50%{text-shadow:0 0 20px rgba(0,255,65,.85),0 0 52px rgba(0,255,65,.4)}} @keyframes hudBlink{0%,93%,100%{opacity:1}94%,96%{opacity:0}95%,97%{opacity:1}98%,99%{opacity:.3}} @keyframes borderGlow{0%,100%{border-color:rgba(0,255,65,.2)}50%{border-color:rgba(0,255,65,.5)}} @keyframes rowGlowDone{0%,100%{background:rgba(0,255,65,.02)}50%{background:rgba(0,255,65,.07)}} @keyframes rowGlowActive{0%,100%{background:rgba(0,255,65,.04)}50%{background:rgba(0,255,65,.14)}} @keyframes rowGlowRunning{0%,100%{background:rgba(0,255,65,.03)}50%{background:rgba(0,255,65,.10)}} @keyframes rowGlowQueued{0%,100%{background:rgba(0,255,65,.015)}50%{background:rgba(0,255,65,.05)}} @keyframes charFall{0%{transform:translateY(-160px);opacity:0}55%{transform:translateY(14px);opacity:1}75%{transform:translateY(-8px)}100%{transform:translateY(0)}} @keyframes charBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @media (hover:hover) and (pointer:fine){.link-nav:hover{color:#00ff41}.btn-next:hover{background:rgba(0,255,65,.12)}.card-service:hover{background:#0a1a0a}.pill-stack:hover{color:#00ff41;border-color:rgba(0,255,65,.6)}.row-ai:hover{padding-left:22px}} @media (min-width:1024px){.hero-grid{grid-template-columns:3fr 2fr!important}.hero-whoami{display:block!important}} @media (max-width:900px){.stack-grid{grid-template-columns:1fr!important}} @media (max-width:640px){.nav-links{display:none!important}.nav-toggle{display:inline-flex!important}.contact-grid{grid-template-columns:1fr!important}.services-grid{grid-template-columns:1fr!important}.stream-readout{display:none!important}.ai-table-head{display:none!important}.ai-table-row{grid-template-columns:28px 1fr!important}.ai-table-row>*:nth-child(3){grid-column:1/-1!important;margin-top:8px}.ai-table-row>*:nth-child(4){grid-column:1/-1!important;margin-top:4px}}`;
export default function App(){return <div style={{background:"#000",color:"#00ff41",minHeight:"100vh"}}><style>{KEYFRAMES}</style><Nav/><main id="top"><LiveConsole/><Hero/><DecodeStreamDivider/><Mission/><AIConsierge/><Services/><Stack/><Price/><Process/><Contact/><Footer/></main><WalkingCharacter/></div>;}
