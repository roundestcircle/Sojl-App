/** A single answer option pointing to the next node's id. */
export type TreeOption = { text: string; next: string };

/** An intermediate tree node that poses a question and offers branching options. */
export type InnerNode = {
  id: string;
  question: string;
  /** Optional clarification shown below the question in smaller text. */
  hint?: string;
  options: TreeOption[];
};

/** A leaf node that carries the final determination result. */
export type ResultNode = {
  id: string;
  /** Short label shown as the primary result text (e.g. "Braunerde"). */
  question: string;
  result: { title: string; description: string };
};

/** Union of the two node types; narrowed at runtime via `'result' in node`. */
export type TreeNode = InnerNode | ResultNode;

// Root of the tree: same shape as InnerNode but also carries the full node lookup map
export type DecisionTreeData = InnerNode & {
  nodes: Record<string, TreeNode>;
};
