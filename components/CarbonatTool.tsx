import DecisionTree from '@/components/DecisionTree';
import { KarbonatGehaltTree } from '@/utils/trees/CarbonateTree';

type Props = { onConfirm?: (result: string) => void };

/**
 * Carbonate content (Carbonatgehalt) determination tool.
 * Wraps DecisionTree with the KarbonatGehaltTree HCl-reaction decision data.
 */
export default function CarbonatTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={KarbonatGehaltTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um den Carbonatgehalt zu bestimmen."
      storageKey="carbonateDontShowAgain"
    />
  );
}
