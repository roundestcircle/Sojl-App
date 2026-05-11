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

type AufnahmeRow = Aufnahme & { horizontCount: number };

export default function SessionDetailScreen() {
  const { kampagneId } = useLocalSearchParams<{ kampagneId: string }>();
  const id = parseInt(kampagneId, 10);

  const navigation = useNavigation();
  const [sessionName, setSessionName] = useState("");
  const [aufnahmen, setAufnahmen] = useState<AufnahmeRow[]>([]);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [exportingCampaign, setExportingCampaign] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AufnahmeRow | null>(null);
  const [showOffeneWarnung, setShowOffeneWarnung] = useState(false);

  useLayoutEffect(() => {
    if (sessionName) navigation.setOptions({ title: sessionName });
  }, [navigation, sessionName]);

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

  const handleBeenden = () => {
    const offene = aufnahmen.filter((a) => a.status !== "abgeschlossen");
    if (offene.length > 0) {
      setShowOffeneWarnung(true);
    } else {
      doBeenden();
    }
  };

  const doBeenden = () => {
    closeFeldkampagne(id);
    router.replace("/mapping");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteAufnahme(deleteTarget.id);
    setDeleteTarget(null);
    reload();
  };

  return (
    <View style={styles.containerfull}>

      <FlatList
        data={aufnahmen}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Noch keine Aufnahmen in dieser Kampagne.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={localStyles.row}>
            <TouchableOpacity
              style={localStyles.rowMain}
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
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.exportBtn}
              onPress={() => handleExport(item)}
              disabled={exportingId === item.id}
            >
              {exportingId === item.id ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={localStyles.exportText}>ZIP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, localStyles.bottomBtn]}
        onPress={() => {
          const aufnahmeId = createAufnahme(0, id);
          router.push(`/mapping/${aufnahmeId}`);
        }}
      >
        <Text style={styles.maintext}>+ Neue Aufnahme</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, localStyles.bottomBtn]}
        onPress={handleBeenden}
      >
        <Text style={styles.maintext}>Kampagne beenden</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, localStyles.bottomBtn]}
        onPress={handleExportCampaign}
        disabled={exportingCampaign || aufnahmen.length === 0}
      >
        {exportingCampaign ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>Kampagne exportieren (ZIP)</Text>
        )}
      </TouchableOpacity>

      {/* ── Offene Aufnahmen Warnung ── */}
      <Modal visible={showOffeneWarnung} transparent animationType="fade" onRequestClose={() => setShowOffeneWarnung(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offene Aufnahmen</Text>
            <Text style={styles.modalText}>
              {aufnahmen.filter((a) => a.status !== "abgeschlossen").length} Aufnahme{aufnahmen.filter((a) => a.status !== "abgeschlossen").length !== 1 ? "n sind" : " ist"} noch offen. Kampagne trotzdem beenden?
            </Text>
            <View style={localStyles.modalButtons}>
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
            <View style={localStyles.modalButtons}>
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

function formatDate(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  exportBtn: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 2,
    borderLeftColor: colors.primary + "44",
    alignSelf: "stretch",
  },
  exportText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  bottomBtn: {
    marginTop: 8,
  },
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
});
