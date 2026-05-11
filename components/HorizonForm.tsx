import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";
import PictureTaker from "@/components/PictureTaker";
import HorizontLexikonContent from "@/components/HorizontLexikonContent";
import TexTree from "@/components/TexTree";
import SoilShareScroll from "@/components/SoilShareScroll";
import HumusgehaltTool from "@/components/HumusgehaltTool";
import CarbonatTool from "@/components/CarbonatTool";
import LagerungsdichteTool from "@/components/LagerungsdichteTool";
import FeinwurzelnTool from "@/components/FeinwurzelnTool";
import GefuegeTool from "@/components/GefuegeTool";

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
  lagerungsart: string;
  maechtigk_dm: string;
};

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  initialData?: Partial<Horizont>;
  onSave: (data: HorizontFormData) => void;
};

type ActiveModal = 'farbe' | 'bodenart' | 'anteil' | 'humus' | 'carbonat' | 'lagerungsdichte' | 'feinwurzeln' | 'lagerungsart' | 'lexikon' | null;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Horizon detail form.
 * Renders all horizon fields grouped into sections; fields with associated determination
 * tools show a "bestimmen" button that opens the tool in a fullscreen modal.
 * All field changes autosave via the onSave callback (no explicit save button).
 * Fields that receive values from tools use Controller with a reactive value prop
 * so the input re-renders immediately when setValue is called.
 */
