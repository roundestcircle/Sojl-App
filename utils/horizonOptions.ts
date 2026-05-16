import type { LabeledOption } from "@/components/LabeledDropdownField";

/** KA6 Carbonatgehalt codes (HCl reaction classes). */
export const CARBONAT_OPTIONS: LabeledOption[] = [
  { code: "c0", label: "karbonatfrei (0 Gew.%)" },
  { code: "c1", label: "sehr karbonatarm (0–<0,5 Gew.%)" },
  { code: "c2", label: "karbonatarm (0,5–<2 Gew.%)" },
  { code: "c3", label: "karbonathaltig (2–<10 Gew.%)" },
  { code: "c4", label: "karbonatreich (10–<25 Gew.%)" },
  { code: "c5", label: "karbonatreich (25–<50 Gew.%)" },
  { code: "c6", label: "extrem karbonatreich (≥50 Gew.%)" },
  { code: "nb", label: "nicht bestimmt" },
];

/** KA6 Packungsdichte-Klassen (Pd1–Pd5) per Tabelle C47. */
export const PACKUNGSDICHTE_OPTIONS: LabeledOption[] = [
  { code: "Pd1", label: "sehr gering" },
  { code: "Pd2", label: "gering" },
  { code: "Pd3", label: "mittel" },
  { code: "Pd4", label: "hoch" },
  { code: "Pd5", label: "sehr hoch" },
  { code: "nb", label: "nicht bestimmt" },
];

/** KA6 Feinwurzelintensität codes (Wf0–Wf6). */
export const FEINWURZELN_OPTIONS: LabeledOption[] = [
  { code: "Wf0", label: "keine Wurzeln (0/dm²)" },
  { code: "Wf1", label: "sehr schwach (1–2/dm²)" },
  { code: "Wf2", label: "schwach (3–5/dm²)" },
  { code: "Wf3", label: "mittel (6–10/dm²)" },
  { code: "Wf4", label: "stark (11–20/dm²)" },
  { code: "Wf5", label: "sehr stark (21–50/dm²)" },
  { code: "Wf6", label: "extrem stark bis Wurzelfilz (>50/dm²)" },
  { code: "nb", label: "nicht bestimmt" },
];
