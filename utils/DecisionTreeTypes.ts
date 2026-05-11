export type TreeOption = { text: string; next: string };

export type InnerNode = {
  id: string;
  question: string;
  hint?: string;
  options: TreeOption[];
};

export type ResultNode = {
  id: string;
  question: string;
  result: { title: string; description: string };
};

export type TreeNode = InnerNode | ResultNode;

// Root of the tree: same shape as InnerNode but also carries the node map
export type DecisionTreeData = InnerNode & {
  nodes: Record<string, TreeNode>;
};
