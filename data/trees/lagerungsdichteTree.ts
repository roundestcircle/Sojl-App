import { leaf, type DecisionTreeData } from "@/data/trees/types";

const Q = "Geschätzte Lagerungsdichte";

export const LagerungsdichteTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question: "Welche Bodenart liegt vor?",
      hint: "Erster Schritt: Unterscheidung zwischen leichten (Sand, Schluff, leichter Lehm) und schweren (schwerer Lehm, Ton) Böden.",
      options: [
        {
          text: "Sand-, Schluff- oder leichter Lehmboden (trocken bis frisch)",
          next: "light_soil",
        },
        {
          text: "schwerer Lehmboden oder Tonboden (trocken bis frisch)",
          next: "heavy_soil",
        },
      ],
    },
    light_soil: {
      question: "Wie verhält sich die Probe bei der Probenahme / beim Drücken?",
      options: [
        {
          text: "Zerfällt schon bei der Probenahme; Profilwand zeigt viele Grobporen",
          next: "result_light_0",
        },
        {
          text: "Zerfällt bei leichtem Drücken in zahlreiche Bruchstücke oder Einzelteile",
          next: "result_light_1",
        },
        {
          text: "Messer mit wenig Kraft einzudrücken; zerfällt in wenige Bruchstücke, die von Hand weiter teilbar sind",
          next: "result_light_2",
        },
        {
          text: "Messer nur schwer 1–2 cm einzudrücken; zerfällt in einzelne Bruchstücke, die kaum weiter zerteilbar sind",
          next: "result_light_3",
        },
        {
          text: "Messer nur mit Gewalt einzutreiben; Probe zerfällt kaum",
          next: "result_light_4",
        },
      ],
    },
    heavy_soil: {
      question: "Wie verhält sich die Probe beim Aufprall und beim Drücken?",
      options: [
        {
          text: "Zerfällt beim Aufprall in zahlreiche Bruchstücke; weiteres Zerkleinern bei mäßigem Drücken möglich",
          next: "result_heavy_0",
        },
        {
          text: "Zerfällt beim Aufprall in wenige Bruchstücke; weiteres Zerkleinern bei mäßigem Drücken möglich",
          next: "result_heavy_1",
        },
        {
          text: "Zerfällt beim Aufprall kaum; weiteres Zerkleinern bei starkem Drücken noch möglich",
          next: "result_heavy_2",
        },
        {
          text: "Zerfällt beim Aufprall nicht; weiteres Zerkleinern mit der Hand kaum möglich",
          next: "result_heavy_3",
        },
      ],
    },

    // ── Ergebnisse leichte Böden ───────────────────────────
    result_light_0: leaf(
      "0,9–1,2 kg/dm³",
      "Häufige Gefügeformen: Einzelkorn, Krümel",
      Q,
    ),
    result_light_1: leaf(
      "1,2–1,4 kg/dm³",
      "Häufige Gefügeformen: Einzelkorn, Bröckel, Subpolyeder, (Polyeder)",
      Q,
    ),
    result_light_2: leaf(
      "1,4–1,6 kg/dm³",
      "Häufige Gefügeformen: Subpolyeder, Polyeder, Prismen, Fragmente, Hüllen, Platten",
      Q,
    ),
    result_light_3: leaf(
      "1,6–1,8 kg/dm³",
      "Häufige Gefügeformen: Prismen, Platten, Hüllen, (Polyeder)",
      Q,
    ),
    result_light_4: leaf(
      "1,8–1,9 kg/dm³",
      "Häufige Gefügeformen: Hüllen, Kohärent, Prismen",
      Q,
    ),

    // ── Ergebnisse schwere Böden ──────────────────────────
    result_heavy_0: leaf(
      "1,0–1,2 kg/dm³",
      "Häufige Gefügeformen: Polyeder, Fragmente",
      Q,
    ),
    result_heavy_1: leaf(
      "1,2–1,4 kg/dm³",
      "Häufige Gefügeformen: Polyeder, Prismen, Säulen, Klumpen, Platten",
      Q,
    ),
    result_heavy_2: leaf(
      "1,4–1,6 kg/dm³",
      "Häufige Gefügeformen: Kohärent, Prismen, (Platten, Säulen, Polyeder)",
      Q,
    ),
    result_heavy_3: leaf(
      "1,6–1,7 kg/dm³",
      "Häufige Gefügeformen: Kohärent, (Prismen, Säulen)",
      Q,
    ),
  },
};
