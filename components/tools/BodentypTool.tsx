import DecisionTree from "@/components/tools/DecisionTree";
import { BodentypTree } from "@/data/trees/bodentypTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil type (Bodentyp) determination tool.
 * Wraps DecisionTree with the BodentypTree horizon-classification data.
 * Result format: "Typ <Abk> – <Name>" which the caller can split for two fields.
 */
export default function BodentypTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={BodentypTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um den Bodentyp zu bestimmen."
      storageKey="bodenTypDontShowAgain"
    />
  );
}
