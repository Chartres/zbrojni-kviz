# Competition research: Zbrojní kvíz (October 2026)

Date of research: 2026-10-27. All prices, ratings and counts were seen on that date unless noted otherwise.
"Not found" means it could not be confirmed from a public page. Nothing here is estimated.

Reference: the correct exam under zákon 90/2024 Sb. § 20(3)(a) and NV 238/2025 Sb. § 12 is
30 questions, 40 minutes, pass at 26 or more (28 or more for rozšířené ZO), drawn as
17 law + 5 weapons science + 5 safe handling + 3 first aid. The current MV ČR question file
is valid from 1 Jan 2026 and has 837 questions (MV version dated 15 Dec 2025).

## Summary

- Two free web trainers now do almost everything we do: **testynazbrojniopravneni.cz**
  (FSRS spaced repetition, explanations, law text built in, offline download, exam
  composition per NV 238/2025 § 12) and **zbrojak-2026.github.io** (837 questions with
  explanations and § citations, 30/40/26|28, spaced repetition, offline, no ads, no
  registration, sync). Both appeared or matured in late 2025 / autumn 2026. Our "free,
  offline, no ads, spaced repetition" pitch is no longer unique.
- The most-reviewed Android app (Martin Roubec, "Zbrojní průkaz - testy", 4.7 from 1.95k
  reviews, 50k+ installs) **was last updated 20 Jan 2021 with the 2021 question set**. It
  still ranks and still gets installed. People studying from it are learning the wrong set.
- The only printed guide in sale (Wolters Kluwer / Sagit, 599 Kč) still uses the
  **2021 set (valid from 30 Jan 2021)**. No 2026 book was found.
- Paid apps carry recurring complaints: wrong answer keys (q. 447 is reported wrong in two
  separate apps), progress lost when the app closes, no law-paragraph view, online-only
  despite the price, and pay-again for the 2026 set.
- Courses are a different market (practical part, 1 700–9 900 Kč). They do not compete on
  theory drilling but could be a distribution channel.
- MV ČR publishes the question file only. No official app, no explanations, no mock exam
  were found on mv.gov.cz.

## Competitors

### 1. testynazbrojniopravneni.cz (web, PWA)

- URL: https://testynazbrojniopravneni.cz/
- Price and model: free ("Offline příprava zdarma" in the meta description). No payment
  screen or ads found in the app bundle. Operator: not named ("Testy na zbrojní oprávnění").
- Audience: ZO and RO applicants, mobile and desktop.
- Does well (from the page metadata and the shipped JS bundle, inspected 2026-10-27):
  - "837 oficiálních testových otázek", 2026 rules (90/2024, 238/2025 in keywords).
  - Exam mode "Simulace testu na 40 minut s historií výsledků"; result chart marks
    "základní - 26 b" and "rozšířené - 28 b"; a screen titled
    "Složení testu dle nařízení vlády č. 238/2025 Sb. (§ 12)" linking to the regulation.
  - Explanations ("Otázek s vysvětlením") and question images ("Obrázků") counted in-app.
  - Spaced repetition using an FSRS scheduler (FSRS-6 parameters in the bundle), with
    buckets "Nové / Učím se / K opakování / Slabá místa / Naučené".
  - Built-in law browser with search ("Hledat např. 90/2024 §12 nebo bezpečná manipulace"),
    law texts cached for offline use; explicit "Stáhnout pro offline používání" button
    stores questions and explanations in IndexedDB.
  - Guest mode plus optional account (email or Google sign-in).
- Does badly: no reviews or forum mentions found. SPA with no server-rendered content: the
  homepage returns only a `<title>` to non-JS clients, so per-question SEO is weak.
- Checklist: 2026 set yes; exam format yes (40 min, 26/28, § 12 composition); explanations
  yes; law citations yes (integrated law text); images yes; offline yes (manual download);
  spaced repetition yes (FSRS); ads none seen; registration optional; mobile app no (PWA).

### 2. Zbroják 2026 (zbrojak-2026.github.io)

