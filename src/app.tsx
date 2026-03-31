// @ts-nocheck
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ━━━ TOKENS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const T = {
  bg:"#FFFFFF", s1:"#F8F8F8", s2:"#F1F1F1", s3:"#E8E8E8",
  l1:"#ECECEC", l2:"#D6D6D6", l3:"#B8B8B8",
  ink:"#0A0A0A", t1:"#1A1A1A", t2:"#5A5A5A", t3:"#8A8A8A", t4:"#C0C0C0",
  g:"#14532D", gBg:"#F0FDF4", gBd:"#86EFAC",
  r:"#7F1D1D", rBg:"#FEF2F2", rBd:"#FECACA",
  a:"#78350F", aBg:"#FFFBEB",
  b:"#1E3A8A", bBg:"#EFF6FF",
  rad:4, radSm:2,
};

// ━━━ HELPERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getMonday=(off=0)=>{const n=new Date(),d=n.getDay(),m=new Date(n);m.setDate(n.getDate()-(d===0?6:d-1)+off*7);m.setHours(0,0,0,0);return m;};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmt=d=>d.toISOString().slice(0,10);
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const pickSeed=(arr,seed)=>arr[Math.abs(seed)%arr.length];

// ━━━ CONSTANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CATS=["Pantalons","T-shirts","Pulls","Vestes","Chaussures","Accessoires","Shorts","Chemises"];
const DAYS_S=["L","M","M","J","V","S","D"];
const DAYS_F=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const EV_TYPES=["École","Sport","Sortie","Travail","Détente","Soirée","RDV","Autre"];
const GR_COLS=["Noir","Gris","Blanc","Vert foncé","Beige","Denim","Marron","Crème","Anthracite"];
const COL_HEX={"Noir":"#101010","Blanc":"#EDE8DF","Gris":"#727272","Beige":"#C0A46E","Vert foncé":"#1C3620","Denim":"#284270","Marron":"#4A2410","Crème":"#D4CCAA","Anthracite":"#2C2C2C"};
const COL_LIGHT=new Set(["Blanc","Crème","Beige"]);
const EV_DOT={"École":"#1E3A8A","Sport":"#14532D","Sortie":"#4C1D95","Travail":"#1E3A8A","Détente":"#14532D","Soirée":"#831843","RDV":"#78350F","Autre":"#525252","Tenue libre":"#0A0A0A"};
const COND_LABEL=["","Mauvais","Mauvais","Passable","Passable","Moyen","Moyen","Bon","Bon","Excellent","Parfait"];
const COND_COLOR=[,"#7F1D1D","#7F1D1D","#78350F","#78350F","#78350F","#4A5568","#14532D","#14532D","#14532D","#14532D"];

