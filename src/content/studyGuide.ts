// Hand-authored study guide grounded in the 2026 legal framework
// (zákon č. 90/2024 Sb., účinný od 1. 1. 2026). The authoritative study
// material is the official question set itself; this is a concise orientation.
// Sources: zákon 90/2024 Sb. (zakonyprolidi.cz/cs/2024-90) and Ministerstvo
// vnitra ČR (mv.gov.cz, „Nový zákon o zbraních“).
export const STUDY_GUIDE_HTML = `
<h2>Co je zbrojní oprávnění</h2>
<p>Od <strong>1. ledna 2026</strong> platí nový <strong>zákon č. 90/2024 Sb., o zbraních a střelivu</strong>. Dosavadní „zbrojní průkaz“ nahrazuje <strong>zbrojní oprávnění</strong>.</p>
<ul>
<li><strong>Obecné zbrojní oprávnění</strong> – pokrývá běžné nakládání se zbraněmi (sběr, sport, lov, ochrana života a majetku).</li>
<li><strong>Rozšířené zbrojní oprávnění</strong> – zahrnuje práva obecného oprávnění a navíc další činnosti.</li>
<li><strong>Platnost je na dobu neurčitou.</strong> Zbrojní oprávnění se tedy <strong>neobnovuje po 5 letech</strong> jako dříve. Držitel ale musí přibližně <strong>každých 5 let předložit lékařský posudek</strong> o zdravotní způsobilosti (poprvé na výzvu policie, dále již z vlastní iniciativy).</li>
<li>Oprávnění a doklady vydané do konce roku 2025 zůstávají v platnosti a automaticky se převádějí do nového režimu.</li>
</ul>

<h2>Kategorie zbraní</h2>
<p>Zákon člení zbraně a střelivo do kategorií <strong>R1, R2, R3, R4, PO a NO</strong>:</p>
<ul>
<li><strong>R1, R2</strong> – <strong>zakázané</strong> zbraně a střelivo; nakládat s nimi lze jen na základě výjimky.</li>
<li><strong>R3</strong> – zbraně podléhající <strong>povolení</strong> (vázané na zbrojní oprávnění a registraci).</li>
<li><strong>R4</strong> – zbraně podléhající <strong>registraci</strong>.</li>
<li><strong>PO</strong> – zbraně podléhající <strong>ohlášení</strong>.</li>
<li><strong>NO</strong> – zbraně <strong>neohlašované</strong> (nejnižší míra regulace).</li>
</ul>

<h2>Podmínky pro vydání</h2>
<p>Žadatel o zbrojní oprávnění musí být zejména:</p>
<ul>
<li><strong>zletilý a plně svéprávný</strong>,</li>
<li><strong>bezúhonný</strong> a <strong>spolehlivý</strong> ve smyslu zákona,</li>
<li><strong>zdravotně způsobilý</strong> (lékařský posudek) a</li>
<li><strong>odborně způsobilý</strong> – složit zkoušku odborné způsobilosti.</li>
</ul>
<p>Bezúhonnost a spolehlivost se posuzují podle závažnosti a souvislosti případného trestného jednání; u nejzávažnějších činů může být doba, po kterou osoba není považována za bezúhonnou, velmi dlouhá (až 30 let), v krajních případech i trvalá.</p>

<h2>Zkouška odborné způsobilosti</h2>
<ul>
<li><strong>Teoretická část</strong>: test o <strong>60 otázkách</strong> (52 z právních předpisů, 5 z nauky o zbraních a střelivu, 3 ze zdravotnického minima). K úspěchu je třeba <strong>nejméně 57 správných</strong> odpovědí ve lhůtě <strong>80 minut</strong>, následuje ústní pohovor.</li>
<li><strong>Praktická část</strong> probíhá na zapsané střelnici (bezpečná manipulace a střelba).</li>
<li>Otázky procvičované v této aplikaci jsou <strong>doslovné</strong> z oficiálního souboru Ministerstva vnitra.</li>
</ul>

<h2>Povinnosti držitele</h2>
<ul>
<li>Ohlásit nabytí zbraně podléhající registraci krajskému ředitelství policie, zpravidla do <strong>10 pracovních dnů</strong>.</li>
<li>Předkládat lékařský posudek (přibližně každých 5 let) a hlídat si vlastní lhůty.</li>
<li>Zbraň a střelivo <strong>bezpečně zabezpečit</strong> proti ztrátě a zneužití; ztrátu či odcizení neprodleně ohlásit.</li>
<li>Dodržovat pravidla bezpečné manipulace – se zbraní zacházet vždy jako s nabitou, nemířit na nic, co nechceme zasáhnout, prst mimo spoušť, dbát na bezpečný směr.</li>
</ul>

<h2>Nauka o zbraních a střelivu – základy</h2>
<ul>
<li><strong>Náboj</strong> tvoří nábojnice, zápalka, výmetná náplň (prach) a střela.</li>
<li><strong>Ráže</strong> označuje rozměr vývrtu hlavně, resp. odpovídajícího náboje.</li>
<li>Hlaveň může být <strong>drážkovaná</strong> (uděluje střele rotaci a stabilitu), nebo <strong>hladká</strong> (brokovnice).</li>
<li><strong>Záměrná</strong> je přímka spojující mířidla a záměrný bod na cíli; <strong>balistika</strong> popisuje pohyb střely.</li>
<li>Závěr může být <strong>uzamčený</strong> (v okamžiku výstřelu pevně spojen s hlavní), nebo <strong>neuzamčený</strong> (dynamický).</li>
</ul>

<h2>Zdravotnické minimum – základy</h2>
<ul>
<li><strong>Tísňová čísla</strong>: <strong>155</strong> zdravotnická záchranná služba, <strong>150</strong> hasiči, <strong>158</strong> Policie ČR, <strong>112</strong> jednotné evropské číslo tísňového volání.</li>
<li><strong>Masivní krvácení</strong>: stlačit ránu, přiložit tlakový obvaz; při život ohrožujícím krvácení použít <strong>zaškrcovadlo</strong> a přivolat pomoc.</li>
<li><strong>Resuscitace (KPR)</strong>: na tvrdé podložce stlačovat střed hrudníku do hloubky <strong>5–6 cm</strong> frekvencí <strong>100–120× za minutu</strong>; co nejdříve volat 155 a použít <strong>AED</strong>, je-li dostupný.</li>
<li>Při bezvědomí se zachovaným dýcháním uložit postiženého do <strong>stabilizované polohy</strong> a průběžně jej sledovat.</li>
</ul>

<p><em>Tento průvodce je orientační. Úplné a závazné znění obsahuje zákon č. 90/2024 Sb. a oficiální soubor testových otázek Ministerstva vnitra (odkaz výše).</em></p>
`
