import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import PictureTaker from "@/components/tools/PictureTaker";
import SoilShareScroll from "@/components/tools/SoilShareScroll";
import TreeTool from "@/components/tools/TreeTool";
import PackungsdichteTool from "@/components/tools/PackungsdichteTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import { ToolModal } from "@/components/ui/ToolModal";
import type { HorizontFormData, HorizontTool } from "./types";

type Accept = (value: string) => void;
type StringField = Exclude<keyof HorizontFormData, "probennummern">;

/** How each tool is rendered; `accept` writes the result into its field and closes the modal. */
const TOOLS: Record<
  HorizontTool,
  {
    padded?: boolean;
    render: (accept: (field: StringField) => Accept) => ReactNode;
  }
> = {
  farbe: {
    padded: true,
    render: (accept) => <PictureTaker onConfirm={accept("farbe_munsell")} />,
  },
  bodenart: {
    render: (accept) => (
      <TreeTool kind="bodenart" onConfirm={accept("bodenart")} />
    ),
  },
  anteil: {
    padded: true,
    render: (accept) => <SoilShareScroll onConfirm={accept("anteil")} />,
  },
  carbonat: {
    render: (accept) => (
      <TreeTool kind="carbonat" onConfirm={accept("carbonat")} />
    ),
  },
  packungsdichte: {
    render: (accept) => (
      <PackungsdichteTool onConfirm={accept("packungsdichte")} />
    ),
  },
  feinwurzeln: {
    render: (accept) => (
      <TreeTool kind="feinwurzeln" onConfirm={accept("feinwurzeln")} />
    ),
  },
  gefuege: {
    render: (accept) => (
      <TreeTool kind="gefuege" onConfirm={accept("gefuege")} />
    ),
  },
  lexikon: { render: () => <HorizontLexikonContent /> },
};

/** Fullscreen modals for every Bestimmungshilfe reachable from the Horizont form. */
export default function HorizontToolModals({
  active,
  onClose,
}: {
  active: HorizontTool | null;
  onClose: () => void;
}) {
  const { setValue } = useFormContext<HorizontFormData>();
  const accept = (field: StringField) => (value: string) => {
    setValue(field, value);
    onClose();
  };

  return (
    <>
      {(Object.keys(TOOLS) as HorizontTool[]).map((key) => (
        <ToolModal
          key={key}
          visible={active === key}
          onClose={onClose}
          padded={TOOLS[key].padded}
        >
          {TOOLS[key].render(accept)}
        </ToolModal>
      ))}
    </>
  );
}