- URL: https://zbrojak-2026.github.io/ , repo https://github.com/zbrojak-2026/zbrojak-2026.github.io
  (created 2026-10-10, last push 2026-10-13, 0 stars).
- Price and model: free, open source, GitHub Pages.
- Audience: ZO and RO applicants on phone.
- Does well:
  - "všech 837 oficiálních testových otázek Ministerstva vnitra ČR ve verzi z 15. 12. 2025".
  - "ke každé otázce vysvětlení s odkazem na předpis"; glossary of 119 terms; inline SVG
    diagrams (cartridge cross-section, rimfire/centrefire, bore types, sight picture);
    practical-part procedures per NV 238/2025.
  - Mock exam 30 questions / 40 min, pass 26 / 28 (code comment cites § 20 odst. 3 zákona
    č. 90/2024 Sb.). Composition coded as `{pravo:17, nauka:10, zdravi:3}` - law 17 and
    first aid 3 are right, weapons science and safe handling are pooled as 10 rather than
    5 + 5.
  - Spaced repetition, offline after first load, no ads, no registration, cross-device sync.
- Does badly: two weeks old, no reviews, no visible traction. Single HTML page, so no
  per-topic landing pages for search.
- Checklist: 2026 set yes; exam format mostly (5+5 pooled); explanations yes; law citations
  yes; images yes (diagrams; official question images not confirmed); offline yes; spaced
  repetition yes; ads none; registration none; mobile app no; price free.

### 3. ZbraněKvalitně.cz trainer (web)

- URL: https://www.zbranekvalitne.cz/zbrojni-prukaz/testove-otazky (list),
  .../testove-otazky/trenink, .../testove-otazky/test-nanecisto. Operator: ZbraněKvalitně.cz
  team / CZECHNOLOGY, site since 2005.
- Price and model: free, donations ("Chcete nás podpořit?"); no ads seen on the pages read.
- Audience: the largest Czech gun community; long-standing default answer on forums.
- Does well: version switch "Verze 2026/1/1 - Platná od 1. ledna 2026" next to
  "Verze 2021/1/30"; full list of 837 questions (561 + 48 + 39 + 151 + 38 by part) with
  "Zvýraznit správné odpovědi" / "Zobrazit klíč"; trainer shows Postup / Úspěšnost /
  Správně / Špatně stats and a per-question "% z pokusů najít v zákoně". Its answer key is
  what users cite when they dispute app answers (Play review on NEPLUS, 2026-04-25).
- Does badly: mock exam shows 30 questions but no time limit and no numeric pass mark
  ("Hodnocení: prospěl - neprospěl"); no explanations; no spaced repetition. On
  2026-10-27 the forum returned "Stránka je dočasně nedostupná - Web ZbraněKvalitně.cz
  právě převádíme na novou verzi" and the old trainer URLs /zbrojni-prukaz/trenink and
  /test-nanecisto returned 404. The site is mid-migration.
