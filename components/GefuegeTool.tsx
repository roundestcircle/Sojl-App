import DecisionTree from "@/components/DecisionTree";
import { GefuegeFormTree } from "@/utils/trees/GefuegeTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil structure (Gefüge) determination tool.
 * Wraps DecisionTree with the GefuegeFormTree classification data.
 */
export default function GefuegeTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={GefuegeFormTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um das Gefüge zu bestimmen."
      storageKey="gefuegeDontShowAgain"
    />
  );
}
