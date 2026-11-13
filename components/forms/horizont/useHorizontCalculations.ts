import { useEffect } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  deriveHorizont,
  HORIZONT_CALC_INPUTS,
  HORIZONT_DERIVED_FIELDS,
  type HorizontCalcInputs,
} from "@/lib/calc/deriveHorizont";
import type { HorizontFormData } from "./types";

/**
 * Keeps all derived ("Automatisch berechnete Werte") fields of the Horizont
 * form in sync with their inputs. The values are computed in one pass by the
 * pure `deriveHorizont` (lib/calc) and only changed fields are written back via
 * setValue, so they are autosaved together with the user-entered fields.
 */
export function useHorizontCalculations(
  methods: UseFormReturn<HorizontFormData>,
  humusform: string | undefined,
) {
  const { control, getValues, setValue } = methods;
  const watched = useWatch({ control, name: [...HORIZONT_CALC_INPUTS] });
  const key = JSON.stringify(watched);

  useEffect(() => {
    const inputs = { humusform: humusform ?? "" } as HorizontCalcInputs;
    HORIZONT_CALC_INPUTS.forEach((f) => {
      inputs[f] = getValues(f) ?? "";
    });
    const derived = deriveHorizont(inputs);
    for (const f of HORIZONT_DERIVED_FIELDS) {
      if (getValues(f) !== derived[f]) setValue(f, derived[f]);
    }
  }, [key, humusform, getValues, setValue]);
}
