// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from "react";

// ━━━ TOKENS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const T = {
  // Surface
  bg:"#FFFFFF", s1:"#F8F8F8", s2:"#F1F1F1", s3:"#E8E8E8",
  // Lines
  l1:"#ECECEC", l2:"#D6D6D6", l3:"#B8B8B8",
  // Type
  ink:"#0A0A0A", t1:"#1A1A1A", t2:"#5A5A5A", t3:"#8A8A8A", t4:"#C0C0C0",
  // Status
  g:"#14532D",  gBg:"#F0FDF4", gBd:"#86EFAC",
  r:"#7F1D1D",  rBg:"#FEF2F2",
  a:"#78350F",  aBg:"#FFFBEB",
  b:"#1E3A8A",  bBg:"#EFF6FF",
  // Radius — GOAT: max 4px
  rad:4, radSm:2,
};
// spacing scale
const sp = n => n * 4;

// ━━━ HELPERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getMonday=(off=0)=>{const n=new Date(),d=n.getDay(),m=new Date(n);m.setDate(n.getDate()-(d===0?6:d-1)+off*7);m.setHours(0,0,0,0);return m;};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmt=d=>d.toISOString().slice(0,10);
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;

// ━━━ CONSTANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CATS=["Pantalons","T-shirts","Pulls","Vestes","Chaussures","Accessoires","Shorts","Chemises"];
const DAYS_S=["L","M","M","J","V","S","D"];
const DAYS_F=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const EV_TYPES=["École","Sport","Sortie","Travail","Détente","Soirée","RDV","Autre"];
const GR_COLS=["Noir","Gris","Blanc","Vert foncé","Beige","Denim","Marron","Crème","Anthracite"];
const COL_HEX={"Noir":"#101010","Blanc":"#EDE8DF","Gris":"#727272","Beige":"#C0A46E","Vert foncé":"#1C3620","Denim":"#284270","Marron":"#4A2410","Crème":"#D4CCAA","Anthracite":"#2C2C2C"};
const COL_LIGHT=new Set(["Blanc","Crème","Beige"]);
const EV_DOT={"École":"#1E3A8A","Sport":"#14532D","Sortie":"#4C1D95","Travail":"#1E3A8A","Détente":"#14532D","Soirée":"#831843","RDV":"#78350F","Autre":"#525252","Tenue libre":"#0A0A0A"};
// Condition labels for wardrobe items
const COND_LABEL=["","Mauvais","Mauvais","Passable","Passable","Moyen","Moyen","Bon","Bon","Excellent","Parfait"];
const COND_COLOR=[,"#7F1D1D","#7F1D1D","#78350F","#78350F","#78350F","#4A5568","#14532D","#14532D","#14532D","#14532D"];

// ━━━ SAMPLE DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SW=[
  {id:"w1",name:"Cargo Ripstop",brand:"Carhartt",color:"Noir",category:"Pantalons",scoreCut:9,scoreLike:9,scoreWorn:8,photo:""},
  {id:"w2",name:"Cargo Double Knee",brand:"Dickies",color:"Beige",category:"Pantalons",scoreCut:8,scoreLike:8,scoreWorn:7,photo:""},
  {id:"w3",name:"Chino slim",brand:"Uniqlo",color:"Gris",category:"Pantalons",scoreCut:7,scoreLike:6,scoreWorn:5,photo:""},
  {id:"w4",name:"Tee oversized",brand:"H&M",color:"Blanc",category:"T-shirts",scoreCut:8,scoreLike:8,scoreWorn:9,photo:""},
  {id:"w5",name:"Tee graphique",brand:"Carhartt",color:"Noir",category:"T-shirts",scoreCut:9,scoreLike:9,scoreWorn:8,photo:""},
  {id:"w6",name:"Tee vintage washed",brand:"Vintage",color:"Gris",category:"T-shirts",scoreCut:7,scoreLike:7,scoreWorn:6,photo:""},
  {id:"w7",name:"Pull maille épaisse",brand:"COS",color:"Beige",category:"Pulls",scoreCut:9,scoreLike:9,scoreWorn:7,photo:""},
  {id:"w8",name:"Pull col rond",brand:"Uniqlo",color:"Gris",category:"Pulls",scoreCut:7,scoreLike:7,scoreWorn:6,photo:""},
  {id:"w9",name:"Coach jacket",brand:"Nike",color:"Noir",category:"Vestes",scoreCut:8,scoreLike:8,scoreWorn:7,photo:""},
  {id:"w10",name:"Veste de travail",brand:"Carhartt",color:"Vert foncé",category:"Vestes",scoreCut:10,scoreLike:10,scoreWorn:8,photo:""},
  {id:"w11",name:"New Balance 550",brand:"New Balance",color:"Blanc",category:"Chaussures",scoreCut:9,scoreLike:9,scoreWorn:8,photo:""},
  {id:"w12",name:"Adidas Samba",brand:"Adidas",color:"Blanc",category:"Chaussures",scoreCut:9,scoreLike:8,scoreWorn:7,photo:""},
  {id:"w13",name:"Casquette 6 panel",brand:"Carhartt",color:"Noir",category:"Accessoires",scoreCut:8,scoreLike:8,scoreWorn:7,photo:""},
];
const SE=(()=>{const m=getMonday();return[
  {id:"e1",type:"École",date:fmt(m),dayOfWeek:0,repeat:true,outfit:"Cargo Ripstop noir + Tee blanc + NB 550",note:"",outfitRating:{style:8,practical:9}},
  {id:"e2",type:"Sport",date:fmt(addDays(m,1)),dayOfWeek:1,repeat:false,outfit:"Short noir + Tee gris + AF1",note:"Basket le soir",outfitRating:{style:6,practical:10}},
  {id:"e3",type:"Sortie",date:fmt(addDays(m,4)),dayOfWeek:4,repeat:false,outfit:"Cargo beige + Pull COS + Samba",note:"Ciné avec amis",outfitRating:{style:9,practical:7}},
  {id:"e4",type:"École",date:fmt(addDays(m,2)),dayOfWeek:2,repeat:true,outfit:"Chino gris + Tee graphique + NB 550",note:"",outfitRating:{}},
  {id:"e5",type:"Détente",date:fmt(addDays(m,5)),dayOfWeek:5,repeat:false,outfit:"",note:"Week-end relax",outfitRating:{}},
]})();
const SWL=[
  {id:"wl1",name:"Bomber satin",category:"Vestes",color:"Noir",brand:"Our Legacy",price:"180€",reason:"Layering hivernal",bought:false},
  {id:"wl2",name:"Knit col roulé",category:"Pulls",color:"Gris",brand:"COS",price:"80€",reason:"Basique manquant",bought:false},
  {id:"wl3",name:"Jordan 1 Low",category:"Chaussures",color:"Beige",brand:"Nike",price:"110€",reason:"Coloris parfait",bought:true},
];
const SOF=[
  {id:"o1",name:"Everyday Minimal",items:["Cargo Ripstop","Tee oversized","New Balance 550"],note:"Go-to du quotidien",rating:9},
  {id:"o2",name:"Clean Street",items:["Chino slim","Pull maille épaisse","Adidas Samba"],note:"Sortie décontractée",rating:8},
];

// ━━━ STORAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useStorage=(key,def)=>{
  const[val,setVal]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):def;}catch{return def;}});
  const set=useCallback(v=>{setVal(p=>{const n=typeof v==="function"?v(p):v;try{localStorage.setItem(key,JSON.stringify(n));}catch{}return n;});},[key]);
  return[val,set];
};

