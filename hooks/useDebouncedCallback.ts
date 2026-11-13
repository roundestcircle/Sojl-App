import { useEffect, useRef, useCallback } from "react";

/**
 * Returns a stable callback that debounces invocations of `fn` by `delayMs`.
 * Pending calls are flushed on unmount so no save is lost when navigating away.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        if (lastArgsRef.current) fnRef.current(...lastArgsRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      lastArgsRef.current = args;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        lastArgsRef.current = null;
        fnRef.current(...args);
      }, delayMs);
    },
    [delayMs],
  );
}
