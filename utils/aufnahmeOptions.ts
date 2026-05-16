import type {
  LabeledOption,
  LabeledSection,
} from "@/components/LabeledDropdownField";

export const EXPOS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];

export const RELIEFPOS_OPTIONS: LabeledOption[] = [
  { code: "Z", label: "Zentrallage" },
  { code: "R", label: "Randlage" },
  { code: "G", label: "Grenzlage" },
  { code: "D", label: "distal (Schwemmfächer)" },
  { code: "P", label: "proximal (Schwemmfächer)" },
  { code: "K", label: "Kulminationslage" },
  { code: "S", label: "Sattelpunkt" },
  { code: "T", label: "Tiefenlage" },
  { code: "O", label: "Oberhang" },
  { code: "M", label: "Mittelhang" },
  { code: "U", label: "Unterhang" },
  { code: "A", label: "Hangschulter" },
  { code: "F", label: "Hangfuß" },
  { code: "nb", label: "nicht bestimmt" },
];

export const WITTERUNG_OPTIONS: LabeledOption[] = [
  { code: "WT1", label: "keine Niederschläge innerhalb des letzten Monats" },
  { code: "WT2", label: "keine Niederschläge innerhalb der letzten Woche" },
  {
    code: "WT3",
    label: "keine Niederschläge innerhalb der letzten 24 Stunden",
  },
  {
    code: "WT4",
    label:
      "regnerisch mit nicht sehr starken Niederschlägen innerhalb der letzten 24 Stunden",
  },
  {
    code: "WT5",
    label:
      "stärkere Regenfälle seit mehreren Tagen oder Starkregen innerhalb der letzten 24 Stunden",
  },
  { code: "WT6", label: "extrem niederschlagsreiche Zeit oder Schneeschmelze" },
  { code: "WT7", label: "Frost seit mehreren Tagen" },
  { code: "nb", label: "nicht bestimmt" },
];

export const NUTZUNG_SECTIONS: LabeledSection[] = [
  {
    title: "Landwirtschaft",
    data: [
      { code: "L", label: "landwirtschaftliche Nutzung allgemein" },
      { code: "A", label: "Acker allgemein" },
      { code: "AK", label: "Kurzumtriebsplantage" },
      { code: "AG", label: "Agroforst" },
      { code: "G", label: "Grünland allgemein" },
      { code: "GI", label: "Grünland intensiv" },
      { code: "GE", label: "Grünland extensiv" },
      { code: "GW", label: "Grünland-Wechselwirtschaft" },
      { code: "GD", label: "Weide" },
      {
        code: "GS",
        label:
          "Streuobstwiese, Grünland mit Wert-, Energieholz oder Obstbäumen",
      },
      { code: "S", label: "Sonderkultur" },
      { code: "SD", label: "Dauerkultur" },
      { code: "SH", label: "Hopfen" },
      { code: "SO", label: "Obst" },
      { code: "SW", label: "Wein" },
    ],
  },
  {
    title: "Wald und Forst",
    data: [
      { code: "F", label: "Wald und Forst allgemein" },
      { code: "FP", label: "Pflanzung, Aufforstung, Baumschule" },
      { code: "FN", label: "Naturwaldparzelle" },
      { code: "FW", label: "Waldweide" },
    ],
  },
  {
    title: "Brache",
    data: [
      { code: "B", label: "Brache allgemein" },
      { code: "BA", label: "Ackerbrache" },
      { code: "BG", label: "Grünlandbrache" },
      { code: "BI", label: "Industriebrache" },
    ],
  },
  {
    title: "Ödland",
    data: [
      {
        code: "O",
        label: "Ödland allgemein (naturnah, ungenutzt oder extensiv genutzt)",
      },
      { code: "OF", label: "Feucht-, Sumpf-, Wasserfläche" },
      { code: "OR", label: "Trockenfläche" },
      { code: "OK", label: "Kussgelände, Gehölz" },
      { code: "OT", label: "Hutung" },
      { code: "OH", label: "Heide" },
    ],
  },
  {
    title: "Sonstige Nutzung",
    data: [
      { code: "N", label: "Sonstige Nutzung" },
      { code: "NS", label: "Sportanlage, Spielplatz" },
      { code: "NK", label: "Kinderspielfläche" },
      { code: "NP", label: "Park-, Grün-, Freizeitanlage" },
      {
        code: "NG",
        label:
          "Kleingartenanlage, Haus- und Kleingarten, Nutzgarten, Gartenland",
      },
      { code: "NF", label: "Friedhof" },
      { code: "NT", label: "Truppenübungsplatz" },
      { code: "NA", label: "Wildacker" },
      { code: "NM", label: "Mischnutzung, Streunutzung" },
    ],
  },
  {
    title: "Versiegelt und bebaut",
    data: [
      { code: "VS", label: "Versiegelte und bebaute Flächen allgemein" },
      {
        code: "VE",
        label: "städtisch geprägte Fläche, Siedlung, Dorfanlage, Wohngebiet",
      },
      { code: "VK", label: "Verkehrsfläche" },
      { code: "VI", label: "Industrie- und Gewerbefläche" },
      { code: "VP", label: "Parkplatz" },
    ],
  },
  {
    title: "Auftrags- und Abbauflächen",
    data: [
      { code: "DK", label: "Auftragsflächen allgemein" },
      { code: "DH", label: "Kippe (Verfüllung)" },
      { code: "DE", label: "Halde (Aufschüttung)" },
      { code: "TB", label: "Abbauflächen, Abtragsflächen allgemein (Tagebau)" },
      { code: "TE", label: "Braunkohletagebau" },
      { code: "TS", label: "Erztagebau" },
      { code: "ZR", label: "Stein- und Erdenabbau (Steinbruch, Grube)" },
    ],
  },
  {
    title: "Sonstiges",
    data: [{ code: "nb", label: "nicht bestimmt" }],
  },
];

