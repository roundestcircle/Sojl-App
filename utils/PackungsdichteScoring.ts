/**
 * Packungsdichte (Pd) classification per KA6 Tabelle C47.
 *
 * The user answers five questions (Gefügemerkmale). Each answer corresponds to
 * one or more Pd-classes (Pd1 sehr gering … Pd5 sehr hoch). Per question, the
 * configured weight is distributed equally over the answer's Pd-classes. The
 * Pd-class with the highest total score wins. Unanswered questions contribute
 * nothing — the user may skip individual questions.
 *
 * KA6 weighting per merkmal: Wurzelverteilung (sehr hoch) > Lagerungsart (hoch)
 * > Makroporen-Flächenanteil (hoch) > Aggregatgröße (mittel) > Verfestigung.
 * The numeric weights below (5/3/2/2/1) were given by the spec.
 */

export type PdClass = 1 | 2 | 3 | 4 | 5;

export type PackungsdichteOption = {
  /** Label shown on the button. Mirrors the descriptor cell in C47. */
  label: string;
  /** Optional explainer rendered beneath the label (from C39/C41/C43/C45). */
  description?: string;
  /** Pd-classes this descriptor matches in C47. Most options match a single class;
   * "gleichmäßig" matches Pd1 and Pd2 because both rows list it. */
  pdClasses: readonly PdClass[];
};

export type PackungsdichteQuestion = {
  id: string;
  /** Headline shown above the option buttons. */
  title: string;
  /** Optional hint shown directly under the title. */
  hint?: string;
  /** Weight (5,3,2,2,1) applied to this question's contribution. */
  weight: number;
  options: readonly PackungsdichteOption[];
};

export const PACKUNGSDICHTE_QUESTIONS: readonly PackungsdichteQuestion[] = [
  {
    id: "wurzelverteilung",
    title: "Wie sind die Feinwurzeln im Horizont verteilt?",
    hint: "Merkmal mit der höchsten Gewichtung (Tabelle C45).",
    weight: 5,
    options: [
      {
        label: "gleichmäßig",
        description:
          "Die Wurzeln verteilen sich gleichmäßig/regelmäßig über den ganzen Horizont.",
        pdClasses: [1, 2],
      },
      {
        label: "ungleichmäßig",
        description:
          "Makroporen wie Regenwurmgänge oder quasi permanente Spalten in Kt-Horizonten werden als bevorzugte Wurzelbahnen genutzt.",
        pdClasses: [3],
      },
      {
        label: "starke Häufung in Rissen und Röhren",
        description:
          "Die Wurzeln konzentrieren sich auf die durch Risse getrennten Aggregatoberflächen oder in Röhren.",
        pdClasses: [4],
      },
      {
        label: "sehr starke Häufung in Rissen",
        description:
          "Wurzeln treten fast ausschließlich in Rissen auf; die Aggregate selbst sind kaum durchwurzelt.",
        pdClasses: [5],
      },
    ],
  },
  {
    id: "lagerungsart",
    title: "Wie sind die Aggregate gelagert?",
    hint: "Form der Aggregatzwischenräume (Tabelle C39).",
    weight: 3,
    options: [
      {
        label: "sperrig",
        description:
          "Aggregate überwiegend durch spalten- und röhrenförmige Hohlräume in unorientierter Anordnung getrennt; Oberflächen bilden keine oder sehr unvollständige Abdrücke. Auch im Quellungszustand vielgestaltige Hohlräume zwischen den Aggregaten.",
        pdClasses: [1],
      },
      {
        label: "offen",
        description:
          "Aggregate überwiegend durch spalten- und röhrenförmige Hohlräume getrennt; Oberflächen bilden unvollständige Abdrücke.",
        pdClasses: [2],
      },
      {
        label: "halboffen",
        description:
          "Aggregate teils durch Fugen, teils durch spalten- oder röhrenförmige Hohlräume getrennt.",
        pdClasses: [3],
      },
      {
        label: "fast geschlossen",
        description:
          "Aggregate teils durch Fugen und wenige spalten- bzw. röhrenförmige Hohlräume getrennt; Oberflächen bilden meist vollkommene Abdrücke. Im Quellungszustand nur wenige Hohlräume.",
        pdClasses: [4],
      },
      {
        label: "geschlossen",
        description:
          "Aggregate sind durch Fugen getrennt, Oberflächen bilden vollkommene Abdrücke; im Quellungszustand liegen die Aggregate unmittelbar aneinander.",
        pdClasses: [5],
      },
    ],
  },
  {
    id: "makroporen",
    title: "Wie hoch ist der Flächenanteil der Makroporen?",
    hint: "Volumenanteilsklasse der Makroporen (Tabelle C43).",
    weight: 2,
    options: [
      {
        label: "sehr hoch",
        description: "Flächenanteil 10 bis < 30 % (Klasse f5).",
        pdClasses: [1],
      },
      {
        label: "hoch",
        description: "Flächenanteil 5 bis < 10 % (Klasse f4).",
        pdClasses: [2],
      },
      {
        label: "mittel",
        description: "Flächenanteil 2 bis < 5 % (Klasse f3).",
        pdClasses: [3],
      },
      {
        label: "gering",
        description: "Flächenanteil 1 bis < 2 % (Klasse f2).",
        pdClasses: [4],
      },
      {
        label: "sehr gering",
        description: "Flächenanteil < 1 % (Klasse f1).",
        pdClasses: [5],
      },
    ],
  },
  {
    id: "aggregatgroesse",
    title: "Wie groß sind die Aggregate?",
    hint: "Aggregatgröße nach Tabelle C38.",
    weight: 2,
    options: [
      { label: "sehr fein bis fein", pdClasses: [1] },
      { label: "sehr fein bis mittel", pdClasses: [2] },
      { label: "fein bis grob", pdClasses: [3] },
      { label: "mittel bis sehr grob", pdClasses: [4] },
      { label: "grob bis sehr grob", pdClasses: [5] },
    ],
  },
  {
    id: "verfestigung",
    title: "Wie fest ist das Aggregat?",
    hint: "Verfestigungsgrad nach Tabelle C41. Verhalten eines aus ca. 1 m Höhe fallengelassenen Bodenblocks bei mittlerer Bodenfeuchte.",
    weight: 1,
    options: [
      {
        label: "sehr lose",
        description: "Zerfällt schon bei Entnahme (Vf1, nicht verfestigt).",
        pdClasses: [1],
      },
      {
        label: "lose",
        description:
          "Zerfällt beim Aufprall in zahlreiche Bruchstücke bzw. Aggregate (Vf2, schwach verfestigt).",
        pdClasses: [2],
      },
      {
        label: "mittel",
        description:
          "Zerfällt beim Aufprall in wenige Bruchstücke, die von Hand weiter aufgeteilt werden können (Vf3).",
        pdClasses: [3],
      },
      {
        label: "fest",
        description:
          "Zerfällt beim Aufprall in wenige Bruchstücke, die von Hand nicht oder nur schwer aufzuteilen sind (Vf4).",
        pdClasses: [4],
      },
      {
        label: "sehr fest",
        description:
          "Zerfällt beim Aufprall kaum und ist mit der Hand nicht weiter aufzuteilen (Vf5).",
        pdClasses: [5],
      },
    ],
  },
];

