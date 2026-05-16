import { useCallback, useState } from "react";
import {
  ScrollView,
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahme,
  saveAufnahmeDetails,
  type AufnahmeDetails,
  Aufnahme,
} from "@/utils/MappingQueries";
import { getHorizonteForAufnahme, type Horizont } from "@/utils/HorizonQueries";
import { calcGrundigkeitCm } from "@/utils/MappingMaths";
import AufnahmeForm from "@/components/AufnahmeForm";
import { useDebouncedCallback } from "@/utils/useDebouncedCallback";
import { useNotizenScroll } from "@/utils/useNotizenScroll";

/**
 * Standortdaten screen.
 * Renders AufnahmeForm for the location and profile fields of an Aufnahme.
 * Autosaves on every form change via the onSave callback.
 */
export default function StandortScreen() {
  const { aufnahmeId: param } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(param, 10);

  // The Aufnahme record loaded from the database, used to seed form defaults
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  const [calcGrundigkeit, setCalcGrundigkeit] = useState("");
  const [horizonte, setHorizonte] = useState<Horizont[]>([]);

  const {
    scrollViewRef,
    onNotizenFocus,
    onNotizenBlur,
    onScroll,
    onContentSizeChange,
    onLayout,
  } = useNotizenScroll();

  // Reload the record and recalculate derived values whenever the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setAufnahme(getAufnahme(aufnahmeId));
      const h = getHorizonteForAufnahme(aufnahmeId);
      setHorizonte(h);
      setCalcGrundigkeit(
        calcGrundigkeitCm(h.map((hz) => hz.maechtigk_dm ?? "")),
      );
    }, [aufnahmeId]),
  );

  /**
   * Persists partial form data on every watch callback from AufnahmeForm.
   * Called on every keystroke/change, so no explicit save button is needed.
   */
  const handleSave = useCallback(
    (data: AufnahmeDetails) => {
      saveAufnahmeDetails(aufnahmeId, data);
    },
    [aufnahmeId],
  );

  // Debounce saves so per-keystroke writes don't hit SQLite with a full UPDATE on every character.
  const debouncedSave = useDebouncedCallback(handleSave, 250);

  if (!aufnahme) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
      >
        <AufnahmeForm
          initialData={aufnahme}
          onSave={debouncedSave}
          calcGrundigkeit={calcGrundigkeit}
          horizonte={horizonte}
          onNotizenFocus={onNotizenFocus}
          onNotizenBlur={onNotizenBlur}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
