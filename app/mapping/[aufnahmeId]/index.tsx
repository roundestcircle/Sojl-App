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
} from "@/lib/db/aufnahmeQueries";
import {
  addHorizont,
  deleteHorizont,
  getHorizonteForAufnahme,
  moveHorizont,
  type Horizont,
} from "@/lib/db/horizontQueries";
import { exportAufnahmeAsZip } from "@/lib/io/csvExport";
import * as Haptics from "expo-haptics";
import HorizontButton from "@/components/forms/HorizontButton";
import Badge from "@/components/ui/Badge";
import OrtFindenModal from "@/components/tools/OrtFindenModal";
import { storedLatLon } from "@/lib/geo/coordinates";

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
  leer: { label: "leer", bg: colors.statusEmpty },
  begonnen: { label: "begonnen", bg: colors.statusStarted },
  abgeschlossen: { label: "abgeschlossen", bg: colors.statusDone },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * Aufnahme overview screen.
 * Shows a "Standortdaten" button with a derived completion badge, followed by the list
 * of Horizonte. Long-pressing a horizon row triggers delete confirmation.
 * The "Abschließen" button warns when the Standortdaten or a Horizont are
 * incomplete, or when there are no Horizonte at all.
 */
export default function AufnahmeOverview() {
  const { aufnahmeId: aufnahmeIdParam } = useLocalSearchParams<{
    aufnahmeId: string;
  }>();
  const aufnahmeId = parseInt(aufnahmeIdParam, 10);
  const navigation = useNavigation();

  // All horizons belonging to this Aufnahme, ordered by nummer
  const [horizonte, setHorizonte] = useState<Horizont[]>([]);
  // The parent Aufnahme record (used for status derivation and navigation after close)
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  // Reasons the Aufnahme is incomplete; non-null shows the warning before closing
  const [closeWarnings, setCloseWarnings] = useState<string[] | null>(null);
  // Drives the spinner on the export button while the ZIP is being generated
  const [exporting, setExporting] = useState(false);
  // Horizon queued for deletion; non-null triggers the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Horizont | null>(null);
  // Whether the "Ort finden" compass modal is open
  const [showOrtFinden, setShowOrtFinden] = useState(false);
  // Ids of the two horizons involved in the last move, plus a counter that bumps
  // on every move so the affected rows re-trigger their label crossfade.
  const [moved, setMoved] = useState<{ ids: number[]; nonce: number }>({
    ids: [],
    nonce: 0,
  });

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
        title: `Aufnahme ${aufnahme.nummer ?? aufnahme.id}${
          aufnahme.name ? ` – ${aufnahme.name}` : ""
        }`,
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
    router.push(`/mapping/${aufnahmeId}/horizont/${horizont.nummer}`);
  };

  /** Moves a Horizont one position up or down, with haptic + label crossfade feedback. */
  const handleMoveHorizont = (horizont: Horizont, direction: "up" | "down") => {
    const index = horizonte.findIndex((h) => h.id === horizont.id);
    const neighbor = horizonte[direction === "up" ? index - 1 : index + 1];
    if (!neighbor) return;
    moveHorizont(aufnahmeId, horizont.nummer, direction);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHorizonte(getHorizonteForAufnahme(aufnahmeId));
    setMoved((m) => ({ ids: [horizont.id, neighbor.id], nonce: m.nonce + 1 }));
  };

  /**
   * Marks the Aufnahme as abgeschlossen and returns to the parent campaign
   * screen — popping back to it when it is already in the stack, so no
   * duplicate screen is pushed. Falls back to the campaign list.
   */
  const doClose = () => {
    closeAufnahme(aufnahmeId);
    const kampagneId = aufnahme?.feldkampagne_id;
    if (kampagneId != null) {
      router.dismissTo({
        pathname: "/mapping/kampagne/[kampagneId]",
        params: { kampagneId: String(kampagneId) },
      });
    } else {
      router.dismissTo("/mapping");
    }
  };

  /**
   * Guards closing the Aufnahme: lists what is still incomplete (Standortdaten,
   * Horizonte) and asks for confirmation, otherwise closes immediately.
   */
  const handleAbschliessen = () => {
    const warnings: string[] = [];
    if (standortStatus !== "abgeschlossen") {
      warnings.push("Standortdaten sind unvollständig.");
    }
    const offene = horizonte.filter((h) => h.status !== "vollstaendig");
    if (horizonte.length === 0) warnings.push("Es gibt keine Horizonte.");
    else if (offene.length > 0) {
      warnings.push(
        `${offene.length} von ${horizonte.length} Horizonten unvollständig.`,
      );
    }
    if (warnings.length > 0) setCloseWarnings(warnings);
    else doClose();
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
  const targetCoords = aufnahme ? storedLatLon(aufnahme) : null;

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

          {/* ── Ort finden button ── */}
          <TouchableOpacity
            style={[styles.actionButton, !targetCoords && localStyles.disabled]}
            onPress={() => setShowOrtFinden(true)}
            disabled={!targetCoords}
          >
            <Text style={styles.actionButtonText}>Ort finden</Text>
          </TouchableOpacity>

          {/* ── Horizont list ── */}
          <View style={localStyles.horizontList}>
            {horizonte.map((horizont, index) => (
              <HorizontButton
                key={horizont.id}
                horizont={horizont}
                onPress={() => handleHorizontPress(horizont)}
                onLongPress={() => setDeleteTarget(horizont)}
                onMoveUp={() => handleMoveHorizont(horizont, "up")}
                onMoveDown={() => handleMoveHorizont(horizont, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < horizonte.length - 1}
                moveNonce={moved.ids.includes(horizont.id) ? moved.nonce : 0}
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

      {/* ── Ort finden compass modal ── */}
      {targetCoords && (
        <OrtFindenModal
          visible={showOrtFinden}
          onClose={() => setShowOrtFinden(false)}
          target={targetCoords}
        />
      )}

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
      <Modal
        visible={closeWarnings !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseWarnings(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aufnahme unvollständig</Text>
            <Text style={styles.modalText}>
              {closeWarnings?.join("\n")}
              {"\n\n"}Trotzdem abschließen?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setCloseWarnings(null);
                  doClose();
                }}
              >
                <Text style={styles.modalButtonText}>Trotzdem abschließen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setCloseWarnings(null)}
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
  horizontList: {
    gap: 12,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.4,
  },
});
