import DecisionTree from '@/components/DecisionTree';
import { SoilTexTree } from '@/utils/trees/SoilTexTree';

type Props = { onConfirm?: (result: string) => void };

/**
 * Soil texture (Bodenart) determination tool.
 * Wraps DecisionTree with the SoilTexTree data and finger-test instructions.
 */
export default function TexTree({ onConfirm }: Props) {
  return (
    <DecisionTree
      tree={SoilTexTree}
      onConfirm={onConfirm}
      instructionText="Nimm eine Murmelgroße Bodenprobe, feuchte sie an und knete sie gut durch. Beantworte die Fragen, um die Bodenart zu bestimmen."
      storageKey="soilTexDontShowAgain"
    />
  );
}
