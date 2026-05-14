import type { DecisionTreeData } from "../DecisionTreeTypes";

export const BodenTypTree: DecisionTreeData = {
  id: "start",
  question:
    "Dominierend aus organischen (O-, H-, U- oder W-) Horizonten bestehend?",
  hint: "Mit Of- und Oh-Horizonten von zusammen ≥ 3 dm Mächtigkeit oder mit O-Horizonten unmittelbar über C-Horizont; oder subhydrisch und mit U-Horizont, der an der MOF beginnt; oder mit H- oder U-Horizont, die innerhalb von 7 dm unter GOF in der Summe eine Mächtigkeit ≥ 3 dm aufweisen.",
  options: [
    { text: "Ja", next: "organisch_subhydrisch" },
    { text: "Nein", next: "mineral_wassereinfluss" },
  ],
  nodes: {
    // ─────────────────────────────────────────────
    // ORGANISCHE BÖDEN
    // ─────────────────────────────────────────────

    organisch_subhydrisch: {
      id: "organisch_subhydrisch",
      question: "Subhydrisch mit U-Horizont an der GOF?",
      hint: "Subhydrisch und mit U-Horizont an der GOF.",
      options: [
        { text: "Ja", next: "result_U" },
        { text: "Nein", next: "organisch_auflage" },
      ],
    },

    organisch_auflage: {
      id: "organisch_auflage",
      question:
        "Mit mächtiger organischer Auflage oder Auflage direkt über dem unveränderten Locker- oder Festgestein?",
      hint: "Mit Of- und Oh-Horizonten von zusammen ≥ 3 dm Mächtigkeit oder mit O-Horizonten unmittelbar über dem C-Horizont.",
      options: [
        { text: "Ja", next: "result_F" },
        { text: "Nein", next: "organisch_torfe" },
      ],
    },

    organisch_torfe: {
      id: "organisch_torfe",
      question: "Aus verlagerten oder gemischten Torfen oder Mudden bestehend?",
      hint: "W-Horizont ≥ 4 dm.",
      options: [
        { text: "Ja", next: "result_M" },
        { text: "Nein", next: "organisch_vererdet" },
      ],
    },

    organisch_vererdet: {
      id: "organisch_vererdet",
      question: "Oberster Horizont höchstens gering vererdet oder vermulmt?",
      hint: "Hn-, Hw- oder Uw-Horizont in < 1 dm unter der TOF beginnend.",
      options: [
        { text: "Ja", next: "result_H" },
        { text: "Nein", next: "result_K" },
      ],
    },

    // ─────────────────────────────────────────────
    // MINERALISCHE BÖDEN – Wassereinfluss
    // ─────────────────────────────────────────────

    mineral_wassereinfluss: {
      id: "mineral_wassereinfluss",
      question: "Mit dominierendem Einfluss von Wasser oder Reduktgasen?",
      hint: "Mit einem S-, G- oder Y-Horizont, der < 4 dm unter MOF beginnt; oder mit S-Horizont, der im oder unmittelbar unter einem Ap-Horizont beginnt; oder mit V-Horizont, der < 4 dm unter MOF beginnt und > 1 dm Mächtigkeit hat; oder mit Am.- oder ..lCq-Horizont, der an der MOF beginnt; oder mit F-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_grund_ufer" },
        { text: "Nein", next: "mineral_kein_wassereinfluss" },
      ],
    },

    mineral_grund_ufer: {
      id: "mineral_grund_ufer",
      question:
        "Am Grund oder Ufer von Gewässern oder durch Reduktgase dominiert?",
      hint: "Mit Y-Horizont, oder mit F-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_reduktgas" },
        { text: "Nein", next: "mineral_stau_haft" },
      ],
    },

    mineral_stau_haft: {
      id: "mineral_stau_haft",
      question: "Durch Stau-, Haft- oder Hangwasser geprägt?",
      hint: "Mit S-Horizont, der < 4 dm unter MOF beginnt; oder mit S-Horizont, der im oder unmittelbar unter einem Ap-Horizont beginnt; oder mit V-Horizont, der < 4 dm unter MOF beginnt und > 1 dm Mächtigkeit hat.",
      options: [
        { text: "Ja", next: "mineral_redoximorph" },
        { text: "Nein", next: "mineral_stoffeintraege" },
      ],
    },

    mineral_redoximorph: {
      id: "mineral_redoximorph",
      question: "Mit redoximorphen Merkmalen?",
      hint: "Mit S-Horizont.",
      options: [
        { text: "Ja", next: "result_S" },
        { text: "Nein", next: "result_Q" },
      ],
    },

    mineral_stoffeintraege: {
      id: "mineral_stoffeintraege",
      question:
        "Mit Stoffeinträgen im Oberboden durch Überflutungswasser, aber ohne hydromorphe Merkmale oberhalb 4 dm unter GOF?",
      hint: "Mit Am.-Horizont und G.-Horizont oberhalb 4 dm unter MOF fehlend.",
      options: [
        { text: "Ja", next: "result_A" },
        { text: "Nein", next: "mineral_strand_wind" },
      ],
    },

    mineral_strand_wind: {
      id: "mineral_strand_wind",
      question: "Oberboden von Brandung und Wind umgelagert?",
      hint: "Mit Cq- oder Gq.-Horizont an der MOF.",
      options: [
        { text: "Ja", next: "result_Ue" },
        { text: "Nein", next: "result_G" },
      ],
    },

    mineral_reduktgas: {
      id: "mineral_reduktgas",
      question: "Durch Reduktgase dominiert?",
      hint: "Mit Y-Horizont.",
      options: [
        { text: "Ja", next: "mineral_wasserschwankung" },
        { text: "Nein", next: "mineral_wasserschwankung_nein" },
      ],
    },

    mineral_wasserschwankung: {
      id: "mineral_wasserschwankung",
      question: "Im Wasserschwankungsbereich des Meeres und der Ästuare?",
      hint: "Mit Fqwo-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "result_I" },
        { text: "Nein", next: "result_X" },
      ],
    },

    mineral_wasserschwankung_nein: {
      id: "mineral_wasserschwankung_nein",
      question: "Im Wasserschwankungsbereich des Meeres und der Ästuare?",
      hint: "Mit Fqwo-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "result_J" },
        { text: "Nein", next: "result_X" },
      ],
    },

    // ─────────────────────────────────────────────
    // MINERALISCHE BÖDEN – Kein dominanter Wassereinfluss
    // ─────────────────────────────────────────────

    mineral_kein_wassereinfluss: {
      id: "mineral_kein_wassereinfluss",
      question: "Natürlicher, voll entwickelter Unterbodenhorizont vorhanden?",
      hint: "P- oder T-Horizont vorhanden, der < 3 dm unter MOF beginnt; oder N-Horizont vorhanden, der < 3 dm unter MOF beginnt und ≥ 4 dm unter MOF reicht; oder K-Horizont vorh., der < 8 dm unter MOF beginnt; oder B-Horizont vorh.",
      options: [
        { text: "Ja", next: "mineral_sauer_bleichung" },
        { text: "Nein", next: "mineral_anthropogen" },
      ],
    },

    mineral_anthropogen: {
      id: "mineral_anthropogen",
      question: "Durch anthropogene Horizonte geprägt?",
      hint: "D- oder R-Horizont, der unter dem A-Horizont beginnt und bis > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "mineral_oberboden_ausgebildet" },
        { text: "Nein", next: "result_O" },
      ],
    },

    mineral_oberboden_ausgebildet: {
      id: "mineral_oberboden_ausgebildet",
      question: "Vollständig ausgebildeter Oberbodenhorizont?",
      hint: "A-Horizont vorh. und stärker als Al entwickelt.",
      options: [
        { text: "Ja", next: "result_R" },
        { text: "Nein", next: "result_Y" },
      ],
    },

    mineral_sauer_bleichung: {
      id: "mineral_sauer_bleichung",
      question:
        "Sauergebleichter Verarmungshorizont und Anreicherungshorizont von Eisenoxiden oder Humusstoffen ausgeprägt?",
      hint: "Kh- oder Ks-Horizont vorhanden und bis ≥ 1,5 dm unter MOF reichend oder direkt über C-Horizont.",
      options: [
        { text: "Ja", next: "mineral_tonreich" },
        { text: "Nein", next: "mineral_tonreich_nein" },
      ],
    },

    mineral_tonreich: {
      id: "mineral_tonreich",
      question:
        "Tonreicher Unterboden, durch Lösungsverwitterung aus Kalkgesteinen, aus Tonstein oder tonig verwitterndem Gestein entstanden?",
      hint: "P- oder T-Horizont vorh., der < 3 dm unter MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_loesungsverwitterung_ja" },
        { text: "Nein", next: "mineral_locker_kolloide" },
      ],
    },

    mineral_tonreich_nein: {
      id: "mineral_tonreich_nein",
      question:
        "Tonreicher Unterboden, durch Lösungsverwitterung aus Kalkgesteinen, aus Tonstein oder tonig verwitterndem Gestein entstanden?",
      hint: "P- oder T-Horizont vorh., der < 3 dm unter MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_loesungsverwitterung_nein_ast" },
        { text: "Nein", next: "mineral_locker_kolloide_nein_ast" },
      ],
    },

    mineral_loesungsverwitterung_ja: {
      id: "mineral_loesungsverwitterung_ja",
      question: "Unterboden durch Lösungsverwitterung entstanden?",
      hint: "T-Horizont vorh.",
      options: [
        { text: "Ja", next: "result_C" },
        { text: "Nein", next: "result_D_podzol_ast" },
      ],
    },

    mineral_locker_kolloide: {
      id: "mineral_locker_kolloide",
      question:
        "Unterboden sehr locker gelagert und mit Kolloiden hoher chemischer Reaktivität?",
      hint: "N-Horizont vorh., der < 3 dm unter MOF beginnt und > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "result_N" },
        { text: "Nein", next: "mineral_tropisch_ja_ast" },
      ],
    },

    mineral_loesungsverwitterung_nein_ast: {
      id: "mineral_loesungsverwitterung_nein_ast",
      question: "Unterboden durch Lösungsverwitterung entstanden?",
      hint: "T-Horizont vorh.",
      options: [
        { text: "Ja", next: "result_C" },
        { text: "Nein", next: "result_D_nein_ast" },
      ],
    },

    mineral_locker_kolloide_nein_ast: {
      id: "mineral_locker_kolloide_nein_ast",
      question:
        "Unterboden sehr locker gelagert und mit Kolloiden hoher chemischer Reaktivität?",
      hint: "N-Horizont vorh., der < 3 dm unter MOF beginnt und > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "result_N" },
        { text: "Nein", next: "mineral_tropisch_nein_ast" },
      ],
    },

    mineral_tropisch_ja_ast: {
      id: "mineral_tropisch_ja_ast",
      question:
        "Mit einem durch tropische Verwitterung entstandenen Unterboden?",
      hint: "Bu- oder Bj-Horizont vorhanden.",
      options: [
        { text: "Ja", next: "result_V" },
        { text: "Nein", next: "mineral_tonverlagerung_ja_ast" },
      ],
    },

    mineral_tropisch_nein_ast: {
      id: "mineral_tropisch_nein_ast",
      question:
        "Mit einem durch tropische Verwitterung entstandenen Unterboden?",
      hint: "Bu- oder Bj-Horizont vorhanden.",
      options: [
        { text: "Ja", next: "result_V" },
        { text: "Nein", next: "mineral_tonverlagerung_nein_ast" },
      ],
    },

    mineral_tonverlagerung_ja_ast: {
      id: "mineral_tonverlagerung_ja_ast",
      question: "Unterboden durch Tonverlagerung geprägt?",
      hint: "Kt < 8 dm u. MOF und nicht unter einem ggf. vorh. Bv.",
      options: [
        { text: "Ja", next: "result_L" },
        { text: "Nein", next: "result_B" },
      ],
    },

    mineral_tonverlagerung_nein_ast: {
      id: "mineral_tonverlagerung_nein_ast",
      question: "Unterboden durch Tonverlagerung geprägt?",
      hint: "Kt < 8 dm u. MOF und nicht unter einem ggf. vorh. Bv.",
      options: [
        { text: "Ja", next: "result_L" },
        { text: "Nein", next: "result_P" },
      ],
    },

    result_D_podzol_ast: {
      id: "result_D_podzol_ast",
      question:
        "Unterboden sehr locker gelagert und mit Kolloiden hoher chemischer Reaktivität?",
      hint: "N-Horizont vorh., der < 3 dm unter MOF beginnt und > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "result_N" },
        { text: "Nein", next: "mineral_tropisch_ja_ast" },
      ],
    },

    result_D_nein_ast: {
      id: "result_D_nein_ast",
      question:
        "Unterboden sehr locker gelagert und mit Kolloiden hoher chemischer Reaktivität?",
      hint: "N-Horizont vorh., der < 3 dm unter MOF beginnt und > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "result_N" },
        { text: "Nein", next: "mineral_tropisch_nein_ast" },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // KLASSE-EBENE (Grobbestimmung) → Feinbestimmung als Optionen
    // ═══════════════════════════════════════════════════════════════

    // ── U ──────────────────────────────────────────────────────────
    result_U: {
      id: "result_U",
      question:
        "Klasse U – Subhydrische organische Böden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Uo an BOF beginnend", next: "typ_OG" },
        { text: "Ur an BOF beginnend", next: "typ_OS" },
      ],
    },

    typ_OG: {
      id: "typ_OG",
      question: "Ergebnis",
      result: {
        title: "Typ OG – Organogyttja",
        description: "Uo an BOF beginnend.",
      },
    },
    typ_OS: {
      id: "typ_OS",
      question: "Ergebnis",
      result: {
        title: "Typ OS – Organosapropel",
        description: "Ur an BOF beginnend.",
      },
    },

    // ── F ──────────────────────────────────────────────────────────
    result_F: {
      id: "result_F",
      question:
        "Klasse F – Organosole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "O..- und O..+C.. in Summe < 1 dm mächtig", next: "typ_FP" },
        {
          text: "O.. ≥ 3 dm mächtig oder O..- und O..+C in Summe 1–< 3 dm mächtig und über C",
          next: "typ_FF",
        },
      ],
    },

    typ_FP: {
      id: "typ_FP",
      question: "Ergebnis",
      result: {
        title: "Typ FP – Protoorganosol",
        description: "O..- und O..+C.. in Summe < 1 dm mächtig.",
      },
    },
    typ_FF: {
      id: "typ_FF",
      question: "Ergebnis",
      result: {
        title: "Typ FF – Organosol",
        description:
          "O.. ≥ 3 dm mächtig oder O..- und O..+C in Summe 1–< 3 dm mächtig und über C.",
      },
    },

    // ── H ──────────────────────────────────────────────────────────
    result_H: {
      id: "result_H",
      question:
        "Klasse H – Natürliche und naturnahe Moore\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        {
          text: "hH > 1 dm mächtig und hHw < 1 dm u. TOF beginnend",
          next: "typ_HH",
        },
        {
          text: "nH oder uH > 1 dm mächtig und nHw oder uHw < 1 dm u. TOF beginnend",
          next: "typ_HN",
        },
        { text: "Uw oder Ur < 1 dm u. TOF beginnend", next: "typ_HW" },
      ],
    },

    typ_HH: {
      id: "typ_HH",
      question: "Ergebnis",
      result: {
        title: "Typ HH – Hochmoor",
        description: "hH > 1 dm mächtig und hHw < 1 dm u. TOF beginnend.",
      },
    },
    typ_HN: {
      id: "typ_HN",
      question: "Ergebnis",
      result: {
        title: "Typ HN – Niedermoor",
        description:
          "nH oder uH > 1 dm mächtig und nHw oder uHw < 1 dm u. TOF beginnend.",
      },
    },
    typ_HW: {
      id: "typ_HW",
      question: "Ergebnis",
      result: {
        title: "Typ HW – Muddemoor",
        description: "Uw oder Ur < 1 dm u. TOF beginnend.",
      },
    },

    // ── K ──────────────────────────────────────────────────────────
    result_K: {
      id: "result_K",
      question:
        "Klasse K – Erd- und Mulmmoore\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Hv ≥ 1 dm mächtig über hH..", next: "typ_KH" },
        { text: "Hm ≥ 1 dm mächtig über hH..", next: "typ_KO" },
        { text: "Hv ≥ 1 dm mächtig über nH.. oder uH..", next: "typ_KV" },
        { text: "Hm ≥ 1 dm mächtig über nH.. oder uH..", next: "typ_KM" },
        { text: "Uv < 1 dm u. TOF beginnend", next: "typ_KE" },
        { text: "Um < 1 dm u. TOF beginnend", next: "typ_KU" },
      ],
    },

    typ_KH: {
      id: "typ_KH",
      question: "Ergebnis",
      result: {
        title: "Typ KH – Erdhochmoor",
        description: "Hv ≥ 1 dm mächtig über hH..",
      },
    },
    typ_KO: {
      id: "typ_KO",
      question: "Ergebnis",
      result: {
        title: "Typ KO – Mulmhochmoor",
        description: "Hm ≥ 1 dm mächtig über hH..",
      },
    },
    typ_KV: {
      id: "typ_KV",
      question: "Ergebnis",
      result: {
        title: "Typ KV – Erdniedermoor",
        description: "Hv ≥ 1 dm mächtig über nH.. oder uH..",
      },
    },
    typ_KM: {
      id: "typ_KM",
      question: "Ergebnis",
      result: {
        title: "Typ KM – Mulmniedermoor",
        description: "Hm ≥ 1 dm mächtig über nH.. oder uH..",
      },
    },
    typ_KE: {
      id: "typ_KE",
      question: "Ergebnis",
      result: {
        title: "Typ KE – Erdmuddemoor",
        description: "Uv < 1 dm u. TOF beginnend.",
      },
    },
    typ_KU: {
      id: "typ_KU",
      question: "Ergebnis",
      result: {
        title: "Typ KU – Mulmmuddemoor",
        description: "Um < 1 dm u. TOF beginnend.",
      },
    },

    // ── M ──────────────────────────────────────────────────────────
    result_M: {
      id: "result_M",
      question:
        "Klasse M – Moorkultisole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Wi oder Wp bis ≥ 4 dm reichend", next: "typ_MR" },
        { text: "Wt bis ≥ 4 dm reichend", next: "typ_MD" },
      ],
    },

    typ_MR: {
      id: "typ_MR",
      question: "Ergebnis",
      result: {
        title: "Typ MR – Rigomoorkultisol",
        description: "Wi oder Wp bis ≥ 4 dm reichend.",
      },
    },
    typ_MD: {
      id: "typ_MD",
      question: "Ergebnis",
      result: {
        title: "Typ MD – Depomoorkultisol",
        description: "Wt bis ≥ 4 dm reichend.",
      },
    },

    // ── O ──────────────────────────────────────────────────────────
    result_O: {
      id: "result_O",
      question:
        "Klasse O – Rohböden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "Ai vorhanden", next: "typ_OO" }],
    },

    typ_OO: {
      id: "typ_OO",
      question: "Ergebnis",
      result: { title: "Typ OO – Syrosem", description: "Ai vorhanden." },
    },

    // ── R ──────────────────────────────────────────────────────────
    result_R: {
      id: "result_R",
      question:
        "Klasse R – A/C-Böden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Ah, Ax, Au < 4 dm mächtig über i..C..", next: "typ_RN" },
        { text: "Ah, Ax < 4 dm mächtig über e..C..", next: "typ_RZ" },
        { text: "Ah, Ax < 4 dm mächtig über c..C..", next: "typ_RR" },
        { text: "Ax bis ≥ 4 dm u. MOF reichend", next: "typ_RT" },
        { text: "Au bis ≥ 4 dm u. MOF reichend", next: "typ_RU" },
      ],
    },

    typ_RN: {
      id: "typ_RN",
      question: "Ergebnis",
      result: {
        title: "Typ RN – Ranker",
        description: "Ah, Ax, Au < 4 dm mächtig über i..C..",
      },
    },
    typ_RZ: {
      id: "typ_RZ",
      question: "Ergebnis",
      result: {
        title: "Typ RZ – Pararendzina",
        description: "Ah, Ax < 4 dm mächtig über e..C..",
      },
    },
    typ_RR: {
      id: "typ_RR",
      question: "Ergebnis",
      result: {
        title: "Typ RR – Rendzina",
        description: "Ah, Ax < 4 dm mächtig über c..C..",
      },
    },
    typ_RT: {
      id: "typ_RT",
      question: "Ergebnis",
      result: {
        title: "Typ RT – Tschernosem",
        description: "Ax bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_RU: {
      id: "typ_RU",
      question: "Ergebnis",
      result: {
        title: "Typ RU – Umbrisol",
        description: "Au bis ≥ 4 dm u. MOF reichend.",
      },
    },

    // ── D ──────────────────────────────────────────────────────────
    result_D: {
      id: "result_D",
      question:
        "Klasse D – Pelosole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "Pv < 3 dm u. MOF beginnend", next: "typ_DD" }],
    },

    typ_DD: {
      id: "typ_DD",
      question: "Ergebnis",
      result: {
        title: "Typ DD – Pelosol",
        description: "Pv < 3 dm u. MOF beginnend.",
      },
    },

    // ── N ──────────────────────────────────────────────────────────
    result_N: {
      id: "result_N",
      question:
        "Klasse N – Andosole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        {
          text: "N..v oder N..v-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend",
          next: "typ_NN",
        },
      ],
    },

    typ_NN: {
      id: "typ_NN",
      question: "Ergebnis",
      result: {
        title: "Typ NN – Andosol",
        description:
          "N..v oder N..v-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
      },
    },

    // ── B ──────────────────────────────────────────────────────────
    result_B: {
      id: "result_B",
      question:
        "Klasse B – Braunerden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "Bv vorhanden", next: "typ_BB" }],
    },

    typ_BB: {
      id: "typ_BB",
      question: "Ergebnis",
      result: { title: "Typ BB – Braunerde", description: "Bv vorhanden." },
    },

    // ── C ──────────────────────────────────────────────────────────
    result_C: {
      id: "result_C",
      question:
        "Klasse C – Terrae calcis\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Tv < 3 dm u. MOF beginnend", next: "typ_CF" },
        { text: "Tu < 3 dm u. MOF beginnend", next: "typ_CR" },
      ],
    },

    typ_CF: {
      id: "typ_CF",
      question: "Ergebnis",
      result: {
        title: "Typ CF – Terra fusca",
        description: "Tv < 3 dm u. MOF beginnend.",
      },
    },
    typ_CR: {
      id: "typ_CR",
      question: "Ergebnis",
      result: {
        title: "Typ CR – Terra rossa",
        description: "Tu < 3 dm u. MOF beginnend.",
      },
    },

    // ── V ──────────────────────────────────────────────────────────
    result_V: {
      id: "result_V",
      question:
        "Klasse V – Ferrallite u. Fersiallite\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Bj vorhanden", next: "typ_VV" },
        { text: "Bu vorhanden", next: "typ_VW" },
      ],
    },

    typ_VV: {
      id: "typ_VV",
      question: "Ergebnis",
      result: { title: "Typ VV – Fersiallit", description: "Bj vorhanden." },
    },
    typ_VW: {
      id: "typ_VW",
      question: "Ergebnis",
      result: { title: "Typ VW – Ferrallit", description: "Bu vorhanden." },
    },

    // ── L ──────────────────────────────────────────────────────────
    result_L: {
      id: "result_L",
      question:
        "Klasse L – Lessivés\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Kt < 8 dm u. MOF beginnend", next: "typ_LL" },
        {
          text: "Kt < 8 dm u. MOF beginnend und Eal vorhanden",
          next: "typ_LF",
        },
      ],
    },

    typ_LL: {
      id: "typ_LL",
      question: "Ergebnis",
      result: {
        title: "Typ LL – Parabraunerde",
        description: "Kt < 8 dm u. MOF beginnend.",
      },
    },
    typ_LF: {
      id: "typ_LF",
      question: "Ergebnis",
      result: {
        title: "Typ LF – Fahlerde",
        description: "Kt < 8 dm u. MOF beginnend und Eal vorhanden.",
      },
    },

    // ── P ──────────────────────────────────────────────────────────
    result_P: {
      id: "result_P",
      question:
        "Klasse P – Podsole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "Kh oder Ks vorhanden", next: "typ_PP" }],
    },

    typ_PP: {
      id: "typ_PP",
      question: "Ergebnis",
      result: {
        title: "Typ PP – Podsol",
        description: "Kh oder Ks vorhanden.",
      },
    },

    // ── Y ──────────────────────────────────────────────────────────
    result_Y: {
      id: "result_Y",
      question:
        "Klasse Y – Aerobe Kultisole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Dj bis ≥ 4 dm u. MOF reichend", next: "typ_YK" },
        { text: "Dt bis ≥ 4 dm u. MOF reichend", next: "typ_YD" },
        { text: "De bis ≥ 4 dm u. MOF reichend", next: "typ_YE" },
        { text: "Dx bis ≥ 4 dm u. MOF reichend", next: "typ_YO" },
        { text: "R.. bis ≥ 4 dm u. MOF reichend", next: "typ_YY" },
      ],
    },

    typ_YK: {
      id: "typ_YK",
      question: "Ergebnis",
      result: {
        title: "Typ YK – Kolluvisol",
        description: "Dj bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_YD: {
      id: "typ_YD",
      question: "Ergebnis",
      result: {
        title: "Typ YD – Deposol",
        description: "Dt bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_YE: {
      id: "typ_YE",
      question: "Ergebnis",
      result: {
        title: "Typ YE – Plaggenesch",
        description: "De bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_YO: {
      id: "typ_YO",
      question: "Ergebnis",
      result: {
        title: "Typ YO – Hortisol",
        description: "Dx bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_YY: {
      id: "typ_YY",
      question: "Ergebnis",
      result: {
        title: "Typ YY – Rigosol",
        description: "R.. bis ≥ 4 dm u. MOF reichend.",
      },
    },

    // ── S ──────────────────────────────────────────────────────────
    result_S: {
      id: "result_S",
      question:
        "Klasse S – Stauwasserböden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Sw oder Sd < 4 dm u. GOF beginnend", next: "typ_SS" },
        { text: "Sg < 4 dm u. GOF beginnend", next: "typ_SH" },
        { text: "Srw < 4 dm u. GOF beginnend", next: "typ_SG" },
      ],
    },

    typ_SS: {
      id: "typ_SS",
      question: "Ergebnis",
      result: {
        title: "Typ SS – Pseudogley",
        description: "Sw oder Sd < 4 dm u. GOF beginnend.",
      },
    },
    typ_SH: {
      id: "typ_SH",
      question: "Ergebnis",
      result: {
        title: "Typ SH – Haftpseudogley",
        description: "Sg < 4 dm u. GOF beginnend.",
      },
    },
    typ_SG: {
      id: "typ_SG",
      question: "Ergebnis",
      result: {
        title: "Typ SG – Stagnogley",
        description: "Srw < 4 dm u. GOF beginnend.",
      },
    },

    // ── Q ──────────────────────────────────────────────────────────
    result_Q: {
      id: "result_Q",
      question:
        "Klasse Q – Rheosole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        {
          text: "Vf oder Vf-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend",
          next: "typ_QO",
        },
        {
          text: "Vc oder Vc-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend",
          next: "typ_QC",
        },
      ],
    },

    typ_QO: {
      id: "typ_QO",
      question: "Ergebnis",
      result: {
        title: "Typ QO – Ockerrheosol",
        description:
          "Vf oder Vf-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
      },
    },
    typ_QC: {
      id: "typ_QC",
      question: "Ergebnis",
      result: {
        title: "Typ QC – Kalkreosol",
        description:
          "Vc oder Vc-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
      },
    },

    // ── A ──────────────────────────────────────────────────────────
    result_A: {
      id: "result_A",
      question:
        "Klasse A – Auenböden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Ami über ..ICv", next: "typ_AO" },
        { text: "Amh, Amu oder Amx über iCv", next: "typ_AQ" },
        { text: "Amh oder Amx über elCv oder clCv", next: "typ_AZ" },
        { text: "Amx bis ≥ 4 dm u. MOF reichend", next: "typ_AT" },
        { text: "Am.. über Mm, bis ≥ 4 dm u. MOF reichend", next: "typ_AB" },
      ],
    },

    typ_AO: {
      id: "typ_AO",
      question: "Ergebnis",
      result: { title: "Typ AO – Rambla", description: "Ami über ..ICv." },
    },
    typ_AQ: {
      id: "typ_AQ",
      question: "Ergebnis",
      result: {
        title: "Typ AQ – Paternia",
        description: "Amh, Amu oder Amx über iCv.",
      },
    },
    typ_AZ: {
      id: "typ_AZ",
      question: "Ergebnis",
      result: {
        title: "Typ AZ – Carbonatpaternia",
        description: "Amh oder Amx über elCv oder clCv.",
      },
    },
    typ_AT: {
      id: "typ_AT",
      question: "Ergebnis",
      result: {
        title: "Typ AT – Tschernitza",
        description: "Amx bis ≥ 4 dm u. MOF reichend.",
      },
    },
    typ_AB: {
      id: "typ_AB",
      question: "Ergebnis",
      result: {
        title: "Typ AB – Vega",
        description: "Am.. über Mm, bis ≥ 4 dm u. MOF reichend.",
      },
    },

    // ── G ──────────────────────────────────────────────────────────
    result_G: {
      id: "result_G",
      question:
        "Klasse G – Gleye\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        {
          text: "Go < 4 dm u. GOF beginnend und Gr ≥ 4 dm u. GOF beginnend",
          next: "typ_GG",
        },
        {
          text: "tGo < 4 dm u. GOF beginnend und tGr ≥ 4 dm u. GOF beginnend",
          next: "typ_GK",
        },
        { text: "Gr < 4 dm u. GOF beginnend", next: "typ_GN" },
      ],
    },

    typ_GG: {
      id: "typ_GG",
      question: "Ergebnis",
      result: {
        title: "Typ GG – Gley",
        description:
          "Go < 4 dm u. GOF beginnend und Gr ≥ 4 dm u. GOF beginnend.",
      },
    },
    typ_GK: {
      id: "typ_GK",
      question: "Ergebnis",
      result: {
        title: "Typ GK – Marschgley",
        description:
          "tGo < 4 dm u. GOF beginnend und tGr ≥ 4 dm u. GOF beginnend.",
      },
    },
    typ_GN: {
      id: "typ_GN",
      question: "Ergebnis",
      result: {
        title: "Typ GN – Nassgley",
        description: "Gr < 4 dm u. GOF beginnend.",
      },
    },

    // ── Ü ──────────────────────────────────────────────────────────
    result_Ue: {
      id: "result_Ue",
      question:
        "Klasse Ü – Strandböden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "..ICq oder ..Gqo an MOF beginnend", next: "typ_UeA" }],
    },

    typ_UeA: {
      id: "typ_UeA",
      question: "Ergebnis",
      result: {
        title: "Typ ÜA – Strand",
        description: "..ICq oder ..Gqo an MOF beginnend.",
      },
    },

    // ── I ──────────────────────────────────────────────────────────
    result_I: {
      id: "result_I",
      question:
        "Klasse I – Semisubhydrische Böden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Fqwo an MOF beginnend", next: "typ_IA" },
        { text: "tFo an MOF beginnend", next: "typ_IW" },
      ],
    },

    typ_IA: {
      id: "typ_IA",
      question: "Ergebnis",
      result: {
        title: "Typ IA – Nasstrand",
        description: "Fqwo an MOF beginnend.",
      },
    },
    typ_IW: {
      id: "typ_IW",
      question: "Ergebnis",
      result: { title: "Typ IW – Watt", description: "tFo an MOF beginnend." },
    },

    // ── J ──────────────────────────────────────────────────────────
    result_J: {
      id: "result_J",
      question:
        "Klasse J – Subhydrische Mineralböden\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [
        { text: "Fi oder Fw an MOF beginnend", next: "typ_JP" },
        { text: "Fo an MOF beginnend", next: "typ_JG" },
        { text: "Fr an MOF beginnend", next: "typ_JS" },
      ],
    },

    typ_JP: {
      id: "typ_JP",
      question: "Ergebnis",
      result: {
        title: "Typ JP – Protopedon",
        description: "Fi oder Fw an MOF beginnend.",
      },
    },
    typ_JG: {
      id: "typ_JG",
      question: "Ergebnis",
      result: {
        title: "Typ JG – Minerogyttja",
        description: "Fo an MOF beginnend.",
      },
    },
    typ_JS: {
      id: "typ_JS",
      question: "Ergebnis",
      result: {
        title: "Typ JS – Minerosapropel",
        description: "Fr an MOF beginnend.",
      },
    },

    // ── X ──────────────────────────────────────────────────────────
    result_X: {
      id: "result_X",
      question:
        "Klasse X – Reduktosole\nWelche diagnostischen Horizonte sind vorhanden?",
      options: [{ text: "Y.. < 4 dm u. MOF beginnend", next: "typ_XX" }],
    },

    typ_XX: {
      id: "typ_XX",
      question: "Ergebnis",
      result: {
        title: "Typ XX – Reduktosol",
        description: "Y.. < 4 dm u. MOF beginnend.",
      },
    },
  },
};
