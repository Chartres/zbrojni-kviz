// Hand-authored study guide grounded in the 2026 legal framework
// (zákon č. 90/2024 Sb., účinný od 1. 1. 2026) and synthesised from public,
// non-copyrighted sources: the Act itself (legal texts are úřední díla, mimo
// ochranu autorského zákona), Ministerstvo vnitra ČR guidance, and the official
// 2026 question set. Facts are paraphrased, not copied. Orientation only —
// binding wording is in the Act and the official questions.
export const STUDY_GUIDE_HTML = `
<h2>Lekce 1 · Zbrojní oprávnění a jak ho získat</h2>
<p>Od <strong>1. ledna 2026</strong> platí <strong>zákon č. 90/2024 Sb., o zbraních a střelivu</strong>. Pojem „zbrojní průkaz“ nahrazuje <strong>zbrojní oprávnění</strong>.</p>
<h3>Druhy a platnost</h3>
<ul>
<li><strong>Obecné zbrojní oprávnění</strong> – běžné nakládání se zbraněmi (sport, lov, sběratelství, ochrana života, zdraví a majetku).</li>
<li><strong>Rozšířené zbrojní oprávnění</strong> – práva obecného oprávnění a navíc další činnosti.</li>
<li><strong>Platí na dobu neurčitou</strong> – neobnovuje se po 5 letech jako dříve. Přibližně <strong>každých 5 let</strong> ale držitel předkládá <strong>lékařský posudek</strong> o zdravotní způsobilosti (poprvé na výzvu policie, dále z vlastní iniciativy).</li>
<li>Oprávnění a doklady vydané do konce roku 2025 zůstávají v platnosti a převádějí se do nového režimu.</li>
</ul>
<h3>Podmínky pro vydání</h3>
<ul>
<li><strong>Zletilost</strong> – zpravidla <strong>18 let</strong> (pro některé činnosti zákon vyžaduje vyšší věk).</li>
<li><strong>Plná svéprávnost</strong> a místo pobytu na území ČR.</li>
<li><strong>Bezúhonnost</strong> a <strong>spolehlivost</strong> ve smyslu zákona.</li>
<li><strong>Zdravotní způsobilost</strong> (lékařský posudek).</li>
<li><strong>Odborná způsobilost</strong> – složení zkoušky.</li>
</ul>
<p>Doba, po kterou osoba není považována za bezúhonnou, závisí na závažnosti a souvislosti činu; u nejzávažnějších případů může jít až o 30 let, výjimečně trvale.</p>
<h3>Zkouška odborné způsobilosti</h3>
<ul>
<li><strong>Teoretická část</strong>: test o <strong>60 otázkách</strong> (52 právní předpisy, 5 nauka o zbraních a střelivu, 3 zdravotnické minimum); k úspěchu <strong>≥ 57 správných</strong> ve lhůtě <strong>80 minut</strong> a ústní pohovor.</li>
<li><strong>Praktická část</strong> na zapsané střelnici – bezpečná manipulace a střelba.</li>
<li>Otázky v této aplikaci jsou <strong>doslovné</strong> z oficiálního souboru Ministerstva vnitra.</li>
</ul>

<h2>Lekce 2 · Kategorie zbraní a střeliva</h2>
<p>Zbraně a střelivo se dělí do kategorií <strong>R1, R2, R3, R4, PO a NO</strong> podle míry nebezpečnosti a regulace:</p>
<ul>
<li><strong>R1 a R2</strong> – <strong>zakázané</strong> zbraně a střelivo. Nakládat s nimi lze jen na základě <strong>výjimky</strong> udělené krajským ředitelstvím policie.</li>
<li><strong>R3</strong> – zbraně podléhající <strong>povolení</strong> (vázané na zbrojní oprávnění a registraci); povolení vydává policie při splnění podmínek.</li>
<li><strong>R4</strong> – zbraně podléhající <strong>registraci</strong>. (Mezi R4 spadá např. i nakládání s tlumičem hluku výstřelu.)</li>
<li><strong>PO</strong> – zbraně podléhající <strong>ohlášení</strong>.</li>
<li><strong>NO</strong> – zbraně <strong>neohlašované</strong> (nejnižší regulace); přesto platí obecná pravidla bezpečného nakládání.</li>
</ul>
<p>Registraci zbraně provádí krajské ředitelství policie; o zbraních se vede <strong>centrální registr zbraní</strong>.</p>

<h2>Lekce 3 · Nakládání se zbraní – povinnosti</h2>
<h3>Registrace a ohlašování</h3>
<ul>
<li>Nabytí zbraně podléhající registraci je třeba <strong>ohlásit do 10 pracovních dnů</strong> krajskému ředitelství policie a zbraň mu předložit.</li>
<li>Obdobně se hlásí převod, ztráta či znehodnocení; změny se promítají do centrálního registru.</li>
</ul>
<h3>Držení, přeprava, nošení</h3>
<ul>
<li><strong>Držení</strong> – zbraň je bezpečně uložena (zpravidla doma v trezoru).</li>
<li><strong>Přeprava</strong> – zbraň se přepravuje <strong>vybitá</strong> a zabezpečená.</li>
<li><strong>Nošení</strong> – mít zbraň u sebe; podléhá přísnějším podmínkám.</li>
</ul>
<h3>Kde a z čeho lze střílet</h3>
<ul>
<li>Mimo střelnici lze střílet jen tam, kde je zajištěno, že <strong>nebude ohrožen život, zdraví, majetek ani veřejný pořádek</strong>.</li>
<li>Volněji to platí pro zbraně s <strong>úsťovou energií střely nejvýše 50 J</strong>, signální zbraně a jinou než ostrou střelbu.</li>
</ul>
<h3>Čtyři pravidla bezpečné manipulace</h3>
<ul>
<li>Se zbraní zacházej vždy, jako by byla <strong>nabitá</strong>.</li>
<li>Nikdy nemiř na nic, co <strong>nechceš zasáhnout</strong>.</li>
<li><strong>Prst mimo spoušť</strong>, dokud nemíříš na cíl.</li>
<li>Znej svůj <strong>cíl i to, co je za ním</strong>.</li>
</ul>

<h2>Lekce 4 · Zabezpečení zbraní a střeliva</h2>
<ul>
<li>Způsob zabezpečení se odvíjí od <strong>počtu</strong> současně ukládaných zbraní a střeliva.</li>
<li>Menší počty: <strong>uzamčené ocelové schránky / trezory</strong> stanovené zákonem.</li>
<li>Větší počty: <strong>komorový trezor chráněný elektronickým zabezpečovacím zařízením (EZS)</strong>.</li>
<li><strong>Ztrátu nebo odcizení</strong> zbraně, střeliva či dokladu je nutné <strong>neprodleně ohlásit</strong> policii.</li>
</ul>

<h2>Lekce 5 · Jiné právní předpisy</h2>
<ul>
<li><strong>Nutná obrana (§ 29 trestního zákoníku)</strong> – odvrácení přímo hrozícího nebo trvajícího útoku; obrana nesmí být <strong>zcela zjevně nepřiměřená</strong> způsobu útoku.</li>
<li><strong>Krajní nouze (§ 28 trestního zákoníku)</strong> – odvrácení nebezpečí přímo hrozícího zájmu chráněnému zákonem; způsobený následek nesmí být <strong>zřejmě stejně závažný nebo závažnější</strong> než ten, který hrozil, a nebezpečí nešlo odvrátit jinak.</li>
<li>Neoprávněné nakládání se zbraněmi a střelivem je <strong>trestným činem</strong> nebo <strong>přestupkem</strong> podle závažnosti.</li>
</ul>

<h2>Lekce 6 · Nauka o zbraních a střelivu</h2>
<ul>
<li><strong>Náboj</strong> tvoří nábojnice, zápalka, výmetná náplň (prach) a střela.</li>
<li><strong>Ráže</strong> označuje rozměr vývrtu hlavně, resp. odpovídajícího náboje.</li>
<li>Hlaveň je <strong>drážkovaná</strong> (uděluje střele rotaci a stabilitu), nebo <strong>hladká</strong> (brokovnice).</li>
<li><strong>Záměrná</strong> je přímka spojující mířidla a záměrný bod na cíli; <strong>balistika</strong> popisuje pohyb střely (vnitřní, vnější, koncová).</li>
<li><strong>Závěr</strong> je <strong>uzamčený</strong> (v okamžiku výstřelu pevně spojen s hlavní), nebo <strong>neuzamčený / dynamický</strong>.</li>
<li><strong>Kulové</strong> střelivo nese jednu střelu (větší zvěř, přesnost); <strong>brokové</strong> více broků (drobná zvěř, ptáci).</li>
</ul>

<h2>Lekce 7 · Zdravotnické minimum</h2>
<h3>Tísňová čísla</h3>
<ul>
<li><strong>155</strong> – zdravotnická záchranná služba</li>
<li><strong>150</strong> – hasiči</li>
<li><strong>158</strong> – Policie ČR</li>
<li><strong>112</strong> – jednotné evropské číslo tísňového volání</li>
</ul>
<h3>Postup u zraněného</h3>
<ul>
<li>Nejprve <strong>vlastní bezpečí</strong>; pokud možno použijte <strong>rukavice</strong> (nebo improvizujte – igelit, sáček, textilie).</li>
<li><strong>Masivní (život ohrožující) krvácení</strong>: stlačte ránu; nestačí-li to, přiložte <strong>zaškrcovadlo nad ránu</strong> na paži nebo stehně a utahujte <strong>až do zástavy</strong> krvácení. <strong>Zaznamenejte čas</strong> zaškrcení a <strong>volejte 155</strong>.</li>
<li><strong>Resuscitace (KPR)</strong>: na tvrdé podložce stlačujte střed hrudníku do hloubky <strong>5–6 cm</strong> frekvencí <strong>100–120× za minutu</strong>; co nejdříve volejte 155 a použijte <strong>AED</strong>, je-li dostupný.</li>
<li><strong>AED</strong> se použije u resuscitovaného postiženého, je-li v dosahu a nezdržuje to záchranu.</li>
<li>Při bezvědomí se zachovaným dýcháním uložte postiženého do <strong>stabilizované polohy</strong> a sledujte ho.</li>
</ul>

<p><em>Tento průvodce je orientační a vychází z veřejných zdrojů (zákon č. 90/2024 Sb., Ministerstvo vnitra, oficiální testové otázky). Úplné a závazné znění obsahuje zákon a oficiální soubor otázek (odkaz výše).</em></p>
`
