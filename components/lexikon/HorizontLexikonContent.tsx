import {
  HORIZONT_SECTIONS,
  type HorizontEntry,
  type HorizontSection,
} from "@/data/horizontData";
import LexikonContent from "@/components/lexikon/LexikonContent";
import type { TermRowProps } from "@/components/lexikon/TermRow";

const toRow = (item: HorizontEntry): TermRowProps => ({
  term: item.symbol,
  text: item.description,
  inline: true,
});

/** Search + SectionList dictionary for a selection of Horizont symbols. */
export default function HorizontLexikonContent() {
  return (
    <LexikonContent<HorizontEntry, HorizontSection>
      sections={HORIZONT_SECTIONS}
      toRow={toRow}
      searchPlaceholder="Symbol oder Beschreibung suchen…"
      emptyHint="Das bedeutet nicht, dass dein gesuchter Horizont nicht existiert. Dies ist nur eine kleine Horizontauswahl. Schau mal in der KA6 nach."
    />
  );
}
