// Linear study guide that covers the facts behind ALL official 2026 questions,
// synthesised (paraphrased, not copied) from public, non-copyrighted sources:
// zákon č. 90/2024 Sb. and related Acts (legal texts are úřední díla, mimo
// ochranu autorského zákona), Ministerstvo vnitra ČR guidance, the official
// question set, and standard first-aid guidance. Each lesson links to a public
// source for more detail. Binding wording is always in the Acts themselves.

export interface LessonSource {
  label: string
  url: string
}
export interface Figure {
  img: string
  caption: string
}
export interface Lesson {
  id: string
  title: string
  html: string
  source: LessonSource
  /** Captioned question images (the image-based questions) for visual learning. */
  figures?: Figure[]
}

const ZAKON: LessonSource = {
  label: 'Zákon č. 90/2024 Sb., o zbraních a střelivu (úplné znění)',
  url: 'https://www.zakonyprolidi.cz/cs/2024-90',
}
const TRESTNI: LessonSource = {
  label: 'Trestní zákoník (40/2009 Sb.) — § 28 a § 29',
  url: 'https://www.zakonyprolidi.cz/cs/2009-40',
}
const MV: LessonSource = {
  label: 'Ministerstvo vnitra ČR — Nový zákon o zbraních',
  url: 'https://mv.gov.cz/clanek/zbrane-strelivo-munice-a-bezpecnostni-material.aspx',
}
const PRVNI_POMOC: LessonSource = {
  label: 'Český červený kříž — první pomoc',
  url: 'https://www.cervenykriz.eu/prvni-pomoc',
}

