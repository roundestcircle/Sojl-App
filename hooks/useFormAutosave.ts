import { useEffect, useLayoutEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Calls `onChange(values, changedField)` for every change of the form's values,
 * including programmatic `setValue` writes (derived fields). Subscribes once and
 * dispatches through a ref so the subscription survives callback identity
 * changes. No change is skipped: react-hook-form does not emit on mount, and a
 * setValue with an unchanged value emits nothing.
 *
 * Call it before any effect that writes values on mount, so those writes are
 * saved too (effects run in declaration order).
 */
export function useFormAutosave<T extends FieldValues>(
  methods: UseFormReturn<T>,
  onChange: (values: T, changedField: string | undefined) => void,
) {
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  const { watch } = methods;
  useEffect(() => {
    const { unsubscribe } = watch((values, { name }) =>
      onChangeRef.current(values as T, name),
    );
    return unsubscribe;
  }, [watch]);
}