- Android app "Zbrojní průkaz od ZbraněKvalitně.cz - testy 2021" exists per a mirror listing
  (https://zbranekvalitne-zbrojniprukaz.andro.io/); current Play status not found.
- Checklist: 2026 set yes (selectable, 2021 still offered); exam format partial (30 q, no
  timer/pass mark shown); explanations no; law citations no (law text separately on site);
  images not found; offline not found; spaced repetition no; ads none seen; registration
  not needed; mobile app 2021 only; price free.

### 4. ZBRANĚ.cz (web)

- URL: https://www.zbrane.cz/zbrojni-opravneni/testove-otazky ,
  .../procvicovani-otazek , .../zkusit-test
- Price and model: free, ad-funded (banners marked "reklama": ARMED.cz, madacz.cz, ProArms,
  a video-course banner "Videokurzy na Zbrojní oprávnění").
- Audience: general gun-shop / news audience.
- Does well: mock exam states the format exactly: "30 testových otázek", "Na zodpovězení
  otázek je 40 minut", "obecného zbrojního oprávnění je 26, pro získání rozšířeného ...
  28 bodů", auto-submit at 40 min, pausable timer. Practice of 837 questions by five parts;
  "nesprávně zodpovězené otázky se zobrazují častěji" (simple weighted repetition).
- Does badly: does not state which question-set version it uses (837 total implies 2026);
  topic composition of the mock test not stated; no explanations; ads.
- Checklist: 2026 set probably (837 q, version not stated); exam format yes (30/40/26|28,
  composition not stated); explanations no; law citations no; images not found; offline no;
  spaced repetition basic weighting; ads yes; registration optional (free); mobile app no;
  price free.

### 5. testy-zbrojni-prukaz.cz (web, freemium)

- URL: https://testy-zbrojni-prukaz.cz/ , contact j2m.apps@gmail.com
- Price and model: freemium. "Free version includes 200 questions", 837 after unlocking,
  registration required for full version. Unlock price: not found.
- Does well: states the law change ("Od ledna 2026 vstoupil v platnost nový zákon o zbraních
  a střelivu 90/2024 Sb."), links e-sbirka.cz and the MV set of 15 Dec 2025; flashcard-style
  repetition; "Simulace ostrého testu v časovém limitu".
- Does badly: paywall on 637 of 837 questions; exam length / pass mark not stated;
  explanations not mentioned; offline not mentioned.
- Checklist: 2026 set yes; exam format not stated; explanations not found; law citations
  links to the law only; images not found; offline not found; spaced repetition flashcards;
  ads not found; registration required for full set; mobile app no; price not found.

### 6. ZbrojakTest.cz (web)

- URL: https://zbrojaktest.cz/
- Price and model: free ("837 zkušebních otázek zdarma"); Google Tag Manager on page;
  ads not confirmed.
- Content is client-rendered and its scripts did not load for a non-browser fetch, so
  version, exam format, explanations and the rest are **not found**. Disclaimer: "Tento web
  není oficiálním zdrojem."

### 7. "Zbrojní průkaz - testy" by Martin Roubec (Android) - outdated

- URL: https://play.google.com/store/apps/details?id=cz.zbrojniprukaztesty.zbrojniprukaz ,
  web http://www.zbrojniprukaz-testy.cz/
- Price and model: free. Rating 4.7 from 1,946 ratings (1.95k reviews), 50,000+ installs
  (79,395 per Play data). First released 31 Oct 2012.
- **Last updated 20 Jan 2021**, release note "nová databáze testovacích otázek platná od
  30.1.2021". It does not have the 2026 set.
- Reviews: "Pozor, obsahuje neaktuální znění zákona o zbraních" (5*, 2022-12-04);
  "aplikace mi stále dokola hlásí, že přestala pracovat a musím ji pořád restartovat"
  (2*, 2025-12-08); "když vypnu aplikaci, tak se zresetuje testování všech otázek"
  (4*, 2020-10-15).
- Checklist: 2026 set no; exam format old (2021 rules); explanations no; law citations
  outdated law text; images yes (picture questions mentioned in reviews); offline yes;
  spaced repetition no (repeats wrong answers); ads not found; registration no; mobile app
  Android; price free.

### 8. "Zbrojní oprávnění 2026 - testy" by NEPLUS, s.r.o. (iOS + Android + web)

- URLs: https://apps.apple.com/cz/app/id1458005092 ,
  https://play.google.com/store/apps/details?id=cz.etesty.zbrojni_prukaz ,
  web https://zbrojni-prukaz.etesty.cz
- Price and model: freemium, one-off IAP per permit type. iOS CZ: "Obecné/Rozšířené zbrojní
  oprávnění" 79 Kč; groups A-E 49 Kč; Zkušební komisař 49 Kč; Pyrotechnický průzkum and
  Vyšší muniční průkaz 149 Kč each. Google Play IAP range up to 149,99-199,99 Kč (exact
  items not visible). Developer says purchase is one-off, not subscription.
- Ratings: iOS CZ 4.8 from 556 ratings; Google Play 3.7 (3.65) from 545 ratings,
  50,000+ installs (69,553). Last update: Android 2 Sep 2026; iOS version 3.2 (13 Feb).
- Claims "kompletní sada 837 aktuálních otázek", "čistě offline verze", mock "reálného
  testu nanečisto". Covers other exams (munice, komisař) too.
- Complaints: "Otázka č.447 je po více než půl roce stále špatně a to je aplikace placená.
  Jiné aplikace zdarma mají otázky v pořádku." (1*, Play, 2026-08-12); iOS "Mate spatnou
  verzi spravnych odpovedi, otazka 447 ma byt PO."; "Pokud zavřete aplikaci, aplikace si
  nepamatuje otázky, které jste prošli ... Zobrazení ustanovení zákonů ... není vůbec k
  dispozici." (2*, 2026-08-23); "verze v 836 otázkami je špatná" (1*, 2026-02-01); paying
  again for the 2026 set: "si mám ZNOVU zaplatit dalších 100kč" (3*, 2025-12-09).
- Checklist: 2026 set yes (accuracy disputed); exam format claimed, not verified;
  explanations no (only highlighted answers); law citations no; images not found; offline
  yes; spaced repetition no (users ask for it); ads not found; registration no; mobile app
  yes; price 79 Kč one-off (iOS).

### 9. "Zbrojní oprávnění 2026" by Filip Melik (iOS)

- URL: https://apps.apple.com/cz/app/id1103623494
- Price and model: free + "Plná verze Zbrojní průkaz+" 79 Kč. Rating 4.9 from 4.8k ratings
  (CZ store) - the most-rated iOS app. Last update 3.9 on 17 Dec 2025; 3.8 (5 Nov 2025)
  added switching to the older set.
- Claims "aktuální otázky pro rok 2026", offline after first launch, daily update check,
  mock test with "stejná kritéria jako u skutečné zkoušky" (format details not stated).
- Complaints: "Only 419 questions. In total there should be over 800" (date shown as 12 May,
  year not shown); "jakmile bude mít podporu novely zákona platného od 1.1. 2026, dám určitě
  5h" (2025-10-16).
- Checklist: 2026 set yes; exam format claimed, not verified; explanations no; law citations
  no; images not found; offline yes; spaced repetition no; ads not found; registration no;
  mobile app iOS; price 79 Kč one-off.

### 10. "Zbrojní oprávnění - 2026" by Jaroslav Janda (iOS)

- URL: https://apps.apple.com/cz/app/id6738841195
- Price and model: freemium with subscription and lifetime tiers: "Měsíční Premium"
  49 / 129 Kč, "Doživotní Premium" 79 / 129 / 299 Kč, "Zbrojní průkaz - PRO" 49 / 79 / 99 Kč.
- Rating 4.9 from 443 ratings (CZ). Very active: last update 1.5.11 (25 Aug), 2026 set
  added in 1.3.11 (17 Oct 2025), law browser with search since 1.3.8, dark mode.
- Claims offline, official MV questions, test "dle pravidel skutečné zkoušky" with error
  summary; ZO and RO groups from 01/2026.
- Complaint: question-section stats counted first choice as wrong even after correction
  (2025-02-19). Reviews otherwise positive on design.
- Checklist: 2026 set yes; exam format claimed, not verified; explanations not claimed; law
  citations law browser (not per question, not confirmed); images yes (image download
  optimisation in 1.5.0); offline yes; spaced repetition not found; ads not found;
  registration not found; mobile app iOS; price 49-299 Kč.

### 11. "Zbrojní Průkaz ČR - testy 2026" / "Zbrojní oprávnění - testy 2026" by Lukas Hrdlicka (Android + iOS)

- URLs: https://play.google.com/store/apps/details?id=com.zbrojniprukaz ,
  https://apps.apple.com/cz/app/id6478442232
- Price and model: freemium; iOS "Plná verze" 179 Kč; Play IAP up to 179 Kč.
- Ratings: Play 4.2 from 35 ratings, 10,000+ installs (14,770), updated 20 Oct 2026;
  iOS 4.0 from 4 ratings.
- Complaints: "NEFUNKČNÍ BEZ INTERNETU!? Nejde složit test jen z označených ... Při zkoušce
  se nejde vrátit k předchozí odpovědi" (2*, 2025-08-28); "nahodne meni poradi odpovedi"
  and "apka nefunguje bez pristupu k internetu" (3*, 2025-11-06); "Mohu se zeptat zda jsou
  otázky skutečně aktualizované podle nového zákona od roku 2026?" (2026-03-24); wrong key
  on q. 158 (3*, 2024-12-10).
- Checklist: 2026 set claimed (unclear to users); exam format not stated; explanations not
  found; law citations no; images not found; offline no (per reviews); spaced repetition
  no; ads not found; registration not found; mobile app yes; price 179 Kč.

### 12. "Zbrojní průkaz 2026" by Jakub Jelinek (iOS, paid)

- URL: https://apps.apple.com/cz/app/id1435343141
- Price and model: paid up front, 99 Kč (US $3.99), no IAP. Rating 4.6 from 47 ratings (CZ).
  Last update 26.9.1 (7 Sep).
- Claims questions "platné od 1. ledna 2026", no internet needed, an explanation for each
  correct answer, and a "chance of passing" indicator.
- Complaints: no way to reset known questions without reinstalling (2022-11-01); wants
  a printable version for highlighting (2025-11-20).
- Checklist: 2026 set yes; exam format not stated; explanations yes; law citations not
  found; images yes (fixed bug in 2.4.1); offline yes; spaced repetition not found (does
  track struggling questions); ads none; registration no; mobile app iOS; price 99 Kč.

### 13. Printed guide: "Zbrojní průkaz - průvodce testovými otázkami", 2. vydání (Wolters Kluwer, sold by Sagit)

- URL: https://sagit.cz/info/zbrojni-prukaz-pruvodce-testovymi-otazkami ;
  WK listing https://www.epravo.cz/knizni-novinky/zbrojni-prukaz-pruvodce-testovymi-otazkami-2-vydani-5091.html
- Author Jan Dvořák, 200 pages, ISBN 978-80-7676-138-4. **Price 599 Kč** (Sagit). E-book and
  print + Smarteca bundle exist on epravo.cz; their prices not found.
- Does well: every question with the correct answer and "poznámkami a komentáři" pointing to
  the underlying legal provisions.
- Does badly: **uses the set "platných od 30. ledna 2021"** although Sagit lists it as
  "podle stavu k 10. 8. 2026". No 2026 edition found. The same author co-wrote a WK
  commentary on zákon 90/2024 Sb. (14 Nov 2025), so a 2026 guide may follow.
- Checklist: 2026 set no; exam format no; explanations yes (commentary); law citations yes;
  images print; offline yes (paper); spaced repetition no; ads no; registration no; mobile
  app no; price 599 Kč.

### 14. Preparatory courses (ranges, gun shops)

| Provider | Location | Offer and price (seen 2026-10-27) | Source |
|---|---|---|---|
| Don Shot academy | Brno | Výklad zákona 1 890 Kč; Manipulace se zbraní 4 490 Kč; Kompletní příprava 6 000 Kč; Vícedenní přípravný kurz 9 900 Kč; Online příprava 2 250 Kč; individual handling 14 990 Kč | https://www.donshot.cz/kurzy |
| Trigger Service | Brno | 3-hour practical prep 2 387 Kč, ammunition extra (usually 710 Kč) | https://www.triggerservice.cz/sluzby/strelecke-kurzy/strelecke-kurzy-1/pripravny-kurz-pro-ziskani-zbrojniho-opravneni/ |
| Gryf Academy | Liberec | Přípravný kurz ZO, parts 1-4, 1 700 Kč per part (max 12 people, gun + ammo included); exam 2 800 Kč | https://www.gryfacademy.cz/zbrojni-opravneni |
| Video zbroják (Slevomat voucher) | Radovesice | 2 h theory + practice 2 999 Kč (was 3 499), with video course 3 999 Kč; range rental extra 350 Kč/h | https://www.slevomat.cz/akce/2433200-priprava-na-ziskani-zbrojniho-opravneni-teorie-i-praxe |
| Beareka | Praha 8 | Course page exists; price not found; page still cites zákon 119/2002 Sb. | https://www.beareka.cz/kurzy/priprava-na-zp/ |
| Ranger Prague | Praha 2 | Range 500 Kč/h; licence course price not found | https://www.pragueranger.cz/cz/strelnice-praha/ |
| Kentaur | - | Blog article only; page returned 403, course price not found | https://www.kentaurzbrane.cz/blog/zbrojni-prukaz-2026--jak-v-cr-ziskat-zbrojni-prukaz--co-musite-udelat-a-splnit/ |

Courses focus on the practical part and the law lecture. None was found offering a
theory-drilling tool of its own. Gryf Academy lists the state fee as 3 000 Kč
(2 400 Kč via Portál občana).

### 15. Ministry of the Interior (official)

- URL: https://mv.gov.cz/zbrojni-opravneni ; question file
  https://mv.gov.cz/soubor/mv-soubor-testovych-otazek-pro-teoretickou-cast-zkousky-odborne-zpusobilosti-a-komisionalni-zkousku.aspx
- Free PDF with correct answers marked. The page lists exam topics but gives no question
  count, time or pass mark. No official app, no explanations, no mock exam found.

## Feature-gap table

Legend: Y yes, N no, P partial, ? not found / not verified.

| Feature | **Zbrojní kvíz** | testynazbrojni-opravneni.cz | Zbroják 2026 | ZbraněKvalitně | ZBRANĚ.cz | testy-zbrojni-prukaz.cz | Roubec (Android) | NEPLUS | Melik (iOS) | Janda (iOS) | Hrdlička | Jelínek (iOS) | WK/Sagit book |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026 set (837 q) | Y | Y | Y | Y (2021 also) | Y? (837, unlabelled) | Y (200 free) | **N (2021)** | Y (q447 disputed) | Y | Y | Y? | Y | **N (2021)** |
| Exam format 30/40/26\|28 | Y (since PR #10, 27 Oct; was 60/80/57) | Y | Y | P (no timer/mark) | Y | ? | N | ? | ? | ? | ? | ? | N |
| 17/5/5/3 composition | Y (PR #10) | Y (§ 12 cited) | P (5+5 pooled) | ? | ? | ? | N | ? | ? | ? | ? | ? | N |
| Answer explanations | P (22-lesson study guide, not per question) | Y | Y | N | N | ? | N | N | N | ? | ? | Y | Y |
| Law-paragraph citations | Y for 290/561 law q: provision quoted verbatim + deep link, blind-validated (PR #11) | Y (law text) | Y | N | N | link only | outdated | N | N | P (law browser) | N | ? | Y |
| Images for questions | Y (71 q, from the MV PDF) | Y | Y (diagrams) | ? | ? | ? | Y | ? | ? | Y | ? | Y | Y |
| Offline | Y | Y | Y | ? | N | ? | Y | Y | Y | Y | N | Y | Y |
| Spaced repetition | Y | Y (FSRS) | Y | N | P (weighting) | P (flashcards) | N | N | N | ? | N | ? | N |
| Daily lesson / streak | Y | ? | ? | N | N | ? | N | N | N | ? | N | ? | N |
| No ads | Y | Y | Y | Y | N | ? | ? | ? | ? | ? | ? | Y | Y |
| No registration | Y | Y (optional) | Y | Y | Y (optional) | N for full set | Y | Y | Y | ? | ? | Y | Y |
| Cross-device sync | Y (optional) | Y (account) | Y | N | ? | ? | N | P (upload to web) | N | ? | ? | N | N |
| Per-okruh SEO pages | Y | N (SPA) | N (single page) | Y (question list) | Y (question list) | ? | N | N | N | N | N | N | N |
| Wrong-option diff (control of error) | Y (PR #11) | N | N | N | N | N | N | N | N | N | N | N | N |
| Native mobile app | N (PWA) | N (PWA) | N | old 2021 app | N | N | Y | Y | Y | Y | Y | Y | N |
| Price | free | free | free | free | free (ads) | freemium, ? | free | 79 Kč (iOS) | 79 Kč | 49-299 Kč, incl. monthly | 179 Kč | 99 Kč | 599 Kč |

Note on our own column: filled in from the code on 2026-10-27. Our key for q447 is PO (b) and
for q158 ZL1 for registered/PO/S1–S3 (b); both match the MV file and § 150 odst. 2 písm. b) /
§ 37 of zákon 90/2024. Competitors' "law references" were read from pages and bundles, not
checked question by question; whether theirs quote the provision or only name a paragraph is
not verified.

## Gaps and opportunities

1. The two strongest web competitors already ship explanations with § citations. If Zbrojní
   kvíz lacks them, that is the largest content gap. Explanations tied to the 90/2024 and
   238/2025 paragraphs are what paid-app reviewers ask for ("Zobrazení ustanovení zákonů ...
   není vůbec k dispozici").
2. Accuracy is a differentiator. Q. 447 (Flobert / PO category) is reported wrong in NEPLUS
   on both stores for 6+ months. We should verify our key for 447 and 158 against the MV
   file, and say on the page that the key matches MV exactly.
3. Outdated incumbents still rank: Roubec's 2021 app (50k+ installs) and the 2021 book.
   A per-okruh SEO page or a short article "Pozor na staré otázky z roku 2021" can catch
   people searching from those.
4. Our per-okruh prerendered pages are an edge: testynazbrojniopravneni.cz is a pure SPA and
   Zbroják 2026 is a single page.
5. The exact 17/5/5/3 draw is done right only by testynazbrojniopravneni.cz among those
   checked; app stores never state it. Worth stating on our mock-exam screen.
6. Paid apps charge 79-299 Kč and NEPLUS charged existing users again for 2026. "Free, no
   paywall, no re-purchase" is a valid message against apps, not against the web trainers.
7. Native-app presence: every top-rated option is a store app. A TWA/Play listing of the
   PWA would reach users who search the stores.
8. Courses (1 700-9 900 Kč) do not ship theory tools. Partnering with ranges as their
   recommended free theory trainer is a possible channel (needs Pavol's sign-off).
9. ZbraněKvalitně.cz, the community default, is mid-migration with 404s and a down forum on
   2026-10-27. Users may be looking for alternatives right now.

## Where we win

The engine is not the moat: two free web trainers shipped the same feature set this year, and
one of them (Zbroják 2026) did it in two weeks. What a competent solo developer would still
lack after two weeks with our code:

1. **Provable correctness, in public.** The bank is byte-identical to the PDF MV links today
   (sha256 in `data/README.md`). The exam format cites § 20 odst. 3 and NV 238/2025 § 12. Each
   citation is a verbatim provision, accepted by a published rule and blind-graded (56/60 exact,
   0 wrong on a fresh sample). Wrong keys (NEPLUS q447) and the 2021 set (Roubec, 50k+ installs;
   the 599 Kč book) are what reviewers complain about most. Being demonstrably right can be
   checked by anyone, and copying it means redoing the verification. We also ran the wrong exam
   format from June to October. That is fixed now; it shows how easy it is to get wrong.
2. **Crawlable depth.** The SPA competitors show crawlers a bare `<title>`. A prerendered page per
   official question, with the verbatim provision and the answer, compounds as it gets indexed.
   It is useful to a person who searched for that question, so it is not a doorway page. This
   is the distribution asset (moat.md: "a channel or brand we built").
3. **A teaching method with roots.** Control of error that points at the one changed word,
   ad fontes on every law question, and a mock exam scored for both permit levels. Competitors
   show the right answer. We show why the wrong one is wrong. See `docs/SIGNATURE.md`.

**Entrant-difficulty score** (`flywheel/docs/standards/moat.md`, 0–5):

- **Before this round: 1.** A clone ships easily and gets no users. Ours had almost none
  measured either; tracking was dead from July to October.
- **After this round: 1.** The citations and the diff are copyable in weeks.
- **Target: 2–3** once (a) the per-question pages are indexed and bring search traffic we can
  measure (3: a channel we built), and (b) per-question error rates from real learners
  accumulate (2: months of our data). Steps that unlock it: per-question pages (next slice),
  then a "most-missed questions" view fed by our own events.

What we deliberately don't rely on: being free and offline (others are too), and app stores
(we stay a PWA until a Play listing is approved).

## Sources (all accessed 2026-10-27)

- MV ČR, Zbrojní oprávnění: https://mv.gov.cz/zbrojni-opravneni
- MV ČR question file: https://mv.gov.cz/soubor/mv-soubor-testovych-otazek-pro-teoretickou-cast-zkousky-odborne-zpusobilosti-a-komisionalni-zkousku.aspx
- testynazbrojniopravneni.cz: https://testynazbrojniopravneni.cz/ and bundle https://testynazbrojniopravneni.cz/build/assets/app-Byg_lDUk.js
- Zbroják 2026: https://zbrojak-2026.github.io/ ; https://github.com/zbrojak-2026/zbrojak-2026.github.io
- ZbraněKvalitně.cz: https://www.zbranekvalitne.cz/zbrojni-prukaz/testove-otazky ; https://www.zbranekvalitne.cz/zbrojni-prukaz/testove-otazky/trenink ; https://www.zbranekvalitne.cz/zbrojni-prukaz/testove-otazky/test-nanecisto ; forum https://zbranekvalitne.cz/forum/viewtopic.php?t=3026 (503, migration notice)
- ZbraněKvalitně Android mirror: https://zbranekvalitne-zbrojniprukaz.andro.io/
- ZBRANĚ.cz: https://www.zbrane.cz/zbrojni-opravneni/zkusit-test ; https://www.zbrane.cz/zbrojni-opravneni/procvicovani-otazek
- testy-zbrojni-prukaz.cz: https://testy-zbrojni-prukaz.cz/
- ZbrojakTest.cz: https://zbrojaktest.cz/
- Roubec app: https://play.google.com/store/apps/details?id=cz.zbrojniprukaztesty.zbrojniprukaz ; http://www.zbrojniprukaz-testy.cz/
- NEPLUS app: https://apps.apple.com/cz/app/id1458005092 ; https://play.google.com/store/apps/details?id=cz.etesty.zbrojni_prukaz
- Melik app: https://apps.apple.com/cz/app/id1103623494
- Janda app: https://apps.apple.com/cz/app/id6738841195
- Hrdlička app: https://play.google.com/store/apps/details?id=com.zbrojniprukaz ; https://apps.apple.com/cz/app/id6478442232
- Jelínek app: https://apps.apple.com/cz/app/id1435343141
- Sagit / Wolters Kluwer guide: https://sagit.cz/info/zbrojni-prukaz-pruvodce-testovymi-otazkami ; https://www.epravo.cz/knizni-novinky/zbrojni-prukaz-pruvodce-testovymi-otazkami-2-vydani-5091.html
- WK commentary on 90/2024: https://www.epravo.cz/knizni-novinky/zakon-o-zbranich-a-strelivu-c-902024-sb-komentar-e-kniha-8528.html
- Don Shot: https://www.donshot.cz/kurzy
- Trigger Service: https://www.triggerservice.cz/sluzby/strelecke-kurzy/strelecke-kurzy-1/pripravny-kurz-pro-ziskani-zbrojniho-opravneni/
- Gryf Academy: https://www.gryfacademy.cz/zbrojni-opravneni
- Slevomat / Video zbroják: https://www.slevomat.cz/akce/2433200-priprava-na-ziskani-zbrojniho-opravneni-teorie-i-praxe
- Beareka: https://www.beareka.cz/kurzy/priprava-na-zp/
- Ranger Prague: https://www.pragueranger.cz/cz/strelnice-praha/
- Kentaur: https://www.kentaurzbrane.cz/blog/zbrojni-prukaz-2026--jak-v-cr-ziskat-zbrojni-prukaz--co-musite-udelat-a-splnit/ (403)

Not found: Reddit r/czech, valka.cz or zbrojnice.com threads comparing these tools did not
show up in searches. The ZbraněKvalitně forum app thread (t=3026) was unreachable (503).
Esako.cz is a Pardubice gun shop and range (ESAKO Sýkora Arms) with prep courses and exam
dates but no prices and no online trainer (https://www.esako.cz/).