// Couleurs importantes pour l'analyse
const KEY_COLORS=["Noir","Blanc","Gris","Beige","Vert foncé","Denim"];

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
  {id:"wl1",name:"Bomber satin",category:"Vestes",color:"Noir",brand:"Our Legacy",price:"180",reason:"Layering hivernal",bought:false},
  {id:"wl2",name:"Knit col roulé",category:"Pulls",color:"Gris",brand:"COS",price:"80",reason:"Basique manquant",bought:false},
  {id:"wl3",name:"Jordan 1 Low",category:"Chaussures",color:"Beige",brand:"Nike",price:"110",reason:"Coloris parfait",bought:true},
];
const SOF=[
  {id:"o1",name:"Everyday Minimal",items:["Cargo Ripstop","Tee oversized","New Balance 550"],note:"Go-to du quotidien",rating:9},
  {id:"o2",name:"Clean Street",items:["Chino slim","Pull maille épaisse","Adidas Samba"],note:"Sortie décontractée",rating:8},
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✦ MOTEUR IA LOCAL — aucune API, 100% logique conditionnelle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LocalAI = {

  // ── Recommandation quotidienne ───────────────────────────────────────────────
  dailyRec(wardrobe, dayIndex, seed = 0) {
    if (!wardrobe.length) return "Commence par ajouter des vêtements à ta garde-robe pour recevoir des suggestions personnalisées.";
    if (wardrobe.length < 3) return "Ajoute quelques pièces supplémentaires — il en faut au minimum 3 pour composer une tenue.";

    const by = cat => wardrobe.filter(w => w.category === cat);
    const best = (arr) => arr.length ? [...arr].sort((a,b)=>(b.scoreLike+b.scoreCut)-(a.scoreLike+a.scoreCut))[0] : null;
    const weekEnd = dayIndex >= 5;
    const day = DAYS_F[dayIndex].toLowerCase();

    // Sélection intelligente des meilleures pièces
    const pantalon = best(by("Pantalons"));
    const short = weekEnd ? best(by("Shorts")) : null;
    const bas = (weekEnd && short) ? short : pantalon;
    const tshirt = best(by("T-shirts"));
    const pull = weekEnd ? null : best(by("Pulls"));
    const haut = pull && dayIndex <= 2 ? pull : tshirt;
    const veste = weekEnd ? null : best(by("Vestes"));
    const shoes = best(by("Chaussures"));

    const parts = [bas, haut, veste, shoes].filter(Boolean);
    if (parts.length < 2) return "Ta garde-robe est trop peu diversifiée pour composer des tenues complètes. Ajoute pantalons et hauts en priorité.";

    const outfitStr = parts.map(p => `${p.name}`).join(" + ");

    // Variété d'introductions selon le jour
    const intros = [
      `Pour ce ${day}, composition idéale :`,
      `Tenue grisch recommandée pour ${day} —`,
      `Le combo du ${day} :`,
      `Mise sur cette sélection ${day} :`,
      `Proposition calibrée pour ${day} :`,
    ];
    // Graine pour varier sans être aléatoire à chaque render
    const intro = pickSeed(intros, dayIndex + seed);
    return `${intro} ${outfitStr}.`;
  },

  // ── Suggestion de tenue pour un événement ───────────────────────────────────
  outfitSuggest(wardrobe, eventType, dayIndex) {
    if (!wardrobe.length) return "Ajoute d'abord des vêtements à ta garde-robe.";

    const by = cat => wardrobe.filter(w => w.category === cat);
    const best = arr => arr.length ? [...arr].sort((a,b)=>(b.scoreLike+b.scoreCut)-(a.scoreLike+a.scoreCut))[0] : null;
    const byColor = (arr, color) => arr.filter(w => w.color === color);

    // Logique par type d'événement
    const rules = {
      "École": () => {
        const pant = best(by("Pantalons"));
        const haut = best(by("T-shirts")) || best(by("Pulls"));
        const shoes = best(by("Chaussures"));
        return [pant, haut, shoes].filter(Boolean);
      },
      "Soirée": () => {
        const pantsNoir = byColor(by("Pantalons"),"Noir");
        const pant = pantsNoir.length ? best(pantsNoir) : best(by("Pantalons"));
        const veste = best(by("Vestes"));
        const tee = best(by("T-shirts"));
        const shoes = best(by("Chaussures"));
        return [pant, tee, veste, shoes].filter(Boolean);
      },
      "Sport": () => {
        const short = best(by("Shorts")) || best(by("Pantalons"));
        const tee = best(by("T-shirts"));
        const shoes = best(by("Chaussures"));
        return [short, tee, shoes].filter(Boolean);
      },
      "Détente": () => {
        const pant = best(by("Pantalons"));
        const pull = best(by("Pulls")) || best(by("T-shirts"));
        const shoes = best(by("Chaussures"));
        return [pant, pull, shoes].filter(Boolean);
      },
      "default": () => {
        const pant = best(by("Pantalons"));
        const haut = best(by("T-shirts")) || best(by("Pulls"));
        const outer = best(by("Vestes"));
        const shoes = best(by("Chaussures"));
        return [pant, haut, outer, shoes].filter(Boolean);
      }
    };

    const fn = rules[eventType] || rules["default"];
    const pieces = fn();
    if (!pieces.length) return "Pas assez de vêtements pour cette occasion. Enrichis ta garde-robe.";

    return pieces.map(p => `${p.name} ${p.color.toLowerCase()}`).join(" + ");
  },

  // ── Analyse complète de la garde-robe ────────────────────────────────────────
  analyze(wardrobe) {
    const by = cat => wardrobe.filter(w => w.category === cat);
    const avg = arr => {
      const clean = arr.filter(v => typeof v === "number" && !isNaN(v));
      return clean.length ? Math.round(clean.reduce((s,v)=>s+v,0)/clean.length*10)/10 : 0;
    };
    const avgScore = arr => avg(arr.flatMap(w=>[w.scoreLike||0, w.scoreCut||0]));

    // ── Calcul des scores par catégorie ──────────────────────────────────────
    // Score = pondération entre quantité et qualité moyenne
    const catScore = (cat) => {
      const items = by(cat);
      if (!items.length) return 1;
      const qty = Math.min(items.length, 5); // max 5 pour la quantité
      const qtyScore = (qty / 5) * 5;         // 0→5 pts quantité
      const qualScore = avgScore(items) / 2;   // 0→5 pts qualité
      return Math.min(10, Math.round((qtyScore + qualScore) * 10) / 10);
    };

    const scores = {};
    CATS.forEach(c => { scores[c] = catScore(c); });

    // ── Analyse des couleurs ─────────────────────────────────────────────────
    const colorCount = {};
    wardrobe.forEach(w => { colorCount[w.color] = (colorCount[w.color]||0)+1; });
    const missingColors = KEY_COLORS.filter(c => !colorCount[c]);
    const lowLiked = wardrobe.filter(w => (w.scoreLike||0) < 5);

    // ── Génération du feedback conditionnel ──────────────────────────────────
    const feedbackParts = [];

    if (wardrobe.length < 5) {
      feedbackParts.push("Ta garde-robe est encore très légère. Commence par ajouter les basiques essentiels.");
    } else if (wardrobe.length < 10) {
      feedbackParts.push("Bonne base, mais il manque encore de la diversité pour alterner les looks.");
    } else {
      feedbackParts.push("Ta garde-robe a une belle consistance, l'essentiel est couvert.");
    }

    const weakCats = CATS.filter(c => catScore(c) < 4);
    if (weakCats.length) {
      const labels = { "Pantalons":"pantalons","T-shirts":"t-shirts","Pulls":"pulls","Vestes":"vestes","Chaussures":"chaussures","Accessoires":"accessoires","Shorts":"shorts","Chemises":"chemises" };
      feedbackParts.push(`Catégories à renforcer : ${weakCats.map(c=>labels[c]).join(", ")}.`);
    }

    if (missingColors.length >= 3) {
      feedbackParts.push(`Ton vestiaire manque de nuances — il n'y a pas de pièces en ${missingColors.slice(0,3).join(", ")}.`);
    } else if (missingColors.length) {
      feedbackParts.push(`Pour plus de polyvalence, explore les coloris : ${missingColors.join(", ")}.`);
    }

    if (lowLiked.length > wardrobe.length * 0.4) {
      feedbackParts.push("Beaucoup de pièces ont une faible appréciation — envisage de trier et de renouveler.");
    } else if (lowLiked.length > 0) {
      feedbackParts.push(`${lowLiked.length} pièce${lowLiked.length>1?"s ont":"  a"} une note d'appréciation basse — à surveiller.`);
    }

    const allGood = weakCats.length === 0 && missingColors.length <= 1 && lowLiked.length === 0;
    if (allGood) feedbackParts.push("Ta garde-robe est bien équilibrée 👍");

    // ── Détails par catégorie ─────────────────────────────────────────────────
    const details = {};
    CATS.forEach(cat => {
      const items = by(cat);
      const s = catScore(cat);
      if (!items.length) {
        const suggestions = {
          "Pantalons": "Aucun pantalon — c'est une pièce fondamentale. Commence par un cargo ou un chino.",
          "T-shirts": "Pas de t-shirts basiques. Ajoute au moins 2-3 couleurs neutres.",
          "Pulls": "Aucun pull. Pour l'automne-hiver, c'est indispensable.",
          "Vestes": "Pas de veste de dessus. Un coach jacket ou une veste de travail ferait parfaitement l'affaire.",
          "Chaussures": "Aucune chaussure enregistrée. Commence par une paire polyvalente type NB 550 ou Samba.",
          "Accessoires": "Pas d'accessoires. Une casquette ou une ceinture peut changer un look.",
          "Shorts": "Aucun short. Utile pour le sport et les sorties estivales.",
          "Chemises": "Aucune chemise. Une overshirt ou flannel ouvre beaucoup de possibilités.",
        };
        details[cat] = suggestions[cat] || `Aucune pièce dans cette catégorie — à ajouter.`;
      } else {
        const avgQ = avgScore(items);
        const topItem = [...items].sort((a,b)=>(b.scoreLike+b.scoreCut)-(a.scoreLike+a.scoreCut))[0];
        if (s >= 8) {
          details[cat] = `Excellent niveau (${items.length} pièce${items.length>1?"s":""}). Meilleure pièce : ${topItem.name}. Continue ainsi.`;
        } else if (s >= 6) {
          details[cat] = `Bonne base (${items.length} pièce${items.length>1?"s":""}), qualité moyenne ${avgQ.toFixed(1)}/10. Quelques ajouts ciblés l'élèveraient davantage.`;
        } else if (s >= 4) {
          details[cat] = `Catégorie légère (${items.length} pièce${items.length>1?"s":""}). Diversifie les coloris et vise une meilleure qualité de coupe.`;
        } else {
          details[cat] = `Très peu de pièces ici (${items.length}). C'est une priorité d'achat pour équilibrer ta garde-robe.`;
        }
      }
    });

    return { scores, feedback: feedbackParts.join(" "), details };
  },

  // ── Recommandations d'achat ───────────────────────────────────────────────
  styleRecs(wardrobe) {
    const by = cat => wardrobe.filter(w => w.category === cat);
    const colorCount = {};
    wardrobe.forEach(w => { colorCount[w.color] = (colorCount[w.color]||0)+1; });
    const hasColor = c => !!colorCount[c];

    const recs = [];

    // Banque de suggestions réelles par catégorie + couleur
    const catalog = {
      "Pantalons": [
        {name:"Cargo Ripstop",brand:"Carhartt WIP",color:"Vert foncé",price:"110",reason:"Coloris signature grisch, très polyvalent"},
        {name:"Cargo Double Knee",brand:"Dickies",color:"Beige",price:"65",reason:"Basique indémodable, coupe workwear parfaite"},
        {name:"Baggy Jean",brand:"Levi's",color:"Denim",price:"80",reason:"Le denim droit manque dans l'arsenal"},
        {name:"Cargo Fatigue",brand:"Engineered Garments",color:"Anthracite",price:"180",reason:"Pièce phare qui élève immédiatement un outfit"},
      ],
      "T-shirts": [
        {name:"Tee pocket",brand:"Carhartt WIP",color:"Noir",price:"35",reason:"Basique noir indispensable au vestiaire grisch"},
        {name:"Tee oversized",brand:"Uniqlo",color:"Blanc",price:"20",reason:"Le blanc oversized est le fondement de tout look minimal"},
        {name:"L/S Tee",brand:"Colorful Standard",color:"Gris",price:"45",reason:"Manche longue polyvalente, parfaite en transition"},
        {name:"Tee Heritage",brand:"Norse Projects",color:"Beige",price:"55",reason:"Coupe et matière premium pour un quotidien soigné"},
      ],
      "Pulls": [
        {name:"Lambswool Crew",brand:"Uniqlo",color:"Crème",price:"60",reason:"Laine douce, coloris neutre, excellent rapport qualité/prix"},
        {name:"Heavy Knit",brand:"COS",color:"Anthracite",price:"90",reason:"Grosse maille structurée qui ancre n'importe quel look"},
        {name:"Zip Sweat",brand:"Carhartt WIP",color:"Gris",price:"85",reason:"La veste pull — hybride pratique et esthétique"},
        {name:"Col roulé côtelé",brand:"Arket",color:"Noir",price:"75",reason:"Pièce de layering puissante, facile à intégrer"},
      ],
      "Vestes": [
        {name:"Bomber Coach",brand:"Nike",color:"Noir",price:"95",reason:"Intemporel, se porte sur tout, durable"},
        {name:"OA Overshirt",brand:"Carhartt WIP",color:"Beige",price:"130",reason:"L'overshirt est le layering ultime du grisch"},
        {name:"Fleece Polaire",brand:"Patagonia",color:"Gris",price:"150",reason:"Fonctionnel et esthétique, parfait pour les journées froides"},
        {name:"Harrington",brand:"Baracuta",color:"Vert foncé",price:"250",reason:"Pièce investissement, coupe iconique"},
      ],
      "Chaussures": [
        {name:"NB 574",brand:"New Balance",color:"Gris",price:"90",reason:"Alternative au 550, silhouette plus chunky trendy"},
        {name:"Chuck 70 Hi",brand:"Converse",color:"Noir",price:"85",reason:"Canvas noir qui va avec absolument tout"},
        {name:"Clarks Desert Boot",brand:"Clarks",color:"Beige",price:"110",reason:"Chukka indémodable, pied léger en toute saison"},
        {name:"NB 1906R",brand:"New Balance",color:"Blanc",price:"130",reason:"Running tech d'archive — esthétique très forte"},
      ],
      "Accessoires": [
        {name:"Bonnet Watch",brand:"Carhartt WIP",color:"Noir",price:"30",reason:"Accessoire hiver essentiel, silhouette épurée"},
        {name:"Tote Canvas",brand:"Carhartt WIP",color:"Beige",price:"35",reason:"Fonctionnel et stylistique, complète n'importe quelle tenue"},
        {name:"Ceinture tactical",brand:"Uniqlo",color:"Noir",price:"20",reason:"Détail discret qui structure un look bas de gamme"},
        {name:"Chaussettes hautes",brand:"Stance",color:"Gris",price:"18",reason:"Petit détail visible qui fait la différence"},
      ],
      "Shorts": [
        {name:"Cargo Short",brand:"Carhartt WIP",color:"Beige",price:"70",reason:"Short workwear polyvalent sport et casual"},
        {name:"Mesh Short",brand:"Nike",color:"Noir",price:"45",reason:"Sport et streetwear, se porte en toutes occasions"},
        {name:"Bermuda Lin",brand:"COS",color:"Crème",price:"65",reason:"Élégant et léger pour l'été, facile à porter"},
      ],
      "Chemises": [
        {name:"Flannel Shirt",brand:"Pendleton",color:"Beige",price:"100",reason:"Chemise de bûcheron devenue icône streetwear"},
        {name:"Oxford BD",brand:"Ralph Lauren",color:"Blanc",price:"85",reason:"Basique élégant-casual très polyvalent"},
        {name:"Work Shirt",brand:"Dickies",color:"Denim",price:"55",reason:"Esprit workwear authentique, très grisch"},
      ],
    };

    // Priorités : ce qui manque en premier
    const priorities = [];
    CATS.forEach(cat => {
      const items = by(cat);
      const catItems = catalog[cat] || [];
      if (!catItems.length) return;

      // Filtrer les couleurs déjà très représentées
      const candidates = catItems.filter(r => {
        const alreadyHas = by(cat).some(w => w.name === r.name);
        return !alreadyHas;
      });

      if (!items.length) {
        // Catégorie vide → très haute priorité
        candidates.slice(0,2).forEach(r => priorities.push({...r, category:cat, priority:9+Math.random()}));
      } else if (items.length < 2) {
        // Peu de pièces → haute priorité
        candidates.slice(0,1).forEach(r => priorities.push({...r, category:cat, priority:7+Math.random()}));
      } else {
        // Compléter les couleurs manquantes
        const missing = candidates.filter(r => !hasColor(r.color));
        missing.slice(0,1).forEach(r => priorities.push({...r, category:cat, priority:5+Math.random()}));
      }
    });

    // Trier par priorité, prendre les 8 meilleures
    return priorities
      .sort((a,b) => b.priority - a.priority)
      .slice(0, 8)
      .map(r => ({...r, priority: Math.round(r.priority)}));
  },

  // ── Rapport couleurs ─────────────────────────────────────────────────────────
  colorReport(wardrobe) {
    const colorCount = {};
    wardrobe.forEach(w => { colorCount[w.color] = (colorCount[w.color]||0)+1; });
    const missing = KEY_COLORS.filter(c => !colorCount[c]);
    const dominated = Object.entries(colorCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

    const lines = [];
    if (dominated.length) {
      lines.push(`Couleurs dominantes : ${dominated.map(([c,n])=>`${c} (${n})`).join(", ")}.`);
    }
    if (missing.length) {
      const msgs = {
        "Noir": "Le noir est absent — c'est la base de tout vestiaire grisch.",
        "Blanc": "Pas de pièce blanche. Le blanc structure les tenues neutres.",
        "Gris": "Le gris manque — c'est la couleur de transition parfaite.",
        "Beige": "Le beige apporte de la chaleur et se marie avec tout.",
        "Vert foncé": "Le vert foncé est le coloris signature du style workwear grisch.",
        "Denim": "Pas de denim. Un jean ou une chemise denim est un fondamental.",
      };
      missing.slice(0,3).forEach(c => { if(msgs[c]) lines.push(msgs[c]); });
    }
    if (!missing.length && wardrobe.length >= 6) {
      lines.push("Excellent équilibre chromatique. Ta palette est cohérente.");
    }
    return lines.join(" ");
  },
};

// ━━━ STORAGE — useState simple (localStorage non supporté dans les artifacts) ━
const useStorage = (_key, def) => useState(def);

// ━━━ TOAST SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "ok") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2600);
  }, []);
  return [toasts, toast];
};
const Toasts = ({ toasts }) => (
  <div style={{ position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 36px)",maxWidth:394,zIndex:900,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none" }}>
    {toasts.map(t => (
      <div key={t.id} style={{ background:t.type==="err"?T.r:T.ink,color:"#fff",padding:"11px 15px",fontSize:12,fontWeight:700,letterSpacing:"0.02em",display:"flex",alignItems:"center",gap:9,animation:"toastIn .2s cubic-bezier(.32,.72,0,1)" }}>
        <div style={{ width:5,height:5,background:t.type==="err"?"#FCA5A5":t.type==="g"?"#86EFAC":"rgba(255,255,255,0.4)",flexShrink:0 }}/>
        {t.msg}
      </div>
    ))}
  </div>
);

