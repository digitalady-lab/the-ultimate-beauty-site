# Wix → Netlify költözés: SEO-helyreállítás

A helyezések azért nullázódtak, mert a régi, Google által már indexelt Wix
URL-ek a költözés után **404-et adtak 301 helyett** (pl. `/contact-4`). A 404
azt üzeni a Google-nek, hogy az oldal megszűnt: a hozzá tartozó linkerő,
kattintási előzmény és domain-előélet nem kerül át az új oldalra, a domain
gyakorlatilag új, ismeretlen honlapként indul újra.

A javítás lényege, hogy **minden régi URL 301-es (végleges) átirányítást
kapjon** a legközelebbi tartalmi megfelelőjére.

---

## 1. Mi került be

| Fájl | Szerep |
|---|---|
| `_redirects` | A Netlify átirányítás-térképe. **Minden új szabály ide kerül.** |
| `netlify.toml` | HTTP-fejlécek (cache, `noindex` a belső sablonokra). Átirányítást szándékosan nem tartalmaz. |
| `vercel.json` | Ugyanaz a szabálykészlet Vercel-formátumban, hogy a két platform ne csússzon szét. |
| `404.html` | Valódi, márkahű 404 oldal oldaltérképpel; hasonló útvonalnál javaslatot ajánl. |
| `sitemap.xml` | Csak kanonikus, kiterjesztés nélküli URL-ek. |
| `manifest.json` | A `/kviz` eddig nem létező manifestre hivatkozott (404 minden betöltéskor). |

Ezen felül:

- **Domain-kanonizálás** – a `www.theultimatebeauty.net` 301-gyel a csupasz
  domainre megy. Eddig mindkét alak indexelve volt, ami kettéosztotta a linkerőt.
- **`.html` → kiterjesztés nélküli URL** – mindkét alak kiszolgálható volt,
  vagyis minden oldal két URL-en élt (duplikált tartalom). A kiterjesztés
  nélküli alak a kanonikus, a `.html` 301-gyel oda mutat.
- **Egységes `canonical` és `og:url`** – korábban vegyesen `.html`-es és tiszta
  URL-re mutattak. A `/hileft`, `/mask`, `/observ`, `/program` és `/protocol`
  `og:url`-je ráadásul a **főoldalra** mutatott (az SPA-szétszedés maradványa),
  így megosztáskor a közösségi platformok a főoldalnak tulajdonították őket.
- **548 belső hivatkozás** átírva kiterjesztés nélküli alakra, hogy a saját
  navigációnk ne redirecten keresztül vezessen (a felesleges ugrás lassít és
  a crawl-büdzsét pazarolja).
- **Megszűnt belső 404-ek** – a `/kviz` navigációja még el nem készült
  oldalakra mutatott (`/konzultacio`, `/kezelesek`, `/megoldas…`); ezek ideiglenes
  **302**-vel a legközelebbi létező tartalomra mennek. A `/klinika#filozofia`,
  `#orvosaink`, `#galeria` horgonyok is hiányoztak — pótolva.

---

## 2. A maradék régi Wix URL-ek pótlása — ezt neked kell megtenned

A `_redirects` 2. szekciója a **megerősített `/contact-4`-et** és a Wix
sablonok szokásos slug-készletét fedi le. A valódi, teljes listát viszont csak
a saját adataidból lehet kinyerni:

1. **Google Search Console** (a leggyorsabb és legpontosabb)
   - *Indexelés → Oldalak → „Nem található (404)"* — itt van feketén-fehéren,
     melyik régi URL-t hívja még mindig a Google.
   - *Teljesítmény → Oldalak*, tartomány: a költözés előtti 12 hónap —
     ezek hozták a forgalmat, ezeket kell elsőként átirányítani.
   - Exportáld CSV-be, és minden sorhoz keresd meg az új megfelelőt.