export const LESSONS: Lesson[] = [
  {
    id: 'uvod',
    title: '1 · Úvod, působnost a základní pojmy',
    source: ZAKON,
    html: `
<p>Právo nabývat, držet a nosit zbraně je zaručeno <strong>za podmínek, které stanoví zákon</strong>. Od 1. 1. 2026 jím je <strong>zákon č. 90/2024 Sb., o zbraních a střelivu</strong>, který upravuje nakládání se zbraněmi a střelivem, provozování střelnic a výkon státní správy v této oblasti.</p>
<ul>
<li><strong>Nakládání se zbraní</strong> = jakékoli fyzické zacházení se zbraní nebo střelivem, včetně jejich přepravy a uložení. Pouhé právní jednání je nakládáním jen tehdy, stanoví-li to zákon výslovně.</li>
<li><strong>Nošení</strong> = mít zbraň na veřejně přístupném místě <strong>při sobě nabitou nebo viditelně</strong>. Nenabitá dlouhá zbraň v uzavřeném neprůhledném pouzdře se „nenosí“.</li>
<li><strong>Zbraň</strong> = palná zbraň, plynová zbraň a další zařízení zařazená do některé kategorie. <strong>Střelivo</strong> = náboje, nábojky a aktivní komponenty střeliva.</li>
<li><strong>Regulované součásti zbraně</strong>: hlavní část zbraně, součást umožňující samočinnou střelbu, polotovar hlavní části, <strong>tlumič hluku výstřelu</strong> a <strong>nadlimitní zásobník</strong>. Patří sem i tzv. <strong>bump-fire pažba</strong>. <strong>Noktovizní zaměřovač</strong> je naopak <strong>neregulovaný doplněk</strong>. Střelivo ani lafeta bezzákluzové zbraně nejsou regulovanou součástí.</li>
<li><strong>Vyňaté veřejnoprávní instituce</strong> (z velké části mimo zákon): Ministerstvo vnitra, Ministerstvo obrany, ozbrojené síly, bezpečnostní sbory, Český úřad pro zkoušení zbraní a střeliva.</li>
<li><strong>Sběratelská činnost</strong> = shromažďování a uchovávání zbraní, jejich hlavních částí nebo střeliva pro historické, kulturní, vědecké, technické, vzdělávací nebo památkové účely.</li>
</ul>`,
  },
  {
    id: 'kategorie',
    title: '2 · Kategorie zbraní a střeliva',
    source: ZAKON,
    html: `
<p>Zbraně se dělí na <strong>R1, R2, R3, R4, PO a NO</strong>; střelivo na <strong>S1, S2, S3, S4</strong>.</p>
<ul>
<li><strong>R1–R4 podléhají registraci.</strong> <strong>Zakázané</strong> jsou zbraně <strong>R1 a R2</strong> a střelivo <strong>S1 a S2</strong>.</li>
<li><strong>Princip nejpřísnější kategorie:</strong> lze-li zbrani přiřadit více kategorií, přiřadí se ta nejpřísnější (neplatí u historických a neaktivních). Není-li zbraň v příloze č. 2, zařadí se jako nejbližší uvedená.</li>
<li>Zbraň, která by byla PO/NO, ale vznikla nevratnou úpravou registrované zbraně nebo nesplňuje technické požadavky (NV 187/2025 Sb.), je <strong>zbraní podléhající registraci</strong>.</li>
</ul>
<p><strong>Kdo smí s čím nakládat:</strong></p>
<ul>
<li><strong>R1</strong>: jen ZL1, nebo ZL2 s výjimkou R1; <strong>ne</strong> běžný držitel zbrojního oprávnění.</li>
<li><strong>R2</strong>: držitel zbrojního oprávnění (s <strong>výjimkou kategorie R2</strong>), ZL1, ZL2 s výjimkou.</li>
<li><strong>R3</strong>: držitel zbrojního oprávnění s <strong>povolením kategorie R3</strong>, ZL1, ZL2 s povolením.</li>
<li><strong>R4</strong>: držitel zbrojního oprávnění, ZL.</li>
<li><strong>PO</strong>: držitel zapsané autorizace, ZL, zbrojní oprávnění, nevyňatá veřejnoprávní instituce.</li>
<li><strong>NO</strong>: kdokoli plně svéprávný zletilý s pobytem v ČR, právnická osoba se sídlem v ČR, ZL, zbrojní oprávnění.</li>
<li><strong>Střelivo:</strong> S1 (ZL2 s výjimkou S1), S2 (zbrojní oprávnění/ZL2 s výjimkou S2), S3 (zbrojní oprávnění), S4 (kdokoli plně svéprávný zletilý; držitel ZO i mladší 18 let). Kdo nakládá se zbraní PO/NO, smí nakládat se S3 pro tuto zbraň a se S4.</li>
</ul>
<ul>
<li><strong>Výjimka</strong> se vydává pro <strong>R1, R2, S1, S2</strong>; <strong>povolení</strong> pro <strong>R3</strong>. S <strong>tlumičem</strong> se nakládá jako se zbraní <strong>R4</strong>. S hlavní částí jako se zbraní, jejíž je součástí. Na <strong>nadlimitní zásobník</strong> se přiměřeně použijí pravidla pro střelivo <strong>S2</strong>.</li>
<li><strong>Podnikání</strong> v oboru vyžaduje <strong>zbrojní licenci</strong> (ZL1 u registrovaných zbraní, PO a střeliva S1–S3; ZL i u NO a S4).</li>
<li>Nabývání registrovaných zbraní, PO, palných NO a střeliva <strong>na dálku (e-shop) je zakázáno</strong>.</li>
</ul>`,
  },
  {
    id: 'povinnosti-zakazy',
    title: '3 · Obecné povinnosti a zákazy',
    source: ZAKON,
    html: `
<p><strong>Každý je povinen:</strong></p>
<ul>
<li>na výzvu <strong>Policie ČR</strong> předložit zbraň/střelivo a doklady; na výzvu <strong>Ministerstva obrany</strong> zbraň zvláště účinnou pod mezinárodním kontrolním režimem. (Ministerstvo vnitra předložení požadovat nemůže.)</li>
<li><strong>neprodleně</strong> ohlásit Policii ČR <strong>ztrátu nebo odcizení</strong> zbraně podléhající registraci nebo PO, a <strong>použití zbraně k ostré střelbě v nutné obraně nebo krajní nouzi</strong>;</li>
<li>střílet jen tam, kde je k tomu oprávněn; uposlechnout pokyny pořadatele akce a správce střelnice; na hraničním přechodu oznámit, že cestuje se zbraní; podrobit se na výzvu policisty vyšetření na alkohol/návykové látky.</li>
</ul>
<p><strong>Nikdo nesmí</strong> nakládat se zbraní bez oprávnění; umožnit nakládání neoprávněné osobě; dodat na trh zbraň/střelivo jiné kategorie, než odpovídá konstrukci; ohrozit život/zdraví/majetek nedbalostí nebo manipulací <strong>pod vlivem alkoholu, návykových látek, léků</strong> či při zhoršeném zdravotním stavu; střílet nebo nosit zbraň pod vlivem; provozovat střelnici bez povolení; nosit neregistrovanou zbraň; <strong>šířit oficiální testové otázky</strong> MV.</p>`,
  },
  {
    id: 'opravneni-podminky',
    title: '4 · Zbrojní oprávnění — podmínky, věk, zdraví, bezúhonnost, spolehlivost',
    source: ZAKON,
    html: `
<p><strong>Zbrojní oprávnění</strong> opravňuje fyzickou osobu nakládat se zbraněmi podléhajícími registraci a střelivem. Je <strong>obecné</strong> a <strong>rozšířené</strong> (rozšířené v sobě zahrnuje obecné). Rozšířené je nutné pro zkušebního komisaře, hlavního zbrojíře ZL1/ZL3, <strong>skryté nošení</strong> a některé úkoly u držitele licence.</p>
<p><strong>Podmínky:</strong> pobyt v ČR, věk, plná svéprávnost, zdravotní způsobilost, bezúhonnost, spolehlivost a odborná způsobilost. <strong>Občanství ČR podmínkou není.</strong> Cizinci mimo EU lze žádost zamítnout z důvodu vnitřního pořádku/bezpečnosti.</p>
<ul>
<li><strong>Věk:</strong> obecné = <strong>18 let</strong> (zletilost); výjimečně od <strong>15 let</strong> žáku střední školy v oboru s myslivostí (se souhlasem zákonného zástupce a školy). Rozšířené = <strong>21 let</strong>.</li>
<li><strong>Zdravotní způsobilost:</strong> lékařský posudek s platností <strong>5 let</strong>, k žádosti ne starší <strong>90 dnů</strong>; prohlídku lze provést nejdříve 90 dnů před koncem platnosti. Není způsobilý ten, komu bylo uloženo ochranné léčení/zabezpečovací detence. Ošetřující lékař musí oznámit policii nezpůsobilost držitele.</li>
<li><strong>Bezúhonnost:</strong> posuzuje se i odsouzení v cizině; doba „nebezúhonnosti“ se u násilných a se zbraněmi souvisejících činů <strong>prodlužuje až na 30 let</strong>, u nejtěžších (výjimečný trest) <strong>neomezeně</strong>. Nepřihlíží se k zahlazení odsouzení.</li>
<li><strong>Spolehlivost:</strong> trestní a přestupková zachovalost + vyloučení alkoholismu a zneužívání návykových látek. Nespolehlivý je mj. ten, kdo v posledních 3 letech opakovaně páchal vážné přestupky (zbraně, doprava pod vlivem, nadměrný alkohol) nebo má uložen zákaz činnosti se zbraněmi.</li>
</ul>`,
  },
  {
    id: 'zkouska',
    title: '5 · Zkouška odborné způsobilosti',
    source: ZAKON,
    html: `
<ul>
<li>Zkoušku skládá žadatel <strong>osobně</strong> (bez tlumočníka/podpůrce). Skládá se z <strong>teoretické</strong> a <strong>praktické</strong> části, zpravidla <strong>v jeden den</strong>.</li>
<li><strong>Teorie</strong>: 60 otázek (právní předpisy, ověřování, trestněprávní aspekty, nauka o zbraních, zásady bezpečného nakládání, zdravotnické minimum); uspět = <strong>≥ 57 z 60</strong> v <strong>80 minutách</strong> + ústní pohovor.</li>
<li><strong>Praxe</strong>: bezpečná manipulace + střelba na kruhový terč ⌀ 500 mm, 10 m krátkou a 25 m dlouhou kulovou zbraní, 5 + 5 výstřelů do 5 minut — <strong>obecné ≥ 6 zásahů</strong>, <strong>rozšířené ≥ 8 zásahů</strong>; nesmí ohrozit bezpečnost.</li>
<li>Odbornou způsobilost je třeba prokázat do <strong>12 měsíců</strong> od zápisu oprávnění do registru; zkoušku lze <strong>jednou opakovat</strong>. Kdo neuspěl ani při opakování, ale uspěl aspoň jednou v teorii, může na <strong>komisionální zkoušku</strong> (tříčlenná komise: MV, Policejní prezidium/KŘP, zkušební komisař).</li>
<li>Zkouška odborné způsobilosti se koná <strong>vždy na zapsané zkouškové střelnici</strong>; obě zkoušky jsou <strong>neveřejné</strong>. KŘP pořizuje obrazový a zvukový záznam praktické části. Proti průběhu/výsledku lze <strong>ihned na místě vznést protest</strong>.</li>
<li><strong>Zkušební komisař:</strong> ≥ 30 let, rozšířené oprávnění ≥ 3 roky, maturita, složená zkouška komisaře. Nesmí jím být policista zařazený u správního/kontrolního orgánu dle tohoto zákona.</li>
</ul>`,
  },
  {
    id: 'pozastaveni-zanik',
    title: '6 · Pozastavení, odnětí a zánik oprávnění',
    source: ZAKON,
    html: `
<ul>
<li>Zákon rozlišuje <strong>pozastavení, odnětí a zánik</strong> zbrojního oprávnění. Odvolání proti pozastavení i odnětí <strong>nemá odkladný účinek</strong>.</li>
<li><strong>Pozastavení</strong> (z důvodu vnitřního pořádku/bezpečnosti): po dobu zajištění zbraně/dokladu, při nedoložení nového lékařského posudku, při odvolání souhlasu spolku u nezletilého aj.</li>
<li><strong>Odnětí</strong>: ztratí-li držitel pobyt v ČR, je-li omezena svéprávnost, přestane-li být bezúhonný/spolehlivý.</li>
<li><strong>Zánik</strong>: dnem nabytí právní moci rozhodnutí o odnětí, dnem, kdy se držitel oprávnění vzdá (následující den), úmrtím apod. Naopak <strong>nezaniká</strong> pouhým odvoláním souhlasu zákonného zástupce/spolku/školy (to je důvod pozastavení).</li>
</ul>`,
  },
  {
    id: 'licence-autorizace',
    title: '7 · Zbrojní licence a zapsaná autorizace',
    source: ZAKON,
    html: `
<ul>
<li><strong>Zbrojní licence</strong> opravňuje právnickou nebo podnikající fyzickou osobu k nakládání se zbraněmi; pro podnikání v oboru je vždy nutná (i u NO a S4). Skupiny: <strong>ZL1, ZL2, ZL3</strong>. Pro většinu činností stačí ZL1 nebo ZL2; ZL3 musí být vydána přímo. Držitel ZL1/ZL2 nemůže být zároveň ZL3.</li>
<li><strong>ZL1</strong>: výroba, opravy, nákup, prodej, přeprava registrovaných zbraní/PO/střeliva S1–S3. Neopravňuje ke komerční výuce střelby veřejnosti.</li>
<li><strong>ZL2</strong>: výcvik ve střelbě, ostraha, sportovně-střelecký klub se zbraněmi podléhajícími registraci.</li>
<li><strong>ZL3</strong>: jednorázová nebo účelová činnost (ne podnikání), vydává se na přiměřenou dobu.</li>
<li><strong>Zapsaná autorizace</strong>: nakládání se zbraněmi <strong>kategorie PO</strong> (např. spolek s kynologickým/divadelním zaměřením). Podmínkou není odborná způsobilost ani spolehlivost; žadatel musí být plně svéprávný.</li>
<li>Se zbraněmi <strong>NO</strong> může nakládat každá právnická osoba se sídlem v ČR <strong>bez licence i autorizace</strong>.</li>
<li><strong>Hlavní zbrojíř</strong> plní podmínku odborné způsobilosti licence: ZL1 — rozšířené oprávnění + obor/3 roky praxe; ZL2 — oprávnění ≥ 3 roky; ZL3 — rozšířené oprávnění.</li>
<li>Licenci vydává <strong>krajské ředitelství policie</strong>; pozastaví/odejme ji při ztrátě podmínek (bezúhonnost, spolehlivost, sídlo mimo ČR). Za porušení podmínek ZL3 hrozí pokuta do 50 000 Kč.</li>
</ul>`,
  },
  {
    id: 'vyjimky-povoleni',
    title: '8 · Výjimky (R1/S1, R2/S2) a povolení (R3)',
    source: ZAKON,
    html: `
<ul>
<li><strong>Výjimku R1/S1</strong> lze vydat jen ZL2 nebo ZL3 — <strong>ne</strong> držiteli zbrojního oprávnění. U zvláště účinné zbraně je třeba závazné stanovisko <strong>Ministerstva obrany</strong>. Důvodem nemůže být běžný obchod ZL1.</li>
<li><strong>Výjimku R2/S2</strong> vydá KŘP držiteli zbrojního oprávnění nebo ZL2/ZL3 — např. z důvodu ochrany života/zdraví/majetku v citlivých prostorách, rekonstrukcí historických bitev, a též ze stejných důvodů jako u R1/S1. Pro sport je nutné potvrzení ZL o aktivním tréninku/soutěžích za 12 měsíců a soulad se specifikací disciplíny. Výjimka <strong>pro nadlimitní zásobníky</strong> se vydává jako výjimka S2.</li>
<li><strong>Povolení R3</strong> vydá KŘP držiteli oprávnění/ZL2 z důvodu ochrany života/zdraví/majetku, rekonstrukcí, sportovní, lovecké či obdobné zájmové činnosti.</li>
<li>Výjimka R1/R2 i povolení R3 se vydávají <strong>individuálně pro každou zbraň</strong>. Pozastaví se s pozastavením oprávnění/licence; odejmou se, pomine-li trvale důvod (neplatí, byly-li vydány z důvodu ochrany života/zdraví/majetku); zaniknou se zánikem oprávnění/licence nebo úmrtím držitele.</li>
</ul>`,
  },
  {
    id: 'strelnice',
    title: '9 · Střelnice a kde lze střílet',
    source: ZAKON,
    html: `
<ul>
<li>Střílet lze na <strong>střelnici</strong> provozované podle zákona nebo vyňatou institucí (u MV/MO jen pokud to umožní). Jiný zákon (myslivost, veterinární) může určit další místo. Munici upravuje zákon 91/2024.</li>
<li><strong>Mimo střelnici</strong> jen tam, kde je zajištěno, že <strong>nebude ohrožen život, zdraví, majetek ani veřejný pořádek</strong> — to platí pro zbraně s <strong>úsťovou energií ≤ 50 J</strong>, signální zbraně, jinou než ostrou střelbu i nepalné/neplynové zbraně (lasery, plamenomety). Provoz střelnice pro ≤ 50 J nepodléhá povolení.</li>
<li><strong>Druhy:</strong> dle provozu <strong>příležitostné</strong> (nejvýše 26 dnů/rok) nebo <strong>stálé</strong>; dle konstrukce <strong>kryté</strong> nebo <strong>otevřené</strong>. Střelnicí může být pozemek, stavba i zařízení.</li>
<li><strong>Provoz</strong> se povoluje (i fyzické osobě). Provozní kniha obsahuje seznam střílejících osob a zbraní; <strong>totožnost se ověřuje</strong>. Zapsanou zkouškovou střelnici provozuje držitel <strong>zbrojní licence</strong>.</li>
<li><strong>Správce střelnice</strong> = zletilý držitel zbrojního oprávnění, dohlíží na provozní řád. <strong>Řídící střelby</strong> = zletilý držitel oprávnění určený správcem; o určení musí být <strong>písemný záznam</strong> (jinak je určení neplatné).</li>
<li>Příloha č. 3 stanoví technicko-organizační požadavky (ohrožený prostor, umístění terčů k minimalizaci odrazů). Bezpečnost = <strong>technická</strong> i <strong>organizační</strong> opatření (zásady střelby, směry a dálky, palebná/terčová čára).</li>
</ul>`,
  },
  {
    id: 'registrace-drzitele',
    title: '10 · Registrace, držitelé, přenechání a svěření',
    source: ZAKON,
    html: `
<ul>
<li><strong>Nabytí</strong> registrované zbraně: ohlásit KŘP <strong>do 10 pracovních dnů</strong> a předložit k prohlídce. <strong>Převod</strong>: ohlásit do 10 prac. dnů. <strong>Nabytí PO</strong>: ohlásit do 10 prac. dnů (bez předložení). Není-li držitel oprávněn, KŘP registraci odmítne a zbraň <strong>zadrží</strong>.</li>
<li><strong>Hlavní držitel</strong> = komu je zbraň zaregistrována. <strong>Vedlejší držitel</strong> se zapisuje na žádost hlavního; musí být oprávněn a souhlasit (u R3 jen s povolením R3).</li>
<li>Dočasné předání ZL1 (oprava, úschova) <strong>není převod</strong> → bez ohlašovací povinnosti. Přenechání ani svěření se neohlašuje.</li>
<li><strong>Přenechání</strong> = dočasné samostatné nakládání jinou osobou (ta nesmí přenechat dál). ZL přenechá registrovanou zbraň zaměstnanci-držiteli oprávnění; na střelnici R2/R3/R4, nebo R4 nejvýše na 30 dnů. PO/NO jen oprávněné nebo plně svéprávné zletilé osobě, jejíž totožnost zná; paintball/airsoft/plynovou NO osobě ≥ 15 let se souhlasem zástupce.</li>
<li><strong>Svěření</strong> = nakládání <strong>pod dohledem</strong> oprávněné osoby. R1/S1 jen při činnosti ZL (ne zážitková střelba). R2/R3/R4 osobě mladší 18 let bez oprávnění: musí být vyspělá a pod dohledem osoby ≥ 21 let s oprávněním déle než 3 roky. PO/NO jen pod dohledem.</li>
</ul>`,
  },
  {
    id: 'noseni-preprava',
    title: '11 · Nošení, přeprava a vystavování',
    source: ZAKON,
    html: `
<ul>
<li>Obecně se zbraň nosí <strong>skrytě</strong>. Registrovanou zbraň k <strong>ochraně života, zdraví nebo majetku</strong> smí nosit držitel <strong>rozšířeného</strong> zbrojního oprávnění (výjimky stanoví § 81).</li>
<li><strong>Viditelně</strong> lze nosit při akci, kde se obvykle nakládá se zbraněmi a kde je to přiměřené: film/divadlo, rekonstrukce bitev, pietní akce, výuka/výcvik, sportovní střelba, lov. Nenabitou zbraň lze na/z takové akce viditelně přepravit.</li>
<li><strong>Veřejné vystavování</strong> za obdobných podmínek (i veletrhy); vystavovatel musí <strong>zajistit zabezpečení</strong> proti zneužití, ztrátě a odcizení.</li>
</ul>`,
  },
  {
    id: 'zabezpeceni',
    title: '12 · Zabezpečení zbraní a střeliva',
    source: MV,
    html: `
<ul>
<li>Povinnost zabezpečit má <strong>ten, kdo se zbraní/střelivem nakládá</strong>; ukládá-li je mimo svou kontrolu, zabezpečí je dle povahy a místních podmínek proti zneužití, ztrátě, odcizení.</li>
<li>Registrované zbraně a střelivo S1–S3 se zabezpečují <strong>podle počtu současně ukládaných</strong> kusů — v ocelových schránkách, skříních, trezorech či místnostech s parametry dle nařízení vlády.</li>
<li><strong>Více než 20</strong> současně ukládaných zbraní → <strong>komorový trezor chráněný EZS</strong>.</li>
<li><strong>Nejvýše 2</strong> zbraně R2–R4 a <strong>nejvýše 1000</strong> nábojů S2/S3 lze zabezpečit <strong>jiným vhodným způsobem</strong> (dočasně v obydlí, krátkodobě ve vozidle).</li>
<li>U nezletilého zajišťuje zabezpečení zákonný zástupce. Jiný způsob povolí KŘP na žádost (s projektem).</li>
</ul>`,
  },
  {
    id: 'oznaceni-upravy',
    title: '13 · Označování, nevratné úpravy, znehodnocení',
    source: ZAKON,
    html: `
<ul>
<li><strong>Jedinečné identifikační údaje</strong>: jméno/značka výrobce, země/místo výroby, výrobní číslo, rok výroby, ráže, model. Označení <strong>trvalé</strong>, nesmí se odstraňovat; při poškození obnovit; KŘP může uložit dodatečné označení. Balení střeliva: výrobce, číslo série/šarže, ráže, druh.</li>
<li><strong>Nevratná úprava</strong> = změna kategorie, druhu nebo funkce, nebo znemožnění balistické identifikace. Vždy jí je: úprava na jinou kategorii, na akustickou/salutní, zkrácení hlavně, změna ráže, znehodnocení, řez. Provádí ji <strong>ZL1 na základě povolení</strong>.</li>
<li><strong>Znehodnocení / řez</strong>: ZL1; poté předložit <strong>ČÚZZS</strong> (u zvláště účinných MO) → <strong>certifikát</strong> + verifikační značka, číslo do CRZ. Přebíjet pro vlastní potřebu smí i nedržitel ZL1 (bez označení a ověření).</li>
</ul>`,
  },
  {
    id: 'preshranicni',
    title: '14 · Přeshraniční přemístění, přeprava, nález, ničení',
    source: ZAKON,
    html: `
<ul>
<li>Dočasně do ČR jen na <strong>zbrojní průvodní list</strong> nebo <strong>evropský zbrojní pas (EZP)</strong>. EZP vydávaný ČR: KŘP, na <strong>5 let</strong> (+5). Držitel EZP smí dočasně přemístit zbraň do jiného státu EU (lov, rekonstrukce, sport) a doložit účel.</li>
<li><strong>Hlášení přepravy</strong> (CRZ) podléhá přeprava <strong>více než 100 zbraní</strong> nebo <strong>více než 200 000 nábojů</strong> (rozhoduje počet, ne účel); <strong>nejméně 1 hodinu předem</strong>; silniční vozidlo musí mít zařízení pro <strong>nepřetržité sledování pohybu</strong>.</li>
<li><strong>Nález</strong> → <strong>neprodleně policii</strong> (ve vojenském objektu Vojenské policii). Neznámý vlastník: úřední deska 12 měsíců; nepřevzaté/opuštěné připadají <strong>státu</strong>.</li>
<li>Registrovanou zbraň/PO lze zničit jen <strong>úředním zničením</strong> (zajišťuje stát, bezplatně). Kdo pozbyl oprávnění: do <strong>10 prac. dnů</strong> odevzdat KŘP a do <strong>12 měsíců</strong> s nimi naložit, jinak připadnou státu.</li>
</ul>`,
  },
  {
    id: 'registr-doklady',
    title: '15 · Centrální registr, zbrojní list, přestupky, kontroly',
    source: ZAKON,
    html: `
<ul>
<li><strong>Centrální registr zbraní (CRZ)</strong> = neveřejný informační systém; správce <strong>Policejní prezidium</strong>. Zveřejňuje jen vybrané údaje (zkouškové střelnice, ztracené/odcizené EZP, držitele ZL1, statistiky) — <strong>ne</strong> ztracená/odcizená oprávnění.</li>
<li>Pochybnost o kategorii řeší <strong>ČÚZZS</strong>. Místně příslušné je KŘP dle pobytu; žádost/registraci/ohlášení lze u kteréhokoli KŘP.</li>
<li><strong>Oprávnění</strong> se prokazuje <strong>zbrojním listem</strong> + dokladem totožnosti, před KŘP/PP, u držitele ZL, nebo EZP. Zbrojní list = ověřený výstup z CRZ; přes portál veřejné správy <strong>zdarma</strong>; platí k okamžiku vydání; nenahrazuje EZP/průvodní list/certifikát.</li>
<li><strong>Přestupky:</strong> fyzická osoba do 30 000 Kč; do 50 000 (opakovaně/trvající stav); do 100 000 (ohrožení života/zdraví); do 1 000 000 (majetkový prospěch). Maximum pro držitele licence <strong>5 000 000 Kč</strong>. Přestupky držitele oprávnění projednává <strong>obecní úřad ORP</strong>.</li>
<li><strong>Kontrola:</strong> KŘP prověří podmínky nejméně <strong>1× za 5 let</strong> a vyzve k předložení zbraní nejméně <strong>1× za 10 let</strong>.</li>
</ul>`,
  },
  {
    id: 'definice-kategorie',
    title: '16 · Definice a zařazení do kategorií (přílohy 1 a 2)',
    source: ZAKON,
    html: `
<p><strong>Druhy zbraní:</strong></p>
<ul>
<li><strong>Palná</strong> = funkce z okamžitého uvolnění chemické energie (i akustická/salutní, poplašná/signalizační, polotovary). <strong>Plynová</strong> = energie stlačeného plynu.</li>
<li><strong>Krátká</strong> = délka ≤ 600 mm nebo hlaveň ≤ 300 mm; <strong>dlouhá</strong> = každá, která není krátká.</li>
<li><strong>Samočinná</strong> = více výstřelů na 1 stisk; <strong>samonabíjecí</strong> = 1 výstřel na stisk, nabití z výstřelu; <strong>opakovací</strong> = ruční manipulace závěrem; <strong>nabíjená jednotlivě</strong>.</li>
<li><strong>Historická</strong> = vyrobená do 31. 12. 1890. <strong>Neaktivní</strong> = znehodnocená, řez, torzo. Paintball/airsoft = neletální plynová.</li>
</ul>
<p><strong>Střelivo:</strong> náboj, nábojka, cvičný náboj, signální náboj (26,5 mm), dělené střelivo. <strong>Střela</strong> jednotná (nerozdělí se) nebo hromadná (broky); výbušná/svítící/zápalná pro speciální účely. <strong>Aktivní komponenty</strong> = zápalky, střeliviny, aktivní střely.</p>
<p><strong>Hlavní části</strong> = hlaveň (i vložná), tělo zbraně (rám revolveru, pouzdro závěru), válec revolveru, závěr (i závorník a nosič). <strong>Nadlimitní zásobník není hlavní částí.</strong> Tlumič = snížení hluku ≥ 10 dB. Nadlimitní zásobník (středový zápal) = > 20 nábojů u krátké, > 10 u dlouhé.</p>
<p><strong>Kategorie zbraní (příloha 2):</strong></p>
<ul>
<li><strong>R1</strong>: zvláště účinné (munice, zápalné, paprskové), <strong>zákeřné</strong> (např. nedetekovatelné), <strong>samočinné</strong>, plamenomety.</li>
<li><strong>R2</strong>: dlouhé samonabíjecí zkrátitelné pod 600 mm; samonabíjecí vzniklé ze samočinné; samonabíjecí (středový zápal) s <strong>nadlimitním zásobníkem</strong> (např. puška se zásobníkem 30).</li>
<li><strong>R3</strong>: krátké jednotlivě (středový zápal); dlouhé hladké ≤ 600 mm; samonabíjecí pistole na 10–20 ran; signální 26,5 mm; samonabíjecí dlouhé na 4–10 nábojů.</li>
<li><strong>R4</strong>: dlouhé hladké s hlavní > 60 cm a ≤ 3 náboji; brokové dvojky a kozlice; opakovací kulovnice a malorážky; krátké jednotlivě (okrajový zápal) ≥ 280 mm.</li>
<li><strong>PO</strong>: neletální prostředky, poplašné/signalizační, jednoranové/dvouranové pro dělené střelivo, EU-znehodnocené.</li>
<li><strong>NO</strong>: expanzní přístroje, neaktivní (mimo PO), historické, plynové ≤ 6,35 mm, paintball/airsoft.</li>
</ul>
<p><strong>Kategorie střeliva:</strong> <strong>S1</strong> nedetekovatelné, střely výbušné/zápalné/průbojné; <strong>S2</strong> krátké se střelou s řízenou deformací/fragmentací, svítící; <strong>S3</strong> běžné (FMJ, SP, Flobert, pyronáboje); <strong>S4</strong> aktivní komponenty (mimo výbušné/zápalné/svítící), nábojky a signální ≤ 16 mm.</p>`,
  },
  {
    id: 'manipulace',
    title: '17 · Bezpečná manipulace a prováděcí předpisy',
    source: MV,
    html: `
<p>Prováděcí pravidla (zejména pro praktickou zkoušku):</p>
<ul>
<li><strong>Bezpečný směr</strong> (k dopadišti) musí respektovat každý a nesmí do něj vstupovat. Zbraň, která nebyla kontrolou uvedena do bezpečného stavu, musí vždy směřovat do bezpečného směru; nemíří se na osoby ani s vybitou/nekompletní zbraní.</li>
<li><strong>Nabití</strong> = stav, kdy ke střelbě stačí přesun prstu na spoušť. Do pokynu ke střelbě je <strong>prst mimo lučík</strong>. Prst v lučíku/na spoušti je porušením zásad (mimo záměrný výstřel či ránu jistoty).</li>
<li><strong>Kontrola zbraně</strong> (vybití do bezpečného stavu): u pistole vyjmout zásobník, stáhnout závěr, vizuálně zkontrolovat komoru a šachtu; u revolveru vyklopit válec a zkontrolovat komory (odkládá se s vyklopeným válcem); u dlouhých obdobně. Manipulace začíná a končí kontrolou.</li>
<li><strong>Závady:</strong> <strong>selhač</strong> — vyčkat min. <strong>10 s</strong> (zbraň do bezpečného směru), pak kontrola a otisk zápalníku; <strong>slabá rána</strong> — kontrola průchodnosti hlavně (uvízlá střela se jen popíše); <strong>zádržka</strong> — vyjmout zásobník, zjistit a odstranit příčinu.</li>
<li><strong>Uložení ve vozidle</strong> (krátkodobě, nejvýše <strong>4 hodiny</strong>, max 2 zbraně R2–R4 / 1000 nábojů S2–S3): v uzamčeném kufru/schránce upevněné ke karoserii, zvenčí neviditelné, zbraň nenabitá a střelivo odděleně; <strong>dlouhodobé uložení ve vozidle se nepřipouští</strong>.</li>
<li><strong>Aktivní komponenty</strong> přechovávat v originálních obalech, v suchu, odděleně; obecný limit pro fyzickou osobu (S4): <strong>10 kg bezdýmného prachu, 3 kg černého prachu</strong>, 15 000 zápalek pro kulové, 10 000 pro brokové, 15 000 perkusních (každý druh zvlášť). Při přebíjení dodržet tlakové limity výrobců.</li>
<li><strong>Znehodnocovací značky:</strong> kontrolní (vyznačí ZL1 po znehodnocení) a verifikační (ČÚZZS/MO potvrzuje shodu). Zbraň s přeraženým „X“ přes značky není platně ověřena.</li>
</ul>`,
  },
  {
    id: 'jine-predpisy',
    title: '18 · Jiné předpisy — nutná obrana, krajní nouze, ověřování',
    source: TRESTNI,
    html: `
<ul>
<li>Právo bránit život se zbraní vychází z <strong>Listiny základních práv a svobod</strong>; podmínky stanoví zejména <strong>trestní zákoník</strong> a zákon o zbraních.</li>
<li><strong>Nutná obrana (§ 29):</strong> odvrácení přímo hrozícího nebo trvajícího útoku na zájem chráněný zákonem; není trestná, <strong>nebyla-li zcela zjevně nepřiměřená</strong> způsobu útoku. Obrana smí být <strong>intenzivnější</strong> než útok, lze chránit i zájmy jiného, mířit proti kterémukoli z více útočníků, bránit se i střelnou zbraní proti noži; obránce <strong>nemusí vyzývat</strong> útočníka. Zbraň připravená na očekávaný útok je v pořádku, použije-li se až při útoku.</li>
<li><strong>Krajní nouze (§ 28):</strong> odvrácení přímo hrozícího nebezpečí zájmu chráněnému zákonem; nejde o ni, šlo-li nebezpečí odvrátit jinak nebo je-li způsobený následek <strong>zřejmě stejně/více závažný</strong>. Jednat může kdokoli; nebezpečí může způsobit příroda, člověk i biologické procesy.</li>
<li>Při překročení mezí obrany soud přihlédne jako k <strong>polehčující okolnosti</strong>.</li>
<li><strong>Ověřování zbraní:</strong> provádí <strong>ČÚZZS</strong>; zkušební značky osvědčují splnění technických požadavků (uznávané dle úmluvy <strong>C.I.P.</strong>); „<strong>X</strong>“ přes značky = neověřená. <strong>Munici</strong> upravuje zákon 91/2024, <strong>vojenský materiál</strong> zákon 38/1994. <strong>Nedovolené ozbrojování</strong> (výroba/držení bez povolení, mazání označení) je trestný čin.</li>
</ul>`,
    figures: [
      { img: 'q716_0.png', caption: 'Ověření státní autoritou ČR — od r. 2000 Český úřad pro zkoušení zbraní a střeliva.' },
      { img: 'q717_0.png', caption: 'Jednotná zkušební značka (obyčejná zkouška), uznávaná dle úmluvy C.I.P.' },
      { img: 'q715_0.png', caption: 'Značka dovolující střelbu ocelovými broky (brokovnice).' },
      { img: 'q608_0.png', caption: 'Kontrolní znehodnocovací značka — vyznačí ji ZL1 ihned po znehodnocení.' },
      { img: 'q609_0.png', caption: 'Verifikační znehodnocovací značka — ČÚZZS/MO potvrzuje řádné znehodnocení.' },
    ],
  },
  {
    id: 'nauka-strelivo',
    title: '19 · Nauka — střelivo a ráže',
    source: MV,
    html: `
<ul>
<li><strong>Náboj</strong> = nábojnice, zápalka, výmetná náplň (prach) a střela. <strong>Zápalka</strong> se nárazem vznítí a zažehne prach. Mechanický zápal: <strong>okrajový</strong>, <strong>středový</strong> nebo <strong>Lefaucheux</strong>.</li>
<li><strong>Brokový náboj</strong> (např. ráže 12 a 20; ráže 12 je větší): střela hromadná, nebo <strong>jednotná typu Brenneke</strong>; číslo na nábojnici (např. 67,5) = nejmenší délka komory. Riziko: náboj ráže 20 v komoře ráže 12 → destrukce zbraně (proto bývá ráže 20 žlutá).</li>
<li><strong>Kulové náboje</strong> mají nábojnici s okrajem, drážkou nebo polookrajem; tvar bývá lahvovitý. Skládají se z nábojnice, střely, prachu a zápalky.</li>
<li><strong>Školní (cvičný) náboj</strong> = bez prachu a zápalky, rozměrově odpovídá náboji, slouží k nácviku. <strong>Flobert</strong> = okrajový zápal, ráže 4/6/9 mm.</li>
<li><strong>Ráže</strong> kulové zbraně = průměr vodicí části vývrtu / popis komory a náboje; brokové = smluvní průměr + délka nábojnice. <strong>Zahrdlení</strong> = úprava ústí brokové hlavně ovlivňující krytí.</li>
</ul>`,
    figures: [
      { img: 'q649_0.png', caption: 'Brokový náboj ráže 12.' },
      { img: 'q650_0.png', caption: 'Broková jednotná střela typu Brenneke.' },
      { img: 'q651_0.png', caption: 'Údaj na nábojnici (např. 67,5) = nejmenší délka komory.' },
      { img: 'q652_0.png', caption: 'Šipka: kování brokového náboje.' },
      { img: 'q653_0.png', caption: 'Šipka: zápalka.' },
      { img: 'q654_0.png', caption: 'Šipka: zápalka — iniciuje (zažehne) prachovou náplň.' },
      { img: 'q655_0.png', caption: 'Šipka NEukazuje na zápalku.' },
      { img: 'q656_0.png', caption: 'Větší ráži má náboj 12 (oproti 20).' },
      { img: 'q657_0.png', caption: 'Náboj ráže 20 v komoře ráže 12 → destrukce zbraně (ráže 20 bývá žlutá).' },
      { img: 'q658_0.png', caption: '7,5×55 a 7,62×54R — pro dlouhé drážkované zbraně (pušky).' },
      { img: 'q659_0.png', caption: 'Tvar nábojnice: lahvovitý.' },
      { img: 'q660_0.png', caption: 'Kulový náboj = nábojnice, střela, prach, zápalka.' },
      { img: 'q661_0.png', caption: 'Liší se nábojnicí: s drážkou vs. s okrajem.' },
      { img: 'q662_0.png', caption: 'Orientačně ~780 m/s, ~3500 J, dostřel ~4000 m.' },
      { img: 'q663_0.png', caption: 'Původně vojenské; vyhovující lze i pro sport.' },
      { img: 'q664_0.png', caption: '7,62×39 — střední výkon, dnes i sport.' },
      { img: 'q665_0.png', caption: 'Horní = školní (vybíjecí) náboj pro nácvik.' },
      { img: 'q666_0.png', caption: 'Dostřel ~2800 m, po celé dráze potenciálně smrtící.' },
      { img: 'q667_0.png', caption: 'Okrajový zápal: č. 1 (.22 LR) a č. 2 (9 mm Flobert).' },
      { img: 'q668_0.png', caption: 'Poloplášťová střela: č. 4 (9 mm Luger).' },
      { img: 'q669_0.png', caption: 'Č. 3 (7,65 Browning) a 4 (9 mm Luger) — pro krátké samonabíjecí zbraně.' },
      { img: 'q670_0.png', caption: 'Dostřel ~1500 m+; nejnižší má 9 mm Flobert.' },
      { img: 'q671_0.png', caption: 'Flobert — pro krátké i dlouhé zbraně (často hladký vývrt).' },
      { img: 'q672_0.png', caption: 'Nábojnice: č. 1–2 okraj, č. 3–5 drážka (č. 3 = polookraj).' },
      { img: 'q673_0.png', caption: 'Šipka: nábojnice.' },
      { img: 'q674_0.png', caption: 'Šipka: směr vkládání náboje do komory.' },
      { img: 'q675_0.png', caption: 'Šipka: střela (projektil).' },
      { img: 'q676_0.png', caption: 'Šipka: směr vytahování nábojnice z komory.' },
      { img: 'q677_0.png', caption: 'Předmět je municí podle zákona o munici.' },
    ],
  },
  {
    id: 'nauka-zbrane',
    title: '20 · Nauka — zbraně a konstrukce',
    source: MV,
    html: `
<ul>
<li><strong>Hlaveň</strong> mění energii v pohyb střely; vývrt je <strong>hladký</strong>, <strong>drážkovaný</strong> nebo <strong>polygonální</strong> (uvádí střelu do rotace). <strong>Nábojová komora</strong> = zadní část vývrtu (u revolveru ve válci). <strong>Výhozné okénko</strong> = otvor pro vyhození nábojnice. <strong>Lučík</strong> chrání spoušť.</li>
<li><strong>Závěr</strong>: <strong>uzamčený</strong> = v okamžiku výstřelu pevně spojen s hlavní (drží tlak); <strong>neuzamčený / dynamický</strong> = není spojen. Uzamykací prvky: ozuby, kuličky/válečky, kleština, závora. <strong>Závorník</strong> uzavírá komoru, <strong>nosič závorníku</strong> jej unáší. <strong>Bicí mechanismus</strong> udeří na zápalku; <strong>spoušťové ústrojí</strong> jej ovládá. <strong>Pojistka</strong> zajišťuje proti výstřelu.</li>
<li><strong>Typy:</strong> jednuška (1 hlaveň/rána), dvojka (2 hlavně vedle sebe), lankasterka (dvojka s vnějšími kohouty), hamerleska (skryté kohouty), kozlice (2 hlavně nad sebou), kombinovaná/kulobroková (různé hlavně), kulovnice (drážkovaná dlouhá), dvoják/kulová kozlice, flobertka, pistole (krátká s komorou v hlavni), revolver (otáčivý válec).</li>
<li><strong>Hlavní části</strong> ve smyslu zákona: hlaveň, tělo zbraně, válec revolveru, závěr. Funkční cyklus: revolver/opakovačka = ruční; samonabíjecí pistole = zpětný ráz; samonabíjecí puška = tlak plynů.</li>
<li><strong>Zkušební značka</strong> potvrzuje ověření (od r. 2000 ČÚZZS), uznávané dle <strong>C.I.P.</strong>; speciální značka dovoluje střelbu ocelovými broky.</li>
</ul>`,
    figures: [
      { img: 'q678_0.png', caption: 'Nevratná úprava: zhotovení řezu.' },
      { img: 'q681_0.png', caption: 'Revolver — krátká kulová opakovací zbraň.' },
      { img: 'q683_0.png', caption: 'Č. 3 = revolverový válec (hlavní část).' },
      { img: 'q684_0.png', caption: 'Č. 2 (červené) = výklopná konzole válce.' },
      { img: 'q685_0.png', caption: 'Vnější bicí kohout = č. 5.' },
      { img: 'q686_0.png', caption: 'Havárie: poškozen rám a válec.' },
      { img: 'q687_0.png', caption: 'Příčina havárie: nepříslušné střelivo / ucpaný vývrt.' },
      { img: 'q688_0.png', caption: 'Lankasterka (dvojka s vnějšími kohouty).' },
      { img: 'q689_0.png', caption: 'Šipka: temenní klička (lůžkový závěr).' },
      { img: 'q690_0.png', caption: 'Kozlice — dvě hlavně nad sebou.' },
      { img: 'q691_0.png', caption: 'Broková zbraň s lůžkovým závěrem a sklopným svazkem.' },
      { img: 'q692_0.png', caption: 'Vodorovná šipka = pažba, svislá = předpažbí.' },
      { img: 'q693_0.png', caption: 'Perkusní revolver (černý prach).' },
      { img: 'q694_0.png', caption: 'Dělené střelivo, iniciace perkusními zápalkami.' },
      { img: 'q695_0.png', caption: 'Křesadlový zámkový systém.' },
      { img: 'q696_0.png', caption: 'Nelze určit nabito/vybito → nutná kontrola stavu.' },
      { img: 'q679_0.png', caption: 'Tělo pistole = č. 3 (hlavní část).' },
      { img: 'q680_0.png', caption: 'Lučík = č. 2.' },
      { img: 'q682_0.png', caption: 'Určení zbraně: ochrana života/zdraví/majetku.' },
      { img: 'q697_0.png', caption: 'Umístění zásobníku: č. 2 a 5.' },
      { img: 'q698_0.png', caption: 'Č. 1 = výhozné okénko (vidět komoru).' },
      { img: 'q699_0.png', caption: 'Ústí hlavně = č. 3.' },
      { img: 'q700_0.png', caption: 'Č. 3, 5, 6 = NEjsou hlavní části zbraně.' },
      { img: 'q701_0.png', caption: 'Č. 1, 2, 4 = hlavní části zbraně.' },
      { img: 'q702_0.png', caption: 'Hlavní části = č. 1, 2, 4.' },
      { img: 'q703_0.png', caption: 'Č. 1 = kluzný pistolový závěr (hlavní část).' },
      { img: 'q704_0.png', caption: 'Č. 2 = hlaveň (s uzamykacími ozuby).' },
      { img: 'q705_0.png', caption: 'Č. 3 = předsuvná (vratná) pružina s vodítkem.' },
      { img: 'q706_0.png', caption: 'Č. 4 = tělo zbraně.' },
      { img: 'q707_0.png', caption: 'Č. 6 = zásobník.' },
      { img: 'q708_0.png', caption: 'Vnější manuální pojistka není označena žádným číslem.' },
      { img: 'q709_0.png', caption: 'Bicí mechanismus s přímoběžným úderníkem.' },
      { img: 'q710_0.png', caption: 'Samonabíjecí pistole, odnímatelný zásobník, pevná mířidla.' },
      { img: 'q711_0.png', caption: 'Závěr = č. 3 a 2; č. 4 uvnitř lučíku (spoušť).' },
      { img: 'q712_0.png', caption: 'Palná opakovací zbraň.' },
      { img: 'q713_0.png', caption: 'Viditelné: pažba, lučík, spoušť, klika a pouzdro závěru, pojistka, okénko, hlaveň, hledí, dno zásobníku.' },
      { img: 'q714_0.png', caption: 'Šipka nad zbraní = k ústí (směr střely); pod zbraní = k rameni.' },
    ],
  },
  {
    id: 'nauka-balistika',
    title: '21 · Nauka — balistika a zásady bezpečnosti',
    source: MV,
    html: `
<ul>
<li><strong>Záměrná</strong> = přímka mířidla–cíl. <strong>Maximální dostřel</strong> = největší dolet; <strong>účinný dostřel</strong> = kde lze cíl efektivně zasáhnout. Pistole 9 mm: přes 1,5 km; puška .308: až ~4 km; malorážka .22: přes 1,5 km; broky ~ stonásobek průměru broku v mm (hrubé broky i přes 1000 m).</li>
<li><strong>Krytí</strong> brokovnice = podíl zásahů v terči (%). <strong>Ranivý účinek</strong> = poranění živého cíle; <strong>průbojný</strong> = pronikání. <strong>Vydutí hlavně</strong> = havárie (cizí předmět/ucpání vývrtu).</li>
<li>Střílet jen <strong>střelivem příslušné ráže</strong> a jen zbraní i střelivem v <strong>dobrém technickém stavu</strong>; zdeformovaná/zrezivělá střela se nepoužívá.</li>
<li><strong>Zásady bezpečného zacházení:</strong> se zbraní zacházet jako s nabitou; nikdy nemířit na nic, na co nelze vystřelit; <strong>prst mimo lučík</strong>, pokud nestřílím; vědět, na co střílím a co je za cílem; počítat s <strong>odrazy</strong> (nestřílet pod malým úhlem na tvrdé/zakřivené plochy ani na vodu); při střelbě <strong>chránit sluch a zrak</strong>; nenechávat zbraň bez dozoru přístupnou jiným; předem se seznámit s funkcí a ovládáním; nosit krátkou zbraň v pouzdře, dlouhou zajištěnou; celková <strong>pokora a uměřenost</strong>.</li>
</ul>`,
  },
  {
    id: 'zdravotnicke',
    title: '22 · Zdravotnické minimum (první pomoc)',
    source: PRVNI_POMOC,
    html: `
<ul>
<li><strong>Tísňová čísla:</strong> 155 (záchranná služba), 150 (hasiči), 158 (Policie ČR), 112 (jednotné evropské). Nejdůležitější je <strong>vlastní bezpečí</strong>; první pomoc je povinen poskytnout každý, pokud tím neohrozí sebe (§ 150/151 tr. zákoníku).</li>
<li><strong>Masivní krvácení</strong> (ohrožení života, volat 155): přímý tlak do rány → tlakový obvaz → <strong>zaškrcovadlo nad ránu</strong> na paži/stehně, utáhnout <strong>do zástavy</strong>, <strong>zaznamenat čas</strong>. Cizí těleso zapíchnuté v ráně <strong>nevyjímáme</strong>. Krvácení z nosu: předklon, stlačit měkkou část nosu 5–10 min.</li>
<li><strong>Bezvědomí:</strong> uvolnit dýchací cesty <strong>záklonem hlavy</strong> a zkontrolovat dech. Dýchá-li → volat 155 a sledovat / <strong>zotavovací poloha</strong> na boku (musíme-li odejít nebo hrozí vdechnutí). Nedýchá normálně (nedýchá, chrčí, lapá) → <strong>resuscitace</strong>.</li>
<li><strong>KPR:</strong> na tvrdé podložce, střed hrudníku, hloubka <strong>5–6 cm</strong>, <strong>100–120/min</strong>; s dýcháním poměr <strong>30 : 2</strong> (dýchání není u laika povinné). <strong>AED</strong> použít co nejdříve, nezdržuje-li to resuscitaci. Při podezření na poranění páteře má přednost záchrana života (resuscitace). Jazyk nikdy nevytahujeme.</li>
<li><strong>Zlomeniny</strong> nedlahujeme, nezatěžujeme, nehýbeme; horní končetinu do šátku, otevřenou zlomeninu řešíme jako krvácení. <strong>Popáleniny</strong> chladit vodou 15–20 min (ne ledem), sundat šperky. <strong>Poleptání</strong> dlouho oplachovat vodou. <strong>Otrava</strong>: volat 155 / Toxikologické středisko; u kyselin/zásad/pěnidel <strong>nevyvolávat zvracení</strong>.</li>
<li><strong>Střelné poranění</strong>: volat 155, řešit masivní krvácení a bezvědomí; u hrudníku ránu <strong>nepřekrývat</strong> (ponechat komunikaci). <strong>Mdloba</strong>: nechat ležet, vzduch. <strong>Křeče</strong> nechat proběhnout, chránit před úrazem. <strong>Mrtvice</strong>: pokleslý koutek, křivý úsměv, slabost poloviny těla, porucha řeči. <strong>Cukrovka</strong> (při vědomí, špatně komunikuje): podat cukr. <strong>Elektrický proud</strong>: nejdřív přerušit/izolovat zdroj.</li>
</ul>`,
  },
]
