import { leaf, type DecisionTreeData } from "@/data/trees/types";

const Q = "Karbonatgehalt";

export const CarbonatTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question: "Reaktion mit 10%iger Salzsäure?",
      hint: "Beobachten Sie die Reaktion der Bodenprobe mit Salzsäure.",
      options: [
        { text: "keine sicht- und hörbare Reaktion", next: "result_c0" },
        { text: "sehr schwache Reaktion, nicht sichtbar", next: "result_c1" },
        { text: "schwache Reaktion, kaum sichtbar", next: "result_c2" },
        { text: "nicht anhaltendes Aufbrausen", next: "result_c3" },
        {
          text: "starkes, anhaltendes Schäumen (ca. 10–<25 Gew.%)",
          next: "result_c4",
        },
        {
          text: "starkes, anhaltendes Schäumen (ca. 25–<50 Gew.%)",
          next: "result_c5",
        },
        {
          text: "starkes, anhaltendes Schäumen (≥50 Gew.%)",
          next: "result_c6",
        },
      ],
    },
    result_c0: leaf("c0", "karbonatfrei (0 Gew.%)", Q),
    result_c1: leaf("c1", "sehr karbonatarm (0–<0,5 Gew.%)", Q),
    result_c2: leaf("c2", "karbonatarm (0,5–<2 Gew.%)", Q),
    result_c3: leaf("c3", "karbonathaltig (2–<10 Gew.%)", Q),
    result_c4: leaf("c4", "karbonatreich (10–<25 Gew.%)", Q),
    result_c5: leaf("c5", "karbonatreich (25–<50 Gew.%)", Q),
    result_c6: leaf("c6", "extrem karbonatreich (≥50 Gew.%)", Q),
  },
};
