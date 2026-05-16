import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { useLayoutEffect, useCallback, useState } from "react";
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getHorizont,
  saveHorizont,
  type Horizont,
} from "@/utils/HorizonQueries";
import { getAufnahme } from "@/utils/MappingQueries";
import HorizontFormular, {
  type HorizontFormData,
} from "@/components/HorizonForm";
import { useDebouncedCallback } from "@/utils/useDebouncedCallback";

/**
 * Individual horizon detail screen.
 * Loads the horizon by aufnahme_id + nummer, passes it to HorizontFormular,
 * and autosaves every form change to SQLite.
 */
export default function HorizontScreen() {
  const { aufnahmeId: aufnahmeIdParam, nr: nrParam } = useLocalSearchParams<{
    aufnahmeId: string;
    nr: string;
  }>();
  const navigation = useNavigation();

  // Route params may arrive as arrays in edge cases; normalize to numbers
  const aufnahmeId = Array.isArray(aufnahmeIdParam)
    ? parseInt(aufnahmeIdParam[0], 10)
    : parseInt(aufnahmeIdParam, 10);
  const nummer = Array.isArray(nrParam)
    ? parseInt(nrParam[0], 10)
    : parseInt(nrParam, 10);

  // Set header title once nummer is available
  useLayoutEffect(() => {
    navigation.setOptions({ title: `Horizont ${nummer}` });
  }, [navigation, nummer]);

  // The Horizont record used to seed form defaults
  const [horizont, setHorizont] = useState<Horizont | null>(null);
  const [humusform, setHumusform] = useState<string | undefined>(undefined);
  // Prevents rendering the form before the DB read completes
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const data = getHorizont(aufnahmeId, nummer);
      setHorizont(data);
      const aufnahme = getAufnahme(aufnahmeId);
      setHumusform(aufnahme?.humusform ?? undefined);
      setLoading(false);
    }, [aufnahmeId, nummer]),
  );

  /**
   * Persists form data to SQLite on every watch callback from HorizontFormular.
   * Status is derived automatically inside saveHorizont based on filled fields.
   */
  const handleSave = useCallback(
    (data: HorizontFormData) => {
      const parseNum = (s: string) => {
        const n = parseFloat(s);
        return isNaN(n) ? null : n;
      };
      saveHorizont(aufnahmeId, nummer, {
        horizontname: data.horizontname || null,
        farbe_munsell: data.farbe_munsell || null,
        bodenart: data.bodenart || null,
        anteil: data.anteil || null,
        notizen: data.notizen || null,
        tiefe_oben: data.tiefe_oben || null,
        tiefe_unten: data.tiefe_unten || null,
        ph_cacl2: parseNum(data.ph_cacl2),
        humus: data.humus || null,
        humus_pct: data.humus_pct || null,
        carbonat: data.carbonat || null,
        lagerungsdichte: data.lagerungsdichte || null,
        feinwurzeln: data.feinwurzeln || null,
        gefuege: data.gefuege || null,
        maechtigk_dm: data.maechtigk_dm || null,
        // Erweiterte fields
        bodenfeuchte: data.bodenfeuchte || null,
        konsistenz: data.konsistenz || null,
        oxidationsmerkmale: data.oxidationsmerkmale || null,
        reduktionsmerkmale: data.reduktionsmerkmale || null,
        pedogene_merkmale: data.pedogene_merkmale || null,
        lagerungsart_erw: data.lagerungsart_erw || null,
        lagerungsform: data.lagerungsform || null,
        verfestigungsdichte: data.verfestigungsdichte || null,
        hohlraeume: data.hohlraeume || null,
        zersetzungsstufe: data.zersetzungsstufe || null,
        wurzelverteilung: data.wurzelverteilung || null,
        pilzmycel: data.pilzmycel || null,
        grobbodenanbindung: data.grobbodenanbindung || null,
        geog_org_kohlenstoff: data.geog_org_kohlenstoff || null,
        geogenese: data.geogenese || null,
        periglaziaere_lagen: data.periglaziaere_lagen || null,
        stratigraphie: data.stratigraphie || null,
        grobkomponenten: data.grobkomponenten || null,
        feinkomponenten: data.feinkomponenten || null,
        beimengungen: data.beimengungen || null,
        bes_strukturen: data.bes_strukturen || null,
        geruch: data.geruch || null,
        substratart: data.substratart || null,
        probennummern: JSON.stringify(
          data.probennummern.map((p) => p.value).filter(Boolean),
        ),
        gpv_pct: data.gpv_pct || null,
        gpv_lm2: data.gpv_lm2 || null,
        lk_pct: data.lk_pct || null,
        lk_lm2: data.lk_lm2 || null,
        fk_pct: data.fk_pct || null,
        fk_lm2: data.fk_lm2 || null,
        nfk_pct: data.nfk_pct || null,
        nfk_lm2: data.nfk_lm2 || null,
        kak: data.kak || null,
        basensaettigung: data.basensaettigung || null,
        tonanteil: data.tonanteil || null,
      });
    },
    [aufnahmeId, nummer],
  );

  // Debounce saves so per-keystroke writes don't hit SQLite with a full UPDATE
  // of ~45 columns + status re-derivation on every character.
  const debouncedSave = useDebouncedCallback(handleSave, 250);

  if (loading) {
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
      <HorizontFormular
        initialData={horizont ?? undefined}
        onSave={debouncedSave}
        humusform={humusform}
      />
    </KeyboardAvoidingView>
  );
}
