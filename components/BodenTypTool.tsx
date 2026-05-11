import DecisionTree from '@/components/DecisionTree';
import { BodenTypTree } from '@/utils/trees/BodenTypTree';

type Props = { onConfirm?: (result: string) => void };

export default function BodenTypTool({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={BodenTypTree}
      onConfirm={onConfirm}
      instructionText="Beantworte die Fragen, um den Bodentyp zu bestimmen."
      storageKey="bodenTypDontShowAgain"
    />
  );
}
