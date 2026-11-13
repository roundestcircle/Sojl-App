/** A single answer option pointing to the next node's key. */
export type TreeOption = { text: string; next: string };

/** An intermediate tree node that poses a question and offers branching options. */
export type InnerNode = {
  question: string;
  /** Optional clarification shown below the question in smaller text. */
  hint?: string;
  options: TreeOption[];
};

/** A leaf node that carries the final determination result. */
export type ResultNode = {
  /** Heading shown above the result box (e.g. "Klasse B – Braunerden"). */
  question: string;
  /** `title` is what "Wert übernehmen" writes into the form field. */
  result: { title: string; description: string };
};

export type TreeNode = InnerNode | ResultNode;

/**
 * A decision tree: every node lives in `nodes` under its id (the map key),
 * `root` names the first question.
 */
export type DecisionTreeData = {
  root: string;
  nodes: Record<string, TreeNode>;
};

export function isResultNode(node: TreeNode): node is ResultNode {
  return "result" in node;
}

/** Builds a leaf node; `question` is the heading shown above the result. */
export function leaf(
  title: string,
  description: string,
  question = "Ergebnis",
): ResultNode {
  return { question, result: { title, description } };
}
