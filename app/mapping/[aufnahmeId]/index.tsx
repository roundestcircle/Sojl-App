import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  closeAufnahme,
  getAufnahme,
  STANDORT_REQUIRED_FOR_VOLLSTAENDIG,
  type Aufnahme,
} from "@/utils/MappingQueries";
import {
  addHorizont,
  deleteHorizont,
  getHorizonteForAufnahme,
  type Horizont,
} from "@/utils/HorizonQueries";
import { exportAufnahmeAsZip } from "@/utils/csvExport";
import HorizontButton from "@/components/HorizonButton";
import Badge from "@/components/Badge";

// ─── Standortdaten status ─────────────────────────────────────────────────────

type StandortStatus = "leer" | "begonnen" | "abgeschlossen";

/**
 * Derives a completion status for the Standortdaten section of an Aufnahme.
 *   - abgeschlossen: GPS + all required profile/climate fields are filled
 *   - begonnen:      at least one meaningful field has been entered
 *   - leer:          no fields filled at all
 */
function deriveStandortStatus(a: Aufnahme): StandortStatus {
  const hasGps = a.gps_lat != null || a.utm_easting != null;
  const allFilled =
    hasGps && STANDORT_REQUIRED_FOR_VOLLSTAENDIG.every((f) => a[f] != null);
  const anyFilled =
    hasGps || STANDORT_REQUIRED_FOR_VOLLSTAENDIG.some((f) => a[f] != null);
  if (allFilled) return "abgeschlossen";
  if (anyFilled) return "begonnen";
  return "leer";
}

const standortBadge: Record<StandortStatus, { label: string; bg: string }> = {
  leer: { label: "leer", bg: "#6c757d" },
  begonnen: { label: "begonnen", bg: "#e0a020" },
  abgeschlossen: { label: "abgeschlossen", bg: colors.primary },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * Aufnahme overview screen.
 * Shows a "Standortdaten" button with a derived completion badge, followed by the list
 * of Horizonte. Long-pressing a horizon row triggers delete confirmation.
 * The "Abschließen" button warns when incomplete horizons exist.
 */
export default function HorizonOverview() {
  const { aufnahmeId: aufnahmeIdParam } = useLocalSearchParams<{
    aufnahmeId: string;
  }>();
  const aufnahmeId = parseInt(aufnahmeIdParam, 10);
  const navigation = useNavigation();

  // All horizons belonging to this Aufnahme, ordered by nummer
  const [horizonte, setHorizonte] = useState<Horizont[]>([]);
  // The parent Aufnahme record (used for status derivation and navigation after close)
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  // Whether to show the "incomplete horizons" warning before closing
  const [showUnvollstaendigModal, setShowUnvollstaendigModal] = useState(false);
  // Drives the spinner on the export button while the ZIP is being generated
  const [exporting, setExporting] = useState(false);
  // Horizon queued for deletion; non-null triggers the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Horizont | null>(null);

  // Reload both the Aufnahme and its horizons whenever the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
      setAufnahme(getAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );

  // Update the navigation bar title once the Aufnahme is loaded
  useLayoutEffect(() => {
    if (aufnahme) {
      navigation.setOptions({
        title: `Aufnahme ${aufnahme.nummer ?? aufnahme.id}`,
      });
    }
  }, [navigation, aufnahme]);

  /** Inserts a new empty Horizont and refreshes the list. */
  const handleAddHorizont = () => {
    addHorizont(aufnahmeId);
    setHorizonte(getHorizonteForAufnahme(aufnahmeId));
  };

  /** Navigates to the detail screen for the tapped Horizont. */
  const handleHorizontPress = (horizont: Horizont) => {
    router.push(`/mapping/${aufnahmeId}/horizon/${horizont.nummer}`);
  };

  /**
   * Marks the Aufnahme as abgeschlossen and returns to the parent campaign screen.
   * Falls back to the campaign list root if the parent campaign id is unknown.
   */
  const doClose = () => {
    closeAufnahme(aufnahmeId);
    const kampagneId = aufnahme?.feldkampagne_id;
    if (kampagneId != null) {
      router.replace(`/mapping/kampagne/${kampagneId}` as any);
    } else {
      router.replace("/mapping" as any);
    }
  };

  /**
   * Guards closing the Aufnahme: shows an "incomplete horizons" warning when any
   * horizon is not yet vollständig, otherwise closes immediately.
   */
  const handleAbschliessen = () => {
    const offene = horizonte.filter((h) => h.status !== "vollstaendig");
    if (offene.length > 0) {
      setShowUnvollstaendigModal(true);
    } else {
      doClose();
    }
  };

  const handleExport = async () => {
    if (!aufnahme) return;
    try {
      setExporting(true);
      await exportAufnahmeAsZip(aufnahme);
    } catch (e) {
      Alert.alert("Export fehlgeschlagen", String(e));
    } finally {
      setExporting(false);
    }
  };

  const standortStatus = aufnahme ? deriveStandortStatus(aufnahme) : "leer";
  const badge = standortBadge[standortStatus];

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={localStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Standortdaten button ── */}
          <TouchableOpacity
            style={[
              styles.listRow,
              { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
            ]}
            onPress={() =>
              router.push(`/mapping/${aufnahmeId}/standort` as any)
            }
            activeOpacity={0.75}
          >
            <Text style={[styles.rowTitle, { flex: 1 }]}>Standortdaten</Text>
            <Badge label={badge.label} color={badge.bg} />
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* ── Horizon list ── */}
          <View style={localStyles.horizonList}>
            {horizonte.map((horizont) => (
              <HorizontButton
                key={horizont.id}
                horizont={horizont}
                onPress={() => handleHorizontPress(horizont)}
                onLongPress={() => setDeleteTarget(horizont)}
              />
            ))}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddHorizont}
            >
              <Text style={styles.actionButtonText}>+ Horizont hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Bottom buttons ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.button} onPress={handleAbschliessen}>
            <Text style={styles.maintext}>Abschließen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            disabled={exporting || !aufnahme}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>
                Aufnahme exportieren (ZIP)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Delete Horizont confirmation modal ── */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Horizont löschen</Text>
            <Text style={styles.modalText}>
              H{deleteTarget?.nummer}
              {deleteTarget?.horizontname
                ? ` – ${deleteTarget.horizontname}`
                : ""}{" "}
              löschen?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#c0392b" }]}
                onPress={() => {
                  if (deleteTarget) deleteHorizont(deleteTarget.id);
                  setDeleteTarget(null);
                  setHorizonte(getHorizonteForAufnahme(aufnahmeId));
                }}
              >
                <Text style={styles.modalButtonText}>Löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Unvollständig confirmation modal ── */}
      <Modal visible={showUnvollstaendigModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aufnahme unvollständig</Text>
            <Text style={styles.modalText}>Trotzdem abschließen?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowUnvollstaendigModal(false);
                  doClose();
                }}
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
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 8,
  },
  horizonList: {
    gap: 12,
    paddingVertical: 8,
  },
});
