import DecisionTree from "@/components/tools/DecisionTree";
import { GefuegeTree } from "@/data/trees/gefuegeTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil structure (Gefüge) determination tool.
 * Wraps DecisionTree with the GefuegeTree classification data.
 */
export default function GefuegeTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={GefuegeTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um das Gefüge zu bestimmen."
      storageKey="gefuegeDontShowAgain"
    />
  );
}
