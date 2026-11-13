import {
  leaf,
  type DecisionTreeData,
  type InnerNode,
  type TreeOption,
} from "@/data/trees/types";

/** Class headings (Bodenklassen); shown above the Typ question and the result. */
const KLASSE = {
  U: "Klasse U – Subhydrische organische Böden",
  F: "Klasse F – Organosole",
  H: "Klasse H – Natürliche und naturnahe Moore",
  K: "Klasse K – Erd- und Mulmmoore",
  M: "Klasse M – Moorkultisole",
  O: "Klasse O – Rohböden",
  R: "Klasse R – A/C-Böden",
  D: "Klasse D – Pelosole",
  N: "Klasse N – Andosole",
  B: "Klasse B – Braunerden",
  C: "Klasse C – Terrae calcis",
  V: "Klasse V – Ferrallite u. Fersiallite",
  L: "Klasse L – Lessivés",
  P: "Klasse P – Podsole",
  Y: "Klasse Y – Aerobe Kultisole",
  S: "Klasse S – Stauwasserböden",
  Q: "Klasse Q – Rheosole",
  A: "Klasse A – Auenböden",
  G: "Klasse G – Gleye",
  Ue: "Klasse Ü – Strandböden",
  I: "Klasse I – Semisubhydrische Böden",
  J: "Klasse J – Subhydrische Mineralböden",
  X: "Klasse X – Reduktosole",
} as const;

type Klasse = keyof typeof KLASSE;

/** Typ question within a class (Feinbestimmung). */
function klasse(k: Klasse, options: TreeOption[]): InnerNode {
  return {
    question: `${KLASSE[k]}\nWelche diagnostischen Horizonte sind vorhanden?`,
    options,
  };
}

/** Typ result; the heading names its class. Title format "Typ <Abk> – <Name>" is split by ProfilSection. */
function typ(k: Klasse, title: string, description: string) {
  return leaf(title, description, KLASSE[k]);
}

const N_HINT =
  "N-Horizont vorh., der < 3 dm unter MOF beginnt und > 4 dm unter MOF reicht.";