export const VEGETATION_SECTIONS: LabeledSection[] = [
  {
    title: "Getreide",
    data: [
      { code: "GE", label: "Getreide" },
      { code: "GEW", label: "Weizen" },
      { code: "GEG", label: "Gerste" },
      { code: "GER", label: "Roggen" },
      { code: "GEH", label: "Hafer" },
      { code: "GET", label: "Triticale" },
      { code: "GES", label: "Hirse" },
    ],
  },
  {
    title: "Hackfrüchte",
    data: [
      { code: "HF", label: "Hackfrüchte" },
      { code: "HFK", label: "Kartoffel" },
      { code: "HFZ", label: "Zuckerrübe" },
      { code: "HFF", label: "Futterrübe" },
      { code: "HFG", label: "Feldgemüse" },
      { code: "HFM", label: "Mais" },
    ],
  },
  {
    title: "Leguminosen",
    data: [
      { code: "LG", label: "Leguminosen" },
      { code: "LGB", label: "Bohne" },
      { code: "LGE", label: "Erbse" },
      { code: "LGK", label: "Klee" },
      { code: "LGL", label: "Lupine" },
    ],
  },
  {
    title: "Ölsaaten",
    data: [
      { code: "OE", label: "Ölsaaten" },
      { code: "OEL", label: "Lein" },
      { code: "OEM", label: "Mohn" },
      { code: "OER", label: "Raps" },
      { code: "OEP", label: "Rübsen" },
      { code: "OES", label: "Sonnenblume" },
    ],
  },
  {
    title: "Ackergras / Zwischenfrüchte",
    data: [
      { code: "GA", label: "Ackergras" },
      { code: "ZF", label: "Zwischenfrüchte" },
    ],
  },
  {
    title: "Sonstige Ackerkulturen",
    data: [
      { code: "SO", label: "Sonstige" },
      { code: "SOH", label: "Hanf" },
      { code: "SOT", label: "Tabak" },
      { code: "SOW", label: "Wein" },
      { code: "SOS", label: "Spargel" },
      { code: "SOP", label: "Hopfen" },
    ],
  },
  {
    title: "Obst und Nuss",
    data: [
      { code: "OB", label: "Obst-, Nussgehölze, -gewächse" },
      { code: "OBA", label: "Apfel" },
      { code: "OBB", label: "Birne" },
      { code: "OBK", label: "Kirsche" },
      { code: "OBP", label: "Pflaume" },
      { code: "OBJ", label: "Johannisbeere" },
      { code: "OBH", label: "Heidelbeere" },
      { code: "OBE", label: "Erdbeere" },
      { code: "NUH", label: "Haselnuss" },
      { code: "NUW", label: "Walnuss" },
    ],
  },
  {
    title: "Weide und Wiese",
    data: [
      { code: "WD", label: "Weiden" },
      { code: "WDF", label: "Fettweide" },
      { code: "WS", label: "Wiesen" },
      { code: "WST", label: "Trocken- und Magerrasen" },
      { code: "WSF", label: "Feuchtwiese" },
    ],
  },
  {
    title: "Laubgehölze",
    data: [
      { code: "LW", label: "Laubgehölze" },
      { code: "LWA", label: "Ahorn" },
      { code: "LWI", label: "Birke" },
      { code: "LWB", label: "Buche" },
      { code: "LWE", label: "Eiche" },
      { code: "LWL", label: "Linde" },
      { code: "LUU", label: "Ulme" },
      { code: "LWR", label: "Erle" },
      { code: "LWS", label: "Esche" },
      { code: "LWW", label: "Weide" },
      { code: "LWP", label: "Pappel" },
      { code: "LWO", label: "sonstige Laubgehölze" },
    ],
  },
  {
    title: "Nadelgehölze",
    data: [
      { code: "NW", label: "Nadelgehölze" },
      { code: "NWF", label: "Fichte" },
      { code: "NWK", label: "Kiefer" },
      { code: "NWT", label: "Tanne" },
      { code: "NWD", label: "Douglasie" },
      { code: "NWL", label: "Lärche" },
      { code: "NWO", label: "sonstige Nadelgehölze" },
    ],
  },
  {
    title: "Naturnahe Pflanzengesellschaften",
    data: [
      { code: "NP", label: "naturnahe Pflanzengesellschaften" },
      {
        code: "NPT",
        label: "naturnahe Pflanzengesellschaften trockener Standorte",
      },
      {
        code: "NPN",
        label: "naturnahe Pflanzengesellschaften nasser Standorte",
      },
      {
        code: "NPS",
        label: "naturnahe Pflanzengesellschaften von Salzstandorten",
      },
      { code: "RP", label: "Ruderal- und Pioniergesellschaften" },
    ],
  },
  {
    title: "Sonstiges",
    data: [
      { code: "nv", label: "nicht vorhanden / ohne Vegetation" },
      { code: "nb", label: "nicht bestimmt" },
    ],
  },
];
