import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { useCallback, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getHorizont, saveHorizont, type Horizont } from "@/utils/HorizonQueries";
import HorizontFormular, { type HorizontFormData } from "@/components/HorizonForm";

/**
 * [nr].tsx
 *
 * Screen for a single Horizont form.
 * Loads existing data from SQLite on focus, saves on form submit.
 * Navigates back to HorizonOverview after saving.
 */
export default function HorizontScreen() {
  const { nr } = useLocalSearchParams();
  const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({ title: `Kartierung > Horizont ${nr}` });
    }, [nr]);
  const { id } = useLocalSearchParams<{ id: string; nr: string }>();
  // Ensure `id` and `nr` are treated as strings by handling potential string[] cases
  const aufnahmeId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
  const nummer = Array.isArray(nr) ? parseInt(nr[0], 10) : parseInt(nr, 10);

  const [horizont, setHorizont] = useState<Horizont | null>(null);
  const [loading, setLoading] = useState(true);

  // Load horizont data from DB each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      const data = getHorizont(aufnahmeId, nummer);
      setHorizont(data);
      setLoading(false);
    }, [aufnahmeId, nummer]),
  );

  const handleSave = (data: HorizontFormData) => {
    saveHorizont(aufnahmeId, nummer, {
      horizontname: data.horizontname || null,
      farbe_munsell: data.farbe_munsell || null,
      farbe_rgb: null,
      bodenart: data.bodenart || null,
      anteil: data.anteil || null,
      notizen: data.notizen || null,
      tiefe_oben: data.tiefe_oben || null,
      tiefe_unten: data.tiefe_unten || null,
    });

    // Navigate back — HorizonOverview will reload on focus and update button status
    // router.back() is intentionally not used here so the screen
    // is fully unmounted and HorizontFormular remounts fresh next visit
    // router.back();
    // Uncomment the line above once you're happy with the save flow
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
        horizontNummer={nummer}
        initialData={horizont ?? undefined}
        onSave={handleSave}
      />
    </View>
  );
}