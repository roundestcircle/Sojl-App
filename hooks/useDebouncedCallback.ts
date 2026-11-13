import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

export type DebouncedFn<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Runs a pending call immediately (no-op when nothing is pending). */
  flush: () => void;
};

/**
 * Returns a stable callback that debounces invocations of `fn` by `delayMs`.
 * Pending calls are flushed on unmount so no save is lost when navigating
 * away; `flush()` runs a pending call on demand.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedFn<Args> {
  const fnRef = useRef(fn);
  // Sync the latest fn after commit (refs must not be written during render).
  // Layout effect so it is current before any timer can fire.
  useLayoutEffect(() => {
    fnRef.current = fn;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Args | null>(null);

  const debounced = useMemo(() => {
    const flush = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      const args = pendingRef.current;
      pendingRef.current = null;
      if (args) fnRef.current(...args);
    };
    const call = (...args: Args) => {
      pendingRef.current = args;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delayMs);
    };
    return Object.assign(call, { flush });
  }, [delayMs]);

  useEffect(() => debounced.flush, [debounced]);

  return debounced;
}
