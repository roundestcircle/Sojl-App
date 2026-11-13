import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

/**
 * Debounced persistence for a form screen. The returned function writes after
 * `delayMs` of inactivity; a pending write is flushed immediately when the
 * screen loses focus (so the previous screen reads fresh data on back
 * navigation), when the app goes to the background (Android pauses JS timers
 * and may kill the app) and on unmount.
 */
export function useAutosave<T>(save: (data: T) => void, delayMs = 250) {
  const debounced = useDebouncedCallback(save, delayMs);

  useFocusEffect(useCallback(() => debounced.flush, [debounced]));

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") debounced.flush();
    });
    return () => sub.remove();
  }, [debounced]);

  return debounced;
}
