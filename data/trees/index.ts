import { BodenartTree } from "@/data/trees/bodenartTree";
import { BodentypTree } from "@/data/trees/bodentypTree";
import { CarbonatTree } from "@/data/trees/carbonatTree";
import { FeinwurzelnTree } from "@/data/trees/feinwurzelnTree";
import { GefuegeTree } from "@/data/trees/gefuegeTree";
import { LagerungsdichteTree } from "@/data/trees/lagerungsdichteTree";
import type { DecisionTreeData } from "@/data/trees/types";

export type TreeKind =
  | "bodenart"
  | "bodentyp"
  | "carbonat"
  | "feinwurzeln"
  | "gefuege"
  | "lagerungsdichte";

export type TreeToolConfig = {
  tree: DecisionTreeData;
  instructionText: string;
  /** AsyncStorage key of the "Nicht mehr anzeigen" flag – never rename. */
  storageKey: string;
};

/** Every decision-tree Bestimmungshilfe, rendered by components/tools/TreeTool. */
export const TREE_TOOLS: Record<TreeKind, TreeToolConfig> = {
  bodenart: {
    tree: BodenartTree,
    instructionText:
      "Nimm eine Murmelgroße Bodenprobe, feuchte sie an und knete sie gut durch. Beantworte die Fragen, um die Bodenart zu bestimmen.",
    storageKey: "soilTexDontShowAgain",
  },
  bodentyp: {
    // Result format "Typ <Abk> – <Name>" is split by ProfilSection.
    tree: BodentypTree,
    instructionText: "Beantworte die Fragen, um den Bodentyp zu bestimmen.",
    storageKey: "bodenTypDontShowAgain",
  },
  carbonat: {
    tree: CarbonatTree,
    instructionText:
      "Beantworte die Fragen, um den Carbonatgehalt zu bestimmen.",
    storageKey: "carbonateDontShowAgain",
  },
  feinwurzeln: {
    tree: FeinwurzelnTree,
    instructionText:
      "Beantworte die Fragen, um die Feinwurzelintensität zu bestimmen.",
    storageKey: "feinwurzelnDontShowAgain",
  },
  gefuege: {
    tree: GefuegeTree,
    instructionText: "Beantworte die Fragen, um das Gefüge zu bestimmen.",
    storageKey: "gefuegeDontShowAgain",
  },
  lagerungsdichte: {
    tree: LagerungsdichteTree,
    instructionText:
      "Beantworte die Fragen, um die Lagerungsdichte zu bestimmen.",
    storageKey: "lagerungsdichteDontShowAgain",
  },
};