export type PackungsdichteAnswer = {
  /** Index into the question's options array; null = skipped. */
  optionIndex: number | null;
};

export type PackungsdichteResult = {
  /** Winning Pd class, or null if every question was skipped. */
  pdClass: PdClass | null;
  /** Canonical code stored in the form (e.g. "Pd3"). Empty string if no class won. */
  code: string;
  /** Human-readable label (e.g. "Pd3 (mittel)") for display in the tool. */
  label: string;
  /** Per-class total scores, indexed Pd1..Pd5. Exposed for transparency. */
  scores: readonly [number, number, number, number, number];
};

const PD_LABELS: Record<PdClass, string> = {
  1: "sehr gering",
  2: "gering",
  3: "mittel",
  4: "hoch",
  5: "sehr hoch",
};

/**
 * Aggregates the user's answers into a Pd-class.
 * Each answer adds (question.weight / option.pdClasses.length) to every Pd-class
 * listed in the chosen option. The class with the highest score wins; ties are
 * broken by the lower Pd-class (matches "give the user the more porous reading").
 */
export function scorePackungsdichte(
  answers: readonly PackungsdichteAnswer[],
): PackungsdichteResult {
  const scores: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  PACKUNGSDICHTE_QUESTIONS.forEach((q, qi) => {
    const a = answers[qi];
    if (!a || a.optionIndex === null) return;
    const opt = q.options[a.optionIndex];
    if (!opt) return;
    const share = q.weight / opt.pdClasses.length;
    for (const pd of opt.pdClasses) {
      scores[pd - 1] += share;
    }
  });
  const total = scores.reduce((s, v) => s + v, 0);
  if (total === 0) {
    return { pdClass: null, code: "", label: "", scores };
  }
  let bestIdx = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[bestIdx]) bestIdx = i;
  }
  const pd = (bestIdx + 1) as PdClass;
  return {
    pdClass: pd,
    code: `Pd${pd}`,
    label: `Pd${pd} (${PD_LABELS[pd]})`,
    scores,
  };
}

/**
 * Maps a Makroporen-Flächenanteil percentage (from SoilShareScroll) to the
 * answer-option index of the C47 Makroporen question (Q3, id: "makroporen").
 * Per KA6 Tabelle C43:
 *   < 1 %        → sehr gering → Pd5 (idx 4)
 *   1 – < 2 %    → gering      → Pd4 (idx 3)
 *   2 – < 5 %    → mittel      → Pd3 (idx 2)
 *   5 – < 10 %   → hoch        → Pd2 (idx 1)
 *   ≥ 10 %       → sehr hoch   → Pd1 (idx 0)
 */
export function makroporenPercentToOptionIndex(percent: number): number {
  if (percent < 1) return 4;
  if (percent < 2) return 3;
  if (percent < 5) return 2;
  if (percent < 10) return 1;
  return 0;
}
