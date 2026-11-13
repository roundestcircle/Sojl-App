import DecisionTree from "@/components/tools/DecisionTree";
import { LagerungsdichteTree } from "@/data/trees/lagerungsdichteTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Lagerungsdichte determination tool.
 * Wraps DecisionTree with the LagerungsdichteTree classification data.
 */
export default function LagerungsdichteTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={LagerungsdichteTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um die Lagerungsdichte zu bestimmen."
      storageKey="lagerungsdichteDontShowAgain"
    />
  );
}