// ━━━ TYPEWRITER HOOK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Donne un effet "IA qui réfléchit" même avec des réponses locales
const useTypewriter = (text, speed = 16) => {
  const [displayed, setDisplayed] = useState("");
  const prevRef = useRef("");
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!text) { setDisplayed(""); prevRef.current = ""; return; }
    if (text === prevRef.current) return;
    prevRef.current = text;
    setDisplayed("");
    let i = 0;
    // Clear any stale interval before starting
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    const start = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }, speed);
    }, 360);
    return () => {
      clearTimeout(start);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [text, speed]);
  return displayed;
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
  bar:["M18 20V10","M12 20V4","M6 20v-6"],
  srch:["M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"],
  pkg:["M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"],
  pal:["M12 2a10 10 0 000 20c1.1 0 2-.9 2-2v-.5c0-.5.4-1 1-1s1 .5 1 1V20a2 2 0 002-2 10 10 0 00-6-9.2","M8 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"],
};
const Ico=({n,size=16,color="currentColor",sw=1.8})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(PX[n]||PX.pls).map((d,i)=><path key={i} d={d}/>)}
  </svg>
);

// ━━━ MICRO UI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Label=({c,style:s})=><div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.t3,...s}}>{c}</div>;
const Title=({c,size=28,style:s})=><div style={{fontSize:size,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1,...s}}>{c}</div>;
const HR=({my=0})=><div style={{height:1,background:T.l1,margin:`${my}px 0`}}/>;
const Skel=({w="100%",h=14,style:s})=><div style={{width:w,height:h,background:`linear-gradient(90deg,${T.s2} 0%,${T.s3} 50%,${T.s2} 100%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s ease-in-out infinite",...s}}/>;
const Dot=({color=T.ink,size=7})=><div style={{width:size,height:size,background:color,flexShrink:0}}/>;
const ScoreBadge=({val,small})=>{
  const c=val>=7?T.g:val>=5?T.a:T.r;
  const bg=val>=7?T.gBg:val>=5?T.aBg:T.rBg;
  return <span style={{fontSize:small?9:10,fontWeight:800,color:c,background:bg,border:`1px solid ${c}22`,padding:small?"2px 5px":"3px 7px",letterSpacing:"0.04em"}}>{val}/10</span>;
};
const CondBadge=({val})=><span style={{fontSize:9,fontWeight:700,color:COND_COLOR[val]||T.t3,letterSpacing:"0.08em",textTransform:"uppercase"}}>{COND_LABEL[val]}</span>;
const Tag=({c,color=T.ink,bg=T.s2})=><span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color,background:bg,padding:"2px 7px"}}>{c}</span>;

const MiniScoreBar=({val})=>{
  const color=val>=7?T.g:val>=5?T.a:T.r;
  return(
    <div style={{flex:1,height:2,background:T.s3}}>
      <div style={{width:`${val*10}%`,height:"100%",background:color,transition:"width .4s ease-out"}}/>
    </div>
  );
};

// ━━━ INPUTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FBase={width:"100%",background:T.s1,border:`1px solid ${T.l1}`,padding:"12px 14px",color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",WebkitAppearance:"none",appearance:"none",borderRadius:T.rad,transition:"border-color .15s"};
const Field=({label,value,onChange,opts,placeholder,multiline})=>(
  <div style={{marginBottom:16}}>
    {label&&<Label c={label} style={{marginBottom:6}}/>}
    {opts
      ?<select value={value} onChange={e=>onChange(e.target.value)} style={FBase}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
      :multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...FBase,resize:"none",lineHeight:1.55}}/>
      :<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={FBase}/>
    }
  </div>
);

// Sélecteur de couleur visuel (swatches)
const ColorPicker=({value,onChange})=>(
  <div style={{marginBottom:16}}>
    <Label c="Couleur" style={{marginBottom:8}}/>
    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {GR_COLS.map(c=>{
        const sel=value===c;
        const hex=COL_HEX[c]||T.s2;
        const lt=COL_LIGHT.has(c);
        return(
          <button key={c} onClick={()=>onChange(c)} title={c}
            style={{width:32,height:32,background:hex,border:sel?`2.5px solid ${T.ink}`:`1px solid ${lt?T.l2:"transparent"}`,cursor:"pointer",position:"relative",outline:sel?`2px solid ${T.bg}`:"none",outlineOffset:sel?-4:0,transition:"transform .12s, box-shadow .12s",transform:sel?"scale(1.15)":"scale(1)",boxShadow:sel?"0 2px 8px rgba(0,0,0,0.18)":"none"}}>
            {sel&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="chk" size={12} color={lt?T.ink:"#fff"} sw={3}/>
            </div>}
          </button>
        );
      })}
    </div>
    {value&&(
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9}}>
        <div style={{width:16,height:16,background:COL_HEX[value]||T.s2,border:`1px solid ${T.l1}`}}/>
        <span style={{fontSize:11,color:T.t2,fontWeight:600,letterSpacing:"0.04em"}}>{value}</span>
      </div>
    )}
  </div>
);

// Barre de recherche
const SearchBar=({value,onChange,placeholder="Rechercher…"})=>(
  <div style={{position:"relative",marginBottom:12}}>
    <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
      <Ico n="srch" size={14} color={T.t4} sw={1.8}/>
    </div>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{...FBase,paddingLeft:34,fontSize:13}}/>
    {value&&(
      <button onClick={()=>onChange("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",lineHeight:1}}>
        <Ico n="cls" size={12} color={T.t3}/>
      </button>
    )}
  </div>
);

// Pills de filtre catégorie
const CatPills=({cats,active,onSelect})=>(
  <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2,marginBottom:16}}>
    {[{cat:"Tout",count:0},...cats].map(({cat,count})=>{
      const on=cat==="Tout"?!active:active===cat;
      return(
        <button key={cat} onClick={()=>onSelect(cat==="Tout"?null:cat)}
          style={{flexShrink:0,background:on?T.ink:T.s1,border:`1px solid ${on?T.ink:T.l1}`,padding:"5px 11px",fontSize:9,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:on?"#fff":T.t2,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",transition:"background .1s,border-color .1s"}}>
          {cat}
          {count>0&&<span style={{opacity:.5,fontSize:8}}>{count}</span>}
        </button>
      );
    })}
  </div>
);

const ScoreSlider=({label,val,onChange})=>(
  <div style={{marginBottom:22}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
      <Label c={label}/>
      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
        <span style={{fontSize:28,fontWeight:900,color:T.ink,letterSpacing:"-0.05em",lineHeight:1}}>{val}</span>
        <span style={{fontSize:11,color:T.t3}}>/10</span>
        <CondBadge val={val}/>
      </div>
    </div>
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:10},(_,i)=>(
        <button key={i} onClick={()=>onChange(i+1)}
          style={{flex:1,height:4,border:"none",cursor:"pointer",background:i<val?T.ink:T.s3,transition:"background .08s",borderRadius:1}}/>
      ))}
    </div>
  </div>
);

const BtnP=({c,onClick,disabled,full,small,icon,style:s})=>(
  <button onClick={onClick} disabled={disabled}
    style={{background:T.ink,color:"#fff",border:"none",borderRadius:T.rad,padding:small?"8px 14px":"13px 20px",fontSize:small?11:13,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.38:1,fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"opacity .12s,transform .1s",...s}}>
    {icon&&<Ico n={icon} size={small?12:13} color="#fff" sw={2}/>}{c}
  </button>
);
const BtnO=({c,onClick,disabled,full,small,icon,style:s})=>(
  <button onClick={onClick} disabled={disabled}
    style={{background:T.bg,color:T.ink,border:`1px solid ${T.l2}`,borderRadius:T.rad,padding:small?"7px 13px":"12px 18px",fontSize:small?11:13,fontWeight:600,letterSpacing:"0.03em",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.38:1,fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"opacity .12s",...s}}>
    {icon&&<Ico n={icon} size={small?12:13} color={T.t2} sw={1.8}/>}{c}
  </button>
);
const BtnD=({c,onClick,full})=>(
  <button onClick={onClick}
    style={{background:T.bg,color:T.r,border:`1px solid ${T.r}20`,borderRadius:T.rad,padding:"12px 18px",fontSize:13,fontWeight:600,letterSpacing:"0.03em",cursor:"pointer",fontFamily:"inherit",width:full?"100%":"auto",display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:10,transition:"background .12s"}}>
    <Ico n="del" size={13} color={T.r}/>{c}
  </button>
);

// ━━━ BOTTOM SHEET ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Sheet=({open,onClose,title,children,full})=>{
  useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow="";};},[open]);
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",animation:"fadeIn .18s ease-out"}} onClick={onClose}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.bg,borderTop:`1px solid ${T.l1}`,maxHeight:full?"96dvh":"92dvh",display:"flex",flexDirection:"column",paddingBottom:"env(safe-area-inset-bottom,18px)",boxShadow:"0 -12px 48px rgba(0,0,0,0.12)",animation:"sheetUp .24s cubic-bezier(.32,.72,0,1)"}}>
        <div style={{width:40,height:3,background:T.s3,margin:"12px auto 0",borderRadius:2}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px 13px",borderBottom:`1px solid ${T.l1}`}}>
          <span style={{fontSize:15,fontWeight:800,letterSpacing:"-0.03em",color:T.ink}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${T.l1}`,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:T.radSm,transition:"background .1s"}}>
            <Ico n="cls" size={12} color={T.t2}/>
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"18px 18px 32px",WebkitOverflowScrolling:"touch"}}>{children}</div>
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
  const lPts=cats.map((_,i)=>pt(i,1.28));
  const gp=rv=>cats.map((_,i)=>pt(i,rv)).map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  const sp=sPts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  const sc=v=>v>=7?T.g:v>=5?T.a:T.r;
  return(
    <div>
      <svg width={W} height={244} style={{display:"block",margin:"0 auto"}}>
        {[.25,.5,.75,1].map(rv=><path key={rv} d={gp(rv)} fill="none" stroke={rv===1?T.l2:T.l1} strokeWidth={rv===1?1:.7}/>)}
        {cats.map((_,i)=>{const p=pt(i,1);return<line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={T.l1} strokeWidth=".7"/>;  })}
        {[2.5,5,7.5].map((v,i)=><text key={v} x={cx+3} y={cy-r*((i+1)*.25)+3} fill={T.t4} fontSize="7.5" fontFamily="inherit">{v}</text>)}
        <path d={sp} fill="rgba(0,0,0,0.05)" stroke={T.ink} strokeWidth="1.6"/>
        {sPts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={sc(scores[cats[i]]||0)} stroke={T.bg} strokeWidth="2.5"/>)}
        {cats.map((c,i)=>{const[lx,ly]=lPts[i];const anch=lx<cx-12?"end":lx>cx+12?"start":"middle";return<text key={i} x={lx} y={ly} textAnchor={anch} dominantBaseline="middle" fill={T.t2} fontSize="9.5" fontFamily="inherit" fontWeight="700">{c}</text>;})}
      </svg>
      <div style={{borderTop:`1px solid ${T.l1}`,marginTop:12}}>
        {cats.map(c=>{
          const s=scores[c]||0;
          return(
            <div key={c} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.l1}`}}>
              <div style={{width:5,height:5,background:sc(s),flexShrink:0}}/>
              <span style={{fontSize:11,color:T.t2,flex:1,fontWeight:600}}>{c}</span>
              <CondBadge val={Math.round(s)}/>
              <span style={{fontSize:13,color:T.ink,fontWeight:900,minWidth:20,textAlign:"right"}}>{s}</span>
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
// PLANNING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Planning=({wardrobe,toast})=>{
  const[events,setEvents]=useStorage("gq_ev",SE);
  const[wo,setWo]=useState(0);
  const[sel,setSel]=useState(()=>{const t=new Date().getDay();return t===0?6:t-1;});
  const[evSh,setEvSh]=useState(null);
  const[outSh,setOutSh]=useState(null);
  const[rateSh,setRateSh]=useState(null);
  const[evF,setEvF]=useState({});
  const[outF,setOutF]=useState({outfit:"",note:""});
  const[aiSug,setAiSug]=useState("");
  const[recKey,setRecKey]=useState(0);

  const wd=useMemo(()=>Array.from({length:7},(_,i)=>addDays(getMonday(wo),i)),[wo]);
  const getEv=useCallback(di=>{const ds=fmt(wd[di]);return events.filter(e=>e.date===ds||(e.repeat&&e.dayOfWeek===di));},[events,wd]);

  // Recommandation locale — recalculée à chaque changement de jour ou refresh
  const recText=useMemo(()=>LocalAI.dailyRec(wardrobe,sel,recKey),[wardrobe,sel,recKey]);
  const displayed=useTypewriter(recText);

  const today=new Date().toDateString();
  const selEvs=getEv(sel);
  const month=wd[0].toLocaleDateString("fr-FR",{month:"long",year:"numeric"});

  const addEv=di=>{setEvF({type:"École",repeat:false,dayOfWeek:di,date:fmt(wd[di]),outfit:"",note:""});setEvSh({mode:"add",di});};
  const editEv=(ev,di)=>{setEvF({...ev});setEvSh({mode:"edit",di,id:ev.id});};
  const saveEv=()=>{
    if(evSh.mode==="add")setEvents(p=>[...p,{...evF,id:Date.now()+"",outfitRating:{}}]);
    else setEvents(p=>p.map(e=>e.id===evSh.id?{...evF,id:evSh.id}:e));
    toast("Événement sauvegardé ✓","g");setEvSh(null);
  };
  const delEv=id=>{setEvents(p=>p.filter(e=>e.id!==id));toast("Événement supprimé");};
  const openOut=(ev,di,sa=false)=>{
    setAiSug("");
    setOutF({outfit:ev.outfit||"",note:ev.note||"",evId:ev.id,sa,di,date:fmt(wd[di])});
    setOutSh({ev,di,sa});
  };
  const saveOut=()=>{
    if(outSh.sa)setEvents(p=>[...p,{id:Date.now()+"",type:"Tenue libre",date:outF.date,dayOfWeek:outF.di,repeat:false,outfit:outF.outfit,note:outF.note,outfitRating:{}}]);
    else setEvents(p=>p.map(e=>e.id===outF.evId?{...e,outfit:outF.outfit,note:outF.note}:e));
    toast("Tenue sauvegardée ✓","g");setOutSh(null);
  };
  // Suggestion locale de tenue
  const suggest=()=>{
    const s=LocalAI.outfitSuggest(wardrobe,outSh.ev.type,outSh.di);
    setAiSug(s);
  };
  const openRate=(ev,di)=>setRateSh({ev,di,r:{style:ev.outfitRating?.style||5,practical:ev.outfitRating?.practical||5}});
  const saveRate=()=>{
    setEvents(p=>p.map(e=>e.id===rateSh.ev.id?{...e,outfitRating:rateSh.r}:e));
    toast("Notation enregistrée ✓","g");setRateSh(null);
  };

  return(
    <div>
      {/* HEADER */}
      <div style={{paddingBottom:20,marginBottom:20,borderBottom:`1px solid ${T.l1}`}}>
        <Label c={new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})} style={{marginBottom:8}}/>
        <Title c="Bonjour Yanis" size={32}/>
        <div style={{display:"flex",gap:0,marginTop:14,borderTop:`1px solid ${T.l1}`}}>
          {[
            [selEvs.filter(e=>e.outfit).length+"/"+selEvs.length,"Tenues planif."],
            [events.filter(e=>e.outfitRating?.style).length,"Tenues notées"],
            [events.filter(e=>e.outfit).length,"Total planifiées"]
          ].map(([val,label],i)=>(
            <div key={label} style={{flex:1,padding:"12px 0",borderRight:i<2?`1px solid ${T.l1}`:"none",paddingLeft:i>0?14:0}}>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{val}</div>
              <Label c={label} style={{marginTop:4}}/>
            </div>
          ))}
        </div>
      </div>

      {/* CARTE IA LOCALE */}
      <div style={{background:T.ink,padding:"16px 18px",marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.018) 24px,rgba(255,255,255,0.018) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,0.018) 24px,rgba(255,255,255,0.018) 25px)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Ico n="spk" size={11} color="rgba(255,255,255,0.3)" sw={1.5}/>
              <Label c="Suggestion du jour" style={{color:"rgba(255,255,255,0.3)"}}/>
            </div>
            <button onClick={()=>setRecKey(k=>k+1)}
              style={{background:"none",border:"1px solid rgba(255,255,255,0.12)",padding:"4px 10px",fontSize:9,color:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em"}}>
              RAFRAÎCHIR
            </button>
          </div>
          {displayed?(
            <p style={{fontSize:14,color:"rgba(255,255,255,0.88)",lineHeight:1.72,margin:0,fontWeight:400}}>
              {displayed}
              {displayed.length<recText.length&&<span style={{opacity:.4,animation:"blink .7s step-end infinite"}}>▍</span>}
            </p>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Skel h={13} style={{background:"rgba(255,255,255,0.07)"}}/>
              <Skel h={13} w="75%" style={{background:"rgba(255,255,255,0.07)"}}/>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION SEMAINE */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>setWo(w=>w-1)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 2px",display:"flex"}}><Ico n="cL" size={17} color={T.t2} sw={2.2}/></button>
        <div style={{textAlign:"center"}}>
          <span style={{fontSize:12,fontWeight:800,letterSpacing:"0.02em",textTransform:"capitalize",color:T.ink}}>{month}</span>
          {wo===0
            ?<span style={{fontSize:10,color:T.t3,marginLeft:8,fontWeight:600}}>Cette semaine</span>
            :<span style={{fontSize:10,color:T.t3,marginLeft:8,fontWeight:600,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setWo(0)}>↩ Aujourd'hui</span>
          }
        </div>
        <button onClick={()=>setWo(w=>w+1)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 2px",display:"flex"}}><Ico n="cR" size={17} color={T.t2} sw={2.2}/></button>
      </div>

      {/* BANDE 7 JOURS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:20}}>
        {DAYS_S.map((d,i)=>{
          const dt=wd[i],isToday=dt.toDateString()===today,isSel=sel===i;
          const evs=getEv(i),hasOut=evs.some(e=>e.outfit),hasRate=evs.some(e=>e.outfitRating?.style);
          return(
            <button key={i} onClick={()=>setSel(i)}
              style={{background:isSel?T.ink:isToday?T.s2:T.bg,border:`1px solid ${isSel?T.ink:isToday?T.l2:T.l1}`,padding:"9px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"background .1s,border-color .1s"}}>
              <span style={{fontSize:7,color:isSel?"rgba(255,255,255,0.4)":T.t4,fontWeight:800,letterSpacing:"0.12em"}}>{d}</span>
              <span style={{fontSize:18,color:isSel?"#fff":T.ink,fontWeight:900,letterSpacing:"-0.04em",lineHeight:1}}>{dt.getDate()}</span>
              <div style={{display:"flex",gap:2.5,height:4,alignItems:"center"}}>
                {evs.length>0&&<div style={{width:3,height:3,background:isSel?"rgba(255,255,255,0.4)":T.t3}}/>}
                {hasOut&&<div style={{width:3,height:3,background:isSel?"rgba(255,255,255,0.7)":T.ink}}/>}
                {hasRate&&<div style={{width:3,height:3,background:isSel?"rgba(255,210,40,0.9)":"#D97706"}}/>}
              </div>
            </button>
          );
        })}
      </div>

      {/* PANNEAU JOUR */}
      <div style={{border:`1px solid ${T.l1}`}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.l1}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:T.s1}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,letterSpacing:"-0.03em",color:T.ink,lineHeight:1}}>{DAYS_F[sel]}</div>
            <div style={{fontSize:10,color:T.t3,marginTop:2,fontWeight:600}}>
              {wd[sel].toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}
              {selEvs.length>0&&` · ${selEvs.length} événement${selEvs.length>1?"s":""}`}
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <BtnO c="Événement" icon="pls" small onClick={()=>addEv(sel)}/>
            <BtnP c="Tenue" icon="lyr" small onClick={()=>openOut({id:null,type:"Tenue libre",outfit:"",note:""},sel,true)}/>
          </div>
        </div>

        {selEvs.length===0?(
          <div style={{padding:"40px 16px",textAlign:"center",background:T.s1}}>
            <Ico n="cal" size={20} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:8}}>Aucun événement</div>
            <div style={{fontSize:10,color:T.t4,marginTop:3}}>Appuie sur Événement pour planifier ta journée</div>
          </div>
        ):selEvs.map((ev,idx)=>{
          const dot=EV_DOT[ev.type]||T.t2;
          const isLast=idx===selEvs.length-1;
          return(
            <div key={ev.id} style={{borderBottom:isLast?"none":`1px solid ${T.l1}`}}>
              <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:3,minHeight:36,background:dot,flexShrink:0,marginTop:2}}/>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:T.ink,letterSpacing:"-0.02em"}}>{ev.type}</span>
                      {ev.repeat&&<Tag c="HEBDO" color={T.t3} bg={T.s2}/>}
                    </div>
                    {ev.note&&<div style={{fontSize:11,color:T.t3,marginTop:2,fontStyle:"italic"}}>{ev.note}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>openRate(ev,sel)} title="Noter la tenue"
                    style={{background:ev.outfitRating?.style?T.aBg:T.s1,border:`1px solid ${ev.outfitRating?.style?"#FCD34D":T.l1}`,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .1s"}}>
                    <Ico n="rat" size={12} color={ev.outfitRating?.style?T.a:T.t4} sw={1.4}/>
                  </button>
                  <button onClick={()=>editEv(ev,sel)} title="Modifier"
                    style={{background:T.s1,border:`1px solid ${T.l1}`,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="edt" size={12} color={T.t3}/>
                  </button>
                  <button onClick={()=>delEv(ev.id)} title="Supprimer"
                    style={{background:T.rBg,border:`1px solid ${T.r}18`,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ico n="del" size={12} color={T.r}/>
                  </button>
                </div>
              </div>
              {/* Zone tenue */}
              <div style={{margin:"0 16px 13px 29px",background:T.s1,border:`1px solid ${T.l1}`,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:ev.outfit?8:0}}>
                  <Label c="Tenue"/>
                  <button onClick={()=>openOut(ev,sel)}
                    style={{background:ev.outfit?T.ink:T.bg,border:`1px solid ${ev.outfit?T.ink:T.l2}`,padding:"3px 9px",fontSize:10,fontWeight:800,letterSpacing:"0.08em",color:ev.outfit?"#fff":T.t2,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",transition:"background .1s"}}>
                    {ev.outfit?"Modifier":"Ajouter"}
                  </button>
                </div>
                {ev.outfit
                  ?<p style={{fontSize:13,color:T.ink,lineHeight:1.6,margin:0,fontWeight:500}}>{ev.outfit}</p>
                  :<p style={{fontSize:12,color:T.t4,margin:"6px 0 0",fontStyle:"italic"}}>Aucune tenue définie</p>
                }
                {ev.outfitRating?.style>0&&(
                  <div style={{display:"flex",gap:14,marginTop:9,paddingTop:9,borderTop:`1px solid ${T.l1}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Dot color="#D97706" size={5}/>
                      <span style={{fontSize:10,color:T.a,fontWeight:800}}>STYLE {ev.outfitRating.style}/10</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Dot color={T.g} size={5}/>
                      <span style={{fontSize:10,color:T.g,fontWeight:800}}>PRATIQUE {ev.outfitRating.practical}/10</span>
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
        {evSh?.mode==="edit"&&<BtnD full c="Supprimer l'événement" onClick={()=>{setEvents(p=>p.filter(e=>e.id!==evSh.id));toast("Supprimé");setEvSh(null);}}/>}
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
          {/* Bouton suggestion locale */}
          <button onClick={suggest}
            style={{width:"100%",background:T.s1,border:`1px solid ${T.l2}`,padding:"12px",fontSize:12,color:T.ink,cursor:"pointer",fontFamily:"inherit",marginBottom:12,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .1s"}}>
            <Ico n="spk" size={13} color={T.ink}/>SUGGESTION TENUE
          </button>
          {aiSug&&(
            <div style={{background:T.ink,padding:"13px 14px",marginBottom:14,animation:"fadeIn .2s ease-out"}}>
              <Label c="Suggestion" style={{color:"rgba(255,255,255,0.32)",marginBottom:8}}/>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.9)",lineHeight:1.65,margin:"0 0 10px"}}>{aiSug}</p>
              <button onClick={()=>setOutF(f=>({...f,outfit:aiSug}))}
                style={{background:"rgba(255,255,255,0.1)",border:"none",padding:"6px 12px",fontSize:10,color:"rgba(255,255,255,0.72)",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",transition:"background .1s"}}>
                UTILISER
              </button>
            </div>
          )}
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
          <BtnP full c="Valider la notation" onClick={saveRate}/>
        </>}
      </Sheet>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GARDE-ROBE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Wardrobe=({wardrobe,setWardrobe,toast})=>{
  const[iSh,setISh]=useState(null);
  const[form,setForm]=useState({});
  const[analysis,setAnalysis]=useState(null);
  const[aSh,setASh]=useState(false);
  const[aLoading,setALoading]=useState(false);
  const[outfits,setOutfits]=useStorage("gq_of",SOF);
  const[oSh,setOSh]=useState(null);
  const[oF,setOF]=useState({name:"",items:[],note:"",rating:5});
  const[sec,setSec]=useState("pieces");
  const[search,setSearch]=useState("");
  const[catFilter,setCatFilter]=useState(null);
  const fRef=useRef();

  const filteredWd=useMemo(()=>{
    let w=wardrobe;
    if(search) w=w.filter(i=>
      i.name.toLowerCase().includes(search.toLowerCase())||
      i.brand.toLowerCase().includes(search.toLowerCase())||
      i.color.toLowerCase().includes(search.toLowerCase())
    );
    if(catFilter) w=w.filter(i=>i.category===catFilter);
    return w;
  },[wardrobe,search,catFilter]);

  const openAdd=()=>{setForm({name:"",brand:"",color:GR_COLS[0],category:CATS[0],scoreCut:7,scoreLike:7,scoreWorn:5,photo:""});setISh("add");};
  const openEdit=item=>{setForm({...item});setISh(item.id);};
  const save=()=>{
    if(!form.name?.trim()){toast("Le nom est obligatoire","err");return;}
    if(iSh==="add")setWardrobe(p=>[...p,{...form,id:Date.now()+""}]);
    else setWardrobe(p=>p.map(w=>w.id===iSh?{...form,id:iSh}:w));
    toast(iSh==="add"?"Vêtement ajouté ✓":"Modifications sauvegardées ✓","g");setISh(null);
  };
  const remove=id=>{setWardrobe(p=>p.filter(w=>w.id!==id));toast("Vêtement supprimé");setISh(null);};
  const onPhoto=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>setForm(f=>({...f,photo:rd.result}));rd.readAsDataURL(f);};

  const openAddO=()=>{setOF({name:"",items:[],note:"",rating:5});setOSh("add");};
  const openEditO=o=>{setOF({...o});setOSh(o.id);};
  const saveO=()=>{
    if(!oF.name?.trim()){toast("Le nom est obligatoire","err");return;}
    if(oSh==="add")setOutfits(p=>[...p,{...oF,id:Date.now()+""}]);
    else setOutfits(p=>p.map(o=>o.id===oSh?{...oF,id:oSh}:o));
    toast("Tenue sauvegardée ✓","g");setOSh(null);
  };
  const removeO=id=>{setOutfits(p=>p.filter(o=>o.id!==id));toast("Tenue supprimée");setOSh(null);};
  const toggleI=name=>setOF(f=>({...f,items:f.items.includes(name)?f.items.filter(x=>x!==name):[...f.items,name]}));

  // Analyse locale — ouvre le sheet immédiatement avec un skeleton de chargement
  const analyze=()=>{
    setAnalysis(null);   // efface l'ancienne analyse
    setALoading(true);
    setASh(true);        // ouvre le sheet IMMÉDIATEMENT
    setTimeout(()=>{
      try{
        const result=LocalAI.analyze(wardrobe);
        setAnalysis(result);
        toast("Analyse générée ✓","g");
      }catch(e){
        toast("Erreur lors de l'analyse","err");
      }finally{
        setALoading(false);
      }
    }, 750);
  };

  const catList=useMemo(()=>CATS.map(cat=>({cat,count:wardrobe.filter(w=>w.category===cat).length})).filter(c=>c.count>0),[wardrobe]);
  const byCat=CATS.map(cat=>({cat,items:filteredWd.filter(w=>w.category===cat),score:analysis?.scores?.[cat]})).filter(g=>g.items.length>0);
  const avgScore=wardrobe.length?Math.round(wardrobe.reduce((a,w)=>(a+(w.scoreLike+w.scoreCut)/2),0)/wardrobe.length*10)/10:0;
  // Pré-calculer le rapport couleurs pour éviter l'IIFE dans le JSX
  const colorRpt=useMemo(()=>analysis?LocalAI.colorReport(wardrobe):"",[analysis,wardrobe]);

  return(
    <div>
      {/* HEADER */}
      <div style={{paddingBottom:18,marginBottom:18,borderBottom:`1px solid ${T.l1}`}}>
        <Title c="Garde-robe" size={28}/>
        <div style={{display:"flex",gap:0,marginTop:16,borderTop:`1px solid ${T.l1}`}}>
          {[[wardrobe.length,"Pièces"],[outfits.length,"Tenues"],[avgScore||"—","Moy. appréc."]].map(([val,label],i)=>(
            <div key={label} style={{flex:1,padding:"12px 0",borderRight:i<2?`1px solid ${T.l1}`:"none",paddingLeft:i>0?16:0}}>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{val}</div>
              <Label c={label} style={{marginTop:4}}/>
            </div>
          ))}
        </div>
      </div>

      {/* CONTRÔLES */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",borderBottom:`2px solid ${T.l1}`,gap:0}}>
          {[["pieces","PIÈCES"],["outfits","TENUES"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setSec(k);setSearch("");setCatFilter(null);}}
              style={{background:"none",border:"none",borderBottom:`2px solid ${sec===k?T.ink:"transparent"}`,marginBottom:-2,padding:"8px 0",paddingRight:16,color:sec===k?T.ink:T.t3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em",transition:"color .12s"}}>{l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <BtnO c={aLoading?"ANALYSE…":"Analyse"} icon="bar" small onClick={analyze} disabled={aLoading}/>
          <BtnP c="Ajouter" icon="pls" small onClick={openAdd}/>
        </div>
      </div>

      {/* PIÈCES */}
      {sec==="pieces"&&<>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher vêtement, marque, couleur…"/>
        {!search&&<CatPills cats={catList} active={catFilter} onSelect={setCatFilter}/>}
        {(search||catFilter)&&(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:11,color:T.t3,fontWeight:600}}>{filteredWd.length} résultat{filteredWd.length!==1?"s":""}</span>
            <button onClick={()=>{setSearch("");setCatFilter(null);}} style={{background:"none",border:"none",fontSize:10,color:T.t3,cursor:"pointer",fontWeight:800,letterSpacing:"0.06em",fontFamily:"inherit",textDecoration:"underline"}}>Tout effacer</button>
          </div>
        )}
        {byCat.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",border:`1px dashed ${T.l1}`}}>
            <Ico n={search?"srch":"hng"} size={26} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:10}}>{search?"Aucun résultat":"Garde-robe vide"}</div>
            {!search&&<button onClick={openAdd} style={{marginTop:14,background:T.ink,border:"none",padding:"9px 20px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:"#fff",fontWeight:700,letterSpacing:"0.06em"}}>+ Ajouter un vêtement</button>}
          </div>
        ):byCat.map(({cat,items,score})=>(
          <div key={cat} style={{marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${T.l1}`}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span style={{fontSize:12,fontWeight:900,letterSpacing:"0.06em",textTransform:"uppercase",color:T.ink}}>{cat}</span>
                <span style={{fontSize:10,color:T.t4,fontWeight:700}}>{items.length}</span>
              </div>
              {score!=null&&<ScoreBadge val={Math.round(score)} small/>}
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
              {items.map(item=>(
                <button key={item.id} onClick={()=>openEdit(item)}
                  style={{flexShrink:0,width:148,background:"none",border:`1px solid ${T.l1}`,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",transition:"border-color .15s,box-shadow .15s"}}>
                  {item.photo
                    ?<img src={item.photo} alt={item.name} style={{width:148,height:185,objectFit:"cover",display:"block"}}/>
                    :<CT color={item.color} h={185} w={148}/>
                  }
                  <div style={{padding:"9px 11px 11px",borderTop:`1px solid ${T.l1}`}}>
                    <div style={{fontSize:12,fontWeight:800,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>{item.brand}</div>
                    {/* Mini score bars */}
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:7,color:T.t4,fontWeight:700,minWidth:28,letterSpacing:"0.04em"}}>COUPE</span>
                        <MiniScoreBar val={item.scoreCut}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:7,color:T.t4,fontWeight:700,minWidth:28,letterSpacing:"0.04em"}}>APPRÉC</span>
                        <MiniScoreBar val={item.scoreLike}/>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <button onClick={openAdd}
                style={{flexShrink:0,width:72,background:"none",border:`1px dashed ${T.l1}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,minHeight:214,color:T.t4,transition:"border-color .15s"}}>
                <Ico n="pls" size={16} color={T.t4} sw={1.4}/>
                <span style={{fontSize:8,fontWeight:800,letterSpacing:"0.1em",color:T.t4}}>AJOUTER</span>
              </button>
            </div>
          </div>
        ))
      }</>}

      {/* TENUES */}
      {sec==="outfits"&&<div>
        <button onClick={openAddO}
          style={{width:"100%",background:"none",border:`1px dashed ${T.l2}`,padding:"13px",color:T.t2,cursor:"pointer",fontSize:11,marginBottom:14,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",transition:"background .1s"}}>
          <Ico n="pls" size={12} color={T.t2}/>CRÉER UNE TENUE
        </button>
        {outfits.length===0&&(
          <div style={{textAlign:"center",padding:"52px 0",border:`1px dashed ${T.l1}`}}>
            <Ico n="lyr" size={22} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:10}}>Aucune tenue créée</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {outfits.map(o=>{
            const cols=o.items.map(nm=>wardrobe.find(w=>w.name===nm)?.color).filter(Boolean);
            return(
              <button key={o.id} onClick={()=>openEditO(o)}
                style={{background:"none",border:`1px solid ${T.l1}`,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",display:"flex",flexDirection:"column",transition:"border-color .15s"}}>
                <div style={{height:5,display:"flex"}}>
                  {cols.slice(0,4).map((c,i)=><div key={i} style={{flex:1,background:COL_HEX[c]||T.s2}}/>)}
                  {!cols.length&&<div style={{flex:1,background:T.s2}}/>}
                </div>
                <div style={{padding:"10px 12px 12px",flex:1}}>
                  <div style={{fontSize:12,fontWeight:900,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,marginBottom:4}}>{o.name}</div>
                  <div style={{fontSize:10,color:T.t3,fontWeight:600,lineHeight:1.55,marginBottom:o.rating?7:0}}>{o.items.slice(0,3).join(" · ")}{o.items.length>3?` +${o.items.length-3}`:""}</div>
                  {o.rating>0&&<ScoreBadge val={o.rating} small/>}
                </div>
              </button>
            );
          })}
        </div>
      </div>}

      {/* SHEET VÊTEMENT */}
      <Sheet open={!!iSh} onClose={()=>setISh(null)} title={iSh==="add"?"Nouveau vêtement":"Modifier le vêtement"} full>
        <Field label="Nom *" value={form.name||""} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Ex: Cargo Ripstop"/>
        <Field label="Marque" value={form.brand||""} onChange={v=>setForm(f=>({...f,brand:v}))} placeholder="Carhartt, Nike…"/>
        <Field label="Catégorie" value={form.category||""} onChange={v=>setForm(f=>({...f,category:v}))} opts={CATS}/>
        <ColorPicker value={form.color||""} onChange={v=>setForm(f=>({...f,color:v}))}/>
        <HR my={4}/>
        <ScoreSlider label="Coupe" val={form.scoreCut||5} onChange={v=>setForm(f=>({...f,scoreCut:v}))}/>
        <ScoreSlider label="Appréciation" val={form.scoreLike||5} onChange={v=>setForm(f=>({...f,scoreLike:v}))}/>
        <ScoreSlider label="Fréquence de port" val={form.scoreWorn||5} onChange={v=>setForm(f=>({...f,scoreWorn:v}))}/>
        <HR my={4}/>
        <div style={{marginBottom:18}}>
          <Label c="Photo" style={{marginBottom:8}}/>
          <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto}/>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <BtnO c="Choisir une photo" onClick={()=>fRef.current?.click()} style={{padding:"9px 16px",fontSize:12}}/>
            {form.photo&&<img src={form.photo} alt="" style={{width:48,height:48,objectFit:"cover",border:`1px solid ${T.l1}`}}/>}
          </div>
        </div>
        <BtnP full c="Sauvegarder" onClick={save}/>
        {iSh!=="add"&&<BtnD full c="Supprimer ce vêtement" onClick={()=>remove(iSh)}/>}
      </Sheet>

      {/* SHEET TENUE — items groupés par catégorie */}
      <Sheet open={!!oSh} onClose={()=>setOSh(null)} title={oSh==="add"?"Créer une tenue":"Modifier la tenue"} full>
        <Field label="Nom de la tenue *" value={oF.name||""} onChange={v=>setOF(f=>({...f,name:v}))} placeholder="Ex: Everyday Minimal"/>
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <Label c={`Pièces · ${oF.items?.length||0} sélectionnée${(oF.items?.length||0)>1?"s":""}`}/>
            {oF.items?.length>0&&(
              <button onClick={()=>setOF(f=>({...f,items:[]}))} style={{background:"none",border:"none",fontSize:9,color:T.r,cursor:"pointer",fontWeight:700,letterSpacing:"0.06em",fontFamily:"inherit"}}>
                TOUT DÉSÉLECT.
              </button>
            )}
          </div>
          <div style={{maxHeight:300,overflowY:"auto",border:`1px solid ${T.l1}`}}>
            {CATS.map(cat=>{
              const its=wardrobe.filter(w=>w.category===cat);
              if(!its.length)return null;
              return(
                <div key={cat}>
                  <div style={{fontSize:8,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:T.t4,padding:"7px 10px",background:T.s1,borderBottom:`1px solid ${T.l1}`}}>{cat}</div>
                  {its.map(item=>{
                    const s=oF.items?.includes(item.name);
                    return(
                      <button key={item.id} onClick={()=>toggleI(item.name)}
                        style={{width:"100%",background:s?T.ink:T.bg,border:"none",borderBottom:`1px solid ${T.l1}`,padding:"9px 11px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:9,transition:"background .08s"}}>
                        <div style={{width:14,height:14,background:COL_HEX[item.color]||T.s2,border:`1px solid ${s?"rgba(255,255,255,0.15)":T.l1}`,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,color:s?"#fff":T.ink,fontWeight:800,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.name}</div>
                          <div style={{fontSize:9,color:s?"rgba(255,255,255,0.42)":T.t3,marginTop:1}}>{item.brand} · {item.color}</div>
                        </div>
                        {s&&<Ico n="chk" size={11} color="rgba(255,255,255,0.6)" sw={2.5}/>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <Field label="Note" value={oF.note||""} onChange={v=>setOF(f=>({...f,note:v}))} placeholder="Occasion, météo, style…"/>
        <ScoreSlider label="Note globale" val={oF.rating||5} onChange={v=>setOF(f=>({...f,rating:v}))}/>
        <BtnP full c="Sauvegarder la tenue" onClick={saveO}/>
        {oSh!=="add"&&<BtnD full c="Supprimer cette tenue" onClick={()=>removeO(oSh)}/>}
      </Sheet>

      {/* SHEET ANALYSE */}
      <Sheet open={aSh} onClose={()=>setASh(false)} title="Rapport garde-robe" full>
        {/* Skeleton de chargement — affiché pendant le calcul */}
        {aLoading&&(
          <div>
            <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"18px 14px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:200,flexDirection:"column",gap:16}}>
                <div style={{display:"flex",gap:5}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:8,height:8,background:T.l2,borderRadius:"50%",animation:`pulse .9s ease-in-out ${i*0.2}s infinite`}}/>
                  ))}
                </div>
                <Label c="Analyse en cours…"/>
              </div>
            </div>
            {[100,80,90,70,85].map((w,i)=>(
              <div key={i} style={{border:`1px solid ${T.l1}`,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <Skel h={11} w={`${w*0.45}%`}/>
                  <Skel h={11} w="18%"/>
                </div>
                <Skel h={9} style={{marginBottom:5}}/>
                <Skel h={9} w={`${w}%`} style={{marginBottom:10}}/>
                <Skel h={2}/>
              </div>
            ))}
          </div>
        )}
        {/* Résultats — affichés une fois l'analyse terminée */}
        {!aLoading&&analysis&&<>
          {/* Spider chart */}
          <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"18px 14px",marginBottom:14}}>
            <Spider scores={analysis.scores}/>
          </div>
          {/* Feedback général */}
          {analysis.feedback&&(
            <div style={{background:T.s1,border:`1px solid ${T.l1}`,padding:"13px 14px",marginBottom:14}}>
              <Label c="Analyse globale" style={{marginBottom:8}}/>
              <p style={{fontSize:13,color:T.t1,lineHeight:1.78,margin:0}}>{analysis.feedback}</p>
            </div>
          )}
          {/* Rapport couleurs — calculé via useMemo, pas d'IIFE */}
          {colorRpt&&(
            <div style={{background:T.bBg,border:`1px solid #BFDBFE`,padding:"13px 14px",marginBottom:14}}>
              <Label c="Palette de couleurs" style={{marginBottom:8,color:T.b}}/>
              <p style={{fontSize:13,color:T.b,lineHeight:1.7,margin:0}}>{colorRpt}</p>
            </div>
          )}
          {/* Détails par catégorie */}
          {Object.entries(analysis.details).map(([cat,text])=>{
            const raw=analysis.scores?.[cat];
            const score=raw!=null?Math.min(10,Math.max(1,Math.round(raw))):null;
            return(
              <div key={cat} style={{border:`1px solid ${T.l1}`,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:12,fontWeight:900,color:T.ink,textTransform:"uppercase",letterSpacing:"0.04em"}}>{cat}</span>
                  {score!=null&&<ScoreBadge val={score}/>}
                </div>
                <p style={{fontSize:12,color:T.t2,lineHeight:1.72,margin:"0 0 10px"}}>{text}</p>
                {score!=null&&(
                  <div style={{height:2,background:T.s3}}>
                    <div style={{width:`${score*10}%`,height:"100%",background:score>=7?T.g:score>=5?T.a:T.r,transition:"width .6s ease-out"}}/>
                  </div>
                )}
              </div>
            );
          })}
          <BtnO full c="Relancer l'analyse" icon="bar" onClick={analyze} style={{marginTop:6}}/>
        </>}
        {/* État vide — si la sheet est ouverte manuellement sans analyse */}
        {!aLoading&&!analysis&&(
          <div style={{textAlign:"center",padding:"56px 0"}}>
            <Ico n="bar" size={22} color={T.t4}/>
            <div style={{fontSize:12,color:T.t3,fontWeight:700,marginTop:10}}>Aucune analyse disponible</div>
            <BtnP c="Lancer l'analyse" icon="bar" onClick={analyze} style={{margin:"16px auto 0"}}/>
          </div>
        )}
      </Sheet>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLE IA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StyleAI=({wardrobe,toast})=>{
  const[recs,setRecs]=useState([]);
  const[recLoading,setRecLoading]=useState(false);
  const[wish,setWish]=useStorage("gq_wl",SWL);
  const[tab,setTab]=useState("recs");
  const[wSh,setWSh]=useState(null);
  const[wF,setWF]=useState({});

  // Génération locale des recommandations — simule un délai de calcul
  const gen=()=>{
    setRecLoading(true);
    setTimeout(()=>{
      setRecs(LocalAI.styleRecs(wardrobe));
      setRecLoading(false);
    }, 700);
  };

  const addR=item=>{
    if(!wish.find(w=>w.name===item.name)){
      setWish(p=>[...p,{...item,id:Date.now()+"",bought:false}]);
      toast("Ajouté à la wishlist ✓","g");
    } else {
      toast("Déjà dans la wishlist");
    }
  };
  const openAdd=()=>{setWF({name:"",category:CATS[0],color:GR_COLS[0],brand:"",price:"",reason:"",bought:false});setWSh("add");};
  const openEdt=item=>{setWF({...item});setWSh(item.id);};
  const saveW=()=>{
    if(!wF.name?.trim()){toast("Le nom est obligatoire","err");return;}
    if(wSh==="add")setWish(p=>[...p,{...wF,id:Date.now()+""}]);
    else setWish(p=>p.map(w=>w.id===wSh?{...wF,id:wSh}:w));
    toast("Wishlist mise à jour ✓","g");setWSh(null);
  };
  const removeW=id=>{setWish(p=>p.filter(w=>w.id!==id));toast("Retiré de la wishlist");setWSh(null);};
  const toggle=id=>{
    const item=wish.find(w=>w.id===id);
    setWish(p=>p.map(w=>w.id===id?{...w,bought:!w.bought}:w));
    toast(item?.bought?"Marqué comme non acheté":"Marqué comme acheté ✓","g");
  };

  const bought=wish.filter(w=>w.bought).length;
  const totalBudget=wish.filter(w=>!w.bought).reduce((s,w)=>s+(parseFloat(w.price)||0),0);

  return(
    <div>
      {/* HEADER */}
      <div style={{paddingBottom:18,marginBottom:18,borderBottom:`1px solid ${T.l1}`}}>
        <Title c="Style IA" size={28}/>
        <div style={{display:"flex",gap:0,marginTop:14,borderTop:`1px solid ${T.l1}`}}>
          {[
            [wish.length,"Articles"],
            [bought,"Achetés"],
            [totalBudget?`${totalBudget}€`:"0€","Budget restant"]
          ].map(([val,label],i)=>(
            <div key={label} style={{flex:1,padding:"12px 0",borderRight:i<2?`1px solid ${T.l1}`:"none",paddingLeft:i>0?14:0}}>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.04em",color:T.ink,lineHeight:1}}>{val}</div>
              <Label c={label} style={{marginTop:4}}/>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",borderBottom:`2px solid ${T.l1}`,marginBottom:18}}>
        {[["recs","RECOMMANDATIONS"],["wish","WISHLIST"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,background:"none",border:"none",borderBottom:`2px solid ${tab===k?T.ink:"transparent"}`,marginBottom:-2,padding:"9px 0",color:tab===k?T.ink:T.t3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.12em",transition:"color .12s"}}>{l}
          </button>
        ))}
      </div>

      {/* RECOMMANDATIONS */}
      {tab==="recs"&&<div>
        <BtnP full c={recLoading?"ANALYSE EN COURS…":"ANALYSER MA GARDE-ROBE"} icon="bar"
          onClick={gen} disabled={recLoading} style={{marginBottom:recs.length?14:16}}/>

        {/* Message contextuel avant la première génération */}
        {!recs.length&&!recLoading&&(
          <div style={{textAlign:"center",padding:"52px 16px",border:`1px dashed ${T.l1}`}}>
            <Ico n="spk" size={22} color={T.t4}/>
            <div style={{fontSize:13,color:T.t2,fontWeight:800,marginTop:14,letterSpacing:"-0.02em"}}>Analyse personnalisée</div>
            <div style={{fontSize:11,color:T.t4,marginTop:6,lineHeight:1.72,maxWidth:240,margin:"8px auto 0"}}>
              L'analyse détecte les lacunes de ta garde-robe et suggère des achats stratégiques.
            </div>
          </div>
        )}

        {recLoading&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[1,2,3,4,5,6].map(i=>(
              <div key={i} style={{border:`1px solid ${T.l1}`,overflow:"hidden"}}>
                <Skel h={120}/>
                <div style={{padding:"10px 11px 12px"}}>
                  <Skel h={10} w="60%" style={{marginBottom:6}}/>
                  <Skel h={9} w="40%" style={{marginBottom:8}}/>
                  <Skel h={9}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {recs.length>0&&!recLoading&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {recs.map((item,i)=>{
              const inW=!!wish.find(w=>w.name===item.name);
              return(
                <div key={i} style={{border:`1px solid ${T.l1}`,overflow:"hidden",animation:`fadeIn .25s ease-out ${i*0.04}s both`}}>
                  <CT color={item.color} h={110}/>
                  <div style={{padding:"10px 11px 12px",borderTop:`1px solid ${T.l1}`}}>
                    {item.priority>=8&&<Tag c="PRIORITÉ" color={T.g} bg={T.gBg}/>}
                    <div style={{fontSize:12,fontWeight:900,color:T.ink,letterSpacing:"-0.02em",lineHeight:1.2,marginTop:item.priority>=8?5:0,marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{item.brand}{item.price&&` · ${item.price}€`}</div>
                    <div style={{fontSize:10,color:T.t2,lineHeight:1.58,marginBottom:9}}>{item.reason}</div>
                    <button onClick={()=>addR(item)} disabled={inW}
                      style={{width:"100%",background:inW?T.gBg:T.ink,border:`1px solid ${inW?T.gBd:T.ink}`,padding:"7px 0",fontSize:9,color:inW?T.g:"#fff",cursor:inW?"default":"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"background .1s"}}>
                      <Ico n={inW?"chk":"pls"} size={10} color={inW?T.g:"#fff"} sw={2.5}/>{inW?"AJOUTÉ":"+ WISHLIST"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>}

      {/* WISHLIST */}
      {tab==="wish"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:T.t2}}>
            {wish.length} ARTICLE{wish.length!==1?"S":""}
            {bought>0&&<span style={{color:T.g,marginLeft:8}}>· {bought} ACHETÉ{bought!==1?"S":""}</span>}
          </div>
          <BtnP c="Ajouter" icon="pls" small onClick={openAdd}/>
        </div>

        {/* Barre de progression wishlist */}
        {wish.length>0&&bought>0&&(
          <div style={{marginBottom:14,padding:"11px 13px",background:T.gBg,border:`1px solid ${T.gBd}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <Label c="Progression" style={{color:T.g}}/>
              <span style={{fontSize:11,color:T.g,fontWeight:900}}>{Math.round(bought/wish.length*100)}%</span>
            </div>
            <div style={{height:3,background:"rgba(20,83,45,0.12)"}}>
              <div style={{width:`${bought/wish.length*100}%`,height:"100%",background:T.g,transition:"width .4s ease-out"}}/>
            </div>
          </div>
        )}

        {wish.length===0&&(
          <div style={{textAlign:"center",padding:"52px 16px",border:`1px dashed ${T.l1}`}}>
            <Ico n="str" size={22} color={T.t4}/>
            <div style={{fontSize:12,color:T.t2,fontWeight:800,marginTop:12}}>Wishlist vide</div>
            <div style={{fontSize:11,color:T.t4,marginTop:5}}>Génère des recommandations ou ajoute des articles manuellement.</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {wish.map(item=>(
            <div key={item.id} style={{border:`1.5px solid ${item.bought?T.gBd:T.l1}`,overflow:"hidden",opacity:item.bought?.65:1,transition:"opacity .2s,border-color .2s"}}>
              <div onClick={()=>openEdt(item)} style={{cursor:"pointer"}}>
                <CT color={item.color} h={96}>
                  {item.bought&&<span style={{background:T.g,padding:"3px 10px",fontSize:8,color:"#fff",fontWeight:800,letterSpacing:"0.14em"}}>ACHETÉ</span>}
                </CT>
              </div>
              <div style={{padding:"9px 11px 12px",borderTop:`1px solid ${T.l1}`}}>
                <div onClick={()=>openEdt(item)} style={{fontSize:12,fontWeight:900,color:T.ink,textDecoration:item.bought?"line-through":"none",letterSpacing:"-0.02em",lineHeight:1.2,cursor:"pointer",marginBottom:2}}>{item.name}</div>
                <div style={{fontSize:9,color:T.t3,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:item.price?3:8}}>{item.brand}</div>
                {item.price&&<div style={{fontSize:14,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-0.02em"}}>{item.price}€</div>}
                <button onClick={()=>toggle(item.id)}
                  style={{width:"100%",background:item.bought?T.gBg:T.ink,border:`1px solid ${item.bought?T.gBd:T.ink}`,padding:"7px 0",fontSize:9,color:item.bought?T.g:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"background .1s"}}>
                  <Ico n="chk" size={10} color={item.bought?T.g:"#fff"} sw={2.5}/>{item.bought?"DÉMARQUER":"MARQUER ACHETÉ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* SHEET WISHLIST */}
      <Sheet open={!!wSh} onClose={()=>setWSh(null)} title={wSh==="add"?"Ajouter à la wishlist":"Modifier l'article"} full>
        <Field label="Nom *" value={wF.name||""} onChange={v=>setWF(f=>({...f,name:v}))} placeholder="Ex: Bomber satin noir"/>
        <Field label="Catégorie" value={wF.category||""} onChange={v=>setWF(f=>({...f,category:v}))} opts={CATS}/>
        <ColorPicker value={wF.color||""} onChange={v=>setWF(f=>({...f,color:v}))}/>
        <Field label="Marque" value={wF.brand||""} onChange={v=>setWF(f=>({...f,brand:v}))} placeholder="Nike, Carhartt…"/>
        <Field label="Budget (€)" value={wF.price||""} onChange={v=>setWF(f=>({...f,price:v.replace(/[^0-9]/g,"")}))} placeholder="80"/>
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
  const[toasts,toast]=useToast();

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
        @keyframes toastIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
        button{transition:opacity .1s,transform .08s;}
        button:active:not(:disabled){opacity:.6!important;transform:scale(.97)!important;}
        select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%238A8A8A' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;}
      `}</style>

      <div style={{height:"env(safe-area-inset-top,44px)",background:T.bg}}/>

      {/* En-tête */}
      <header style={{height:48,padding:"0 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.l1}`,background:T.bg,position:"sticky",top:"env(safe-area-inset-top,0px)",zIndex:20}}>
        <span style={{fontSize:15,fontWeight:900,letterSpacing:"0.06em",color:T.ink,textTransform:"uppercase"}}>GRISCH</span>
        <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.14em",color:T.t4}}>{wardrobe.length} PIÈCES</span>
      </header>

      {/* Contenu */}
      <main style={{padding:"20px 18px",paddingBottom:90,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {tab===0&&<Planning wardrobe={wardrobe} toast={toast}/>}
        {tab===1&&<Wardrobe wardrobe={wardrobe} setWardrobe={setWardrobe} toast={toast}/>}
        {tab===2&&<StyleAI wardrobe={wardrobe} toast={toast}/>}
      </main>

      {/* Toasts */}
      <Toasts toasts={toasts}/>

      {/* Navigation bas */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.bg,borderTop:`1px solid ${T.l1}`,paddingBottom:"env(safe-area-inset-bottom,12px)",zIndex:50}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
          {NAV.map((t,i)=>{
            const on=tab===i;
            return(
              <button key={i} onClick={()=>setTab(i)}
                style={{background:"none",border:"none",cursor:"pointer",padding:"12px 8px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"inherit",position:"relative",transition:"none"}}>
                {on&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:T.ink,borderRadius:0}}/>}
                <Ico n={t.i} size={20} color={on?T.ink:T.t4} sw={on?2.2:1.6}/>
                <span style={{fontSize:8,letterSpacing:"0.14em",fontWeight:on?900:600,color:on?T.ink:T.t4,textTransform:"uppercase"}}>{t.l}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}