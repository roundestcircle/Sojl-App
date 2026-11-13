import DecisionTree from "@/components/tools/DecisionTree";
import { TREE_TOOLS, type TreeKind } from "@/data/trees";

type Props = {
  kind: TreeKind;
  /** Receives the result title; omitted on the standalone tool screens. */
  onConfirm?: (result: string) => void;
};

/** Decision-tree Bestimmungshilfe (Bodenart, Bodentyp, Carbonat, …) by kind. */
export default function TreeTool({ kind, onConfirm }: Props) {
  const { tree, instructionText, storageKey } = TREE_TOOLS[kind];
  return (
    <DecisionTree
      // Remount on kind change so navigation state never leaks between trees.
      key={kind}
      tree={tree}
      instructionText={instructionText}
      storageKey={storageKey}
      onConfirm={onConfirm}
    />
  );
}
