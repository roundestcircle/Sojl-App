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
      {
        title: "S-Wert im effektiven Wurzelraum (Profilsumme)",
        description:
          "Wird in der Aufnahme unter „Automatisch berechnete Werte“ aus den Horizontdaten berechnet. Pro Horizont: KAK [cmolc/kg] × Basensättigung/100 × Trockenrohdichte [kg/dm³] × Mächtigkeit [dm], umgerechnet auf cmolc/m². Als Trockenrohdichte dient der Mittelwert der eingetragenen Klasse (z. B. 1,2–1,4 → 1,3). A-Horizonte gehen voll ein, alle anderen Horizonte mit dem Faktor 0,5. Summiert wird bis zur Tiefe des effektiven Wurzelraums; ein Horizont, der über diese Grenze reicht, wird anteilig abgeschnitten. Fehlen in einem Horizont innerhalb dieser Tiefe KAK, Basensättigung oder Trockenrohdichte oder haben die Tiefenangaben Lücken bzw. Überlappungen, wird „unvollständig“ angezeigt. Der Skelettanteil wird bisher nicht abgezogen. Die Summe wird in fünf Klassen von „sehr gering“ (<100 cmolc/m²) bis „sehr hoch“ (≥20 000 cmolc/m²) eingestuft.",
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
        title: "Bestimmung der Lagerungsdichte",
        description:
          "Bestimmungsschlüssel für die Feldansprache der Lagerungsdichte nach KA5. Zuerst wird zwischen leichten Böden (Sand, Schluff, leichter Lehm) und schweren Böden (schwerer Lehm, Ton) unterschieden, danach nach dem Verhalten der Probe bei der Probenahme, beim Eindrücken eines Messers bzw. beim Aufprall und Zerdrücken. Ergebnis ist ein geschätzter Bereich der Lagerungsdichte in kg/dm³ mit den dafür typischen Gefügeformen. Für die Ansprache nach KA6 gibt es das Tool zur Packungsdichte.",
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
          "Hat keine spezifische Entsprechung in der KA6, sondern lässt sich für verschiedene Anteile verwenden, z. B. Skelett, Grobporen etc. Der Bildschirm ist in ein Raster aus Quadraten aufgeteilt, die beim Scrollen in zufälliger Reihenfolge schwarz eingefärbt werden. Der Zähler zeigt den Anteil schwarzer Fläche in Prozent (0–100 %). Diesen Anteil vergleicht man visuell mit dem Anteil der Komponente in der Probe.",
      },
      {
        title: "Bestimmung der Bodenfarbe",
        description:
          "Die Farbbestimmung erfolgt automatisch aus einem Foto, auf dem die Bodenprobe zusammen mit einer neutralgrauen Graukarte zu sehen ist. (1) Pixelauslese: Die App liest die Pixel der beiden Messflächen mit Skia aus. Ausgewertet wird nur der Bildausschnitt, der in der Kameravorschau sichtbar ist, damit die Messflächen den weißen Hilfsrechtecken entsprechen. (2) Linearisierung: Jeder sRGB-Wert wird über die sRGB-Übertragungsfunktion in lineares Licht umgerechnet. Mittelwerte und Weißabgleich werden ausschließlich im linearen Licht gerechnet. (3) Weißabgleich: Aus dem oberen Teil des Graukarten-Rechtecks (60 % der Bildbreite, 35 % der Bildhöhe; bewusst so gewählt, dass er nicht mit dem Probenfeld überlappt) wird die mittlere lineare Farbe bestimmt. Pro Farbkanal ergibt sich ein Korrekturfaktor Zielwert / Messwert. Als Zielwert dient der lineare Wert von sRGB 128 (mittleres Grau). Das gleicht Farbstiche und Helligkeitsunterschiede durch wechselnde Lichtverhältnisse aus. (4) Probenfarbe: Die mittlere lineare Farbe des Probenfelds (16 % der Bildbreite, 10 % der Bildhöhe, unten mittig) wird kanalweise mit den Korrekturfaktoren multipliziert. (5) Munsell-Zuweisung: Die korrigierte Farbe wird über XYZ in CIE-L*a*b* (Weißpunkt D65) umgerechnet. Die App sucht im RIT-Munsell-Renotation-Datensatz den Farbchip mit dem kleinsten CIEDE2000-Farbabstand und gibt dessen Munsell-Notation aus. Die Renotation-Daten beziehen sich auf Normlichtart C und wurden dafür vorab per Bradford-Transformation nach D65 umgerechnet; verwendet werden nur Chips, die im sRGB-Farbraum darstellbar sind.",
      },
    ],
  },
  {
    title: "Feldarbeit",
    data: [
      {
        title: "Ort finden",
        description:
          "Führt zu den gespeicherten Koordinaten einer Aufnahme. Die App liest laufend die GPS-Position und die Kompassausrichtung des Geräts, berechnet die Entfernung zum Ziel (Haversine-Formel, Kugelerde) und die Peilung von Norden aus und dreht den Pfeil um Peilung minus Geräteausrichtung. Sind nur UTM-Koordinaten eingetragen, werden sie vorher in geografische Koordinaten umgerechnet. Hat das Gerät keinen Kompass, wird das angezeigt; die Entfernung funktioniert trotzdem. Alles läuft auf dem Gerät, es werden keine Karten geladen und keine Daten verschickt.",
      },
      {
        title: "Import",
        description:
          "Begonnene Kampagne (ZIP): Eine zuvor von der App exportierte ZIP-Datei (aufnahmen.csv + horizonte.csv) wird als neue Kampagne mit allen Aufnahmen und Horizonten wieder eingelesen. Der Import läuft in einer einzigen Datenbank-Transaktion, eine fehlerhafte Datei hinterlässt also keine halb importierten Daten. Geplante Kampagne (GPX): Aus jedem Wegpunkt (<wpt>) einer GPX-Datei wird eine leere Aufnahme mit GPS- und UTM-Koordinaten und dem Wegpunktnamen angelegt. Routen und Tracks werden ignoriert, Wegpunkte ohne gültige Koordinaten übersprungen.",
      },
    ],
  },
];
