import type { ImageSourcePropType } from "react-native";

export type FunktionsweiseEntry = {
  title: string;
  description: string;
  image?: ImageSourcePropType;
};

export type FunktionsweiseSection = {
  title: string;
  data: FunktionsweiseEntry[];
};

export const FUNKTIONSWEISE_SECTIONS: FunktionsweiseSection[] = [
  {
    title: "Berechnungstools",
    data: [
      {
        title: "Humusberechnung",
        description:
          "Basiert auf dem Diagramm nach Renger (1987). Die Linien wurden manuell digitalisiert und als Lookup-Table hinterlegt. Falls notwendig interpoliert die App zwischen den Punkten. Die Einordnung in Humusklassen erfolgt nach Tabelle C33 der KA6.",
        image: require("../assets/images/Renger_diagram.png"),
      },
      {
        title: "Berechnung der KAK",
        description:
          "Basiert noch auf zwei Tabellen der KA5. Das Berechnungsverfahren wird demnächst angepasst.",
      },
      {
        title: "Berechnung der Basensättigung / S-Wert",
        description:
          "Basiert auf einem Diagramm, das mithilfe von WebPlotDigitizer digitalisiert wurde. Die App interpoliert zwischen den Punkten des Lookup-Tables. Dieser Prozess wird demnächst an die KA6 angepasst.",
        image: require("../assets/images/basesat_diagr.png"),
      },
      {
        title: "Berechnung der Porenvolumen und Feldkapazitäten",
        description:
          "Basiert auf den Tabellen B3, B6 und B9 der KA6. Die App interpoliert zwischen den Tabellenpunkten für die eingegebenen Bodeneigenschaften.",
      },
      {
        title: "Berechnung der Trockenrohdichten",
        description: "Basiert auf Tabelle B2 der KA6.",
      },
    ],
  },
  {
    title: "Bestimmungstools",
    data: [
      {
        title: "Bestimmung der Packungsdichteklassen",
        description:
          "Basiert auf Tabelle C47 der KA6. Damit zusammenhängend werden auch die Tabellen C45, C39, C43, C38 und C41 verwendet.",
      },
      {
        title: "Bestimmung der Feinwurzeln",
        description: "Basiert auf Tabelle C45 der KA6.",
      },
      {
        title: "Bestimmung der Gefügeform",
        description: "Basiert auf Tabelle C38 der KA6.",
      },
      {
        title: "Bestimmung der Carbonatklassen",
        description: "Basiert auf Tabelle C61 der KA6.",
      },
      {
        title: "Bestimmung der Bodenart",
        description: "Basiert auf Tabelle C51 der KA6.",
      },
      {
        title: "Abschätzung des Tongehalts",
        description:
          "Basiert auf Tabelle C51 der KA6. Diese Abschätzung ist recht grob und sollte angepasst werden.",
      },
      {
        title: "Bestimmung des Bodentyps",
        description:
          "Basiert auf dem graphischen Bestimmungsschlüssel von Einar Eberhardt (Abb. C18 der KA6) sowie Tabelle C83.",
      },
      {
        title: "Bestimmung eines Anteils",
        description:
          "Hat keine spezifische Entsprechung in der KA6, sondern lässt sich für verschiedene Anteile verwenden, z.B. Skelett, Grobporen etc.",
      },
      {
        title: "Bestimmung der Bodenfarbe",
        description:
          "Die Farbbestimmung erfolgt vollautomatisch aus einem Foto mit 18%-Graukarte. (1) Pixelauslese: Die App liest die RGBA-Pixeldaten des Fotos pixelgenau mit Skia aus. (2) Weißabgleich: Aus dem mittleren Bereich der Graukarte (60 % Bildbreite, 35 % Bildhöhe) wird der mittlere RGB-Wert berechnet. Da eine 18%-Graukarte theoretisch (128, 128, 128) haben sollte, ergibt sich pro Kanal ein Korrekturfaktor von 128 / gemessenem Wert – das kompensiert Farbstiche durch wechselnde Lichtverhältnisse. (3) Probenfarbe: Aus dem Probenfeld (16 % Bildbreite, 10 % Bildhöhe, unten mittig) wird der mittlere RGB-Wert bestimmt und mit den Korrekturfaktoren multipliziert. (4) Munsell-Zuweisung: Der korrigierte RGB-Wert wird über Gamma-Korrektur → lineares sRGB → XYZ (D65) → CIE-L*a*b* umgerechnet. Die App sucht per CIE76-ΔE den nächsten Eintrag im RIT-Munsell-Renotation-Datensatz und gibt die Munsell-Notation aus.",
      },
    ],
  },
];
