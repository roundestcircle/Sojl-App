import { useCallback, useState } from "react";
import { ScrollView, ActivityIndicator, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getAufnahme, saveAufnahmeDetails, type AufnahmeDetails } from "@/utils/MappingQueries";
import AufnahmeForm from "@/components/AufnahmeForm";
import type { Aufnahme } from "@/utils/MappingQueries";

export default function StandortScreen() {
  const { aufnahmeId: param } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(param, 10);

  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);

  useFocusEffect(
    useCallback(() => {
      setAufnahme(getAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );

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
