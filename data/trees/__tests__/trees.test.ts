import { TREE_TOOLS, type TreeKind } from "@/data/trees";
import {
  isResultNode,
  type DecisionTreeData,
  type ResultNode,
} from "@/data/trees/types";
import { CARBONAT_OPTIONS, FEINWURZELN_OPTIONS } from "@/data/horizontOptions";
import { validateBodenart } from "@/lib/validation/fieldValidation";

const KINDS = Object.keys(TREE_TOOLS) as TreeKind[];

/** Every `next` id pointing to a key missing from `nodes`, as "from -> to". */
function danglingEdges(tree: DecisionTreeData): string[] {
  const out: string[] = [];
  if (!tree.nodes[tree.root]) out.push(`(root) -> ${tree.root}`);
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (isResultNode(node)) continue;
    for (const o of node.options) {
      if (!tree.nodes[o.next]) out.push(`${id} -> ${o.next}`);
    }
  }
  return out;
}

function reachableIds(tree: DecisionTreeData): Set<string> {
  const seen = new Set<string>();
  const stack = [tree.root];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = tree.nodes[id];
    if (node && !isResultNode(node)) {
      stack.push(...node.options.map((o) => o.next));
    }
  }
  return seen;
}

/** Returns every cycle found by DFS from the root, as "a > b > a". */
function findCycles(tree: DecisionTreeData): string[] {
  const cycles: string[] = [];
  const state: Record<string, "open" | "done"> = {};
  const visit = (id: string, path: string[]) => {
    state[id] = "open";
    const node = tree.nodes[id];
    if (node && !isResultNode(node)) {
      for (const { next } of node.options) {
        if (state[next] === "open") {
          cycles.push(
            [...path.slice(path.indexOf(next)), id, next].join(" > "),
          );
        } else if (!state[next]) {
          visit(next, [...path, id]);
        }
      }
    }
    state[id] = "done";
  };
  visit(tree.root, []);
  return cycles;
}

function leaves(tree: DecisionTreeData): ResultNode[] {
  return [...reachableIds(tree)]
    .map((id) => tree.nodes[id])
    .filter((n): n is ResultNode => !!n && isResultNode(n));
}

const leafTitles = (kind: TreeKind) =>
  leaves(TREE_TOOLS[kind].tree).map((n) => n.result.title);

describe.each(KINDS)("%s tree structure", (kind) => {
  const { tree } = TREE_TOOLS[kind];

  test("has no dangling next ids", () => {
    expect(danglingEdges(tree)).toEqual([]);
  });

  test("has no unreachable nodes", () => {
    const reached = reachableIds(tree);
    expect(Object.keys(tree.nodes).filter((id) => !reached.has(id))).toEqual(
      [],
    );
  });

  // Every inner node is a real choice; single-option "confirmation" nodes
  // were folded into their leaf (the class is shown as the leaf heading).
  test("every inner node offers ≥ 2 distinct options", () => {
    const bad = Object.entries(tree.nodes)
      .filter(([, n]) => {
        if (isResultNode(n)) return false;
        const nexts = n.options.map((o) => o.next);
        return nexts.length < 2 || new Set(nexts).size !== nexts.length;
      })
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  // B1.1: the Bodenart key loops back on "Nein" (tex1a, tex1c, tex3a) and
  // needs a redesign; drop `.failing` once that is done.
  (kind === "bodenart" ? test.failing : test)("has no cycles", () => {
    expect(findCycles(tree)).toEqual([]);
  });
});

describe("tree results match the form fields they are written to", () => {
  test.each([
    ["carbonat", CARBONAT_OPTIONS],
    ["feinwurzeln", FEINWURZELN_OPTIONS],
  ] as const)("%s leaves are option codes", (kind, options) => {
    const codes = new Set(options.map((o) => o.code));
    expect(leafTitles(kind).filter((t) => !codes.has(t))).toEqual([]);
  });

  // Gefüge (35) is a free-text field without an option list; the tree writes
  // the KA6 short codes (lower case, umlauts allowed).
  test("gefuege leaves are KA6 short codes", () => {
    for (const t of leafTitles("gefuege")) expect(t).toMatch(/^[a-zäöü]{2,4}$/);
  });

  // ProfilSection splits "Typ <Abk> – <Name>" into bodtyp_abk and bodentyp.
  test("bodentyp leaves have the 'Typ <Abk> – <Name>' format", () => {
    for (const t of leafTitles("bodentyp")) {
      expect(t).toMatch(/^Typ [A-ZÄÖÜ]{2,3} – \S/);
    }
  });

  // B1.1: Ts3-4 / Tu3-4 are not single KA5 codes; the Bodenart key redesign
  // is open. Drop `.failing` once every leaf passes validateBodenart.
  test.failing("bodenart leaves are valid Bodenart codes", () => {
    const invalid = leafTitles("bodenart").filter(
      (t) => !validateBodenart(t).valid,
    );
    expect(invalid).toEqual([]);
  });
});
