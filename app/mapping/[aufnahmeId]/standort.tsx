import { useCallback, useState } from "react";
import { ScrollView, ActivityIndicator, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getAufnahme, saveAufnahmeDetails, type AufnahmeDetails } from "@/utils/MappingQueries";
import AufnahmeForm from "@/components/AufnahmeForm";
import type { Aufnahme } from "@/utils/MappingQueries";

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

  // Reload the record whenever the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setAufnahme(getAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );

  /**
   * Persists partial form data on every watch callback from AufnahmeForm.
   * Called on every keystroke/change, so no explicit save button is needed.
   */
  const handleSave = (data: AufnahmeDetails) => {
    saveAufnahmeDetails(aufnahmeId, data);
  };

  if (!aufnahme) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <AufnahmeForm initialData={aufnahme} onSave={handleSave} />
    </ScrollView>
  );
}