// ━━━ AI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// === CALL AI ===
const callAI = async (prompt, sys) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system: sys || "Expert style grisch streetwear minimal. Réponds en français, concis.",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.content
    ? Array.isArray(data.content)
      ? data.content.map(b => (typeof b === "string" ? b : b.text || "")).join("")
      : data.content
    : "";
  if (!text) throw new Error("Réponse vide");
  return text;
};

// === SAFE JSON ===
const safeJSON = (raw) => {
  let s = raw.replace(/[“”«»„‟]/g, '"').replace(/[‘’‚‛]/g, "'");
  s = s.replace(/```json|```/gi, "");
  try { return JSON.parse(s); } catch {}
  const firstJSON = s.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (firstJSON) {
    try { return JSON.parse(firstJSON[0]); } catch {}
    const repaired = firstJSON[0]
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
    try { return JSON.parse(repaired); } catch {}
  }
  throw new Error("Impossible de parser la réponse IA en JSON valide");
};

// ━━━ ICONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PX={
  cal:["M3 9h18M8 2v3m8-3v3M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"],
  hng:["M12 3a2 2 0 012 2v1.5l8 5.5c.4.3.4 1 0 1.3l-8 4.7-8-4.7c-.4-.3-.4-1 0-1.3l8-5.5V5a2 2 0 012-2z"],
  str:["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  pls:["M12 5v14M5 12h14"],
  edt:["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  del:["M3 6h18","M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"],
  cls:["M18 6L6 18M6 6l12 12"],
  chk:["M20 6L9 17l-5-5"],
  cR:["M9 18l6-6-6-6"],
  cL:["M15 18l-6-6 6-6"],
  spk:["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  lyr:["M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"],
  rat:["M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 13.9h7.6L12 2z"],
  arr:["M5 12h14M12 5l7 7-7 7"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 110 6 3 3 0 010-6z"],
  bar:["M18 20V10","M12 20V4","M6 20v-6"],
};
const Ico=({n,size=16,color="currentColor",sw=1.8})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(PX[n]||PX.pls).map((d,i)=><path key={i} d={d}/>)}
  </svg>
);

// ━━━ MICRO UI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Typography
const Label=({c,style:s})=><div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.t3,...s}}>{c}</div>;
const Title=({c,size=28,style:s})=><div style={{fontSize:size,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1,...s}}>{c}</div>;
// Hairline
const HR=({my=0})=><div style={{height:1,background:T.l1,margin:`${my}px 0`}}/>;
// Skeleton loader
const Skel=({w="100%",h=14,style:s})=><div style={{width:w,height:h,background:`linear-gradient(90deg,${T.s2} 0%,${T.s3} 50%,${T.s2} 100%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s ease-in-out infinite",...s}}/>;
// Dot indicator
const Dot=({color=T.ink,size=7})=><div style={{width:size,height:size,background:color,flexShrink:0}}/>;
// Score badge
const ScoreBadge=({val,small})=>{
  const c=val>=7?T.g:val>=5?T.a:T.r;
  const bg=val>=7?T.gBg:val>=5?T.aBg:T.rBg;
  return <span style={{fontSize:small?9:10,fontWeight:800,color:c,background:bg,border:`1px solid ${c}22`,padding:small?"2px 5px":"3px 7px",letterSpacing:"0.04em"}}>{val}/10</span>;
};
// Condition badge (for items)
const CondBadge=({val})=><span style={{fontSize:9,fontWeight:700,color:COND_COLOR[val]||T.t3,letterSpacing:"0.08em",textTransform:"uppercase"}}>{COND_LABEL[val]}</span>;
// Tag
const Tag=({c,color=T.ink,bg=T.s2})=><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color,background:bg,padding:"2px 7px"}}>{c}</span>;

// ━━━ INPUT COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FBase={width:"100%",background:T.s1,border:`1px solid ${T.l1}`,padding:"12px 14px",color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",WebkitAppearance:"none",appearance:"none",borderRadius:T.rad};
const Field=({label,value,onChange,opts,placeholder,multiline})=>(
  <div style={{marginBottom:16}}>
    {label&&<Label c={label} style={{marginBottom:6}}/>}
    {opts?<select value={value} onChange={e=>onChange(e.target.value)} style={FBase}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
    :multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...FBase,resize:"none",lineHeight:1.55}}/>
    :<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={FBase}/>}
  </div>
);
const ScoreSlider=({label,val,onChange})=>(
  <div style={{marginBottom:22}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
      <Label c={label}/>
      <div style={{display:"flex",alignItems:"baseline",gap:3}}>
        <span style={{fontSize:28,fontWeight:900,color:T.ink,letterSpacing:"-0.05em",lineHeight:1}}>{val}</span>
        <span style={{fontSize:11,color:T.t3,fontWeight:400}}>/10</span>
        <CondBadge val={val}/>
      </div>
    </div>
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:10},(_,i)=>(
        <button key={i} onClick={()=>onChange(i+1)} style={{flex:1,height:3,border:"none",cursor:"pointer",background:i<val?T.ink:T.s3,transition:"background .06s"}}/>
      ))}
    </div>
  </div>
);
// Buttons
const BtnP=({c,onClick,disabled,full,small,icon,style:s})=>(
  <button onClick={onClick} disabled={disabled} style={{background:T.ink,color:"#fff",border:"none",borderRadius:T.rad,padding:small?"8px 14px":"13px 18px",fontSize:small?11:13,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.35:1,fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...s}}>
    {icon&&<Ico n={icon} size={small?12:13} color="#fff" sw={2}/>}{c}
  </button>
);
const BtnO=({c,onClick,disabled,full,small,icon,style:s})=>(
  <button onClick={onClick} disabled={disabled} style={{background:T.bg,color:T.ink,border:`1px solid ${T.l2}`,borderRadius:T.rad,padding:small?"7px 13px":"12px 18px",fontSize:small?11:13,fontWeight:600,letterSpacing:"0.03em",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.35:1,fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...s}}>
    {icon&&<Ico n={icon} size={small?12:13} color={T.t2} sw={1.8}/>}{c}
  </button>
);
const BtnD=({c,onClick,full})=>(
  <button onClick={onClick} style={{background:T.bg,color:T.r,border:`1px solid ${T.r}18`,borderRadius:T.rad,padding:"12px 18px",fontSize:13,fontWeight:600,letterSpacing:"0.03em",cursor:"pointer",fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10}}>
    <Ico n="del" size={13} color={T.r}/>{c}
  </button>
);

// ━━━ BOTTOM SHEET ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Sheet=({open,onClose,title,children,full})=>{
  useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow="";};},[open]);
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.32)"}} onClick={onClose}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.bg,borderTop:`1px solid ${T.l1}`,maxHeight:full?"96dvh":"92dvh",display:"flex",flexDirection:"column",paddingBottom:"env(safe-area-inset-bottom,18px)",boxShadow:"0 -8px 40px rgba(0,0,0,0.08)"}}>
        {/* Handle */}
        <div style={{width:36,height:3,background:T.s3,margin:"12px auto 0"}}/>
        {/* Title bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px 13px",borderBottom:`1px solid ${T.l1}`}}>
          <span style={{fontSize:15,fontWeight:800,letterSpacing:"-0.03em",color:T.ink}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${T.l1}`,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:T.radSm}}>
            <Ico n="cls" size={12} color={T.t2}/>
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 18px 28px",WebkitOverflowScrolling:"touch"}}>{children}</div>
      </div>
    </div>
  );
};

