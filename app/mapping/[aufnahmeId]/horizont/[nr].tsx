import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useCallback, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
  getHorizont,
  saveHorizont,
  type HorizontData,
} from "@/lib/db/horizontQueries";
import { getAufnahme } from "@/lib/db/aufnahmeQueries";
import HorizontForm from "@/components/forms/horizont/HorizontForm";
import { useAutosave } from "@/hooks/useAutosave";

/** Route params may arrive as arrays in edge cases; normalize to a number. */
const toInt = (p: string | string[]) =>
  parseInt(Array.isArray(p) ? p[0] : p, 10);

/**
 * Individual horizon detail screen.
 * Loads the horizon by aufnahme_id + nummer, passes it to HorizontForm,
 * and autosaves every form change to SQLite.
 */
export default function HorizontScreen() {
  const params = useLocalSearchParams<{ aufnahmeId: string; nr: string }>();
  const aufnahmeId = toInt(params.aufnahmeId);
  const nummer = toInt(params.nr);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Horizont ${nummer}` });
  }, [navigation, nummer]);

  // The form only uses these as initial values, so read them once (synchronous).
  const [horizont] = useState(() => getHorizont(aufnahmeId, nummer));
  const [humusform] = useState(
    () => getAufnahme(aufnahmeId)?.humusform ?? undefined,
  );

  /** Status is derived inside saveHorizont from the filled fields. */
  const handleSave = useCallback(
    (data: HorizontData) => saveHorizont(aufnahmeId, nummer, data),
    [aufnahmeId, nummer],
  );
  // Debounced so per-keystroke changes don't each run a full-row UPDATE;
  // flushed on blur, backgrounding and unmount.
  const autosave = useAutosave(handleSave);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={165}
    >
      <HorizontForm
        initialData={horizont}
        onSave={autosave}
        humusform={humusform}
      />
    </KeyboardAwareScrollView>
  );
}
