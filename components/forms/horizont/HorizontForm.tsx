import { useState } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import type { HorizontData } from "@/lib/db/horizontQueries";
import { useFormAutosave } from "@/hooks/useFormAutosave";
import GrunddatenSections from "./GrunddatenSections";
import ErweiterteSection from "./ErweiterteSection";
import BerechneteWerteSection from "./BerechneteWerteSection";
import HorizontToolModals from "./HorizontToolModals";
import { useHorizontCalculations } from "./useHorizontCalculations";
import {
  toHorizontFormDefaults,
  toHorizontData,
  type HorizontFormData,
  type HorizontTool,
} from "./types";

export type { HorizontFormData } from "./types";

type Props = {
  initialData?: Partial<HorizontData> | null;
  /** Called with the DB payload on every change (user input and derived values). */
  onSave: (data: HorizontData) => void;
  /** Humusform of the parent Aufnahme; needed for the KAK calculation. */
  humusform?: string;
};

/**
 * Horizont detail form.
 * Renders all horizon fields grouped into sections; fields with associated
 * determination tools open them in a fullscreen modal. All field changes
 * autosave via onSave (no explicit save button). Derived values are kept in
 * sync by useHorizontCalculations and saved like any other field.
 *
 * Scrolling (incl. keyboard avoidance) is handled by the surrounding screen.
 */
export default function HorizontForm({
  initialData,
  onSave,
  humusform,
}: Props) {
  const methods = useForm<HorizontFormData>({
    defaultValues: toHorizontFormDefaults(initialData),
  });
  const [activeTool, setActiveTool] = useState<HorizontTool | null>(null);

  // Declared before useHorizontCalculations so derived values it corrects on
  // mount are saved as well.
  useFormAutosave(methods, (values) => onSave(toHorizontData(values)));
  useHorizontCalculations(methods, humusform);

  return (
    <FormProvider {...methods}>
      <View style={{ gap: 8 }}>
        <GrunddatenSections onOpenTool={setActiveTool} />
        <ErweiterteSection />
        <BerechneteWerteSection />
      </View>
      <HorizontToolModals
        active={activeTool}
        onClose={() => setActiveTool(null)}
      />
    </FormProvider>
  );
}
