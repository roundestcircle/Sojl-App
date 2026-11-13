import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import PictureTaker from "@/components/tools/PictureTaker";
import BodenartTool from "@/components/tools/BodenartTool";
import SoilShareScroll from "@/components/tools/SoilShareScroll";
import CarbonatTool from "@/components/tools/CarbonatTool";
import PackungsdichteTool from "@/components/tools/PackungsdichteTool";
import FeinwurzelnTool from "@/components/tools/FeinwurzelnTool";
import GefuegeTool from "@/components/tools/GefuegeTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import { ToolModal } from "../shared";
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
    render: (accept) => <BodenartTool onConfirm={accept("bodenart")} />,
  },
  anteil: {
    padded: true,
    render: (accept) => <SoilShareScroll onConfirm={accept("anteil")} />,
  },
  carbonat: {
    render: (accept) => <CarbonatTool onConfirm={accept("carbonat")} />,
  },
  packungsdichte: {
    render: (accept) => (
      <PackungsdichteTool onConfirm={accept("packungsdichte")} />
    ),
  },
  feinwurzeln: {
    render: (accept) => <FeinwurzelnTool onConfirm={accept("feinwurzeln")} />,
  },
  gefuege: {
    render: (accept) => <GefuegeTool onConfirm={accept("gefuege")} />,
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