2. **A régi Wix sitemap** — ha megvan a Wix-fiók, a
   `https://<régi-wix-cím>/sitemap.xml` még lekérhető, vagy a
   [web.archive.org](https://web.archive.org/) mentéseiben megtalálod.

3. **Bing Webmester eszközök** és bármilyen SEO-eszköz (Ahrefs / SEMrush)
   „Top pages" / „Best by links" riportja — ezek mutatják, melyik régi URL-re
   mutatnak külső linkek. Ezek a legértékesebbek.

4. **Netlify Analytics** → *Top resources not found* — élő 404-lista a valódi
   látogatói kérésekből.

Új szabály felvétele a `_redirects` fájlba, a 2. szekcióba:

```
/regi-wix-url        /uj-oldal        301
```

Szabályok:

- **Tartalmilag legközelebbi oldalra irányíts**, ne mindent a főoldalra.
  A tömeges főoldalra-irányítást a Google „soft 404"-ként kezeli, és a
  linkerő nagy részét eldobja.
- **301**, ha a változás végleges; **302** csak akkor, ha az új oldal még
  készül, és később a helyére kerül.
- Ne építs láncot (A→B→C). Mindig a **végleges** célra mutass.
- A sorrend számít: az első illeszkedő szabály nyer.

---

## 3. Ellenőrzés élesítés után

```bash
# Egy URL ellenőrzése — 301-et és helyes Location-t kell látni
curl -sSI https://theultimatebeauty.net/contact-4 | grep -iE '^(HTTP|location)'

# A teljes _redirects térkép végigpörgetése
./scripts/check-redirects.sh
```

Elvárt eredmény:

- `/contact-4` → `301`, `Location: /#home-contact`
- `/klinika.html` → `301`, `Location: /klinika`
- `https://www.theultimatebeauty.net/` → `301` a csupasz domainre
- Egy tényleg nem létező URL → `404` (és a szép 404 oldal), nem átirányítás

Ezután a Search Console-ban:

1. Küldd be újra a `sitemap.xml`-t.
2. Az *URL-ellenőrzés* eszközben kérj újraindexelést a legfontosabb oldalakra.
3. A *Nem található (404)* riportnál nyomj *Javítás ellenőrzése* gombot.
4. A helyreállás jellemzően **4–8 hét**; a 404-ek eltűnése viszont napokon
   belül látszik.

> Címváltoztatás (*Change of Address*) eszközre **nincs szükség**: a domain
> nem változott, csak a tárhely és az URL-struktúra.

---

## 4. Ami még hátravan (tartalmi döntést igényel)

Ezek már nem technikai hibák, hanem üzleti döntések — ezért nem nyúltam hozzájuk:

1. **Kulcsszó-kannibalizáció.** Ugyanarra a témára két-két oldal él:

   | Régi | Új |
   |---|---|
   | `/technologia-hileft` | `/hileft` |
   | `/technologia-observ` | `/observ` |
   | `/technologia-led-mask` | `/mask` |
   | `/protocol-hub` | `/protocol` |
   | `/clinical-program` | `/program` |

   A Google-nek el kell döntenie, melyiket rangsorolja — jellemzően egyiket sem
   jól. A `/kviz` forráskódjában lévő megjegyzés szerint a `/protocol-hub`
   kivezetése már eldöntött (`301 → /protocol`), de a menü 86 helyen még a régi
   oldalra mutat. **Amíg a két navigáció párhuzamosan él, nem irányítottam át:**
   előbb el kell dönteni, melyik oldalstruktúra marad. Utána a régi → új 301
   egyetlen sor a `_redirects`-ben.

2. **Helyre utaló kulcsszavak.** A régi `technologia-*` oldalak címei erősebbek
   voltak lokális SEO szempontból („Budapest", „12. kerület", „Tű Nélkül").
   Összevonáskor ezeket a megmaradó oldal `<title>`-jébe és leírásába érdemes
   átmenteni.

3. **A tervezett oldalak megépítése.** A `_redirects` 3. szekciójában 13 db
   **302** van olyan URL-re, amelyre már hivatkozunk, de még nincs oldal
   (`/konzultacio`, `/kezelesek`, `/megoldas…`, `/arak`, `/technologia`).
   Ahogy egy oldal elkészül, a hozzá tartozó sort **törölni kell** a
   `_redirects`-ből.
