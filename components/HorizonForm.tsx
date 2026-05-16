import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useForm,
  FormProvider,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";
import PictureTaker from "@/components/PictureTaker";
import HorizontLexikonContent from "@/components/HorizontLexikonContent";
import TexTree from "@/components/TexTree";
import SoilShareScroll from "@/components/SoilShareScroll";
import CarbonatTool from "@/components/CarbonatTool";
import LagerungsdichteTool from "@/components/LagerungsdichteTool";
import FeinwurzelnTool from "@/components/FeinwurzelnTool";
import GefuegeTool from "@/components/GefuegeTool";
import CollapsibleSection from "@/components/CollapsibleSection";
import InfoButton from "@/components/InfoButton";
import ValidatedField from "@/components/ValidatedField";
import LabeledDropdownField from "@/components/LabeledDropdownField";
import { CARBONAT_OPTIONS, FEINWURZELN_OPTIONS } from "@/utils/horizonOptions";
import {
  validateTiefe,
  validateBodenart,
  validateTonanteil,
  validateAnteil,
  validatePh,
  validateMunsell,
  validateLagerungsdichte,
  tiefeOrderInvalid,
  TIEFE_ORDER_SUGGESTION,
} from "@/utils/fieldValidation";
import {
  calcMaechtigkeitDm,
  calcPoreCapacities,
  calcKAK,
  rateGPV,
  rateLK,
  rateKAK,
} from "@/utils/MappingMaths";
import { calcBasensaettigung } from "@/utils/BasensaettigungLookup";
import {
  bodenartToClay,
  humusKlasse,
  estimateHumus,
  parseMunsell,
  chromaToClass,
} from "@/utils/renger1987";

// ─── Form shape ────────────────────────────────────────────────────────────────

export type HorizontFormData = {
  horizontname: string;
  farbe_munsell: string;
  bodenart: string;
  anteil: string;
  notizen: string;
  tiefe_oben: string;
  tiefe_unten: string;
  ph_cacl2: string;
  humus: string;
  humus_pct: string;
  carbonat: string;
  lagerungsdichte: string;
  feinwurzeln: string;
  gefuege: string;
  maechtigk_dm: string;
  gpv_pct: string;
  gpv_lm2: string;
  lk_pct: string;
  lk_lm2: string;
  fk_pct: string;
  fk_lm2: string;
  nfk_pct: string;
  nfk_lm2: string;
  kak: string;
  basensaettigung: string;
  tonanteil: string;
  // Erweiterte fields
  bodenfeuchte: string;
  konsistenz: string;
  oxidationsmerkmale: string;
  reduktionsmerkmale: string;
  pedogene_merkmale: string;
  lagerungsart_erw: string;
  lagerungsform: string;
  verfestigungsdichte: string;
  hohlraeume: string;
  zersetzungsstufe: string;
  wurzelverteilung: string;
  pilzmycel: string;
  grobbodenanbindung: string;
  geog_org_kohlenstoff: string;
  geogenese: string;
  periglaziaere_lagen: string;
  stratigraphie: string;
  grobkomponenten: string;
  feinkomponenten: string;
  beimengungen: string;
  bes_strukturen: string;
  geruch: string;
  substratart: string;
  probennummern: { value: string }[];
};

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  initialData?: Partial<Horizont>;
  onSave: (data: HorizontFormData) => void;
  humusform?: string;
};

type ActiveModal =
  | "farbe"
  | "bodenart"
  | "anteil"
  | "carbonat"
  | "lagerungsdichte"
  | "feinwurzeln"
  | "gefuege"
  | "lexikon"
  | null;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Horizon detail form.
 * Renders all horizon fields grouped into sections; fields with associated determination
 * tools show a "bestimmen" button that opens the tool in a fullscreen modal.
 * All field changes autosave via the onSave callback (no explicit save button).
 * Fields that receive values from tools use Controller with a reactive value prop
 * so the input re-renders immediately when setValue is called.
 */
