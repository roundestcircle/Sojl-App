import { useCallback, useLayoutEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { styles } from "@/styles/styles";
import { spacing } from "@/styles/theme";
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
import Button from "@/components/ui/Button";
import NavRow from "@/components/ui/NavRow";
import StatusBadge from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { aufnahmeTitle } from "@/lib/text";
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
      navigation.setOptions({ title: aufnahmeTitle(aufnahme) });
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
  const targetCoords = aufnahme ? storedLatLon(aufnahme) : null;

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={localStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <NavRow
            title="Standortdaten"
            badge={<StatusBadge status={standortStatus} />}
            onPress={() => router.push(`/mapping/${aufnahmeId}/standort`)}
          />

          <Button
            title="Ort finden"
            icon="compass-outline"
            onPress={() => setShowOrtFinden(true)}
            disabled={!targetCoords}
          />

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
            <Button
              title="Horizont hinzufügen"
              icon="add"
              onPress={handleAddHorizont}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title="Abschließen"
            variant="outline"
            onPress={handleAbschliessen}
          />
          <Button
            title="Aufnahme exportieren (ZIP)"
            onPress={handleExport}
            loading={exporting}
            disabled={!aufnahme}
          />
        </View>
      </View>

      {targetCoords && (
        <OrtFindenModal
          visible={showOrtFinden}
          onClose={() => setShowOrtFinden(false)}
          target={targetCoords}
        />
      )}

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Horizont löschen"
        message={`H${deleteTarget?.nummer}${
          deleteTarget?.horizontname ? ` – ${deleteTarget.horizontname}` : ""
        } löschen?`}
        confirmLabel="Löschen"
        tone="danger"
        onConfirm={() => {
          if (deleteTarget) deleteHorizont(deleteTarget.id);
          setDeleteTarget(null);
          setHorizonte(getHorizonteForAufnahme(aufnahmeId));
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        visible={closeWarnings !== null}
        title="Aufnahme unvollständig"
        message={`${closeWarnings?.join("\n")}\n\nTrotzdem abschließen?`}
        confirmLabel="Trotzdem abschließen"
        onConfirm={() => {
          setCloseWarnings(null);
          doClose();
        }}
        onCancel={() => setCloseWarnings(null)}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 32,
    gap: spacing.sm,
  },
  horizontList: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
});