export const BodentypTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question:
        "Dominierend aus organischen (O-, H-, U- oder W-) Horizonten bestehend?",
      hint: "Mit Of- und Oh-Horizonten von zusammen ≥ 3 dm Mächtigkeit oder mit O-Horizonten unmittelbar über C-Horizont; oder subhydrisch und mit U-Horizont, der an der MOF beginnt; oder mit H- oder U-Horizont, die innerhalb von 7 dm unter GOF in der Summe eine Mächtigkeit ≥ 3 dm aufweisen.",
      options: [
        { text: "Ja", next: "organisch_subhydrisch" },
        { text: "Nein", next: "mineral_wassereinfluss" },
      ],
    },

    // ─────────────────────────────────────────────
    // ORGANISCHE BÖDEN
    // ─────────────────────────────────────────────

    organisch_subhydrisch: {
      question: "Subhydrisch mit U-Horizont an der GOF?",
      hint: "Subhydrisch und mit U-Horizont an der GOF.",
      options: [
        { text: "Ja", next: "klasse_U" },
        { text: "Nein", next: "organisch_auflage" },
      ],
    },

    organisch_auflage: {
      question:
        "Mit mächtiger organischer Auflage oder Auflage direkt über dem unveränderten Locker- oder Festgestein?",
      hint: "Mit Of- und Oh-Horizonten von zusammen ≥ 3 dm Mächtigkeit oder mit O-Horizonten unmittelbar über dem C-Horizont.",
      options: [
        { text: "Ja", next: "klasse_F" },
        { text: "Nein", next: "organisch_torfe" },
      ],
    },

    organisch_torfe: {
      question: "Aus verlagerten oder gemischten Torfen oder Mudden bestehend?",
      hint: "W-Horizont ≥ 4 dm.",
      options: [
        { text: "Ja", next: "klasse_M" },
        { text: "Nein", next: "organisch_vererdet" },
      ],
    },

    organisch_vererdet: {
      question: "Oberster Horizont höchstens gering vererdet oder vermulmt?",
      hint: "Hn-, Hw- oder Uw-Horizont in < 1 dm unter der TOF beginnend.",
      options: [
        { text: "Ja", next: "klasse_H" },
        { text: "Nein", next: "klasse_K" },
      ],
    },

    // ─────────────────────────────────────────────
    // MINERALISCHE BÖDEN – Wassereinfluss
    // ─────────────────────────────────────────────

    mineral_wassereinfluss: {
      question: "Mit dominierendem Einfluss von Wasser oder Reduktgasen?",
      hint: "Mit einem S-, G- oder Y-Horizont, der < 4 dm unter MOF beginnt; oder mit S-Horizont, der im oder unmittelbar unter einem Ap-Horizont beginnt; oder mit V-Horizont, der < 4 dm unter MOF beginnt und > 1 dm Mächtigkeit hat; oder mit Am.- oder ..lCq-Horizont, der an der MOF beginnt; oder mit F-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_grund_ufer" },
        { text: "Nein", next: "mineral_kein_wassereinfluss" },
      ],
    },

    mineral_grund_ufer: {
      question:
        "Am Grund oder Ufer von Gewässern oder durch Reduktgase dominiert?",
      hint: "Mit Y-Horizont, oder mit F-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_reduktgas" },
        { text: "Nein", next: "mineral_stau_haft" },
      ],
    },

    mineral_reduktgas: {
      question: "Durch Reduktgase dominiert?",
      hint: "Mit Y-Horizont.",
      options: [
        { text: "Ja", next: "typ_XX" },
        { text: "Nein", next: "mineral_wasserschwankung" },
      ],
    },

    mineral_wasserschwankung: {
      question: "Im Wasserschwankungsbereich des Meeres und der Ästuare?",
      hint: "Mit Fqwo-Horizont, der an der MOF beginnt.",
      options: [
        { text: "Ja", next: "klasse_I" },
        { text: "Nein", next: "klasse_J" },
      ],
    },

    mineral_stau_haft: {
      question: "Durch Stau-, Haft- oder Hangwasser geprägt?",
      hint: "Mit S-Horizont, der < 4 dm unter MOF beginnt; oder mit S-Horizont, der im oder unmittelbar unter einem Ap-Horizont beginnt; oder mit V-Horizont, der < 4 dm unter MOF beginnt und > 1 dm Mächtigkeit hat.",
      options: [
        { text: "Ja", next: "mineral_redoximorph" },
        { text: "Nein", next: "mineral_stoffeintraege" },
      ],
    },

    mineral_redoximorph: {
      question: "Mit redoximorphen Merkmalen?",
      hint: "Mit S-Horizont.",
      options: [
        { text: "Ja", next: "klasse_S" },
        { text: "Nein", next: "klasse_Q" },
      ],
    },

    mineral_stoffeintraege: {
      question:
        "Mit Stoffeinträgen im Oberboden durch Überflutungswasser, aber ohne hydromorphe Merkmale oberhalb 4 dm unter GOF?",
      hint: "Mit Am.-Horizont und G.-Horizont oberhalb 4 dm unter MOF fehlend.",
      options: [
        { text: "Ja", next: "klasse_A" },
        { text: "Nein", next: "mineral_strand_wind" },
      ],
    },

    mineral_strand_wind: {
      question: "Oberboden von Brandung und Wind umgelagert?",
      hint: "Mit Cq- oder Gq.-Horizont an der MOF.",
      options: [
        { text: "Ja", next: "typ_UeA" },
        { text: "Nein", next: "klasse_G" },
      ],
    },

    // ─────────────────────────────────────────────
    // MINERALISCHE BÖDEN – Kein dominanter Wassereinfluss
    // ─────────────────────────────────────────────

    mineral_kein_wassereinfluss: {
      question: "Natürlicher, voll entwickelter Unterbodenhorizont vorhanden?",
      hint: "P- oder T-Horizont vorhanden, der < 3 dm unter MOF beginnt; oder N-Horizont vorhanden, der < 3 dm unter MOF beginnt und ≥ 4 dm unter MOF reicht; oder K-Horizont vorh., der < 8 dm unter MOF beginnt; oder B-Horizont vorh.",
      options: [
        { text: "Ja", next: "mineral_tonreich" },
        { text: "Nein", next: "mineral_anthropogen" },
      ],
    },

    mineral_anthropogen: {
      question: "Durch anthropogene Horizonte geprägt?",
      hint: "D- oder R-Horizont, der unter dem A-Horizont beginnt und bis > 4 dm unter MOF reicht.",
      options: [
        { text: "Ja", next: "klasse_Y" },
        { text: "Nein", next: "mineral_oberboden_ausgebildet" },
      ],
    },

    mineral_oberboden_ausgebildet: {
      question: "Vollständig ausgebildeter Oberbodenhorizont?",
      hint: "A-Horizont vorh. und stärker als Al entwickelt.",
      options: [
        { text: "Ja", next: "klasse_R" },
        { text: "Nein", next: "typ_OO" },
      ],
    },

    mineral_tonreich: {
      question:
        "Tonreicher Unterboden, durch Lösungsverwitterung aus Kalkgesteinen, aus Tonstein oder tonig verwitterndem Gestein entstanden?",
      hint: "P- oder T-Horizont vorh., der < 3 dm unter MOF beginnt.",
      options: [
        { text: "Ja", next: "mineral_loesungsverwitterung" },
        { text: "Nein", next: "mineral_locker_kolloide" },
      ],
    },

    mineral_loesungsverwitterung: {
      question: "Unterboden durch Lösungsverwitterung entstanden?",
      hint: "T-Horizont vorh.",
      options: [
        { text: "Ja", next: "klasse_C" },
        // P-Horizont, aber kein T-Horizont → Pelosol
        { text: "Nein", next: "typ_DD" },
      ],
    },

    mineral_locker_kolloide: {
      question:
        "Unterboden sehr locker gelagert und mit Kolloiden hoher chemischer Reaktivität?",
      hint: N_HINT,
      options: [
        { text: "Ja", next: "typ_NN" },
        { text: "Nein", next: "mineral_tropisch" },
      ],
    },

    mineral_tropisch: {
      question:
        "Mit einem durch tropische Verwitterung entstandenen Unterboden?",
      hint: "Bu- oder Bj-Horizont vorhanden.",
      options: [
        { text: "Ja", next: "klasse_V" },
        { text: "Nein", next: "mineral_tonverlagerung" },
      ],
    },

    mineral_tonverlagerung: {
      question: "Unterboden durch Tonverlagerung geprägt?",
      hint: "Kt < 8 dm u. MOF und nicht unter einem ggf. vorh. Bv.",
      options: [
        { text: "Ja", next: "klasse_L" },
        { text: "Nein", next: "mineral_sauer_bleichung" },
      ],
    },

    // Kh/Ks only separates Podsol from Braunerde, so it is asked last.
    mineral_sauer_bleichung: {
      question:
        "Sauergebleichter Verarmungshorizont und Anreicherungshorizont von Eisenoxiden oder Humusstoffen ausgeprägt?",
      hint: "Kh- oder Ks-Horizont vorhanden und bis ≥ 1,5 dm unter MOF reichend oder direkt über C-Horizont.",
      options: [
        { text: "Ja", next: "typ_PP" },
        { text: "Nein", next: "typ_BB" },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // KLASSEN-EBENE (Grobbestimmung) → Feinbestimmung als Optionen.
    // Klassen mit nur einem Typ (O, D, N, B, P, Ü, X) führen direkt
    // zum Typ; die Klasse steht dort als Überschrift.
    // ═══════════════════════════════════════════════════════════════

    // ── U ──────────────────────────────────────────────────────────
    klasse_U: klasse("U", [
      { text: "Uo an BOF beginnend", next: "typ_OG" },
      { text: "Ur an BOF beginnend", next: "typ_OS" },
    ]),
    typ_OG: typ("U", "Typ OG – Organogyttja", "Uo an BOF beginnend."),
    typ_OS: typ("U", "Typ OS – Organosapropel", "Ur an BOF beginnend."),

    // ── F ──────────────────────────────────────────────────────────
    klasse_F: klasse("F", [
      { text: "O..- und O..+C.. in Summe < 1 dm mächtig", next: "typ_FP" },
      {
        text: "O.. ≥ 3 dm mächtig oder O..- und O..+C in Summe 1–< 3 dm mächtig und über C",
        next: "typ_FF",
      },
    ]),
    typ_FP: typ(
      "F",
      "Typ FP – Protoorganosol",
      "O..- und O..+C.. in Summe < 1 dm mächtig.",
    ),
    typ_FF: typ(
      "F",
      "Typ FF – Organosol",
      "O.. ≥ 3 dm mächtig oder O..- und O..+C in Summe 1–< 3 dm mächtig und über C.",
    ),

    // ── H ──────────────────────────────────────────────────────────
    klasse_H: klasse("H", [
      {
        text: "hH > 1 dm mächtig und hHw < 1 dm u. TOF beginnend",
        next: "typ_HH",
      },
      {
        text: "nH oder uH > 1 dm mächtig und nHw oder uHw < 1 dm u. TOF beginnend",
        next: "typ_HN",
      },
      { text: "Uw oder Ur < 1 dm u. TOF beginnend", next: "typ_HW" },
    ]),
    typ_HH: typ(
      "H",
      "Typ HH – Hochmoor",
      "hH > 1 dm mächtig und hHw < 1 dm u. TOF beginnend.",
    ),
    typ_HN: typ(
      "H",
      "Typ HN – Niedermoor",
      "nH oder uH > 1 dm mächtig und nHw oder uHw < 1 dm u. TOF beginnend.",
    ),
    typ_HW: typ(
      "H",
      "Typ HW – Muddemoor",
      "Uw oder Ur < 1 dm u. TOF beginnend.",
    ),

    // ── K ──────────────────────────────────────────────────────────
    klasse_K: klasse("K", [
      { text: "Hv ≥ 1 dm mächtig über hH..", next: "typ_KH" },
      { text: "Hm ≥ 1 dm mächtig über hH..", next: "typ_KO" },
      { text: "Hv ≥ 1 dm mächtig über nH.. oder uH..", next: "typ_KV" },
      { text: "Hm ≥ 1 dm mächtig über nH.. oder uH..", next: "typ_KM" },
      { text: "Uv < 1 dm u. TOF beginnend", next: "typ_KE" },
      { text: "Um < 1 dm u. TOF beginnend", next: "typ_KU" },
    ]),
    typ_KH: typ("K", "Typ KH – Erdhochmoor", "Hv ≥ 1 dm mächtig über hH.."),
    typ_KO: typ("K", "Typ KO – Mulmhochmoor", "Hm ≥ 1 dm mächtig über hH.."),
    typ_KV: typ(
      "K",
      "Typ KV – Erdniedermoor",
      "Hv ≥ 1 dm mächtig über nH.. oder uH..",
    ),
    typ_KM: typ(
      "K",
      "Typ KM – Mulmniedermoor",
      "Hm ≥ 1 dm mächtig über nH.. oder uH..",
    ),
    typ_KE: typ("K", "Typ KE – Erdmuddemoor", "Uv < 1 dm u. TOF beginnend."),
    typ_KU: typ("K", "Typ KU – Mulmmuddemoor", "Um < 1 dm u. TOF beginnend."),

    // ── M ──────────────────────────────────────────────────────────
    klasse_M: klasse("M", [
      { text: "Wi oder Wp bis ≥ 4 dm reichend", next: "typ_MR" },
      { text: "Wt bis ≥ 4 dm reichend", next: "typ_MD" },
    ]),
    typ_MR: typ(
      "M",
      "Typ MR – Rigomoorkultisol",
      "Wi oder Wp bis ≥ 4 dm reichend.",
    ),
    typ_MD: typ("M", "Typ MD – Depomoorkultisol", "Wt bis ≥ 4 dm reichend."),

    // ── O ──────────────────────────────────────────────────────────
    typ_OO: typ("O", "Typ OO – Syrosem", "Ai vorhanden."),

    // ── R ──────────────────────────────────────────────────────────
    klasse_R: klasse("R", [
      { text: "Ah, Ax, Au < 4 dm mächtig über i..C..", next: "typ_RN" },
      { text: "Ah, Ax < 4 dm mächtig über e..C..", next: "typ_RZ" },
      { text: "Ah, Ax < 4 dm mächtig über c..C..", next: "typ_RR" },
      { text: "Ax bis ≥ 4 dm u. MOF reichend", next: "typ_RT" },
      { text: "Au bis ≥ 4 dm u. MOF reichend", next: "typ_RU" },
    ]),
    typ_RN: typ(
      "R",
      "Typ RN – Ranker",
      "Ah, Ax, Au < 4 dm mächtig über i..C..",
    ),
    typ_RZ: typ(
      "R",
      "Typ RZ – Pararendzina",
      "Ah, Ax < 4 dm mächtig über e..C..",
    ),
    typ_RR: typ("R", "Typ RR – Rendzina", "Ah, Ax < 4 dm mächtig über c..C.."),
    typ_RT: typ("R", "Typ RT – Tschernosem", "Ax bis ≥ 4 dm u. MOF reichend."),
    typ_RU: typ("R", "Typ RU – Umbrisol", "Au bis ≥ 4 dm u. MOF reichend."),

    // ── D ──────────────────────────────────────────────────────────
    typ_DD: typ("D", "Typ DD – Pelosol", "Pv < 3 dm u. MOF beginnend."),

    // ── N ──────────────────────────────────────────────────────────
    typ_NN: typ(
      "N",
      "Typ NN – Andosol",
      "N..v oder N..v-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
    ),

    // ── B ──────────────────────────────────────────────────────────
    typ_BB: typ("B", "Typ BB – Braunerde", "Bv vorhanden."),

    // ── C ──────────────────────────────────────────────────────────
    klasse_C: klasse("C", [
      { text: "Tv < 3 dm u. MOF beginnend", next: "typ_CF" },
      { text: "Tu < 3 dm u. MOF beginnend", next: "typ_CR" },
    ]),
    typ_CF: typ("C", "Typ CF – Terra fusca", "Tv < 3 dm u. MOF beginnend."),
    typ_CR: typ("C", "Typ CR – Terra rossa", "Tu < 3 dm u. MOF beginnend."),

    // ── V ──────────────────────────────────────────────────────────
    klasse_V: klasse("V", [
      { text: "Bj vorhanden", next: "typ_VV" },
      { text: "Bu vorhanden", next: "typ_VW" },
    ]),
    typ_VV: typ("V", "Typ VV – Fersiallit", "Bj vorhanden."),
    typ_VW: typ("V", "Typ VW – Ferrallit", "Bu vorhanden."),

    // ── L ──────────────────────────────────────────────────────────
    klasse_L: klasse("L", [
      { text: "Kt < 8 dm u. MOF beginnend, ohne Eal", next: "typ_LL" },
      {
        text: "Kt < 8 dm u. MOF beginnend und Eal vorhanden",
        next: "typ_LF",
      },
    ]),
    typ_LL: typ(
      "L",
      "Typ LL – Parabraunerde",
      "Kt < 8 dm u. MOF beginnend, ohne Eal.",
    ),
    typ_LF: typ(
      "L",
      "Typ LF – Fahlerde",
      "Kt < 8 dm u. MOF beginnend und Eal vorhanden.",
    ),

    // ── P ──────────────────────────────────────────────────────────
    typ_PP: typ("P", "Typ PP – Podsol", "Kh oder Ks vorhanden."),

    // ── Y ──────────────────────────────────────────────────────────
    klasse_Y: klasse("Y", [
      { text: "Dj bis ≥ 4 dm u. MOF reichend", next: "typ_YK" },
      { text: "Dt bis ≥ 4 dm u. MOF reichend", next: "typ_YD" },
      { text: "De bis ≥ 4 dm u. MOF reichend", next: "typ_YE" },
      { text: "Dx bis ≥ 4 dm u. MOF reichend", next: "typ_YO" },
      { text: "R.. bis ≥ 4 dm u. MOF reichend", next: "typ_YY" },
    ]),
    typ_YK: typ("Y", "Typ YK – Kolluvisol", "Dj bis ≥ 4 dm u. MOF reichend."),
    typ_YD: typ("Y", "Typ YD – Deposol", "Dt bis ≥ 4 dm u. MOF reichend."),
    typ_YE: typ("Y", "Typ YE – Plaggenesch", "De bis ≥ 4 dm u. MOF reichend."),
    typ_YO: typ("Y", "Typ YO – Hortisol", "Dx bis ≥ 4 dm u. MOF reichend."),
    typ_YY: typ("Y", "Typ YY – Rigosol", "R.. bis ≥ 4 dm u. MOF reichend."),

    // ── S ──────────────────────────────────────────────────────────
    klasse_S: klasse("S", [
      { text: "Sw oder Sd < 4 dm u. GOF beginnend", next: "typ_SS" },
      { text: "Sg < 4 dm u. GOF beginnend", next: "typ_SH" },
      { text: "Srw < 4 dm u. GOF beginnend", next: "typ_SG" },
    ]),
    typ_SS: typ(
      "S",
      "Typ SS – Pseudogley",
      "Sw oder Sd < 4 dm u. GOF beginnend.",
    ),
    typ_SH: typ("S", "Typ SH – Haftpseudogley", "Sg < 4 dm u. GOF beginnend."),
    typ_SG: typ("S", "Typ SG – Stagnogley", "Srw < 4 dm u. GOF beginnend."),

    // ── Q ──────────────────────────────────────────────────────────
    klasse_Q: klasse("Q", [
      {
        text: "Vf oder Vf-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend",
        next: "typ_QO",
      },
      {
        text: "Vc oder Vc-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend",
        next: "typ_QC",
      },
    ]),
    typ_QO: typ(
      "Q",
      "Typ QO – Ockerrheosol",
      "Vf oder Vf-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
    ),
    typ_QC: typ(
      "Q",
      "Typ QC – Kalkrheosol",
      "Vc oder Vc-A.. < 3 dm u. MOF beginnend und bis ≥ 4 dm reichend.",
    ),

    // ── A ──────────────────────────────────────────────────────────
    klasse_A: klasse("A", [
      { text: "Ami über ..lCv", next: "typ_AO" },
      { text: "Amh, Amu oder Amx über iCv", next: "typ_AQ" },
      { text: "Amh oder Amx über elCv oder clCv", next: "typ_AZ" },
      { text: "Amx bis ≥ 4 dm u. MOF reichend", next: "typ_AT" },
      { text: "Am.. über Mm, bis ≥ 4 dm u. MOF reichend", next: "typ_AB" },
    ]),
    typ_AO: typ("A", "Typ AO – Rambla", "Ami über ..lCv."),
    typ_AQ: typ("A", "Typ AQ – Paternia", "Amh, Amu oder Amx über iCv."),
    typ_AZ: typ(
      "A",
      "Typ AZ – Carbonatpaternia",
      "Amh oder Amx über elCv oder clCv.",
    ),
    typ_AT: typ("A", "Typ AT – Tschernitza", "Amx bis ≥ 4 dm u. MOF reichend."),
    typ_AB: typ(
      "A",
      "Typ AB – Vega",
      "Am.. über Mm, bis ≥ 4 dm u. MOF reichend.",
    ),

    // ── G ──────────────────────────────────────────────────────────
    klasse_G: klasse("G", [
      {
        text: "Go (nicht tGo) < 4 dm u. GOF beginnend und Gr ≥ 4 dm u. GOF beginnend",
        next: "typ_GG",
      },
      {
        text: "tGo < 4 dm u. GOF beginnend und tGr ≥ 4 dm u. GOF beginnend",
        next: "typ_GK",
      },
      { text: "Gr < 4 dm u. GOF beginnend", next: "typ_GN" },
    ]),
    typ_GG: typ(
      "G",
      "Typ GG – Gley",
      "Go (nicht tGo) < 4 dm u. GOF beginnend und Gr ≥ 4 dm u. GOF beginnend.",
    ),
    typ_GK: typ(
      "G",
      "Typ GK – Marschgley",
      "tGo < 4 dm u. GOF beginnend und tGr ≥ 4 dm u. GOF beginnend.",
    ),
    typ_GN: typ("G", "Typ GN – Nassgley", "Gr < 4 dm u. GOF beginnend."),

    // ── Ü ──────────────────────────────────────────────────────────
    typ_UeA: typ("Ue", "Typ ÜA – Strand", "..lCq oder ..Gqo an MOF beginnend."),

    // ── I ──────────────────────────────────────────────────────────
    klasse_I: klasse("I", [
      { text: "Fqwo an MOF beginnend", next: "typ_IA" },
      { text: "tFo an MOF beginnend", next: "typ_IW" },
    ]),
    typ_IA: typ("I", "Typ IA – Nasstrand", "Fqwo an MOF beginnend."),
    typ_IW: typ("I", "Typ IW – Watt", "tFo an MOF beginnend."),

    // ── J ──────────────────────────────────────────────────────────
    klasse_J: klasse("J", [
      { text: "Fi oder Fw an MOF beginnend", next: "typ_JP" },
      { text: "Fo an MOF beginnend", next: "typ_JG" },
      { text: "Fr an MOF beginnend", next: "typ_JS" },
    ]),
    typ_JP: typ("J", "Typ JP – Protopedon", "Fi oder Fw an MOF beginnend."),
    typ_JG: typ("J", "Typ JG – Minerogyttja", "Fo an MOF beginnend."),
    typ_JS: typ("J", "Typ JS – Minerosapropel", "Fr an MOF beginnend."),

    // ── X ──────────────────────────────────────────────────────────
    typ_XX: typ("X", "Typ XX – Reduktosol", "Y.. < 4 dm u. MOF beginnend."),
  },
};
