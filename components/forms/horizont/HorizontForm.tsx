import { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import type { Horizont } from "@/lib/db/horizontQueries";
import GrunddatenSections from "./GrunddatenSections";
import ErweiterteSection from "./ErweiterteSection";
import BerechneteWerteSection from "./BerechneteWerteSection";
import HorizontToolModals from "./HorizontToolModals";
import { useHorizontCalculations } from "./useHorizontCalculations";
import {
  toHorizontFormDefaults,
  type HorizontFormData,
  type HorizontTool,
} from "./types";

export type { HorizontFormData } from "./types";

type Props = {
  initialData?: Partial<Horizont>;
  onSave: (data: HorizontFormData) => void;
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
  const isFirstWatch = useRef(true);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Autosave: subscribe once and dispatch through a ref so the subscription
  // survives onSave identity changes (would otherwise drop the first tick after resub).
  // Must stay declared before useHorizontCalculations so it sees their first writes.
  useEffect(() => {
    const { unsubscribe } = methods.watch((data) => {
      if (isFirstWatch.current) {
        isFirstWatch.current = false;
        return;
      }
      onSaveRef.current(data as HorizontFormData);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
