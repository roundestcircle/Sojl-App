import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useCallback, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getHorizont, saveHorizont, type Horizont } from "@/utils/HorizonQueries";
import HorizontFormular, { type HorizontFormData } from "@/components/HorizonForm";

/**
 * Individual horizon detail screen.
 * Loads the horizon by aufnahme_id + nummer, passes it to HorizontFormular,
 * and autosaves every form change to SQLite.
 */
export default function HorizontScreen() {
  const { aufnahmeId: aufnahmeIdParam, nr: nrParam } = useLocalSearchParams<{ aufnahmeId: string; nr: string }>();
  const navigation = useNavigation();

  // Route params may arrive as arrays in edge cases; normalize to numbers
  const aufnahmeId = Array.isArray(aufnahmeIdParam) ? parseInt(aufnahmeIdParam[0], 10) : parseInt(aufnahmeIdParam, 10);
  const nummer = Array.isArray(nrParam) ? parseInt(nrParam[0], 10) : parseInt(nrParam, 10);

  // Set header title once nummer is available
  useLayoutEffect(() => {
    navigation.setOptions({ title: `Horizont ${nummer}` });
  }, [nummer]);

  // The Horizont record used to seed form defaults
  const [horizont, setHorizont] = useState<Horizont | null>(null);
  // Prevents rendering the form before the DB read completes
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const data = getHorizont(aufnahmeId, nummer);
      setHorizont(data);
      setLoading(false);
    }, [aufnahmeId, nummer]),
  );

  /**
   * Persists form data to SQLite on every watch callback from HorizontFormular.
   * Status is derived automatically inside saveHorizont based on filled fields.
   */
  const handleSave = (data: HorizontFormData) => {
    const parseNum = (s: string) => { const n = parseFloat(s); return isNaN(n) ? null : n; };
    saveHorizont(aufnahmeId, nummer, {
      horizontname:  data.horizontname || null,
      farbe_munsell: data.farbe_munsell || null,
      farbe_rgb:     null,
      bodenart:      data.bodenart || null,
      anteil:        data.anteil || null,
      notizen:       data.notizen || null,
      tiefe_oben:    data.tiefe_oben || null,
      tiefe_unten:   data.tiefe_unten || null,
      ph_cacl2:      parseNum(data.ph_cacl2),
      humus:         data.humus || null,
      humus_pct:     data.humus_pct || null,
      carbonat:      data.carbonat || null,
      lagerungsdichte: data.lagerungsdichte || null,
      feinwurzeln:   data.feinwurzeln || null,
      lagerungsart:  data.lagerungsart || null,
      maechtigk_dm:  data.maechtigk_dm || null,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HorizontFormular
        initialData={horizont ?? undefined}
        onSave={handleSave}
      />
    </View>
  );
}
