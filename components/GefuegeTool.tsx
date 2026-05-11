import DecisionTree from '@/components/DecisionTree';
import { GefuegeFormTree } from '@/utils/trees/GefuegeTree';

type Props = { onConfirm?: (result: string) => void };

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