export default function HorizontFormular({ initialData, onSave }: Props) {
  const methods = useForm<HorizontFormData>({
    defaultValues: {
      horizontname:  initialData?.horizontname ?? "",
      farbe_munsell: initialData?.farbe_munsell ?? "",
      bodenart:      initialData?.bodenart ?? "",
      anteil:        initialData?.anteil ?? "",
      notizen:       initialData?.notizen ?? "",
      tiefe_oben:    initialData?.tiefe_oben ?? "",
      tiefe_unten:   initialData?.tiefe_unten ?? "",
      ph_cacl2:      initialData?.ph_cacl2 != null ? String(initialData.ph_cacl2) : "",
      humus:         initialData?.humus ?? "",
      humus_pct:     initialData?.humus_pct ?? "",
      carbonat:      initialData?.carbonat ?? "",
      lagerungsdichte: initialData?.lagerungsdichte ?? "",
      feinwurzeln:   initialData?.feinwurzeln ?? "",
      lagerungsart:  initialData?.lagerungsart ?? "",
      maechtigk_dm:  initialData?.maechtigk_dm ?? "",
    },
  });

  const { setValue, control, watch } = methods;
  // Which tool modal is currently open; null means all modals are closed
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Autosave: subscribe to every form change and call onSave with the full data snapshot
  useEffect(() => {
    const { unsubscribe } = watch((data) => onSave(data as HorizontFormData));
    return unsubscribe;
  }, [onSave]);

  const watchedFarbe    = watch('farbe_munsell');
  const watchedPH       = watch('ph_cacl2');
  const watchedBodenart = watch('bodenart');

  return (
    <>
      <FormProvider {...methods}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Horizontname ── */}
          <Section title="Horizontname">
            <View style={localStyles.fieldWithTool}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="z.B. Ap, Bv, C"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={(v) => setValue("horizontname", v)}
                defaultValue={initialData?.horizontname ?? ""}
              />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('lexikon')}>
                <Text style={styles.actionButtonText}>Lexikon</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Bodenfarbe ── */}
          <Section title="Bodenfarbe">
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="farbe_munsell"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. 10YR 4/3"
                    placeholderTextColor={colors.primary + "66"} onChangeText={onChange} value={value} />
                )}
              />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('farbe')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Tiefe ── */}
          <Section title="Tiefe (cm)">
            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Von</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="z.B. 0"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("tiefe_oben", v)}
                  defaultValue={initialData?.tiefe_oben ?? ""}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Bis</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="z.B. 30"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("tiefe_unten", v)}
                  defaultValue={initialData?.tiefe_unten ?? ""}
                />
              </View>
            </View>
          </Section>

          {/* ── Bodenart ── */}
          <Section title="Bodenart / Textur">
            <View style={localStyles.fieldWithTool}>
              <Controller
                control={control}
                name="bodenart"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="z.B. Su2"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('bodenart')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Bodeneigenschaften ── */}
          <Section title="Bodeneigenschaften">

            {/* pH + Mächtigkeit: no tools, keep paired layout */}
            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>pH (CaCl₂)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="z.B. 5.5"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("ph_cacl2", v)}
                  defaultValue={initialData?.ph_cacl2 != null ? String(initialData.ph_cacl2) : ""}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Mächtigkeit (dm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="z.B. 1.5"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("maechtigk_dm", v)}
                  defaultValue={initialData?.maechtigk_dm ?? ""}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Humusgehalt</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="humus" render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { width: 60 }]} placeholder="h2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange} value={value} />
              )} />
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 }}>
                <Controller control={control} name="humus_pct" render={({ field: { onChange, value } }) => (
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Humus"
                    placeholderTextColor={colors.primary + "66"}
                    keyboardType="decimal-pad"
                    onChangeText={onChange} value={value} />
                )} />
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 18 }}>%</Text>
              </View>
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('humus')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Carbonatgehalt</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="carbonat" render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. C0"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange} value={value} />
              )} />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('carbonat')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Lagerungsdichte</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="lagerungsdichte" render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. 4"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange} value={value} />
              )} />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('lagerungsdichte')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Feinwurzeln</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="feinwurzeln" render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. w2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange} value={value} />
              )} />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('feinwurzeln')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Gefüge</Text>
            <View style={localStyles.fieldWithTool}>
              <Controller control={control} name="lagerungsart" render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. Ld2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange} value={value} />
              )} />
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('lagerungsart')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Skelettanteil</Text>
            <View style={localStyles.fieldWithTool}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 }}>
                <Controller control={control} name="anteil"
                  render={({ field: { onChange, value } }) => (
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="z.B. 35" keyboardType="number-pad"
                      placeholderTextColor={colors.primary + "66"} onChangeText={onChange} value={value} />
                  )}
                />
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 18 }}>%</Text>
              </View>
              <TouchableOpacity style={[styles.actionButton, localStyles.toolBtn]} onPress={() => setActiveModal('anteil')}>
                <Text style={styles.actionButtonText}>bestimmen</Text>
              </TouchableOpacity>
            </View>

          </Section>

          {/* ── Notizen ── */}
          <Section title="Notizen">
            <TextInput
              style={[styles.input, localStyles.multiline]}
              placeholder="Freitext..."
              placeholderTextColor={colors.primary + "66"}
              multiline
              numberOfLines={4}
              onChangeText={(v) => setValue("notizen", v)}
              defaultValue={initialData?.notizen ?? ""}
            />
          </Section>

        </ScrollView>
      </FormProvider>

      {/* ── Farbe modal ── */}
      <Modal visible={activeModal === 'farbe'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <View style={{ flex: 1, padding: 20 }}>
            <PictureTaker onConfirm={(munsell) => { setValue('farbe_munsell', munsell); setActiveModal(null); }} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Bodenart modal ── */}
      <Modal visible={activeModal === 'bodenart'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <TexTree onConfirm={(result) => { setValue('bodenart', result); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Anteil modal ── */}
      <Modal visible={activeModal === 'anteil'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <View style={{ flex: 1, padding: 20 }}>
            <SoilShareScroll onConfirm={(percent) => { setValue('anteil', percent); setActiveModal(null); }} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Humusgehalt modal ── */}
      <Modal visible={activeModal === 'humus'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <HumusgehaltTool
            onConfirm={(klasse, pct) => { setValue('humus', klasse); setValue('humus_pct', pct); setActiveModal(null); }}
            initialFarbeMunsell={watchedFarbe}
            initialPH={watchedPH}
            initialBodenart={watchedBodenart}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Carbonatgehalt modal ── */}
      <Modal visible={activeModal === 'carbonat'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <CarbonatTool onConfirm={(v) => { setValue('carbonat', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Lagerungsdichte modal ── */}
      <Modal visible={activeModal === 'lagerungsdichte'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <LagerungsdichteTool onConfirm={(v) => { setValue('lagerungsdichte', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Feinwurzeln modal ── */}
      <Modal visible={activeModal === 'feinwurzeln'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <FeinwurzelnTool onConfirm={(v) => { setValue('feinwurzeln', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Gefüge modal ── */}
      <Modal visible={activeModal === 'lagerungsart'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <GefuegeTool onConfirm={(v) => { setValue('lagerungsart', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Horizontlexikon modal ── */}
      <Modal visible={activeModal === 'lexikon'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  fieldWithTool: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toolBtn: {
    paddingHorizontal: 10,
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
});
