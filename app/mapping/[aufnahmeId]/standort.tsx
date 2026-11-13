import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahme,
  saveAufnahmeDetails,
  type AufnahmeDetails,
} from "@/lib/db/aufnahmeQueries";
import {
  getHorizonteForAufnahme,
  setHorizontKak,
  type Horizont,
} from "@/lib/db/horizontQueries";
import { calcGrundigkeitCm, calcKAK } from "@/lib/calc/mappingMaths";
import AufnahmeForm from "@/components/forms/aufnahme/AufnahmeForm";
import { useAutosave } from "@/hooks/useAutosave";

/**
 * Standortdaten screen.
 * Renders AufnahmeForm for the location and profile fields of an Aufnahme.
 * Autosaves on every form change via the onSave callback.
 */
export default function StandortScreen() {
  const { aufnahmeId: param } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(param, 10);

  // The form only uses the record as initial values, so read it once.
  const [aufnahme] = useState(() => getAufnahme(aufnahmeId));
  // Seeded synchronously so the first render already has the right Gründigkeit
  // (the form saves it on mount).
  const [horizonte, setHorizonte] = useState<Horizont[]>(() =>
    getHorizonteForAufnahme(aufnahmeId),
  );

  // Horizonte (for Gründigkeit and the profile sums) may change while this
  // screen is in the background, so reload them on focus.
  useFocusEffect(
    useCallback(() => {
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );
  const calcGrundigkeit = calcGrundigkeitCm(
    horizonte.map((h) => h.tiefe_unten),
  );

  const humusformRef = useRef(aufnahme?.humusform ?? null);

  /**
   * Persists the form. The KAK of every Horizont depends on the Aufnahme's
   * Humusform, so it is recomputed for all Horizonte when that changes.
   */
  const handleSave = useCallback(
    (data: AufnahmeDetails) => {
      saveAufnahmeDetails(aufnahmeId, data);
      if (data.humusform === humusformRef.current) return;
      humusformRef.current = data.humusform;
      const hs = getHorizonteForAufnahme(aufnahmeId);
      for (const h of hs) {
        const kak = calcKAK(
          h.bodenart ?? "",
          data.humusform ?? "",
          h.humus_pct ?? "",
        );
        if (kak !== (h.kak ?? "")) setHorizontKak(h.id, kak || null);
      }
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
    },
    [aufnahmeId],
  );
  const autosave = useAutosave(handleSave);

  if (!aufnahme) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={165}
    >
      <AufnahmeForm
        initialData={aufnahme}
        onSave={autosave}
        calcGrundigkeit={calcGrundigkeit}
        horizonte={horizonte}
      />
    </KeyboardAwareScrollView>
  );
}
