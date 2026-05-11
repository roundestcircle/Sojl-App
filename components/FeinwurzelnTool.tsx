import DecisionTree from '@/components/DecisionTree';
import { FeinwurzelIntensityTree } from '@/utils/trees/WurzelTree';

type Props = { onConfirm?: (result: string) => void };

/**
 * Fine root intensity (Feinwurzeln) determination tool.
 * Wraps DecisionTree with the FeinwurzelIntensityTree classification data.
 */
export default function FeinwurzelnTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={FeinwurzelIntensityTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um die Feinwurzelintensität zu bestimmen."
      storageKey="feinwurzelnDontShowAgain"
    />
  );
}
