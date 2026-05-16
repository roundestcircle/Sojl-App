export type ParagraphEntry = {
  id: string;
  kind: "paragraph";
  horizonSequence?: string;
  body: string;
};

export type SymbolEntry = {
  id: string;
  kind: "symbol";
  symbol: string;
  description: string;
};

export type HumusformEntry = ParagraphEntry | SymbolEntry;

export type HumusformSection = {
  title: string;
  data: HumusformEntry[];
};

export const HUMUSFORM_SECTIONS: HumusformSection[] = [
  {
    title: "Allgemeines",
    data: [
      {
        id: "intro-1",
        kind: "paragraph",
        body: "Typische morphologische Ausbildungen und Tiefenverteilungen des Bodenhumus werden als Humusform bezeichnet. Mit einfachen Mitteln lassen sich im Gelände Rückschlüsse auf stoffliche Zusammensetzung und Dynamik des Standortes ziehen. Man unterscheidet bei der Humusform die organischen Auflagehorizonte (O-Horizonte) und einen mineralischen, humusangereicherten Oberboden-Horizont (A-Horizont). Die Humusformen unterscheiden sich nach biologischem Bodenzustand, Ort und Geschwindigkeit der Streuzersetzung, Art der Huminstoffe, Abfolge, Mächtigkeit, Gefüge und/oder Lagerungsart der Horizonte und dem chemischen Bodenzustand.",
      },
      {
        id: "intro-2",
        kind: "paragraph",
        body: "Humusformgruppen sind Mull, Moder und Rohhumus, zwischen denen je nach Standortbedingungen verschiedene Übergangsformen auftreten können. Abweichungen von den unten definierten Humusformgruppen treten insbesondere bei semiterrestrischen bzw. Stauwasserböden auf. Hier ist generell der Oh-Horizont stärker betont (Primärabbau durch Feuchtigkeit begünstigt, Zersetzung durch Sauerstoffmangel gehemmt). Bei nassen Verhältnissen kommen Übergänge zu Torfen vor.",
      },
    ],
  },
  {
    title: "Mull",
    data: [
      {
        id: "mull",
        kind: "paragraph",
        horizonSequence: "Horizontabfolge: (Ol)/(Of)/Ah",
        body: "(Auflage meist nur sehr geringmächtig und bei gutem biologischem Bodenzustand nicht dauernd vorhanden). Bei Fehlen der Of-Lage ist die Mächtigkeit des Ah-Horizontes meist größer als 8 cm, bei Vorhandensein einer Of-Lage beträgt sie meist weniger als 10 cm (häufig nur 5–7 cm). Das Gefüge des meist stark bis sehr stark humosen Ah-Horizontes ist meist krümelig, in klimatisch ungünstiger Lage mitunter auch körnig. Die Durchwurzelung ist meist sehr stark (oft Wurzelfilz). Es liegt in der Regel eine hohe biologische Aktivität vor. Der chemische Bodenzustand entspricht einer guten Nährstoffversorgung (eutrophil) mit schwach saurer bis neutraler Reaktion. C/N-Verhältnis <18.",
      },
    ],
  },
  {
    title: "Moder",
    data: [
      {
        id: "moder",
        kind: "paragraph",
        horizonSequence: "Horizontabfolge: Ol/Of/Obh/Ah",
        body: '(Auflage mehrlagig und dauernd vorhanden, 2–8 cm). Die org. Auflagen sind in der Regel geringmächtiger als der Ah-Horizont. Die Übergänge zwischen den Lagen sind meist unscharf, die Auflage lässt sich nur schwer vom Ah-Horizont trennen. In der Of-Lage nehmen die Pflanzenreste von oben nach unten zugunsten der Feinsubstanz ab, der Vernetzungsgrad dagegen zu. Die Obh-Lage ist stärker von Fein- als von Grobwurzeln durchzogen. Das Gefüge der Oh-Lage ist meist bröckelig (Obh) und zerfällt insbesondere bei Trockenheit pulvrig ("Kaffeesatz"). Die Of-Lage ist meist vernetzt und schwach schichtig. Die Tätigkeit der Bodenwühler ist nur mäßig. Die Streuzersetzung findet meist im Auflagehums statt und verläuft langsam. Es liegen meist mesotrophe Verhältnisse, saure Reaktion und ein C/N-Verhältnis von 18 bis 29 vor.',
      },
    ],
  },
  {
    title: "Rohhumus",
    data: [
      {
        id: "rohhumus",
        kind: "paragraph",
        horizonSequence: "Horizontabfolge: Ol/Of/Osh bzw. Okh/Ah-Ee bzw. Ee",
        body: "(Auflage mehrlagig und dauernd vorhanden). Die org. Auflagen sind meist mächtiger als der Ah-Horizont, die Übergänge zwischen den Lagen und zum Ah sind meist scharf und lassen sich gut voneinander trennen. Die Osh-Lage lässt sich scharfkantig brechen, wobei sich die Bruchteile wieder lückenlos zusammenfügen lassen. Statt einer Osh-Lage kann eine Okh-Lage entwickelt sein, welche ebenso kompakt gelagert ist, deren Bruchstücke sich aber nicht wieder lückenlos zusammensetzen lassen. Die Of-Lage ist oft stark verfilzt und lässt sich mitunter verbiegen. Im Vergleich zum Moder weist die Osh/Okh-Lage deutlich mehr Grobwurzeln auf und Bodenwühler fehlen völlig. Die sehr langsame Streuzersetzung findet ausschließlich im Auflagehums statt. Es werden wanderungsfähige Huminstoffe gebildet, die mit dem Sickerwasser verlagert werden können. Es herrschen oligotrophe Verhältnisse vor. Die Bodenreaktion ist sehr sauer, die P-, N-, Ca-Versorgung stets schlecht; das C/N-Verhältnis ist >29. Mäßige bis starke Podsoligkeit.",
      },
    ],
  },
  {
    title: "O-Haupthorizonte",
    data: [
      {
        id: "ol",
        kind: "symbol",
        symbol: "Ol",
        description:
          "≥15 Masse% Corg, Anteil organischer Feinsubstanz <10 Vol.%",
      },
      {
        id: "of",
        kind: "symbol",
        symbol: "Of",
        description:
          "≥15 Masse% Corg, Anteil organischer Feinsubstanz 10–<70 Vol.%",
      },
      {
        id: "oh",
        kind: "symbol",
        symbol: "Oh",
        description:
          "≥15 Masse% Corg, Anteil organischer Feinsubstanz ≥70 Vol.%",
      },
    ],
  },
  {
    title: "O-Abweichungshorizonte (Auswahl)",
    data: [
      {
        id: "oft",
        kind: "symbol",
        symbol: "Oft",
        description: "Anteil org. Feinsubstanz 10–<30 Vol.%",
      },
      {
        id: "ohf",
        kind: "symbol",
        symbol: "Ohf",
        description: "Anteil org. Feinsubstanz 30–<70 Vol.%",
      },
      {
        id: "odf-odh",
        kind: "symbol",
        symbol: "Odf / Odh",
        description: "Anteil an lebenden Feinwurzeln ≥50 Vol.%",
      },
      {
        id: "owf-owh",
        kind: "symbol",
        symbol: "Owf / Owh",
        description: "Zeitweilig grund- oder stauwasserbeeinflusst",
      },
      {
        id: "osh",
        kind: "symbol",
        symbol: "Osh",
        description:
          "Kompakte Lagerung, scharfkantige Bruchstellen, lückenloses Zusammenfügen der Aggregate",
      },
      {
        id: "okh",
        kind: "symbol",
        symbol: "Okh",
        description:
          "Kompakte Lagerung, bricht unscharf, kein lückenloses Zusammenfügen der Aggregate möglich",
      },
      {
        id: "obh",
        kind: "symbol",
        symbol: "Obh",
        description:
          "Lockere Lagerung, pulvrig oder leicht in kantengerundete Aggregate zerfallend",
      },
    ],
  },
];
