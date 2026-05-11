import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useCallback, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getHorizont, saveHorizont, type Horizont } from "@/utils/HorizonQueries";
import HorizontFormular, { type HorizontFormData } from "@/components/HorizonForm";

export default function HorizontScreen() {
  const { aufnahmeId: aufnahmeIdParam, nr: nrParam } = useLocalSearchParams<{ aufnahmeId: string; nr: string }>();
  const navigation = useNavigation();

  const aufnahmeId = Array.isArray(aufnahmeIdParam) ? parseInt(aufnahmeIdParam[0], 10) : parseInt(aufnahmeIdParam, 10);
  const nummer = Array.isArray(nrParam) ? parseInt(nrParam[0], 10) : parseInt(nrParam, 10);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Horizont ${nummer}` });
  }, [nummer]);

  const [horizont, setHorizont] = useState<Horizont | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const data = getHorizont(aufnahmeId, nummer);
      setHorizont(data);
      setLoading(false);
    }, [aufnahmeId, nummer]),
  );

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
      carbonat:      data.carbonat || null,
      pflanzenreste: data.pflanzenreste || null,
      feinwurzeln:   data.feinwurzeln || null,
      trennbarkeit:  data.trennbarkeit || null,
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