// ━━━ SPIDER CHART ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Spider=({scores})=>{
  const cats=Object.keys(scores),n=cats.length;
  if(n<3)return null;
  const W=260,cx=130,cy=122,r=86;
  const pt=(i,ratio)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return[cx+r*ratio*Math.cos(a),cy+r*ratio*Math.sin(a)];};
  const sPts=cats.map((_,i)=>pt(i,Math.max(0.05,(scores[cats[i]]||0)/10)));
  const lPts=cats.map((_,i)=>pt(i,1.27));
  const gp=rv=>cats.map((_,i)=>pt(i,rv)).map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  const sp=sPts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  const sc=v=>v>=7?T.g:v>=5?T.a:T.r;
  return(
    <div>
      <svg width={W} height={244} style={{display:"block",margin:"0 auto"}}>
        {[.25,.5,.75,1].map(rv=><path key={rv} d={gp(rv)} fill="none" stroke={rv===1?T.l2:T.l1} strokeWidth={rv===1?1:0.7}/>)}
        {cats.map((_,i)=>{const p=pt(i,1);return<line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={T.l1} strokeWidth="0.7"/>;  })}
        {/* Value labels on grid */}
        {[2.5,5,7.5].map((v,i)=><text key={v} x={cx+3} y={cy-r*((i+1)*.25)+3} fill={T.t4} fontSize="7.5" fontFamily="inherit">{v}</text>)}
        <path d={sp} fill="rgba(0,0,0,0.04)" stroke={T.ink} strokeWidth="1.5"/>
        {sPts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={sc(scores[cats[i]]||0)} stroke={T.bg} strokeWidth="2.5"/>)}
        {cats.map((c,i)=>{const[lx,ly]=lPts[i];const anch=lx<cx-12?"end":lx>cx+12?"start":"middle";return<text key={i} x={lx} y={ly} textAnchor={anch} dominantBaseline="middle" fill={T.t2} fontSize="9.5" fontFamily="inherit" fontWeight="700">{c}</text>;})}
      </svg>
      {/* Legend table */}
      <div style={{borderTop:`1px solid ${T.l1}`,marginTop:12}}>
        {cats.map(c=>{
          const s=scores[c]||0;
          return(
            <div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.l1}`}}>
              <div style={{width:5,height:5,background:sc(s),flexShrink:0}}/>
              <span style={{fontSize:11,color:T.t2,flex:1,fontWeight:600}}>{c}</span>
              <CondBadge val={s}/>
              <span style={{fontSize:13,color:T.ink,fontWeight:900,minWidth:18,textAlign:"right"}}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ━━━ COLOR TILE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CT=({color,h=170,w="100%",children,style:s})=>{
  const hex=COL_HEX[color]||T.s2;
  const lt=COL_LIGHT.has(color);
  return(
    <div style={{background:hex,height:h,width:w,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",...s}}>
      {children||<span style={{fontSize:8,fontWeight:800,letterSpacing:"0.2em",textTransform:"uppercase",color:lt?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.2)"}}>{color}</span>}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLANNING TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Planning=({wardrobe})=>{
  const[events,setEvents]=useStorage("gq_ev",SE);
  const[wo,setWo]=useState(0);
  const[sel,setSel]=useState(()=>{const t=new Date().getDay();return t===0?6:t-1;});
  const[evSh,setEvSh]=useState(null);
  const[outSh,setOutSh]=useState(null);
  const[rateSh,setRateSh]=useState(null);
  const[evF,setEvF]=useState({});
  const[outF,setOutF]=useState({outfit:"",note:"",evId:null});
  const[aiL,setAiL]=useState(false);
  const[aiSug,setAiSug]=useState("");
  const[aiErr,setAiErr]=useState("");
  const[rec,setRec]=useState("");
  const[recL,setRecL]=useState(false);
  const[recK,setRecK]=useState(0);

  const wd=Array.from({length:7},(_,i)=>addDays(getMonday(wo),i));
  const getEv=di=>{const ds=fmt(wd[di]);return events.filter(e=>e.date===ds||(e.repeat&&e.dayOfWeek===di));};

  // AI daily recommendation
  useEffect(()=>{
    if(!wardrobe.length)return;
    let gone=false;
    setRec("");setRecL(true);
    callAI(`Garde-robe: ${wardrobe.slice(0,10).map(w=>`${w.name} (${w.color})`).join(", ")}. Aujourd'hui: ${DAYS_F[sel]}. Propose en 1 phrase directe une tenue grisch précise, sans titre ni ponctuation finale. Commence par le vêtement principal.`)
      .then(r=>{if(!gone)setRec(r.replace(/^["'`]|["'`\.]$/g,"").trim());})
      .catch(()=>{})
      .finally(()=>{if(!gone)setRecL(false);});
    return()=>{gone=true;};
  },[sel,recK,wardrobe.length]);

  const addEv=di=>{setEvF({type:"École",repeat:false,dayOfWeek:di,date:fmt(wd[di]),outfit:"",note:""});setEvSh({mode:"add",di});};
  const editEv=(ev,di)=>{setEvF({...ev});setEvSh({mode:"edit",di,id:ev.id});};
  const saveEv=()=>{if(evSh.mode==="add")setEvents(p=>[...p,{...evF,id:Date.now()+"",outfitRating:{}}]);else setEvents(p=>p.map(e=>e.id===evSh.id?{...evF,id:evSh.id}:e));setEvSh(null);};
  const delEv=id=>setEvents(p=>p.filter(e=>e.id!==id));
  const openOut=(ev,di,sa=false)=>{setAiSug("");setAiErr("");setOutF({outfit:ev.outfit||"",note:ev.note||"",evId:ev.id,sa,di,date:fmt(wd[di])});setOutSh({ev,di,sa});};
  const saveOut=()=>{
    if(outSh.sa)setEvents(p=>[...p,{id:Date.now()+"",type:"Tenue libre",date:outF.date,dayOfWeek:outF.di,repeat:false,outfit:outF.outfit,note:outF.note,outfitRating:{}}]);
    else setEvents(p=>p.map(e=>e.id===outF.evId?{...e,outfit:outF.outfit,note:outF.note}:e));
    setOutSh(null);
  };
  const suggest=async()=>{
    setAiL(true);setAiErr("");
    try{const items=wardrobe.map(w=>`${w.name}(${w.category},${w.color})`).join(",");const r=await callAI(`Événement: ${outSh.ev.type}, ${DAYS_F[outSh.di]}. Pièces: ${items||"vide"}. 1 ligne grisch, pas de markdown. Ex: Cargo noir + Tee blanc + NB 550`);setAiSug(r.replace(/^["'`]|["'`]$/g,"").trim());}
    catch(e){setAiErr(e.message);}
    setAiL(false);
  };
  const openRate=(ev,di)=>setRateSh({ev,di,r:{style:ev.outfitRating?.style||5,practical:ev.outfitRating?.practical||5}});
  const saveRate=()=>{setEvents(p=>p.map(e=>e.id===rateSh.ev.id?{...e,outfitRating:rateSh.r}:e));setRateSh(null);};

  const today=new Date().toDateString();
  const selEvs=getEv(sel);
  const month=wd[0].toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const totalOutfits=events.filter(e=>e.outfit).length;

  return(
    <div>
      {/* ── HEADER ── */}
      <div style={{paddingBottom:20,marginBottom:20,borderBottom:`1px solid ${T.l1}`}}>
        <Label c={new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})} style={{marginBottom:8}}/>
        <Title c="Bonjour Yanis" size={32}/>
        {/* Stats row */}
        <div style={{display:"flex",gap:20,marginTop:14}}>
          {[["Tenues cette semaine",`${selEvs.filter(e=>e.outfit).length}/${selEvs.length}`],["Total tenues notées",`${events.filter(e=>e.outfitRating?.style).length}`]].map(([label,val])=>(
            <div key={label}>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{val}</div>
              <Label c={label} style={{marginTop:3}}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI REC CARD ── */}
      <div style={{background:T.ink,padding:"16px 18px",marginBottom:24,position:"relative",overflow:"hidden"}}>
        {/* Subtle grid texture */}
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.02) 24px,rgba(255,255,255,0.02) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,0.02) 24px,rgba(255,255,255,0.02) 25px)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Ico n="spk" size={11} color="rgba(255,255,255,0.35)" sw={1.5}/>
              <Label c="Recommandation IA" style={{color:"rgba(255,255,255,0.35)"}}/>
            </div>
            <button onClick={()=>setRecK(k=>k+1)} disabled={recL} style={{background:"none",border:"1px solid rgba(255,255,255,0.12)",padding:"4px 10px",fontSize:9,color:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em",opacity:recL?0.5:1}}>
              ACTUALISER
            </button>
          </div>
          {recL?(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Skel h={14} style={{background:"rgba(255,255,255,0.06)"}}/>
              <Skel h={14} w="72%" style={{background:"rgba(255,255,255,0.06)"}}/>
            </div>
          ):(
            <p style={{fontSize:14,color:"rgba(255,255,255,0.88)",lineHeight:1.7,margin:0,fontWeight:400}}>{rec||"Ajoute des vêtements pour recevoir une recommandation personnalisée."}</p>
          )}
        </div>
      </div>

      {/* ── WEEK NAV ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>setWo(w=>w-1)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 2px"}}><Ico n="cL" size={17} color={T.t2} sw={2.2}/></button>
        <div style={{textAlign:"center"}}>
          <span style={{fontSize:12,fontWeight:800,letterSpacing:"0.02em",textTransform:"capitalize",color:T.ink}}>{month}</span>
          {wo===0&&<span style={{fontSize:10,color:T.t3,marginLeft:8,fontWeight:600}}>Cette semaine</span>}
        </div>
        <button onClick={()=>setWo(w=>w+1)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 2px"}}><Ico n="cR" size={17} color={T.t2} sw={2.2}/></button>
      </div>

      {/* ── 7-DAY STRIP ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:20}}>
        {DAYS_S.map((d,i)=>{
          const dt=wd[i],isToday=dt.toDateString()===today,isSel=sel===i;
          const evs=getEv(i),hasOut=evs.some(e=>e.outfit),hasRate=evs.some(e=>e.outfitRating?.style);
          return(
            <button key={i} onClick={()=>setSel(i)} style={{background:isSel?T.ink:isToday?T.s2:T.bg,border:`1px solid ${isSel?T.ink:isToday?T.l2:T.l1}`,padding:"9px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"background .08s"}}>
              <span style={{fontSize:7,color:isSel?"rgba(255,255,255,0.45)":T.t4,fontWeight:800,letterSpacing:"0.12em"}}>{d}</span>
              <span style={{fontSize:18,color:isSel?"#fff":T.ink,fontWeight:900,letterSpacing:"-0.04em",lineHeight:1}}>{dt.getDate()}</span>
              {/* Indicator dots */}
              <div style={{display:"flex",gap:2.5,height:4,alignItems:"center"}}>
                {evs.length>0&&<div style={{width:3,height:3,background:isSel?"rgba(255,255,255,0.45)":T.t3}}/>}
                {hasOut&&<div style={{width:3,height:3,background:isSel?"rgba(255,255,255,0.7)":T.ink}}/>}
                {hasRate&&<div style={{width:3,height:3,background:isSel?"rgba(255,191,36,0.8)":"#D97706"}}/>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── DAY PANEL ── */}
      <div style={{border:`1px solid ${T.l1}`}}>
        {/* Panel header */}
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.l1}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:T.s1}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,letterSpacing:"-0.03em",color:T.ink,lineHeight:1}}>{DAYS_F[sel]}</div>
            <div style={{fontSize:10,color:T.t3,marginTop:2,fontWeight:600}}>{wd[sel].toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}{selEvs.length>0&&` · ${selEvs.length} événement${selEvs.length>1?"s":""}`}</div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <BtnO c="Événement" icon="pls" small onClick={()=>addEv(sel)}/>
            <BtnP c="Tenue" icon="lyr" small onClick={()=>openOut({id:null,type:"Tenue libre",outfit:"",note:""},sel,true)}/>
          </div>
        </div>

        {selEvs.length===0?(
          <div style={{padding:"40px 16px",textAlign:"center",background:T.s1}}>
            <Ico n="cal" size={20} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:8,letterSpacing:"-0.01em"}}>Aucun événement</div>
            <div style={{fontSize:10,color:T.t4,marginTop:3}}>Appuie sur Événement pour planifier ta journée</div>
          </div>
        ):selEvs.map((ev,idx)=>{
          const dot=EV_DOT[ev.type]||T.t2;
          const isLast=idx===selEvs.length-1;
          return(
            <div key={ev.id} style={{borderBottom:isLast?"none":`1px solid ${T.l1}`}}>
              {/* Event row */}
              <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:3,height:"100%",minHeight:36,background:dot,flexShrink:0,marginTop:2}}/>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:T.ink,letterSpacing:"-0.02em"}}>{ev.type}</span>
                      {ev.repeat&&<Tag c="HEBDO" color={T.t3} bg={T.s2}/>}
                    </div>
                    {ev.note&&<div style={{fontSize:11,color:T.t3,marginTop:2,fontStyle:"italic"}}>{ev.note}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>openRate(ev,sel)} style={{background:ev.outfitRating?.style?T.aBg:T.s1,border:`1px solid ${ev.outfitRating?.style?"#FCD34D":T.l1}`,width:29,height:29,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="rat" size={11} color={ev.outfitRating?.style?T.a:T.t4} sw={1.4}/>
                  </button>
                  <button onClick={()=>editEv(ev,sel)} style={{background:T.s1,border:`1px solid ${T.l1}`,width:29,height:29,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="edt" size={11} color={T.t3}/>
                  </button>
                  <button onClick={()=>delEv(ev.id)} style={{background:T.rBg,border:`1px solid ${T.r}18`,width:29,height:29,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="del" size={11} color={T.r}/>
                  </button>
                </div>
              </div>
              {/* Outfit row */}
              <div style={{margin:"0 16px 12px 29px",background:T.s1,border:`1px solid ${T.l1}`,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:ev.outfit?8:0}}>
                  <Label c="Tenue"/>
                  <button onClick={()=>openOut(ev,sel)} style={{background:ev.outfit?T.ink:T.bg,border:`1px solid ${ev.outfit?T.ink:T.l2}`,padding:"3px 9px",fontSize:10,fontWeight:800,letterSpacing:"0.08em",color:ev.outfit?"#fff":T.t2,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>
                    {ev.outfit?"Modifier":"Ajouter"}
                  </button>
                </div>
                {ev.outfit?(
                  <p style={{fontSize:13,color:T.ink,lineHeight:1.6,margin:0,fontWeight:500}}>{ev.outfit}</p>
                ):(
                  <p style={{fontSize:12,color:T.t4,margin:"6px 0 0",fontStyle:"italic"}}>Aucune tenue définie</p>
                )}
                {ev.outfitRating?.style>0&&(
                  <div style={{display:"flex",gap:12,marginTop:9,paddingTop:9,borderTop:`1px solid ${T.l1}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Dot color="#D97706" size={5}/>
                      <span style={{fontSize:10,color:T.a,fontWeight:800,letterSpacing:"0.02em"}}>STYLE {ev.outfitRating.style}/10</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Dot color={T.g} size={5}/>
                      <span style={{fontSize:10,color:T.g,fontWeight:800,letterSpacing:"0.02em"}}>PRATIQUE {ev.outfitRating.practical}/10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHEETS */}
      <Sheet open={!!evSh} onClose={()=>setEvSh(null)} title={evSh?.mode==="add"?"Nouvel événement":"Modifier l'événement"}>
        <Field label="Type" value={evF.type||""} onChange={v=>setEvF(f=>({...f,type:v}))} opts={EV_TYPES}/>
        <Field label="Tenue prévue" value={evF.outfit||""} onChange={v=>setEvF(f=>({...f,outfit:v}))} placeholder="Cargo noir + Tee blanc + NB 550…" multiline/>
        <Field label="Note" value={evF.note||""} onChange={v=>setEvF(f=>({...f,note:v}))} placeholder="Remarques…"/>
        <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"11px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <input type="checkbox" id="rep" checked={evF.repeat||false} onChange={e=>setEvF(f=>({...f,repeat:e.target.checked}))} style={{width:15,height:15,cursor:"pointer",accentColor:T.ink}}/>
          <label htmlFor="rep" style={{fontSize:13,color:T.t1,cursor:"pointer",userSelect:"none",fontWeight:600}}>Répéter chaque semaine</label>
        </div>
        <BtnP full c="Sauvegarder" onClick={saveEv}/>
        {evSh?.mode==="edit"&&<BtnD full c="Supprimer l'événement" onClick={()=>{setEvents(p=>p.filter(e=>e.id!==evSh.id));setEvSh(null);}}/>}
      </Sheet>

      <Sheet open={!!outSh} onClose={()=>setOutSh(null)} title="Tenue du jour">
        {outSh&&<>
          <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"10px 13px",marginBottom:14,display:"flex",gap:9,alignItems:"center"}}>
            <div style={{width:3,height:28,background:EV_DOT[outSh.ev.type]||T.t2,flexShrink:0}}/>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:T.ink}}>{outSh.ev.type}</div>
              <div style={{fontSize:10,color:T.t3,marginTop:1}}>{DAYS_F[outSh.di]}</div>
            </div>
          </div>
          <button onClick={suggest} disabled={aiL} style={{width:"100%",background:T.s1,border:`1px solid ${T.l2}`,padding:"12px",fontSize:12,color:T.ink,cursor:aiL?"not-allowed":"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:aiL?0.55:1}}>
            <Ico n="spk" size={13} color={T.ink}/>{aiL?"GÉNÉRATION EN COURS…":"SUGGESTION IA"}
          </button>
          {aiSug&&(
            <div style={{background:T.ink,padding:"13px 14px",marginBottom:12}}>
              <Label c="Suggestion" style={{color:"rgba(255,255,255,0.35)",marginBottom:8}}/>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.88)",lineHeight:1.65,margin:"0 0 10px"}}>{aiSug}</p>
              <button onClick={()=>setOutF(f=>({...f,outfit:aiSug}))} style={{background:"rgba(255,255,255,0.08)",border:"none",padding:"6px 12px",fontSize:10,color:"rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                UTILISER
              </button>
            </div>
          )}
          {aiErr&&<div style={{background:T.rBg,border:`1px solid ${T.r}18`,padding:"9px 12px",marginBottom:12,fontSize:11,color:T.r,fontWeight:700}}>Erreur : {aiErr}</div>}
          <Field label="Tenue" value={outF.outfit} onChange={v=>setOutF(f=>({...f,outfit:v}))} placeholder="Cargo noir + Tee blanc + NB 550" multiline/>
          <Field label="Note" value={outF.note} onChange={v=>setOutF(f=>({...f,note:v}))} placeholder="Remarques…"/>
          <BtnP full c="Sauvegarder" onClick={saveOut}/>
        </>}
      </Sheet>

      <Sheet open={!!rateSh} onClose={()=>setRateSh(null)} title="Évaluer la tenue">
        {rateSh&&<>
          <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"11px 13px",marginBottom:20}}>
            <Label c={`${rateSh.ev.type} · ${DAYS_F[rateSh.di]}`} style={{marginBottom:6}}/>
            <div style={{fontSize:13,color:T.ink,lineHeight:1.55,fontWeight:500}}>{rateSh.ev.outfit||"Aucune tenue enregistrée"}</div>
          </div>
          <ScoreSlider label="Style & appréciation" val={rateSh.r.style} onChange={v=>setRateSh(rs=>({...rs,r:{...rs.r,style:v}}))}/>
          <ScoreSlider label="Praticité & confort" val={rateSh.r.practical} onChange={v=>setRateSh(rs=>({...rs,r:{...rs.r,practical:v}}))}/>
          <BtnP full c="Valider" onClick={saveRate}/>
        </>}
      </Sheet>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WARDROBE TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Wardrobe=({wardrobe,setWardrobe})=>{
  const[iSh,setISh]=useState(null);
  const[form,setForm]=useState({});
  const[analysis,setAnalysis]=useStorage("gq_an",null);
  const[aL,setAL]=useState(false);
  const[aSh,setASh]=useState(false);
  const[aErr,setAErr]=useState("");
  const[outfits,setOutfits]=useStorage("gq_of",SOF);
  const[oSh,setOSh]=useState(null);
  const[oF,setOF]=useState({name:"",items:[],note:"",rating:5});
  const[sec,setSec]=useState("pieces");
  const[expandedCat,setExpandedCat]=useState(null);
  const fRef=useRef();

  const openAdd=()=>{setForm({name:"",brand:"",color:GR_COLS[0],category:CATS[0],scoreCut:7,scoreLike:7,scoreWorn:5,photo:""});setISh("add");};
  const openEdit=item=>{setForm({...item});setISh(item.id);};
  const save=()=>{if(iSh==="add")setWardrobe(p=>[...p,{...form,id:Date.now()+""}]);else setWardrobe(p=>p.map(w=>w.id===iSh?{...form,id:iSh}:w));setISh(null);};
  const remove=id=>{setWardrobe(p=>p.filter(w=>w.id!==id));setISh(null);};
  const onPhoto=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setForm(f=>({...f,photo:r.result}));r.readAsDataURL(f);};

  const openAddO=()=>{setOF({name:"",items:[],note:"",rating:5});setOSh("add");};
  const openEditO=o=>{setOF({...o});setOSh(o.id);};
  const saveO=()=>{if(oSh==="add")setOutfits(p=>[...p,{...oF,id:Date.now()+""}]);else setOutfits(p=>p.map(o=>o.id===oSh?{...oF,id:oSh}:o));setOSh(null);};
  const removeO=id=>{setOutfits(p=>p.filter(o=>o.id!==id));setOSh(null);};
  const toggleI=name=>setOF(f=>({...f,items:f.items.includes(name)?f.items.filter(x=>x!==name):[...f.items,name]}));

  const analyze=async()=>{
    setAL(true);setAErr("");
    const sum=CATS.map(cat=>{const its=wardrobe.filter(w=>w.category===cat);return `${cat}(${its.length}): ${its.map(i=>`${i.color} cut:${i.scoreCut}`).join(",")||"vide"}`;}).join(" | ");
    try{const res=await callAI(`Garde-robe grisch:\n${sum}\n\nRéponds UNIQUEMENT avec ce JSON:\n{"scores":{"Pantalons":7,"T-shirts":8,"Pulls":6,"Vestes":9,"Chaussures":7,"Accessoires":4,"Shorts":2,"Chemises":3},"feedback":"2 phrases.","details":{"Pantalons":"explication","T-shirts":"explication","Pulls":"explication","Vestes":"explication","Chaussures":"explication","Accessoires":"explication","Shorts":"explication","Chemises":"explication"}}`, "Expert grisch. UNIQUEMENT JSON valide.");setAnalysis(pJSON(res));setASh(true);}
    catch(e){setAErr(e.message);setAnalysis({scores:{"Pantalons":7,"T-shirts":8,"Pulls":5,"Vestes":9,"Chaussures":7,"Accessoires":4,"Shorts":2,"Chemises":3},feedback:"",details:{}});setASh(true);}
    setAL(false);
  };

  const byCat=CATS.map(cat=>({cat,items:wardrobe.filter(w=>w.category===cat),score:analysis?.scores?.[cat]})).filter(g=>g.items.length>0);
  const avgScore=wardrobe.length?Math.round(wardrobe.reduce((a,w)=>(a+w.scoreLike+w.scoreCut)/2,0)/wardrobe.length*10)/10:0;

  return(
    <div>
      {/* HEADER */}
      <div style={{paddingBottom:18,marginBottom:18,borderBottom:`1px solid ${T.l1}`}}>
        <Title c="Garde-robe" size={28}/>
        {/* Stats */}
        <div style={{display:"flex",gap:0,marginTop:16,borderTop:`1px solid ${T.l1}`}}>
          {[[wardrobe.length,"Pièces"],[outfits.length,"Tenues"],[avgScore||"—","Moy. appréc."]].map(([val,label],i)=>(
            <div key={label} style={{flex:1,padding:"12px 0",borderRight:i<2?`1px solid ${T.l1}`:"none",paddingLeft:i>0?16:0}}>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{val}</div>
              <Label c={label} style={{marginTop:4}}/>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",borderBottom:`2px solid ${T.l1}`,gap:0}}>
          {[["pieces","PIÈCES"],["outfits","TENUES"]].map(([k,l])=>(
            <button key={k} onClick={()=>setSec(k)} style={{background:"none",border:"none",borderBottom:`2px solid ${sec===k?T.ink:"transparent"}`,marginBottom:-2,padding:"8px 0",paddingRight:16,color:sec===k?T.ink:T.t3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em",transition:"color .1s"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <BtnO c={aL?"…":"Analyse IA"} icon="bar" small onClick={analyze} disabled={aL}/>
          <BtnP c="Ajouter" icon="pls" small onClick={openAdd}/>
        </div>
      </div>

      {/* PIECES */}
      {sec==="pieces"&&(
        byCat.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",border:`1px dashed ${T.l1}`}}>
            <Ico n="hng" size={26} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:10}}>Aucun vêtement</div>
          </div>
        ):byCat.map(({cat,items,score})=>(
          <div key={cat} style={{marginBottom:28}}>
            {/* Category header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${T.l1}`}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span style={{fontSize:12,fontWeight:900,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink}}>{cat}</span>
                <span style={{fontSize:10,color:T.t4,fontWeight:700}}>{items.length}</span>
              </div>
              {score!=null&&<ScoreBadge val={score} small/>}
            </div>
            {/* Horizontal scroll */}
            <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
              {items.map(item=>(
                <button key={item.id} onClick={()=>openEdit(item)} style={{flexShrink:0,width:148,background:"none",border:`1px solid ${T.l1}`,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",transition:"border-color .1s"}}>
                  {item.photo?(
                    <img src={item.photo} alt={item.name} style={{width:148,height:185,objectFit:"cover",display:"block"}}/>
                  ):(
                    <CT color={item.color} h={185} w={148}/>
                  )}
                  <div style={{padding:"9px 11px 11px",borderTop:`1px solid ${T.l1}`}}>
                    <div style={{fontSize:12,fontWeight:800,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.name}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}>
                      <span style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{item.brand}</span>
                      <CondBadge val={item.scoreLike}/>
                    </div>
                  </div>
                </button>
              ))}
              {/* Add ghost card */}
              <button onClick={openAdd} style={{flexShrink:0,width:72,background:"none",border:`1px dashed ${T.l1}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,minHeight:214,color:T.t4}}>
                <Ico n="pls" size={16} color={T.t4} sw={1.4}/>
                <span style={{fontSize:8,fontWeight:800,letterSpacing:"0.1em",color:T.t4}}>AJOUTER</span>
              </button>
            </div>
          </div>
        ))
      )}

      {/* OUTFITS */}
      {sec==="outfits"&&(
        <div>
          <button onClick={openAddO} style={{width:"100%",background:"none",border:`1px dashed ${T.l2}`,padding:"13px",color:T.t2,cursor:"pointer",fontSize:11,marginBottom:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase"}}>
            <Ico n="pls" size={12} color={T.t2}/> CRÉER UNE TENUE
          </button>
          {outfits.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${T.l1}`}}>
              <Ico n="lyr" size={22} color={T.t4}/>
              <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:8}}>Aucune tenue créée</div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {outfits.map(o=>{
              const cols=o.items.map(nm=>wardrobe.find(w=>w.name===nm)?.color).filter(Boolean);
              return(
                <button key={o.id} onClick={()=>openEditO(o)} style={{background:"none",border:`1px solid ${T.l1}`,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  {/* Color bars */}
                  <div style={{height:5,display:"flex"}}>
                    {cols.slice(0,4).map((c,i)=><div key={i} style={{flex:1,background:COL_HEX[c]||T.s2}}/>)}
                    {!cols.length&&<div style={{flex:1,background:T.s2}}/>}
                  </div>
                  <div style={{padding:"10px 12px 12px",flex:1}}>
                    <div style={{fontSize:12,fontWeight:900,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:4}}>{o.name}</div>
                    <div style={{fontSize:10,color:T.t3,fontWeight:600,lineHeight:1.55,marginBottom:o.rating?7:0}}>{o.items.slice(0,3).join(" · ")}{o.items.length>3?" +":" "}</div>
                    {o.rating>0&&<ScoreBadge val={o.rating} small/>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ITEM SHEET */}
      <Sheet open={!!iSh} onClose={()=>setISh(null)} title={iSh==="add"?"Nouveau vêtement":"Modifier"} full>
        <Field label="Nom" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Ex: Cargo Ripstop"/>
        <Field label="Marque" value={form.brand||""} onChange={v=>setForm(f=>({...f,brand:v}))} placeholder="Carhartt, Nike…"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Catégorie" value={form.category||""} onChange={v=>setForm(f=>({...f,category:v}))} opts={CATS}/>
          <Field label="Couleur" value={form.color||""} onChange={v=>setForm(f=>({...f,color:v}))} opts={GR_COLS}/>
        </div>
        {/* Color preview */}
        {form.color&&<div style={{height:44,background:COL_HEX[form.color]||T.s2,marginBottom:16,border:`1px solid ${T.l1}`}}/>}
        <HR my={4}/>
        <ScoreSlider label="Coupe" val={form.scoreCut||5} onChange={v=>setForm(f=>({...f,scoreCut:v}))}/>
        <ScoreSlider label="Appréciation" val={form.scoreLike||5} onChange={v=>setForm(f=>({...f,scoreLike:v}))}/>
        <ScoreSlider label="Fréquence de port" val={form.scoreWorn||5} onChange={v=>setForm(f=>({...f,scoreWorn:v}))}/>
        <HR my={4}/>
        <div style={{marginBottom:18}}>
          <Label c="Photo" style={{marginBottom:8}}/>
          <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto}/>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <BtnO c="Choisir une photo" onClick={()=>fRef.current?.click()} style={{width:"auto",padding:"9px 16px",fontSize:12}}/>
            {form.photo&&<img src={form.photo} alt="" style={{width:48,height:48,objectFit:"cover",border:`1px solid ${T.l1}`}}/>}
          </div>
        </div>
        <BtnP full c="Sauvegarder" onClick={save}/>
        {iSh!=="add"&&<BtnD full c="Supprimer ce vêtement" onClick={()=>remove(iSh)}/>}
      </Sheet>

      {/* OUTFIT SHEET */}
      <Sheet open={!!oSh} onClose={()=>setOSh(null)} title={oSh==="add"?"Créer une tenue":"Modifier"} full>
        <Field label="Nom de la tenue" value={oF.name||""} onChange={v=>setOF(f=>({...f,name:v}))} placeholder="Ex: Everyday Minimal"/>
        <div style={{marginBottom:16}}>
          <Label c={`Pièces · ${oF.items?.length||0} sélectionnée${(oF.items?.length||0)>1?"s":""}`} style={{marginBottom:8}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:260,overflowY:"auto"}}>
            {wardrobe.map(item=>{
              const s=oF.items?.includes(item.name);
              return(
                <button key={item.id} onClick={()=>toggleI(item.name)} style={{background:s?T.ink:T.s1,border:`1px solid ${s?T.ink:T.l1}`,padding:"9px 11px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all .08s"}}>
                  <div style={{width:18,height:18,background:COL_HEX[item.color]||T.s2,border:`1px solid ${s?"rgba(255,255,255,0.15)":T.l1}`,flexShrink:0}}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:11,color:s?"#fff":T.ink,fontWeight:800,lineHeight:1.2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.name}</div>
                    <div style={{fontSize:9,color:s?"rgba(255,255,255,0.45)":T.t3,fontWeight:600,marginTop:1,letterSpacing:"0.04em",textTransform:"uppercase"}}>{item.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Note" value={oF.note||""} onChange={v=>setOF(f=>({...f,note:v}))} placeholder="Occasion, style, météo…"/>
        <ScoreSlider label="Note globale" val={oF.rating||5} onChange={v=>setOF(f=>({...f,rating:v}))}/>
        <BtnP full c="Sauvegarder la tenue" onClick={saveO}/>
        {oSh!=="add"&&<BtnD full c="Supprimer cette tenue" onClick={()=>removeO(oSh)}/>}
      </Sheet>

      {/* ANALYSIS SHEET */}
      <Sheet open={aSh} onClose={()=>setASh(false)} title="Rapport garde-robe" full>
        {analysis&&<>
          {aErr&&<div style={{background:T.rBg,border:`1px solid ${T.r}18`,padding:"9px 12px",marginBottom:14,fontSize:11,color:T.r,fontWeight:700}}>Erreur IA : {aErr}</div>}
          <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"18px 14px",marginBottom:16}}>
            <Spider scores={analysis.scores||{}}/>
          </div>
          {analysis.feedback&&(
            <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"12px 14px",marginBottom:14}}>
              <p style={{fontSize:13,color:T.t1,lineHeight:1.75,margin:0}}>{analysis.feedback}</p>
            </div>
          )}
          {Object.entries(analysis.details||{}).map(([cat,text])=>{
            const s=analysis.scores?.[cat];
            return(
              <div key={cat} style={{border:`1px solid ${T.l1}`,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:12,fontWeight:900,letterSpacing:"-0.02em",color:T.ink,textTransform:"uppercase"}}>{cat}</span>
                  {s!=null&&<ScoreBadge val={s}/>}
                </div>
                <p style={{fontSize:12,color:T.t2,lineHeight:1.7,margin:"0 0 9px"}}>{text}</p>
                {s!=null&&<div style={{height:2,background:T.s3}}><div style={{width:`${s*10}%`,height:"100%",background:s>=7?T.g:s>=5?T.a:T.r}}/></div>}
              </div>
            );
          })}
          <BtnO full c="Relancer l'analyse" onClick={analyze} style={{marginTop:8,opacity:aL?0.45:1}}/>
        </>}
      </Sheet>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLE IA TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StyleAI=({wardrobe})=>{
  const[recs,setRecs]=useState([]);
  const[load,setLoad]=useState(false);
  const[rErr,setRErr]=useState("");
  const[wish,setWish]=useStorage("gq_wl",SWL);
  const[tab,setTab]=useState("recs");
  const[wSh,setWSh]=useState(null);
  const[wF,setWF]=useState({});

  const gen=async()=>{
    setLoad(true);setRErr("");
    const sum=CATS.map(c=>{const its=wardrobe.filter(w=>w.category===c);return `${c}(${its.length}): ${its.map(i=>i.color).join(",")||"vide"}`;}).join(" | ");
    try{const res=await callAI(`Garde-robe grisch: ${sum||"vide"}\n\nPropose 8 vêtements à acheter. UNIQUEMENT ce JSON (pas de texte):\n[{"name":"Cargo beige","category":"Pantalons","color":"Beige","brand":"Dickies","price":"60€","priority":9,"reason":"Base essentielle"}]`,"Expert grisch. UNIQUEMENT JSON.");setRecs(pJSON(res));}
    catch(e){setRErr(e.message);setRecs([]);}
    setLoad(false);
  };

  const addR=item=>{if(!wish.find(w=>w.name===item.name))setWish(p=>[...p,{...item,id:Date.now()+"",bought:false}]);};
  const openAdd=()=>{setWF({name:"",category:CATS[0],color:GR_COLS[0],brand:"",price:"",reason:"",bought:false});setWSh("add");};
  const openEdt=item=>{setWF({...item});setWSh(item.id);};
  const saveW=()=>{if(wSh==="add")setWish(p=>[...p,{...wF,id:Date.now()+""}]);else setWish(p=>p.map(w=>w.id===wSh?{...wF,id:wSh}:w));setWSh(null);};
  const removeW=id=>{setWish(p=>p.filter(w=>w.id!==id));setWSh(null);};
  const toggle=id=>setWish(p=>p.map(w=>w.id===id?{...w,bought:!w.bought}:w));
  const bought=wish.filter(w=>w.bought).length;

  return(
    <div>
      {/* HEADER */}
      <div style={{paddingBottom:18,marginBottom:18,borderBottom:`1px solid ${T.l1}`}}>
        <Title c="Style IA" size={28}/>
        <div style={{display:"flex",gap:0,marginTop:14,borderTop:`1px solid ${T.l1}`}}>
          {[[wish.length,"Articles",""],["  "+bought,"Achetés",""]].map(([val,label],i)=>(
            <div key={label} style={{flex:1,padding:"12px 0",borderRight:i<1?`1px solid ${T.l1}`:"none",paddingLeft:i>0?16:0}}>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{String(val).trim()}</div>
              <Label c={label} style={{marginTop:4}}/>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",borderBottom:`2px solid ${T.l1}`,marginBottom:18}}>
        {[["recs","RECOMMANDATIONS"],["wish","WISHLIST"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:"none",border:"none",borderBottom:`2px solid ${tab===k?T.ink:"transparent"}`,marginBottom:-2,padding:"9px 0",color:tab===k?T.ink:T.t3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em"}}>{l}</button>
        ))}
      </div>

      {/* RECS */}
      {tab==="recs"&&(
        <div>
          <BtnP full c={load?"ANALYSE EN COURS…":"GÉNÉRER DES RECOMMANDATIONS"} icon="spk" onClick={gen} disabled={load} style={{marginBottom:16}}/>
          {rErr&&<div style={{background:T.rBg,border:`1px solid ${T.r}18`,padding:"9px 12px",marginBottom:12,fontSize:11,color:T.r,fontWeight:700}}>{rErr}</div>}
          {recs.length===0&&!load&&!rErr&&(
            <div style={{textAlign:"center",padding:"56px 16px",border:`1px dashed ${T.l1}`}}>
              <Ico n="spk" size={22} color={T.t4}/>
              <div style={{fontSize:12,color:T.t2,fontWeight:800,marginTop:12,letterSpacing:"-0.01em"}}>Génère des recommandations</div>
              <div style={{fontSize:11,color:T.t4,marginTop:5,lineHeight:1.65}}>L'IA analysera ta garde-robe et proposera des achats stratégiques.</div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {recs.map((item,i)=>{
              const inW=!!wish.find(w=>w.name===item.name);
              return(
                <div key={i} style={{border:`1px solid ${T.l1}`,overflow:"hidden"}}>
                  <CT color={item.color} h={120}/>
                  <div style={{padding:"10px 11px 12px",borderTop:`1px solid ${T.l1}`}}>
                    {item.priority>=8&&<Tag c="TOP PRIORITÉ" color={T.g} bg={T.gBg}/>}
                    <div style={{fontSize:12,fontWeight:900,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,marginTop:item.priority>=8?5:0,marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{item.brand} · {item.price}</div>
                    <div style={{fontSize:10,color:T.t2,lineHeight:1.55,marginBottom:9}}>{item.reason}</div>
                    <button onClick={()=>addR(item)} disabled={inW} style={{width:"100%",background:inW?T.gBg:T.ink,border:`1px solid ${inW?T.gBd:T.ink}`,padding:"7px 0",fontSize:10,color:inW?T.g:"#fff",cursor:inW?"default":"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <Ico n={inW?"chk":"pls"} size={10} color={inW?T.g:"#fff"} sw={2.5}/>{inW?"AJOUTÉ":"WISHLIST"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WISHLIST */}
      {tab==="wish"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.t2}}>{wish.length} ARTICLE{wish.length!==1?"S":""}{bought>0&&<span style={{color:T.g,marginLeft:8}}>· {bought} ACHETÉ{bought!==1?"S":""}</span>}</div>
            <BtnP c="Ajouter" icon="pls" small onClick={openAdd}/>
          </div>
          {wish.length===0&&(
            <div style={{textAlign:"center",padding:"56px 16px",border:`1px dashed ${T.l1}`}}>
              <Ico n="str" size={22} color={T.t4}/>
              <div style={{fontSize:12,color:T.t2,fontWeight:800,marginTop:12}}>Wishlist vide</div>
              <div style={{fontSize:11,color:T.t4,marginTop:5}}>Ajoute des articles ou génère des recommandations.</div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {wish.map(item=>(
              <div key={item.id} style={{border:`1.5px solid ${item.bought?T.gBd:T.l1}`,overflow:"hidden",opacity:item.bought?.62:1,transition:"opacity .2s"}}>
                <div onClick={()=>openEdt(item)} style={{cursor:"pointer"}}>
                  <CT color={item.color} h={100}>
                    {item.bought&&<span style={{background:T.g,padding:"3px 9px",fontSize:8,color:"#fff",fontWeight:800,letterSpacing:"0.14em"}}>ACHETÉ</span>}
                  </CT>
                </div>
                <div style={{padding:"9px 11px 12px",borderTop:`1px solid ${T.l1}`}}>
                  <div style={{fontSize:12,fontWeight:900,color:T.ink,textDecoration:item.bought?"line-through":"none",letterSpacing:"-0.02em",lineHeight:1.2,cursor:"pointer",marginBottom:2}} onClick={()=>openEdt(item)}>{item.name}</div>
                  <div style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:item.price?2:8}}>{item.brand}</div>
                  {item.price&&<div style={{fontSize:13,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-0.02em"}}>{item.price}</div>}
                  <button onClick={()=>toggle(item.id)} style={{width:"100%",background:item.bought?T.gBg:T.ink,border:`1px solid ${item.bought?T.gBd:T.ink}`,padding:"7px 0",fontSize:9,color:item.bought?T.g:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <Ico n="chk" size={10} color={item.bought?T.g:"#fff"} sw={2.5}/>{item.bought?"ACHETÉ":"MARQUER ACHETÉ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!wSh} onClose={()=>setWSh(null)} title={wSh==="add"?"Ajouter à la wishlist":"Modifier"} full>
        <Field label="Nom" value={wF.name||""} onChange={v=>setWF(f=>({...f,name:v}))} placeholder="Ex: Bomber satin noir"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Catégorie" value={wF.category||""} onChange={v=>setWF(f=>({...f,category:v}))} opts={CATS}/>
          <Field label="Couleur" value={wF.color||""} onChange={v=>setWF(f=>({...f,color:v}))} opts={GR_COLS}/>
        </div>
        {wF.color&&<div style={{height:40,background:COL_HEX[wF.color]||T.s2,marginBottom:14,border:`1px solid ${T.l1}`}}/>}
        <Field label="Marque" value={wF.brand||""} onChange={v=>setWF(f=>({...f,brand:v}))} placeholder="Nike, Carhartt…"/>
        <Field label="Budget" value={wF.price||""} onChange={v=>setWF(f=>({...f,price:v}))} placeholder="80-120€"/>
        <Field label="Note" value={wF.reason||""} onChange={v=>setWF(f=>({...f,reason:v}))} placeholder="Pourquoi ce vêtement…" multiline/>
        <BtnP full c="Sauvegarder" onClick={saveW}/>
        {wSh!=="add"&&<BtnD full c="Supprimer de la wishlist" onClick={()=>removeW(wSh)}/>}
      </Sheet>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NAV=[{l:"Planning",i:"cal"},{l:"Garde-robe",i:"hng"},{l:"Style IA",i:"str"}];

export default function App(){
  const[tab,setTab]=useState(0);
  const[wardrobe,setWardrobe]=useStorage("gq_wr",SW);

  return(
    <div style={{width:"100%",minHeight:"100dvh",background:T.bg,color:T.ink,fontFamily:"'Helvetica Neue',Arial,sans-serif",maxWidth:430,margin:"0 auto"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}
        html,body{background:#fff;overflow-x:hidden;}
        input,select,button,textarea{font-family:inherit;}
        input::placeholder,textarea::placeholder{color:#C4C4C4;}
        ::-webkit-scrollbar{display:none;}
        select{-webkit-appearance:none;appearance:none;}
        input[type=checkbox]{accent-color:#0A0A0A;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
        button{transition:opacity .1s;}
        button:active{opacity:.65!important;}
        a{color:inherit;}
      `}</style>

      {/* Safe area top */}
      <div style={{height:"env(safe-area-inset-top,44px)",background:T.bg}}/>

      {/* Header */}
      <header style={{height:48,padding:"0 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.l1}`,background:T.bg,position:"sticky",top:"env(safe-area-inset-top,0px)",zIndex:20}}>
        <span style={{fontSize:15,fontWeight:900,letterSpacing:"0.04em",color:T.ink,textTransform:"uppercase"}}>GRISCH</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.14em",color:T.t4}}>{wardrobe.length} PIÈCES</span>
        </div>
      </header>

      {/* Content */}
      <main style={{padding:"20px 18px",paddingBottom:84,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {tab===0&&<Planning wardrobe={wardrobe}/>}
        {tab===1&&<Wardrobe wardrobe={wardrobe} setWardrobe={setWardrobe}/>}
        {tab===2&&<StyleAI wardrobe={wardrobe}/>}
      </main>

      {/* Bottom nav — GOAT style */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.bg,borderTop:`1px solid ${T.l1}`,paddingBottom:"env(safe-area-inset-bottom,12px)",zIndex:50}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
          {NAV.map((t,i)=>{
            const on=tab===i;
            return(
              <button key={i} onClick={()=>setTab(i)} style={{background:"none",border:"none",cursor:"pointer",padding:"12px 8px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"inherit",position:"relative"}}>
                {on&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:16,height:2,background:T.ink}}/>}
                <Ico n={t.i} size={20} color={on?T.ink:T.t4} sw={on?2.2:1.5}/>
                <span style={{fontSize:8,letterSpacing:"0.14em",fontWeight:on?900:600,color:on?T.ink:T.t4,textTransform:"uppercase"}}>{t.l}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