export default function HorizontFormular({
  initialData,
  onSave,
  humusform,
}: Props) {
  const methods = useForm<HorizontFormData>({
    defaultValues: {
      horizontname: initialData?.horizontname ?? "",
      farbe_munsell: initialData?.farbe_munsell ?? "",
      bodenart: initialData?.bodenart ?? "",
      anteil: initialData?.anteil ?? "",
      notizen: initialData?.notizen ?? "",
      tiefe_oben: initialData?.tiefe_oben ?? "",
      tiefe_unten: initialData?.tiefe_unten ?? "",
      ph_cacl2:
        initialData?.ph_cacl2 != null ? String(initialData.ph_cacl2) : "",
      humus: initialData?.humus ?? "",
      humus_pct: initialData?.humus_pct ?? "",
      carbonat: initialData?.carbonat ?? "",
      lagerungsdichte: initialData?.lagerungsdichte ?? "",
      feinwurzeln: initialData?.feinwurzeln ?? "",
      gefuege: initialData?.gefuege ?? "",
      maechtigk_dm: initialData?.maechtigk_dm ?? "",
      gpv_pct: initialData?.gpv_pct ?? "",
      gpv_lm2: initialData?.gpv_lm2 ?? "",
      lk_pct: initialData?.lk_pct ?? "",
      lk_lm2: initialData?.lk_lm2 ?? "",
      fk_pct: initialData?.fk_pct ?? "",
      fk_lm2: initialData?.fk_lm2 ?? "",
      nfk_pct: initialData?.nfk_pct ?? "",
      nfk_lm2: initialData?.nfk_lm2 ?? "",
      kak: initialData?.kak ?? "",
      basensaettigung: initialData?.basensaettigung ?? "",
      tonanteil: initialData?.tonanteil ?? "",
      bodenfeuchte: initialData?.bodenfeuchte ?? "",
      konsistenz: initialData?.konsistenz ?? "",
      oxidationsmerkmale: initialData?.oxidationsmerkmale ?? "",
      reduktionsmerkmale: initialData?.reduktionsmerkmale ?? "",
      pedogene_merkmale: initialData?.pedogene_merkmale ?? "",
      lagerungsart_erw: initialData?.lagerungsart_erw ?? "",
      lagerungsform: initialData?.lagerungsform ?? "",
      verfestigungsdichte: initialData?.verfestigungsdichte ?? "",
      hohlraeume: initialData?.hohlraeume ?? "",
      zersetzungsstufe: initialData?.zersetzungsstufe ?? "",
      wurzelverteilung: initialData?.wurzelverteilung ?? "",
      pilzmycel: initialData?.pilzmycel ?? "",
      grobbodenanbindung: initialData?.grobbodenanbindung ?? "",
      geog_org_kohlenstoff: initialData?.geog_org_kohlenstoff ?? "",
      geogenese: initialData?.geogenese ?? "",
      periglaziaere_lagen: initialData?.periglaziaere_lagen ?? "",
      stratigraphie: initialData?.stratigraphie ?? "",
      grobkomponenten: initialData?.grobkomponenten ?? "",
      feinkomponenten: initialData?.feinkomponenten ?? "",
      beimengungen: initialData?.beimengungen ?? "",
      bes_strukturen: initialData?.bes_strukturen ?? "",
      geruch: initialData?.geruch ?? "",
      substratart: initialData?.substratart ?? "",
      probennummern: (() => {
        try {
          return (
            JSON.parse(initialData?.probennummern ?? "[]") as string[]
          ).map((v) => ({ value: v }));
        } catch {
          return [];
        }
      })(),
    },
  });

  const { setValue, control, watch } = methods;
  const {
    fields: probenFields,
    append: appendProbe,
    remove: removeProbe,
  } = useFieldArray({ control, name: "probennummern" });
  // Which tool modal is currently open; null means all modals are closed
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [erweiterteExpanded, setErweiterteExpanded] = useState(false);
  const isFirstWatch = useRef(true);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Autosave: subscribe once and dispatch through a ref so the subscription
  // survives onSave identity changes (would otherwise drop the first tick after resub).
  useEffect(() => {
    const { unsubscribe } = watch((data) => {
      if (isFirstWatch.current) {
        isFirstWatch.current = false;
        return;
      }
      onSaveRef.current(data as HorizontFormData);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchedFarbe = watch("farbe_munsell");
  const watchedPH = watch("ph_cacl2");
  const watchedBodenart = watch("bodenart");
  const watchedTiefeOben = watch("tiefe_oben");
  const watchedTiefeUnten = watch("tiefe_unten");
  const watchedLagerungsdichte = watch("lagerungsdichte");
  const watchedHumusPct = watch("humus_pct");
  const watchedAnteil = watch("anteil");
  const watchedGpvPct = watch("gpv_pct");
  const watchedLkPct = watch("lk_pct");
  const watchedKak = watch("kak");
  const watchedTonanteil = watch("tonanteil");

  useEffect(() => {
    setValue(
      "maechtigk_dm",
      calcMaechtigkeitDm(watchedTiefeOben, watchedTiefeUnten),
    );
  }, [watchedTiefeOben, watchedTiefeUnten, setValue]);

  useEffect(() => {
    const maechtigkDm = calcMaechtigkeitDm(watchedTiefeOben, watchedTiefeUnten);
    const result = calcPoreCapacities(
      watchedBodenart,
      watchedLagerungsdichte,
      watchedHumusPct,
      watchedAnteil,
      maechtigkDm,
    );
    const poreFields = [
      "gpv_pct",
      "gpv_lm2",
      "lk_pct",
      "lk_lm2",
      "fk_pct",
      "fk_lm2",
      "nfk_pct",
      "nfk_lm2",
    ] as const;
    if (result) {
      poreFields.forEach((f) => setValue(f, result[f]));
    } else {
      poreFields.forEach((f) => setValue(f, ""));
    }
  }, [
    watchedBodenart,
    watchedLagerungsdichte,
    watchedHumusPct,
    watchedAnteil,
    watchedTiefeOben,
    watchedTiefeUnten,
    setValue,
  ]);

  useEffect(() => {
    const pct = parseFloat(watchedHumusPct);
    if (!isNaN(pct) && pct > 0) {
      setValue("humus", humusKlasse(pct).klasse);
    } else {
      setValue("humus", "");
    }
  }, [watchedHumusPct, setValue]);

  useEffect(() => {
    const parsed = parseMunsell(watchedFarbe);
    const pH = parseFloat(watchedPH);
    const clay = parseFloat(watchedTonanteil);
    if (!parsed || isNaN(pH) || isNaN(clay)) {
      setValue("humus_pct", "");
      return;
    }
    const munsellValue = parsed.value;
    const chroma = chromaToClass(parsed.chroma);
    if (
      munsellValue < 1 ||
      munsellValue > 8 ||
      pH < 2 ||
      pH > 9 ||
      clay < 0 ||
      clay > 100
    ) {
      setValue("humus_pct", "");
      return;
    }
    setValue(
      "humus_pct",
      String(estimateHumus(munsellValue, chroma, pH, clay)),
    );
  }, [watchedFarbe, watchedPH, watchedTonanteil, setValue]);

  useEffect(() => {
    setValue("kak", calcKAK(watchedBodenart, humusform ?? "", watchedHumusPct));
  }, [watchedBodenart, humusform, watchedHumusPct, setValue]);

  useEffect(() => {
    setValue(
      "basensaettigung",
      calcBasensaettigung(watchedPH, watchedHumusPct),
    );
  }, [watchedPH, watchedHumusPct, setValue]);

  return (
    <>
      <FormProvider {...methods}>
        <View style={localStyles.formContent}>
          {/* ── Horizontname ── */}
          <Section title="Horizontname (58)">
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="horizontname"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="z.B. Ap, Bv, C"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("lexikon")}
              >
                <Text style={styles.actionButtonText}>Lexikon</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Tiefe ── */}
          <Section title="Tiefe (cm) (26)">
            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Von</Text>
                <Controller
                  control={control}
                  name="tiefe_oben"
                  render={({ field: { onChange, value } }) => (
                    <ValidatedField
                      keyboardType="number-pad"
                      placeholder="z.B. 0"
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value}
                      validate={validateTiefe}
                      externalInvalid={tiefeOrderInvalid(
                        watchedTiefeOben,
                        watchedTiefeUnten,
                      )}
                      externalSuggestion={TIEFE_ORDER_SUGGESTION}
                      fieldLabel="Tiefe oben (cm)"
                    />
                  )}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Bis</Text>
                <Controller
                  control={control}
                  name="tiefe_unten"
                  render={({ field: { onChange, value } }) => (
                    <ValidatedField
                      keyboardType="number-pad"
                      placeholder="z.B. 30"
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value}
                      validate={validateTiefe}
                      externalInvalid={tiefeOrderInvalid(
                        watchedTiefeOben,
                        watchedTiefeUnten,
                      )}
                      externalSuggestion={TIEFE_ORDER_SUGGESTION}
                      fieldLabel="Tiefe unten (cm)"
                    />
                  )}
                />
              </View>
            </View>
          </Section>

          {/* ── Bodenart ── */}
          <Section title="Bodenart / Textur (44)">
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="bodenart"
                render={({ field: { onChange, value } }) => (
                  <ValidatedField
                    placeholder="z.B. Su2"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                    validate={validateBodenart}
                    fieldLabel="Bodenart / Textur"
                  />
                )}
              />
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("bodenart")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Bodeneigenschaften ── */}
          <Section title="Bodeneigenschaften">
            <Text style={styles.fieldLabel}>Tonanteil</Text>
            <View style={localStyles.fieldWithTool}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  gap: 4,
                }}
              >
                <Controller
                  control={control}
                  name="tonanteil"
                  render={({ field: { onChange, value } }) => (
                    <ValidatedField
                      placeholder="z.B. 17"
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value}
                      validate={validateTonanteil}
                      fieldLabel="Tonanteil"
                    />
                  )}
                />
                <Text style={localStyles.unit}>%</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => {
                  const clay = bodenartToClay(watchedBodenart);
                  if (clay !== null) {
                    setValue("tonanteil", String(clay));
                  } else {
                    Alert.alert(
                      "Bodenart nicht erkannt",
                      "Bitte zuerst eine gültige KA5-Bodenart eingeben.",
                    );
                  }
                }}
              >
                <Text style={styles.actionButtonText}>Abschätzen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Skelettanteil (45)</Text>
            <View style={localStyles.fieldWithTool}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  gap: 4,
                }}
              >
                <Controller
                  control={control}
                  name="anteil"
                  render={({ field: { onChange, value } }) => (
                    <ValidatedField
                      placeholder="z.B. 35"
                      keyboardType="number-pad"
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value}
                      validate={validateAnteil}
                      fieldLabel="Skelettanteil"
                    />
                  )}
                />
                <Text style={localStyles.unit}>%</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("anteil")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>pH (CaCl₂)</Text>
            <Controller
              control={control}
              name="ph_cacl2"
              render={({ field: { onChange, value } }) => (
                <ValidatedField
                  keyboardType="decimal-pad"
                  placeholder="z.B. 5.5"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                  validate={validatePh}
                  fieldLabel="pH (CaCl₂)"
                />
              )}
            />

            <Text style={styles.fieldLabel}>Bodenfarbe (28)</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="farbe_munsell"
                render={({ field: { onChange, value } }) => (
                  <ValidatedField
                    placeholder="z.B. 10YR 4/3"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                    validate={validateMunsell}
                    fieldLabel="Bodenfarbe (Munsell)"
                  />
                )}
              />
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("farbe")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Carbonatgehalt (48)</Text>
            <View style={localStyles.fieldWithTool}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="carbonat"
                  render={({ field: { onChange, value } }) => (
                    <LabeledDropdownField
                      value={value}
                      options={CARBONAT_OPTIONS}
                      placeholder="Auswählen…"
                      onChange={onChange}
                    />
                  )}
                />
              </View>
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("carbonat")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Lagerungsdichte (42)</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="lagerungsdichte"
                render={({ field: { onChange, value } }) => (
                  <ValidatedField
                    style={[styles.input, { flex: 1 }]}
                    placeholder="z.B. 1,5 oder 1,4–1,6"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                    validate={validateLagerungsdichte}
                    fieldLabel="Lagerungsdichte"
                  />
                )}
              />
              <Text style={localStyles.unit}>kg/dm³</Text>
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("lagerungsdichte")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Feinwurzeln (41a)</Text>
            <View style={localStyles.fieldWithTool}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="feinwurzeln"
                  render={({ field: { onChange, value } }) => (
                    <LabeledDropdownField
                      value={value}
                      options={FEINWURZELN_OPTIONS}
                      placeholder="Auswählen…"
                      onChange={onChange}
                    />
                  )}
                />
              </View>
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("feinwurzeln")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Gefüge (35)</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="gefuege"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="z.B. Ei, Sub"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                style={[styles.actionButton, localStyles.halfRowBtn]}
                onPress={() => setActiveModal("gefuege")}
              >
                <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Notizen ── */}
          <Section title="Notizen (57)">
            <Controller
              control={control}
              name="notizen"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, localStyles.multiline]}
                  placeholder="Freitext..."
                  placeholderTextColor={colors.primary + "66"}
                  multiline
                  numberOfLines={4}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Section>

          {/* ── Erweiterte Bodenaufnahme ── */}
          <CollapsibleSection
            title="Erweiterte Bodenaufnahme"
            expanded={erweiterteExpanded}
            onToggle={() => setErweiterteExpanded((v) => !v)}
          >
            <Text style={styles.erweiterteHint}>
              Hierfür stehen noch keine Bestimmungshilfen zur Verfügung. Bitte
              nutzt die KA6 für die korrekte Formatierung der Werte.
            </Text>

            {(
              [
                ["bodenfeuchte", "Bodenfeuchte (32)"],
                ["konsistenz", "Konsistenz (33)"],
                ["oxidationsmerkmale", "Oxidationsmerkmale (30)"],
                ["reduktionsmerkmale", "Reduktionsmerkmale (31)"],
                ["pedogene_merkmale", "Weitere pedogene Merkmale (34)"],
                ["lagerungsart_erw", "Lagerungsart (36)"],
                ["lagerungsform", "Lagerungsform (37)"],
                ["verfestigungsdichte", "Verfestigungsdichte (38)"],
                ["hohlraeume", "Hohlräume / Sekundärporen (39)"],
                [
                  "zersetzungsstufe",
                  "Zersetzungsstufe / Humifizierungsgrad (40)",
                ],
                ["wurzelverteilung", "Wurzelverteilung (41b)"],
                ["pilzmycel", "Pilzmycel (41c)"],
                ["grobbodenanbindung", "Grobbodenanbindung (47)"],
                [
                  "geog_org_kohlenstoff",
                  "Geogener Organischer Kohlenstoff (49)",
                ],
              ] as [keyof HorizontFormData, string][]
            ).map(([name, label]) => (
              <View key={name}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Controller
                  control={control}
                  name={name as any}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value as string}
                    />
                  )}
                />
              </View>
            ))}

            <Text
              style={[styles.fieldLabel, { marginTop: 8, fontWeight: "700" }]}
            >
              Substratkennzeichnung
            </Text>
            {(
              [
                ["geogenese", "Geogenese (43)"],
                ["periglaziaere_lagen", "Periglaziäre Lagen (51)"],
                ["stratigraphie", "Stratigraphie (55)"],
                ["grobkomponenten", "Grobkomponenten (52a)"],
                ["feinkomponenten", "Feinkomponenten (52b)"],
                ["beimengungen", "Beimengungen (53)"],
                ["bes_strukturen", "Besondere Strukturen (54)"],
              ] as [keyof HorizontFormData, string][]
            ).map(([name, label]) => (
              <View key={name}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Controller
                  control={control}
                  name={name as any}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value as string}
                    />
                  )}
                />
              </View>
            ))}

            {(
              [
                ["geruch", "Geruch (56)"],
                ["substratart", "Substratart"],
              ] as [keyof HorizontFormData, string][]
            ).map(([name, label]) => (
              <View key={name}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Controller
                  control={control}
                  name={name as any}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value as string}
                    />
                  )}
                />
              </View>
            ))}

            <Text style={styles.fieldLabel}>Probennummern (59)</Text>
            {probenFields.map((field, index) => (
              <View key={field.id} style={localStyles.fieldWithTool}>
                <Controller
                  control={control}
                  name={`probennummern.${index}.value`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder={`Probe ${index + 1}`}
                      placeholderTextColor={colors.primary + "66"}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    localStyles.toolBtn,
                    { backgroundColor: "#c00" },
                  ]}
                  onPress={() => removeProbe(index)}
                >
                  <Text style={styles.actionButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => appendProbe({ value: "" })}
            >
              <Text style={styles.actionButtonText}>
                + Weitere Probe hinzufügen
              </Text>
            </TouchableOpacity>
          </CollapsibleSection>

          {/* ── Automatisch berechnete Werte ── */}
          <CollapsibleSection
            title="Automatisch berechnete Werte"
            expanded={autoExpanded}
            onToggle={() => setAutoExpanded((v) => !v)}
          >
            <View style={localStyles.headingRow}>
              <Text style={styles.sectionTitle}>Mächtigkeit (dm)</Text>
              <InfoButton text="Dicke des Horizonts in Dezimetern, automatisch berechnet aus Tiefe oben und Tiefe unten. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt." />
            </View>
            <Controller
              control={control}
              name="maechtigk_dm"
              render={({ field: { value } }) => (
                <TextInput
                  style={[styles.input, styles.readonlyInput]}
                  placeholder="Wird automatisch berechnet"
                  placeholderTextColor={colors.primary + "66"}
                  value={value}
                  editable={false}
                />
              )}
            />

            <View style={{ gap: 6 }}>
              <View style={localStyles.headingRow}>
                <Text style={styles.sectionTitle}>Humusgehalt (29)</Text>
                <InfoButton text="Geschätzter Humusgehalt nach Renger (1987) in %; benötigt Bodenfarbe (Munsell), pH (CaCl₂) und Tonanteil. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt." />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Humusgehalt</Text>
                    <Controller
                      control={control}
                      name="humus_pct"
                      render={({ field: { value } }) => (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <TextInput
                            style={[styles.input, styles.readonlyInput, { flex: 1 }]}
                            placeholder="Wird berechnet…"
                            placeholderTextColor={colors.primary + "66"}
                            value={value}
                            editable={false}
                          />
                          <Text style={localStyles.unit}>%</Text>
                        </View>
                      )}
                    />
                  </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Humusklasse</Text>
                  <Controller
                    control={control}
                    name="humus"
                    render={({ field: { value } }) => (
                      <TextInput
                        style={[styles.input, styles.readonlyInput]}
                        placeholder="Wird berechnet…"
                        placeholderTextColor={colors.primary + "66"}
                        value={value}
                        editable={false}
                      />
                    )}
                  />
                </View>
              </View>
            </View>

            <PoreReadout
              title="Gesamte Porenkapazität (GPV)"
              pctField="gpv_pct"
              lm2Field="gpv_lm2"
              rating={watchedGpvPct ? rateGPV(parseFloat(watchedGpvPct)) : ""}
              control={control}
              info="Gesamtvolumen aller Bodenporen in Vol% und l/m²; benötigt Bodenart, Lagerungsdichte, Humusgehalt, Skelettanteil und Mächtigkeit (Tiefe oben + Tiefe unten). Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt."
            />
            <PoreReadout
              title="Luftkapazität (LK)"
              pctField="lk_pct"
              lm2Field="lk_lm2"
              rating={watchedLkPct ? rateLK(parseFloat(watchedLkPct)) : ""}
              control={control}
              info="Anteil grober Poren (Luftporen) in Vol% und l/m²; benötigt Bodenart, Lagerungsdichte, Humusgehalt, Skelettanteil und Mächtigkeit (Tiefe oben + Tiefe unten). Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt."
            />
            <PoreReadout
              title="Feldkapazität (FK)"
              pctField="fk_pct"
              lm2Field="fk_lm2"
              control={control}
              info="Wassergehalt nach Ablauf des Schwerkraftwassers in l/m²; benötigt Bodenart, Lagerungsdichte, Humusgehalt, Skelettanteil und Mächtigkeit. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt."
            />
            <PoreReadout
              title="Nutzbare Feldkapazität (nFK)"
              pctField="nfk_pct"
              lm2Field="nfk_lm2"
              control={control}
              info="Pflanzenverfügbares Wasser zwischen Feldkapazität und permanentem Welkepunkt in l/m²; benötigt Bodenart, Lagerungsdichte, Humusgehalt, Skelettanteil und Mächtigkeit. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt."
            />

              <View style={localStyles.poreBlock}>
              <View style={localStyles.headingRow}>
                <Text style={styles.sectionTitle}>KAK</Text>
                <InfoButton text="Kationenaustauschkapazität nach Bodenart-Nachschlagetabelle mit Humuskorrektur; benötigt Bodenart, Humusform (Aufnahme) und Humusgehalt. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt." />
              </View>
              <Controller
                control={control}
                name="kak"
                render={({ field: { value } }) => (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      style={[styles.input, styles.readonlyInput, { flex: 1 }]}
                      placeholder="Wird berechnet…"
                      placeholderTextColor={colors.primary + "66"}
                      value={value}
                      editable={false}
                    />
                    <Text style={localStyles.unit}>cmol_c/kg</Text>
                  </View>
                )}
              />
              <Text style={styles.fieldLabel}>Bewertung</Text>
              <TextInput
                style={[styles.input, styles.readonlyInput]}
                placeholder="Wird berechnet…"
                placeholderTextColor={colors.primary + "66"}
                value={watchedKak ? rateKAK(parseFloat(watchedKak)) : ""}
                editable={false}
              />
            </View>

            <View style={localStyles.poreBlock}>
              <View style={localStyles.headingRow}>
                <Text style={styles.sectionTitle}>Basensättigung</Text>
                <InfoButton text="Anteil der Basen (Ca, Mg, K, Na) an der Kationenaustauschkapazität in %; benötigt pH (CaCl₂) und Humusgehalt. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt." />
              </View>
              <Controller
                control={control}
                name="basensaettigung"
                render={({ field: { value } }) => (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TextInput
                      style={[styles.input, styles.readonlyInput, { flex: 1 }]}
                      placeholder="Wird berechnet…"
                      placeholderTextColor={colors.primary + "66"}
                      value={value}
                      editable={false}
                    />
                    <Text style={localStyles.unit}>%</Text>
                  </View>
                )}
              />
            </View>
          </CollapsibleSection>
        </View>
      </FormProvider>

      {/* ── Farbe modal ── */}
      <Modal
        visible={activeModal === "farbe"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <View style={{ flex: 1, padding: 20 }}>
            <PictureTaker
              onConfirm={(munsell) => {
                setValue("farbe_munsell", munsell);
                setActiveModal(null);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Bodenart modal ── */}
      <Modal
        visible={activeModal === "bodenart"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <TexTree
            onConfirm={(result) => {
              setValue("bodenart", result);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Anteil modal ── */}
      <Modal
        visible={activeModal === "anteil"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <View style={{ flex: 1, padding: 20 }}>
            <SoilShareScroll
              onConfirm={(percent) => {
                setValue("anteil", percent);
                setActiveModal(null);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Carbonatgehalt modal ── */}
      <Modal
        visible={activeModal === "carbonat"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <CarbonatTool
            onConfirm={(v) => {
              setValue("carbonat", v);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Lagerungsdichte modal ── */}
      <Modal
        visible={activeModal === "lagerungsdichte"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <LagerungsdichteTool
            onConfirm={(v) => {
              if (typeof v === "string") {
                // Extract all numeric parts (e.g. "1,2 - 1,5 kg/dm³" -> ["1,2","1,5"]) and
                // join them with ' - ' while normalizing commas to dots.
                const matches = v.match(/[-+]?\d*[.,]?\d+/g);
                if (matches && matches.length > 0) {
                  const cleaned = matches.map((m) => m.replace(',', '.')).join(' - ');
                  setValue("lagerungsdichte", cleaned);
                } else {
                  setValue("lagerungsdichte", v);
                }
              } else {
                setValue("lagerungsdichte", String(v));
              }
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Feinwurzeln modal ── */}
      <Modal
        visible={activeModal === "feinwurzeln"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <FeinwurzelnTool
            onConfirm={(v) => {
              setValue("feinwurzeln", v);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Gefüge modal ── */}
      <Modal
        visible={activeModal === "gefuege"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <GefuegeTool
            onConfirm={(v) => {
              setValue("gefuege", v);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Horizontlexikon modal ── */}
      <Modal
        visible={activeModal === "lexikon"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <HorizontLexikonContent />
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ─── Modal header with close button ───────────────────────────────────────────

/** Reusable header rendered at the top of every fullscreen tool modal. */
function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <View style={localStyles.modalHeader}>
      <TouchableOpacity onPress={onClose}>
        <Text style={localStyles.modalClose}>✕ Schließen</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

/** Wraps a group of related form fields with a section title and bottom divider. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PoreReadout({
  title,
  pctField,
  lm2Field,
  rating,
  control,
  info,
}: {
  title: string;
  pctField: keyof HorizontFormData;
  lm2Field: keyof HorizontFormData;
  rating?: string;
  control: any;
  info?: string;
}) {
  const placeholder = "Wird berechnet…";
  const ph = colors.primary + "66";
  return (
    <View style={localStyles.poreBlock}>
      <View style={localStyles.headingRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {info && <InfoButton text={info} />}
      </View>
      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Controller
            control={control}
            name={pctField}
            render={({ field: { value } }) => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  style={[styles.input, styles.readonlyInput, { flex: 1 }]}
                  placeholder={placeholder}
                  placeholderTextColor={ph}
                  value={value as string}
                  editable={false}
                />
                <Text style={localStyles.unit}>Vol%</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.halfField}>
          <Controller
            control={control}
            name={lm2Field}
            render={({ field: { value } }) => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextInput
                  style={[styles.input, styles.readonlyInput, { flex: 1 }]}
                  placeholder={placeholder}
                  placeholderTextColor={ph}
                  value={value as string}
                  editable={false}
                />
                <Text style={localStyles.unit}>l/m²</Text>
              </View>
            )}
          />
        </View>
      </View>
      {rating !== undefined && (
        <>
          <Text style={styles.fieldLabel}>Bewertung</Text>
          <TextInput
            style={[styles.input, styles.readonlyInput]}
            placeholder={placeholder}
            placeholderTextColor={ph}
            value={rating}
            editable={false}
          />
        </>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  formContent: {
    gap: 8,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldWithTool: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  toolBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  halfRowBtn: {
    width: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalClose: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  unit: {
    color: colors.primary,
    fontSize: 13,
  },
  poreBlock: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
});
