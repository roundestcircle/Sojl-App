import DecisionTree from '@/components/DecisionTree';
import { BodenTypTree } from '@/utils/trees/BodenTypTree';

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil type (Bodentyp) determination tool.
 * Wraps DecisionTree with the BodenTypTree horizon-classification data.
 * Result format: "Typ <Abk> – <Name>" which the caller can split for two fields.
 */
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
