import {
  FUNKTIONSWEISE_SECTIONS,
  type FunktionsweiseEntry,
  type FunktionsweiseSection,
} from "@/data/funktionsweiseData";
import LexikonContent from "@/components/lexikon/LexikonContent";
import type { TermRowProps } from "@/components/lexikon/TermRow";

const toRow = (item: FunktionsweiseEntry): TermRowProps => ({
  term: item.title,
  text: item.description,
  image: item.image,
});

/** Searchable explanation of how each tool and calculation works. */
export default function FunktionsweiseContent() {
  return (
    <LexikonContent<FunktionsweiseEntry, FunktionsweiseSection>
      sections={FUNKTIONSWEISE_SECTIONS}
      toRow={toRow}
      searchPlaceholder="Tool suchen…"
    />
  );
}
