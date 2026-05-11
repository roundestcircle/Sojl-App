import type { DecisionTreeData } from '../DecisionTreeTypes';

export const GefuegeFormTree: DecisionTreeData = {
  id: 'start',
  question: 'Vorhandensein von Aggregaten?',
  hint: 'Unterscheidung zwischen Einzelkorn-, Kohärent-, Kittgefüge und aggregierten Böden.',
  options: [
    { text: 'keine Aggregate', next: 'primarpartikel_lagerung' },
    { text: 'Primärpartikel allseitig umhüllt und zementiert (Kittgefüge)', next: 'result_kit' },
    { text: 'Boden aggregiert', next: 'aggregate_form' },
  ],
  nodes: {
    // ── 1a: Keine Aggregate → Einzelkorn oder Kohärent ──────────
    primarpartikel_lagerung: {
      id: 'primarpartikel_lagerung',
      question: 'Wie sind die Primärpartikel gelagert?',
      hint: 'Lose gelagert → Einzelkorngefüge (ein), zusammenhängend → Kohärentgefüge (koh).',
      options: [
        { text: 'lose gelagert', next: 'result_ein' },
        { text: 'zusammenhängend', next: 'result_koh' },
      ],
    },

    // ── 1b: Kittgefüge ──────────────────────────────────────────
    result_kit: {
      id: 'result_kit',
      question: 'Das Gefüge ist',
      result: {
        title: 'kit',
        description: 'Kittgefüge',
      },
    },

    // ── 2: Form der Aggregate ───────────────────────────────────
    aggregate_form: {
      id: 'aggregate_form',
      question: 'Form der Aggregate?',
      options: [
        { text: 'abgerundet (oft traubig‑nierig, ø 1 bis mehrere mm)', next: 'kruemel_verklebt' },
        { text: 'gerinnselartig (Feinkoagulat)', next: 'result_gri' },
        { text: '± scharfkantig', next: 'aggregate_orientation' },
      ],
    },

    // ── 2a: Krümel oder Schwamm ────────────────────────────────
    kruemel_verklebt: {
      id: 'kruemel_verklebt',
      question: 'Sind die Krümel zu einem größeren Aggregat verklebt?',
      hint: 'Verklebte Krümel → Schwammgefüge (schw), sonst Krümelgefüge (krü).',
      options: [
        { text: 'Ja, zu größerem Aggregat verklebt', next: 'result_schw' },
        { text: 'Nein, einzelne Krümel', next: 'result_krue' },
      ],
    },

    // ── 2b: Feinkoagulat ───────────────────────────────────────
    result_gri: {
      id: 'result_gri',
      question: 'Das Gefüge ist',
      result: {
        title: 'gri',
        description: 'Feinkoagulatgefüge',
      },
    },

    // ── 3: Räumliche Orientierung ──────────────────────────────
    aggregate_orientation: {
      id: 'aggregate_orientation',
      question: 'Räumliche Orientierung der Aggregate?',
      options: [
        { text: 'nicht orientiert (Breite ≈ Länge)', next: 'surface_rauh' },
        { text: 'vertikal orientiert (Breite < Länge)', next: 'kopfflaeche' },
        { text: 'horizontal orientiert (Breite > Länge)', next: 'result_pla' },
      ],
    },

    // ── 3a: nicht orientiert → raue / glatte Flächen ──────────
    surface_rauh: {
      id: 'surface_rauh',
      question: 'Beschaffenheit der Flächen?',
      hint: 'Rauhe Flächen → Subpolyedergefüge (sub), glatte Flächen → Polyedergefüge (pol).',
      options: [
        { text: 'rauhe Flächen', next: 'result_sub' },
        { text: 'glatte Flächen', next: 'result_pol' },
      ],
    },

    // ── 3b: vertikal orientiert → raue / gerundete Kopffläche ─
    kopfflaeche: {
      id: 'kopfflaeche',
      question: 'Form der Kopffläche?',
      hint: 'Rauhe Kopffläche → Prismengefüge (pri), gerundete Kopffläche → Säulengefüge (säu).',
      options: [
        { text: 'rauhe Kopffläche', next: 'result_pri' },
        { text: 'gerundete Kopffläche', next: 'result_saeu' },
      ],
    },

    // ── 3c: horizontal orientiert → Plattengefüge ──────────────
    result_pla: {
      id: 'result_pla',
      question: 'Das Gefüge ist',
      result: {
        title: 'pla',
        description: 'Plattengefüge',
      },
    },

    // ── Ergebnis‑Knoten für Einzelkorn und Kohärent ────────────
    result_ein: {
      id: 'result_ein',
      question: 'Das Gefüge ist',
      result: {
        title: 'ein',
        description: 'Einzelkorngefüge',
      },
    },
    result_koh: {
      id: 'result_koh',
      question: 'Das Gefüge ist',
      result: {
        title: 'koh',
        description: 'Kohärentgefüge',
      },
    },
    result_krue: {
      id: 'result_krue',
      question: 'Das Gefüge ist',
      result: {
        title: 'krü',
        description: 'Krümelgefüge',
      },
    },
    result_schw: {
      id: 'result_schw',
      question: 'Das Gefüge ist',
      result: {
        title: 'schw',
        description: 'Schwammgefüge',
      },
    },
    result_sub: {
      id: 'result_sub',
      question: 'Das Gefüge ist',
      result: {
        title: 'sub',
        description: 'Subpolyedergefüge',
      },
    },
    result_pol: {
      id: 'result_pol',
      question: 'Das Gefüge ist',
      result: {
        title: 'pol',
        description: 'Polyedergefüge',
      },
    },
    result_pri: {
      id: 'result_pri',
      question: 'Das Gefüge ist',
      result: {
        title: 'pri',
        description: 'Prismengefüge',
      },
    },
    result_saeu: {
      id: 'result_saeu',
      question: 'Das Gefüge ist',
      result: {
        title: 'säu',
        description: 'Säulengefüge',
      },
    },
  },
};
