import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  closeAufnahme,
  getAufnahme,
  type Aufnahme,
} from "@/utils/MappingQueries";
import { addHorizont, getHorizonteForAufnahme, type Horizont } from "@/utils/HorizonQueries";
import HorizontButton from "@/components/HorizonButton";

// ─── Standortdaten status ─────────────────────────────────────────────────────

type StandortStatus = "leer" | "begonnen" | "abgeschlossen";

function deriveStandortStatus(a: Aufnahme): StandortStatus {
  const hasGps = a.gps_lat != null || a.utm_easting != null;
  const allFilled =
    hasGps &&
    a.bodentyp != null && a.bodtyp_abk != null &&
    a.humusform != null && a.humsfrm_abk != null &&
    a.ausgangsgestein != null && a.grundigkeit != null &&
    a.m_ue_nn != null && a.reliefpos != null && a.expos != null &&
    a.nutzung != null && a.vegetation != null &&
    a.witterung != null && a.mittl_n != null && a.mittl_temp != null;
  const anyFilled =
    hasGps || a.bodentyp != null || a.humusform != null ||
    a.reliefpos != null || a.nutzung != null || a.witterung != null;
  if (allFilled) return "abgeschlossen";
  if (anyFilled) return "begonnen";
  return "leer";
}

const standortBadge: Record<StandortStatus, { label: string; bg: string }> = {
  leer:          { label: "leer",          bg: "#6c757d" },
  begonnen:      { label: "begonnen",      bg: "#e0a020" },
  abgeschlossen: { label: "abgeschlossen", bg: colors.primary },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HorizonOverview() {
  const { aufnahmeId: aufnahmeIdParam } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(aufnahmeIdParam, 10);
  const navigation = useNavigation();

  const [horizonte, setHorizonte] = useState<Horizont[]>([]);
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  const [showUnvollstaendigModal, setShowUnvollstaendigModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
      setAufnahme(getAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );

  useLayoutEffect(() => {
    if (aufnahme) {
      navigation.setOptions({ title: `Aufnahme ${aufnahme.nummer ?? aufnahme.id}` });
    }
  }, [navigation, aufnahme]);

  const handleAddHorizont = () => {
    addHorizont(aufnahmeId);
    setHorizonte(getHorizonteForAufnahme(aufnahmeId));
  };

  const handleHorizontPress = (horizont: Horizont) => {
    router.push(`/mapping/${aufnahmeId}/horizon/${horizont.nummer}`);
  };

  const doClose = () => {
    closeAufnahme(aufnahmeId);
    const kampagneId = aufnahme?.feldkampagne_id;
    if (kampagneId != null) {
      router.replace(`/mapping/kampagne/${kampagneId}` as any);
    } else {
      router.replace("/mapping" as any);
    }
  };

  const handleAbschliessen = () => {
    const offene = horizonte.filter((h) => h.status !== "vollstaendig");
    if (offene.length > 0) {
      setShowUnvollstaendigModal(true);
    } else {
      doClose();
    }
  };

  const standortStatus = aufnahme ? deriveStandortStatus(aufnahme) : "leer";
  const badge = standortBadge[standortStatus];

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Standortdaten button ── */}
        <TouchableOpacity
          style={localStyles.standortBtn}
          onPress={() => router.push(`/mapping/${aufnahmeId}/standort` as any)}
          activeOpacity={0.75}
        >
          <Text style={localStyles.standortName}>Standortdaten</Text>
          <View style={[localStyles.badge, { backgroundColor: badge.bg }]}>
            <Text style={localStyles.badgeText}>{badge.label}</Text>
          </View>
        </TouchableOpacity>

        {/* ── Horizon list ── */}
        <View style={localStyles.horizonList}>
          {horizonte.map((horizont) => (
            <HorizontButton
              key={horizont.id}
              horizont={horizont}
              onPress={() => handleHorizontPress(horizont)}
            />
          ))}
          <TouchableOpacity style={styles.actionButton} onPress={handleAddHorizont}>
            <Text style={styles.actionButtonText}>+ Horizont hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* ── Close button ── */}
        <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={handleAbschliessen}>
          <Text style={styles.maintext}>Abschließen</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Unvollständig confirmation modal ── */}
      <Modal visible={showUnvollstaendigModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aufnahme unvollständig</Text>
            <Text style={styles.modalText}>Trotzdem abschließen?</Text>
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowUnvollstaendigModal(false); doClose(); }}
              >
                <Text style={styles.modalButtonText}>Trotzdem abschließen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setShowUnvollstaendigModal(false)}
              >
                <Text style={styles.modalButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  standortBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  standortName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  horizonList: {
    gap: 12,
    paddingVertical: 8,
  },
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
});
