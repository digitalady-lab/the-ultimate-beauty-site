// /arcelemzes — AJÁNLÁSI SZABÁLYOK + arányszámítás (tiszta függvények, DOM nélkül → tests/arcelemzes-rules.test.mjs)
// ORVOSI JÓVÁHAGYÁS: a zóna → Protocol hozzárendelést és a döntetlen-sorrendet az orvosnak kell hitelesítenie.
// Módosítás csak itt; a tesztek (npm-mentes: `node --test tests/*.test.mjs`) azonnal jelzik, ha valami elromlik.

// Zónák: arcpont-indexek (MediaPipe 468-pontos háló) → ajánlott Protocol
export const ZONES = {
  homlok:      { label:'Homlokráncok',               pts:[108, 337],      proto:'anti' },
  glabella:    { label:'Szemöldökközi „mérges” ránc', pts:[9],        proto:'anti' },
  szemkornyek: { label:'Fáradt tekintet, karikák',    pts:[230, 450], proto:'hialuron' },
  kozeparc:    { label:'Volumenvesztés az arccsontnál', pts:[50, 280], proto:'hialuron' },
  nasolabialis:{ label:'Orr-száj redő',               pts:[206, 426], proto:'hialuron' },
  ajkak:       { label:'Ajkak, szájzug',              pts:[0],        proto:'hialuron' },
  allkapocs:   { label:'Állkapocsvonal, megereszkedés', pts:[172, 397, 152], proto:'lifting' },
  borminoseg:  { label:'Bőrtextúra, pórusok, tónus',  pts:[],         proto:'borminoseg' }
};
export const PROTOS = {
  anti:       { title:'Anti-aging Komplex', proto:'Nem egyetlen kezelés, hanem rendszer', sub:'Koordinált öregedésgátló rendszer: Botox, biostimulátorok, ULTIMA HILEFT és LED Mask — egy orvos felügyeletével.', r:['Szöveti előkészítés','Célzott orvosi kezelések','Regeneráció és karbantartás'], href:'/protocol-anti-aging-komplex' },
  hialuron:   { title:'Hialuronsav Szinergia', proto:'Jobb integrálódás, természetesebb eredmény, hosszabb tartósság', sub:'Hialuronsavas kezelések hatékonyságának fokozása ULTIMA HILEFT szövet-előkészítéssel.', r:['Szöveti előkészítés','Hialuronsavas kezelés','Regeneráció és stabilizáció'], href:'/protocol-hialuronsav-szinergia' },
  lifting:    { title:'ULTIMA Face Lifting', proto:'Műtét nélküli arcfeszesítés — orvosi kontroll mellett', sub:'Az állkapocsvonal és az arckontúr feszesítése ULTIMA technológiával, a természetes arcvonásaid megtartásával.', r:['Diagnózis + Prepare','ULTIMA Face kezeléssorozat','Stabilizáció és karbantartás'], href:'/kezeles-ultima-face' },
  borminoseg: { title:'Bőrminőség Javítás', proto:'Observ 520x diagnosztikára épülő program', sub:'Textúra, tónus, fényesség javítása HILEFT stimulációval és otthoni LED Mask karbantartással.', r:['Diagnózis + Prepare','Célzott stimulációs kezelések','LED Mask otthoni program + rendszeres kontroll'], href:'/protocol-borminoseg-javitas' }
};

// Döntetlennél ez a sorrend dönt (az első nyer)
export const TIE_ORDER = ['lifting', 'anti', 'hialuron', 'borminoseg'];

// A megjelölt zónák → ajánlott Protocol kulcsa (többségi szavazás; döntetlennél TIE_ORDER). Üres/ismeretlen bemenetre null.
export function recommend(zones){
  const votes = {};
  for (const k of zones) { const z = ZONES[k]; if (z) votes[z.proto] = (votes[z.proto] || 0) + 1; }
  let best = null;
  for (const p of TIE_ORDER) if ((votes[p] || 0) > (best ? votes[best] : 0)) best = p;
  return best;
}

// Geometriai arány — tájékoztató, NEM szépségpontszám és nem orvosi diagnózis.
// Csak a tesztben stabilnak bizonyult mérés marad (archarmadok: ±5% tükrözés/méret/fény mellett, tests/arcelemzes.e2e.mjs).
// A szimmetria-% és az ajakarány KIVEZETVE: a fejtartástól függően 10%+ szórás, félrevezető lett volna a vendégnek.
export function measure(lm, W, H){
  const P = (i) => ({ x: lm[i].x * W, y: lm[i].y * H });
  const d = (a, b) => Math.hypot(P(a).x - P(b).x, P(a).y - P(b).y);
  const yaw = (P(1).x - P(234).x) / (P(454).x - P(234).x); // orrhegy helye a két arcél között: 0,5 = szemből
  return {
    thirds: d(2, 152) / d(9, 2), // alsó (orr alja → áll) / középső (szemöldökköz → orr alja) archarmad
    frontal: yaw > .38 && yaw < .62
  };
}

// Heni szakmai videói (assets/videos/heni) — NEM orvosi szabály, csak tartalom-hozzárendelés: melyik zónához melyik magyarázó videó illik.
// A 4. (férfiak) és 6. (homlokránc) rész még hiányzik (a forrás privát) — ha megjön, ide kell felvenni.
const V = (id) => ({ src: `/assets/videos/heni/heni-${id}.mp4`, poster: `/assets/videos/heni/heni-${id}.jpg` });
export const VIDEOS = {
  intro:    { ...V('1-ami-teged-zavar'),        title: 'Miért azzal kezdjük, ami téged zavar' },
  szembor:  { ...V('2-szem-koruli-bor'),        title: 'A szem körüli bőr: más probléma, más kezelés' },
  halantek: { ...V('3-halantek-szemoldok'),     title: 'Halánték és szemöldök: amikor a bőr lejjebb ereszkedik' },
  vitaran:  { ...V('5-vitaran-szemkornyek'),    title: 'Szemkörnyéki skinboosterek, például a Vitaran' },
  tekintet: { ...V('7-szomoru-tekintet'),       title: '„Szomorú tekintet”: a szemöldök megtartása' }
};
export const ZONE_VIDEOS = {
  szemkornyek: ['szembor', 'vitaran', 'tekintet', 'halantek'],
  kozeparc:    ['halantek'],
  borminoseg:  ['vitaran']
};

// A megjelölt zónák sorrendjében legfeljebb `max` videó, ismétlés nélkül; ha egyik zónához sincs, Heni bevezetője.
export function videosFor(zones, max = 2){
  const out = [];
  for (const z of zones) for (const id of ZONE_VIDEOS[z] || []) if (!out.includes(id) && out.length < max) out.push(id);
  return out.length ? out : ['intro'];
}
