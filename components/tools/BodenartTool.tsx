import DecisionTree from "@/components/tools/DecisionTree";
import { BodenartTree } from "@/data/trees/bodenartTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil texture (Bodenart) determination tool.
 * Wraps DecisionTree with the BodenartTree data and finger-test instructions.
 */
export default function BodenartTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={BodenartTree}
      onConfirm={onConfirm}
      instructionText="Nimm eine Murmelgroße Bodenprobe, feuchte sie an und knete sie gut durch. Beantworte die Fragen, um die Bodenart zu bestimmen."
      storageKey="soilTexDontShowAgain"
    />
  );
}
