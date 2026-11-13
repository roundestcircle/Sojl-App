import { leaf, type DecisionTreeData } from "@/data/trees/types";

const Q = "Das Gefüge ist";

export const GefuegeTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question: "Vorhandensein von Aggregaten?",
      hint: "Unterscheidung zwischen Einzelkorn-, Kohärent-, Kittgefüge und aggregierten Böden.",
      options: [
        { text: "keine Aggregate", next: "primarpartikel_lagerung" },
        {
          text: "Primärpartikel allseitig umhüllt und zementiert (Kittgefüge)",
          next: "result_kit",
        },
        { text: "Boden aggregiert", next: "aggregate_form" },
      ],
    },

    // ── 1a: Keine Aggregate → Einzelkorn oder Kohärent ──────────
    primarpartikel_lagerung: {
      question: "Wie sind die Primärpartikel gelagert?",
      hint: "Lose gelagert → Einzelkorngefüge (ein), zusammenhängend → Kohärentgefüge (koh).",
      options: [
        { text: "lose gelagert", next: "result_ein" },
        { text: "zusammenhängend", next: "result_koh" },
      ],
    },

    // ── 2: Form der Aggregate ───────────────────────────────────
    aggregate_form: {
      question: "Form der Aggregate?",
      options: [
        {
          text: "abgerundet (oft traubig‑nierig, ø 1 bis mehrere mm)",
          next: "kruemel_verklebt",
        },
        { text: "gerinnselartig (Feinkoagulat)", next: "result_gri" },
        { text: "± scharfkantig", next: "aggregate_orientation" },
      ],
    },

    // ── 2a: Krümel oder Schwamm ────────────────────────────────
    kruemel_verklebt: {
      question: "Sind die Krümel zu einem größeren Aggregat verklebt?",
      hint: "Verklebte Krümel → Schwammgefüge (schw), sonst Krümelgefüge (krü).",
      options: [
        { text: "Ja, zu größerem Aggregat verklebt", next: "result_schw" },
        { text: "Nein, einzelne Krümel", next: "result_krue" },
      ],
    },

    // ── 3: Räumliche Orientierung ──────────────────────────────
    aggregate_orientation: {
      question: "Räumliche Orientierung der Aggregate?",
      options: [
        { text: "nicht orientiert (Breite ≈ Länge)", next: "surface_rauh" },
        { text: "vertikal orientiert (Breite < Länge)", next: "kopfflaeche" },
        { text: "horizontal orientiert (Breite > Länge)", next: "result_pla" },
      ],
    },

    // ── 3a: nicht orientiert → raue / glatte Flächen ──────────
    surface_rauh: {
      question: "Beschaffenheit der Flächen?",
      hint: "Raue Flächen → Subpolyedergefüge (sub), glatte Flächen → Polyedergefüge (pol).",
      options: [
        { text: "raue Flächen", next: "result_sub" },
        { text: "glatte Flächen", next: "result_pol" },
      ],
    },

    // ── 3b: vertikal orientiert → raue / gerundete Kopffläche ─
    kopfflaeche: {
      question: "Form der Kopffläche?",
      hint: "Raue Kopffläche → Prismengefüge (pri), gerundete Kopffläche → Säulengefüge (säu).",
      options: [
        { text: "raue Kopffläche", next: "result_pri" },
        { text: "gerundete Kopffläche", next: "result_saeu" },
      ],
    },

    // ── Ergebnisse ─────────────────────────────────────────────
    result_ein: leaf("ein", "Einzelkorngefüge", Q),
    result_koh: leaf("koh", "Kohärentgefüge", Q),
    result_kit: leaf("kit", "Kittgefüge", Q),
    result_gri: leaf("gri", "Feinkoagulatgefüge", Q),
    result_krue: leaf("krü", "Krümelgefüge", Q),
    result_schw: leaf("schw", "Schwammgefüge", Q),
    result_sub: leaf("sub", "Subpolyedergefüge", Q),
    result_pol: leaf("pol", "Polyedergefüge", Q),
    result_pri: leaf("pri", "Prismengefüge", Q),
    result_saeu: leaf("säu", "Säulengefüge", Q),
    result_pla: leaf("pla", "Plattengefüge", Q),
  },
};
