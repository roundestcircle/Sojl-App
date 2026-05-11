import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";
import PictureTaker from "@/components/PictureTaker";
import TexTree from "@/components/TexTree";
import SoilShareScroll from "@/components/SoilShareScroll";
import HumusgehaltTool from "@/components/HumusgehaltTool";
import CarbonatTool from "@/components/CarbonatTool";
import PflanzenresteTool from "@/components/PflanzenresteTool";
import FeinwurzelnTool from "@/components/FeinwurzelnTool";
import TrennbarkeitTool from "@/components/TrennbarkeitTool";
import LagerungsartTool from "@/components/LagerungsartTool";

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
  carbonat: string;
  pflanzenreste: string;
  feinwurzeln: string;
  trennbarkeit: string;
  lagerungsart: string;
  maechtigk_dm: string;
};

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  initialData?: Partial<Horizont>;
  onSave: (data: HorizontFormData) => void;
};

type ActiveModal = 'farbe' | 'bodenart' | 'anteil' | 'humus' | 'carbonat' | 'pflanzenreste' | 'feinwurzeln' | 'trennbarkeit' | 'lagerungsart' | null;

// ─── Component ─────────────────────────────────────────────────────────────────

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
      carbonat:      initialData?.carbonat ?? "",
      pflanzenreste: initialData?.pflanzenreste ?? "",
      feinwurzeln:   initialData?.feinwurzeln ?? "",
      trennbarkeit:  initialData?.trennbarkeit ?? "",
      lagerungsart:  initialData?.lagerungsart ?? "",
      maechtigk_dm:  initialData?.maechtigk_dm ?? "",
    },
  });

  const { setValue, control, watch } = methods;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  useEffect(() => {
    const { unsubscribe } = watch((data) => onSave(data as HorizontFormData));
    return unsubscribe;
  }, [onSave]);

  return (
    <>
      <FormProvider {...methods}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Horizontname ── */}
          <Section title="Horizontname">
            <TextInput
              style={styles.input}
              placeholder="z.B. Ap, Bv, C"
              placeholderTextColor={colors.primary + "66"}
              onChangeText={(v) => setValue("horizontname", v)}
              defaultValue={initialData?.horizontname ?? ""}
            />
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
            <Controller
              control={control}
              name="bodenart"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Su2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('bodenart')}>
              <Text style={styles.actionButtonText}>Bodenart bestimmen</Text>
            </TouchableOpacity>
          </Section>

          {/* ── Bodeneigenschaften ── */}
          <Section title="Bodeneigenschaften">

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

            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Humusgehalt</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. h2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("humus", v)}
                  defaultValue={initialData?.humus ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('humus')}>
                  <Text style={styles.actionButtonText}>Humusgehalt bestimmen</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Carbonatgehalt</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. C0"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("carbonat", v)}
                  defaultValue={initialData?.carbonat ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('carbonat')}>
                  <Text style={styles.actionButtonText}>Carbonatgehalt bestimmen</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Pflanzenreste</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. 4"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("pflanzenreste", v)}
                  defaultValue={initialData?.pflanzenreste ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('pflanzenreste')}>
                  <Text style={styles.actionButtonText}>Pflanzenreste bestimmen</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Feinwurzeln</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. w2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("feinwurzeln", v)}
                  defaultValue={initialData?.feinwurzeln ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('feinwurzeln')}>
                  <Text style={styles.actionButtonText}>Feinwurzeln bestimmen</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Trennbarkeit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. t2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("trennbarkeit", v)}
                  defaultValue={initialData?.trennbarkeit ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('trennbarkeit')}>
                  <Text style={styles.actionButtonText}>Trennbarkeit bestimmen</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Lagerungsart</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Ld2"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={(v) => setValue("lagerungsart", v)}
                  defaultValue={initialData?.lagerungsart ?? ""}
                />
                <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('lagerungsart')}>
                  <Text style={styles.actionButtonText}>Lagerungsart bestimmen</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Bodenfarbe ── */}
            <Text style={styles.fieldLabel}>Bodenfarbe (Munsell)</Text>
            <Controller
              control={control}
              name="farbe_munsell"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="z.B. 10YR 4/3"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('farbe')}>
              <Text style={styles.actionButtonText}>Farbe bestimmen</Text>
            </TouchableOpacity>

            {/* ── Skelettanteil ── */}
            <Text style={styles.fieldLabel}>Skelettanteil</Text>
            <Controller
              control={control}
              name="anteil"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="z.B. 35"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('anteil')}>
              <Text style={styles.actionButtonText}>Anteil schätzen</Text>
            </TouchableOpacity>

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
          <HumusgehaltTool onConfirm={(v) => { setValue('humus', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Carbonatgehalt modal ── */}
      <Modal visible={activeModal === 'carbonat'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <CarbonatTool onConfirm={(v) => { setValue('carbonat', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Pflanzenreste modal ── */}
      <Modal visible={activeModal === 'pflanzenreste'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <PflanzenresteTool onConfirm={(v) => { setValue('pflanzenreste', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Feinwurzeln modal ── */}
      <Modal visible={activeModal === 'feinwurzeln'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <FeinwurzelnTool onConfirm={(v) => { setValue('feinwurzeln', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Trennbarkeit modal ── */}
      <Modal visible={activeModal === 'trennbarkeit'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <TrennbarkeitTool onConfirm={(v) => { setValue('trennbarkeit', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>

      {/* ── Lagerungsart modal ── */}
      <Modal visible={activeModal === 'lagerungsart'} animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ModalHeader onClose={() => setActiveModal(null)} />
          <LagerungsartTool onConfirm={(v) => { setValue('lagerungsart', v); setActiveModal(null); }} />
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ─── Modal header with close button ───────────────────────────────────────────

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
