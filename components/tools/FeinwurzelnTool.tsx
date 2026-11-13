import DecisionTree from "@/components/tools/DecisionTree";
import { FeinwurzelnTree } from "@/data/trees/feinwurzelnTree";

type Props = { onConfirm?: (result: string) => void };

/**
 * Fine root intensity (Feinwurzeln) determination tool.
 * Wraps DecisionTree with the FeinwurzelnTree classification data.
 */
export default function FeinwurzelnTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={FeinwurzelnTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um die Feinwurzelintensität zu bestimmen."
      storageKey="feinwurzelnDontShowAgain"
    />
  );
}
