import {
  HUMUSFORM_SECTIONS,
  type HumusformEntry,
  type HumusformSection,
} from "@/data/humusformData";
import LexikonContent from "@/components/lexikon/LexikonContent";
import type { TermRowProps } from "@/components/lexikon/TermRow";

const toRow = (item: HumusformEntry): TermRowProps =>
  item.kind === "symbol"
    ? { term: item.symbol, text: item.description, inline: true }
    : { caption: item.horizontSequence, text: item.body };

/** Search + SectionList dictionary for Humusformen and O-Horizonte. */
export default function HumusformLexikonContent() {
  return (
    <LexikonContent<HumusformEntry, HumusformSection>
      sections={HUMUSFORM_SECTIONS}
      toRow={toRow}
      searchPlaceholder="Humusform oder Begriff suchen…"
    />
  );
}
