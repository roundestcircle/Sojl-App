import type { DecisionTreeData } from "../DecisionTreeTypes";

export const KarbonatGehaltTree: DecisionTreeData = {
  id: "start",
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
    { text: "starkes, anhaltendes Schäumen (≥50 Gew.%)", next: "result_c6" },
  ],
  nodes: {
    result_c0: {
      id: "result_c0",
      question: "Karbonatgehalt",
      result: { title: "c0", description: "karbonatfrei (0 Gew.%)" },
    },
    result_c1: {
      id: "result_c1",
      question: "Karbonatgehalt",
      result: { title: "c1", description: "sehr karbonatarm (0–<0,5 Gew.%)" },
    },
    result_c2: {
      id: "result_c2",
      question: "Karbonatgehalt",
      result: { title: "c2", description: "karbonatarm (0,5–<2 Gew.%)" },
    },
    result_c3: {
      id: "result_c3",
      question: "Karbonatgehalt",
      result: { title: "c3", description: "karbonathaltig (2–<10 Gew.%)" },
    },
    result_c4: {
      id: "result_c4",
      question: "Karbonatgehalt",
      result: { title: "c4", description: "karbonatreich (10–<25 Gew.%)" },
    },
    result_c5: {
      id: "result_c5",
      question: "Karbonatgehalt",
      result: { title: "c5", description: "karbonatreich (25–<50 Gew.%)" },
    },
    result_c6: {
      id: "result_c6",
      question: "Karbonatgehalt",
      result: { title: "c6", description: "extrem karbonatreich (≥50 Gew.%)" },
    },
  },
};
