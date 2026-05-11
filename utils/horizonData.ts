export type HorizonEntry = {
  symbol: string;
  description: string;
};

export type HorizonSection = {
  title: string;
  data: HorizonEntry[];
};

export const HORIZON_SECTIONS: HorizonSection[] = [
  {
    title: 'Hauptsymbole — Unterwasserhorizonte',
    data: [
      { symbol: 'F', description: 'Min. Haupthoriz., am Grund von Gewässern entstanden.' },
      { symbol: 'U', description: 'Org. Haupthoriz., hauptsächlich aus Resten von Algen, anderen Wasserpflanzen, oder aus sedimentierten Torfpartikeln am Grund von Stillgewässern oder in strömungsberuhigten Zonen von Fließgewässern entstanden.' },
    ],
  },
  {
    title: 'Hauptsymbole — Organische Horizonte',
    data: [
      { symbol: 'H', description: '(Humus) Org. Horiz. mit >30 Gew.-% org. Substanz (Torf), primär aus Resten torfbildender Pflanzen an der Geländeoberfläche unter Wasserüberschuss gebildet.' },
      { symbol: 'O', description: '(Organisch) Org. aeromorpher bis aero-hydromorpher Auflagehorizont aus abgestorbener Biomasse (vor allem Pflanzenstreu) an der Bodenoberfläche entstanden.' },
      { symbol: 'W', description: 'Org. Haupthoriz., durch tiefreichende wendende oder mischende Bearbeitung von Mooren (Moorkultivierung) entstanden.' },
    ],
  },
  {
    title: 'Hauptsymbole — Mineralische Horizonte',
    data: [
      { symbol: 'A', description: 'Min. Oberbodenhoriz. mit Akkumulation von in situ entstandener oder aus organischen Düngern stammender organischer Substanz.' },
      { symbol: 'B', description: 'Min. Unterbodenhoriz. durch Verwitterung oder Umwandlung des Bodenausgangsgesteins entstanden.' },
      { symbol: 'C', description: 'Min. Untergrundhoriz. aus natürlichem oder technogenem Locker- oder Festgestein gebildet.' },
      { symbol: 'D', description: 'Min. Hauptbodenhoriz., aus umgelagertem oder aufgebrachtem Solummaterial (Kulti- oder Technodeposition) entstanden.' },
      { symbol: 'E', description: 'Min. Haupthoriz., durch Verlagerung von Tonmineralen, Eisen(hydr)oxiden oder Humus verarmt (Eluvialhorizont).' },
      { symbol: 'G', description: '(v. Grundwasser) Min. Haupthoriz., unter Grundwassereinfluss entstanden.' },
      { symbol: 'K', description: 'Min. Unterbodenhoriz., durch vertikal im Profil verlagerte Stoffe angereichert (Illuvialhorizont).' },
      { symbol: 'M', description: '(v. migrare = wandern) Min. Unterbodenhoriz., aus fortlaufend sedimentiertem Soummaterial und dadurch bedingt regelmäßiger Sediment- und Stoffzufuhr im aktuellen oder früheren Auenbereich eines Fließgewässers entstanden.' },
      { symbol: 'N', description: 'Min. Unterbodenhoriz., durch Bildung von röntgenamorphen und wasserhaltigen Tonmineralen oder von Aluminium-Humus-Komplexen gekennzeichnet.' },
      { symbol: 'P', description: '(v. Pelosol) Min. Unterbodenhoriz., aus primär tonigem, tonmergeligen oder tonig verwitterndem Ausgangsgestein entstanden, mit >45 Gew.-% Ton, ausgeprägte Quellungs- und Schrumpfungsdynamik (zeitweilig Trockenrisse), besonders im unteren Bereich grobes in sich dichtes Prismen- und Polyedergefüge (oft Gleitharnische).' },
      { symbol: 'R', description: 'Min. Haupthor., durch tiefreichende wendende oder mischende Bodenbearbeitung entstanden.' },
      { symbol: 'S', description: '(v. Stauwasser) Min. Haupthoriz., durch Stau- oder Haftwassereinfluss entstanden, zeitweilig luftarm infolge gehemmter Wasserführung oder ständig luftarm wegen geringer Luftkapazität.' },
      { symbol: 'T', description: '(v. Terra) Min. Unterbodenhoriz., aus dem Lösungsrückstand von Kalk- und Dolomitgesteinen entstanden, die über 75 Gew.-% Karbonat enthalten, >65 Gew.-% Ton (in Übergangshorizonten 45-60 Gew.-% Ton), leuchtend braungelbe bis braunrote Farben und ausgeprägte Polyedergefüge haben.' },
      { symbol: 'V', description: 'Min. Unterbodenhoriz., durch Akkumulation von gefällten Stoffen entstanden, welche am Hang einem Lösungstransport unterlagen.' },
      { symbol: 'Y', description: 'Min. Haupthoriz., der durch Reduktgas (CO₂, CH₄, H₂S) geprägt ist.' },
    ],
  },
  {
    title: 'Vorgesetzte Merkmalssymbole — Geogen/Anthropogen',
    data: [
      { symbol: 'b...', description: 'braun (nur kombinierbar mit De).' },
      { symbol: 'b...', description: 'brackisch (el. Lf.: ≥4 und ≤15 dS m⁻¹).' },
      { symbol: 'c...', description: 'carbonatisch, >75 Gew.-% Karbonat oder Gips.' },
      { symbol: 'e...', description: 'mergelig, 2-75 Gew.-% Karb. od. Gips.' },
      { symbol: 'f...', description: 'Begrabener (fossiler) Horizont (z.B. IIfAh).' },
      { symbol: 'g...', description: 'grau, kombinierbar mit De.' },
      { symbol: 'h...', description: '(Hochmoor) vorwiegend aus Resten Hochmoortorf bild. Pfl.' },
      { symbol: 'i...', description: 'kieselig, silikatisch, <2 Gew.-% Karbonat oder Gips.' },
      { symbol: 'j...', description: 'juvenil, anthropogen umgelagertes Natursubstrat, <25% techn. Substrate.' },
      { symbol: 'jy...', description: 'anthropogen umgelagertes Natursubstrat, ≥25-50% techn. Substrate.' },
      { symbol: 'jy...', description: 'Hor., aus vorwiegend künstlichem Substrat bestehend, Anteil technogener Komponenten 50-75%.' },
      { symbol: 'w...', description: 'Hor., dessen Bodenbildungsprozess irreversibel nicht mehr aktiv ist (z.B. wGo).' },
      { symbol: 'x...', description: 'steinig, komb. mit C, Gerüst aus Grobboden der Fraktionen ≥20 mm, Zwischenräume zu <50% aus feinerem min. Material gefüllt, die verbleibenden Hohlräume zu höchstens 5% mit org. Material gefüllt.' },
      { symbol: 'y...', description: 'anthropogen umgelagertes künstliches Substrat, Anteil technogener Komponenten ≥75%.' },
      { symbol: 'IC', description: 'Lockersubstrat, mit Spaten grabbar.' },
      { symbol: 'mC', description: 'massives Festgestein.' },
      { symbol: 'nH', description: '(Niedermoor) vorwiegend aus Resten Niedermoortorf bild. Pfl.' },
      { symbol: 'o...', description: 'organisch (sedimentär) kombinierbar mit A, C, D, F, G, M, R.' },
      { symbol: 'p...', description: 'pyrithaltig, komb. mit C, F, G, H, W.' },
      { symbol: 'q...', description: 'quellwasserbeeinflusst, komb. mit G, H.' },
      { symbol: 'r...', description: 'Überprägter (reliktischer) Horizont.' },
      { symbol: 's...', description: 'hangwasserbeeinflusst.' },
      { symbol: 't...', description: 'Hor. aus litoralen, epilitoralen oder lagunären Ablagerungen der Nordsee, komb. mit A, C, F, G, S.' },
      { symbol: 'uH', description: '(Uebergangsmoor) H-Horiz.' },
      { symbol: 'z...', description: 'salzhaltig, el. Lf. ≥15 dS m⁻¹ aufgrund der Anwesenheit von Salzen, die löslicher sind als Gips.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Humusbildung und -akkumulation',
    data: [
      { symbol: 'Ol', description: '(engl. litter = Streu) Organischer Horizont von nicht oder wenig zersetzter Pflanzensubstanz an der Bodenoberfläche, in der Regel <10 Vol.% Feinsubstanz.' },
      { symbol: 'Of', description: '(schwed. Förmultningsskiktet) Fermentierung der org. Substanz, ca. 10-70 Vol.% der organischen Feinsubstanz sind geschwärzte Streureste.' },
      { symbol: 'Oh', description: '(humos) O-Horizont, mit organische Feinsubstanz >70 Vol.%.' },
      { symbol: 'Ai', description: '(initial) Sehr geringe Akkumulation von organischer Substanz (lückige Entwicklung, Mächtigkeit <2 cm oder Humusgehalt kaum sichtbar).' },
      { symbol: 'Ah, Kh, Gh', description: '(Humus) Akkum. von org. Subst. in Mineralbodenhorizont (≥0,5-8% Corg).' },
      { symbol: 'Ax', description: '(gemixt) biogen durchmischt.' },
      { symbol: 'Au', description: '(umbra, Schatten) Akkumulation org. Subst. (≥1% Corg), dunkle Färbung und Basensättigung <50%, Regenwurmgänge, Krümel- oder Subpolyedergefüge.' },
      { symbol: 'Aa', description: '(anmoorig) Akkumulation von organischer Substanz (8-<15% Corg).' },
      { symbol: 'Ab', description: '(abmoorig) durch Entwässerung und Abbau der organischen Substanz oder durch Einmischung mineralischen Materials aus H- und U-Horizonten entstanden (8-<15% Corg).' },
      { symbol: 'Kbh', description: '(gebändert humos) Bänderförmige Humusanreicherung im Unterboden.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Mechanische Bearbeitung',
    data: [
      { symbol: 'Ap', description: '(Pflug) Durch regelmäßige Bodenbearbeitung geprägter A- bzw. H-Horizont.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Verwitterung',
    data: [
      { symbol: 'Cn', description: '(unverwittert) Nicht angewitterter C-Horizont.' },
      { symbol: 'Cv', description: 'Schwach verwitterter C-Horizont.' },
      { symbol: 'Bv, Tv, Nv', description: 'Durch Verwitterung entkalkt, verbraunt und verlehmt.' },
      { symbol: 'Tu', description: 'Rubefizierter (rötlich gefärbter) Unterbodenh. (in Deutschland fossil oder reliktisch).' },
      { symbol: 'Bj', description: 'Stark verwitterter (fersialisiert), weitgehend kaolinitisierter Unterbodenhorizont (in Deutschland fossil oder reliktisch).' },
      { symbol: 'Bu', description: 'Sehr stark verwitterter (ferralisierter), rotgefärbter Unterbodenhorizont mit <5 Vol.% Festgesteinsresten, >17% Ton, <16 cmolc/kg KAK, <3% verwitterbare Minerale (in Deutschland fossil oder reliktisch).' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Tonverlagerung',
    data: [
      { symbol: 'El', description: '(lessiviert) Gegenüber Ah und Kt durch Ton- und Eisenverlagerung aufgehellter und tonverarmter Horizont, über Kt liegend.' },
      { symbol: 'Eal', description: '(aufgehellt, lessiviert) Wie El jedoch stärker aufgehellt u. zus. sauergebleicht (fahl).' },
      { symbol: 'Kt', description: '(Ton) Durch Toneinwaschung entstandener Illuvialhorizont. Tongehaltsdifferenz je nach Textur 3-8 Gew.-% auf eine Distanz <30 cm und ausgeprägte Tonbeläge.' },
      { symbol: 'Kbt', description: '(gebändert tonangereichert) Durch Toneinwaschung entstandene Illuvialbänder.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Podsolierung',
    data: [
      { symbol: 'Ee', description: '(eluvial) Sauerbleichung, fahl, violettstictig/fleckig oder gebleichte Quarzkörner, kaum organische Substanz, Munsell-Value oft ≥4/ (≥5/ wenn trocken) sowie Quotient von Value: Chroma > 2,5 und über einem Kh, Ksh, Ks oder Ksv liegend.' },
      { symbol: 'Ks', description: '(Sesquioxid) Mit Sesquioxiden (Aluminium- und Eisen(hydr)oxide) durch Umlagerung angereichert.' },
      { symbol: 'Kbs', description: 'Gebänderte Sesquioxid Anreicherung.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Stauwassereinfluss',
    data: [
      { symbol: 'Sw', description: '(stauwasserleitend) Stauwasserleitender Horizont, >80 Flächen-% Bleich- und Rostflecken sowie Konkretionen, zeitweilig nass und höhere Wasserdurchlässigkeit (kf meist >10 cm/d) als darunterliegender Sd.' },
      { symbol: 'Sew', description: '(eluvial, stauwasserleitend) Nassbleichung, <5 Flächen-% Rostflecken und/oder Konkretionen, deutlich erkennbare Eisenabreicherung.' },
      { symbol: 'Srw', description: '(reduziert) 200-300 Tage im Jahr vernässt, reduziert, Rostfl. nur an Wurzelbahnen.' },
      { symbol: 'Sd', description: '(dicht) Wasserstauend, höhere Lagerungsdichte und geringere Wasserdurchlässigkeit (meist <1 cm/d) als darüberliegender Sw und marmoriert (Aggregatoberflächen gebleicht, Aggregatinneres rostfleckig), 50-<70 Flächen-% Nassbleichungs- und Oxidationsmerkmale.' },
      { symbol: 'Srd', description: 'Dauernd Luftmangel im Sd, reduziert.' },
      { symbol: 'tSqd', description: 'Knickhorizont der Knickmarsch, wasserstauend und solonetzartig.' },
      { symbol: 'Sg', description: 'Haftnasser S-Horizont mit >80 Flächen-% diffuse Nassbleichungs- und Oxidationsmerkmale, Luftmangel bereits bei Feldkapazität, sehr niedrige Luftkapazität, hoher Gehalt an U und feinem fS.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Grundwassereinfluss',
    data: [
      { symbol: 'Go, (Fo, Yo)', description: '(oxidiert) Im GW-Schwankungsbereich (einschl. Bereich des Kapillarsaumes) entstanden und >5 Flächen-% Rost- oder/und Karbonatflecken, besonders an Aggregatoberflächen.' },
      { symbol: 'Gr, (Fr, Hr, Sr, Yr)', description: '(reduziert) >300 Tage im Jahr nass wenn nicht entwässert, und mit einem Munsell Farbton von N1 (schwarz) bis N8 (weiß) oder von 5Y (grau), 5G (graugrün) bzw. 5B (blaugrau) bei einem Chroma <1,5 (bei 5G <2,5), <5 Flächen-% Rostfl., ≥95 Flächen-% Reduktionsfarben.' },
      { symbol: 'Gor, ...', description: 'Gr, teilweise oxidiert mit ≥5 Flächen-% Rostflecken, ≥50 Flächen-% Reduktionsfarben.' },
      { symbol: 'Gro, ...', description: 'Go, 10-<50 Flächen-% Reduktionsfarben.' },
      { symbol: 'Gw, Fw, Hw', description: 'Zeitweilig grundwassererfüllt.' },
    ],
  },
  {
    title: 'Nachgesetzte Merkmalssymbole — Anreicherungen',
    data: [
      { symbol: '...c', description: '((K)Carbonat) Erkennbare sekundäre Karbonatanreicherung.' },
      { symbol: 'Hz, Az, Gz', description: '(Salz) Sekundäre Salzanreicherung (el. Leitfähigkeit ≥15 dS/m im Sättigungsextrakt).' },
      { symbol: 'Bk, Ck, Gk', description: '(Konkretion) Konkretionäre Karbonat- (...kc), Eisen- (...ks) Anreicherung.' },
      { symbol: 'Km, Gm', description: '(massiv) Verfestigte (Sesquioxid) Anreicherung.' },
      { symbol: 'Vf', description: '(Ferrum) Ausfällung schlecht kristalliner Eisen(hydr)oxide, schmierige Konsistenz (Greasing-Effekt), geringe Trockenrohdichte (<1,1 g/cm³), keine Reduktionsmerkmale.' },
    ],
  },
];
