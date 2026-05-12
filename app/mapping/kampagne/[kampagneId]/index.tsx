import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahmenForFeldkampagne,
  getFeldkampagne,
  closeFeldkampagne,
} from "@/utils/FeldkampagneQueries";
import StatusBadge from "@/components/StatusBadge";
import { getHorizonteForAufnahme } from "@/utils/HorizonQueries";
import { exportAufnahmeAsZip, exportKampagneAsZip } from "@/utils/csvExport";
import { createAufnahme, deleteAufnahme, type Aufnahme } from "@/utils/MappingQueries";

// Extends Aufnahme with a derived horizon count used in the list subtitle
type AufnahmeRow = Aufnahme & { horizontCount: number };

/**
 * Campaign detail screen.
 * Lists all Aufnahmen in a campaign with their horizon count and status badge.
 * Provides per-Aufnahme ZIP export, campaign-wide ZIP export, and campaign close flow.
 */
export default function SessionDetailScreen() {
  const { kampagneId } = useLocalSearchParams<{ kampagneId: string }>();
  const id = parseInt(kampagneId, 10);

  const navigation = useNavigation();
  // Name of this campaign, displayed as the navigation bar title
  const [sessionName, setSessionName] = useState("");
  // All Aufnahmen enriched with their horizon count
  const [aufnahmen, setAufnahmen] = useState<AufnahmeRow[]>([]);
  // ID of the Aufnahme currently being exported (drives the spinner on that row)
  const [exportingId, setExportingId] = useState<number | null>(null);
  // Drives the spinner on the campaign export button
  const [exportingCampaign, setExportingCampaign] = useState(false);
  // Aufnahme queued for deletion; non-null triggers the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<AufnahmeRow | null>(null);
  // Whether to show the "still open Aufnahmen" warning before closing the campaign
  const [showOffeneWarnung, setShowOffeneWarnung] = useState(false);

  // Update header title whenever the session name is loaded
  useLayoutEffect(() => {
    if (sessionName) navigation.setOptions({ title: sessionName });
  }, [navigation, sessionName]);

  /**
   * Reloads the campaign name and Aufnahmen list from the database.
   * Invoked on focus so the list stays up-to-date after returning from a child screen.
   */
  const reload = useCallback(() => {
    const session = getFeldkampagne(id);
    setSessionName(session?.name ?? "");
    const rows = getAufnahmenForFeldkampagne(id).map((a) => ({
      ...a,
      horizontCount: getHorizonteForAufnahme(a.id).length,
    }));
    setAufnahmen(rows);
  }, [id]);

  useFocusEffect(reload);

  /**
   * Exports a single Aufnahme as a ZIP (aufnahmen.csv + horizonte.csv)
   * and opens the system share dialog.
   */
  const handleExport = async (aufnahme: AufnahmeRow) => {
    try {
      setExportingId(aufnahme.id);
      await exportAufnahmeAsZip(aufnahme);
    } catch (e) {
      Alert.alert("Export fehlgeschlagen", String(e));
    } finally {
      setExportingId(null);
    }
  };

  /**
   * Exports the entire campaign as a single ZIP and opens the system share dialog.
   */
  const handleExportCampaign = async () => {
    try {
      setExportingCampaign(true);
      await exportKampagneAsZip(id, sessionName);
    } catch (e) {
      Alert.alert("Export fehlgeschlagen", String(e));
    } finally {
      setExportingCampaign(false);
    }
  };

  /**
   * Guards closing the campaign: shows a warning modal when any Aufnahme is still open,
   * otherwise closes immediately.
   */
  const handleBeenden = () => {
    const offene = aufnahmen.filter((a) => a.status !== "abgeschlossen");
    if (offene.length > 0) {
      setShowOffeneWarnung(true);
    } else {
      doBeenden();
    }
  };

  /** Marks the campaign as abgeschlossen and navigates back to the campaign list. */
  const doBeenden = () => {
    closeFeldkampagne(id);
    router.replace("/mapping");
  };

  /**
   * Permanently deletes the targeted Aufnahme (and its Horizonte via CASCADE),
   * then refreshes the list.
   */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteAufnahme(deleteTarget.id);
    setDeleteTarget(null);
    reload();
  };

  return (
    <View style={{ flex: 1 }}>

      <FlatList
        data={aufnahmen}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingHorizontal: 15 }]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Noch keine Aufnahmen in dieser Kampagne.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.listRow}>
            <TouchableOpacity
              style={styles.listRowMain}
              onPress={() => router.push(`/mapping/${item.id}`)}
              onLongPress={() => setDeleteTarget(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  Aufnahme {item.nummer ?? item.id}
                </Text>
                <Text style={styles.rowSub}>
                  {formatDate(item.erstellt_am)} · {item.horizontCount} Horizont{item.horizontCount !== 1 ? "e" : ""}
                </Text>
              </View>
              <StatusBadge status={item.status} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => handleExport(item)}
              disabled={exportingId === item.id}
            >
              {exportingId === item.id ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.exportText}>ZIP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const aufnahmeId = createAufnahme(0, id);
            router.push(`/mapping/${aufnahmeId}`);
          }}
        >
          <Text style={styles.maintext}>+ Neue Aufnahme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleBeenden}
        >
          <Text style={styles.maintext}>Kampagne beenden</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportCampaign}
          disabled={exportingCampaign || aufnahmen.length === 0}
        >
          {exportingCampaign ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>Kampagne exportieren (ZIP)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Offene Aufnahmen Warnung ── */}
      <Modal visible={showOffeneWarnung} transparent animationType="fade" onRequestClose={() => setShowOffeneWarnung(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offene Aufnahmen</Text>
            <Text style={styles.modalText}>
              {aufnahmen.filter((a) => a.status !== "abgeschlossen").length} Aufnahme{aufnahmen.filter((a) => a.status !== "abgeschlossen").length !== 1 ? "n sind" : " ist"} noch offen. Kampagne trotzdem beenden?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e0a020" }]}
                onPress={() => { setShowOffeneWarnung(false); doBeenden(); }}
              >
                <Text style={styles.modalButtonText}>Trotzdem beenden</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setShowOffeneWarnung(false)}
              >
                <Text style={styles.modalButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Aufnahme confirmation modal ── */}
      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aufnahme löschen</Text>
            <Text style={styles.modalText}>
              {deleteTarget?.horizontCount
                ? `Diese Aufnahme enthält ${deleteTarget.horizontCount} Horizont${deleteTarget.horizontCount !== 1 ? "e" : ""}, die ebenfalls gelöscht werden. Trotzdem löschen?`
                : "Aufnahme löschen?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#c0392b" }]}
                onPress={confirmDelete}
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

    </View>
  );
}

/** Formats an ISO datetime string to "YYYY-MM-DD HH:MM" for display. */
function formatDate(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

const localStyles = StyleSheet.create({
});
