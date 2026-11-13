import DecisionTree from "@/components/tools/DecisionTree";
import { CarbonatTree } from "@/data/trees/carbonatTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Carbonate content (Carbonatgehalt) determination tool.
 * Wraps DecisionTree with the CarbonatTree HCl-reaction decision data.
 */
export default function CarbonatTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={CarbonatTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um den Carbonatgehalt zu bestimmen."
      storageKey="carbonateDontShowAgain"
    />
  );
}
