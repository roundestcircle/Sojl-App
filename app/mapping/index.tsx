import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAllFeldkampagnen,
  createFeldkampagne,
  deleteFeldkampagne,
  type Feldkampagne,
} from "@/utils/FeldkampagneQueries";
import { exportKampagneAsZip } from "@/utils/csvExport";
import {
  InstructionModal,
  ResetInstructionButton,
} from "@/components/InstructionModal";
import StatusBadge from "@/components/StatusBadge";

/**
 * Feldkampagnen overview screen.
 * Lists all campaigns with their status badge; long-pressing a row opens a delete confirmation.
 * The "Neue Kampagne" button opens a creation modal and navigates directly into the new campaign.
 */
export default function FeldkampagnenScreen() {
  // Full list of campaigns, reloaded on every focus to reflect changes from child screens
  const [kampagnen, setKampagnen] = useState<Feldkampagne[]>([]);
  const [modalKey, setModalKey] = useState(0);
  const [exportingId, setExportingId] = useState<number | null>(null);
  // Controls visibility of the "create campaign" input modal
  const [creating, setCreating] = useState(false);
  // Bound to the name input inside the create modal
  const [newName, setNewName] = useState("");

  useFocusEffect(
    useCallback(() => {
      setKampagnen(getAllFeldkampagnen());
    }, []),
  );

  /**
   * Creates a new Feldkampagne with the current name, then navigates to its detail screen.
   * No-ops if the name is empty.
   */
  const handleExport = async (item: Feldkampagne) => {
    try {
      setExportingId(item.id);
      await exportKampagneAsZip(item.id, item.name);
    } catch (e) {
      Alert.alert("Export fehlgeschlagen", String(e));
    } finally {
      setExportingId(null);
    }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createFeldkampagne(name);
    setCreating(false);
    setNewName("");
    router.push(`/mapping/kampagne/${id}` as any);
  };

  /** Closes the create modal and resets the name input without creating anything. */
  const handleCancel = () => {
    setCreating(false);
    setNewName("");
  };

  // The campaign queued for deletion; non-null triggers the confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Feldkampagne | null>(null);

  const handleDelete = (item: Feldkampagne) => setDeleteTarget(item);

  /**
   * Permanently deletes the target campaign (and all its Aufnahmen + Horizonte via CASCADE),
   * then refreshes the list.
   */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteFeldkampagne(deleteTarget.id);
    setKampagnen(getAllFeldkampagnen());
    setDeleteTarget(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <InstructionModal
        key={modalKey}
        storageKey="mappingDontShowAgain"
        instructionText="Erstelle eine neue Kampagne. Innerhalb der Kampagne kannst du mehrere Bodenaufnahmen erstellen und in diesen deine erhobenen Daten eintragen. Die Daten werden automatisch gespeichert. Am Ende kannst du sowohl einzelne Aufnahmen als auch die gesamte Kampagne als ZIP exportieren. Diese Datei enthält zwei CSV-Dateien mit den Aufnahme- und Horizontdaten."
      />

      <FlatList
        data={kampagnen}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingHorizontal: 15 }]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Noch keine Kampagnen vorhanden.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            <TouchableOpacity
              style={styles.listRowMain}
              onPress={() => router.push(`/mapping/kampagne/${item.id}` as any)}
              onLongPress={() => handleDelete(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>
                  {formatDate(item.erstellt_am)}
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
          onPress={() => setCreating(true)}
        >
          <Text style={styles.maintext}>+ Neue Kampagne</Text>
        </TouchableOpacity>
        <ResetInstructionButton
          storageKey="mappingDontShowAgain"
          onReset={() => setModalKey((prev) => prev + 1)}
          style={{
            position: "relative",
            bottom: undefined,
            left: undefined,
            right: undefined,
          }}
        />
      </View>

      <Modal
        visible={creating}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          style={localStyles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[styles.modalContent, { width: "100%", maxWidth: 9999 }]}
          >
            <Text style={styles.modalTitle}>Neue Kampagne</Text>
            <TextInput
              style={localStyles.nameInput}
              placeholder="Kampagnenname"
              placeholderTextColor={colors.primary + "88"}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={localStyles.createRow}>
              <TouchableOpacity
                style={[styles.button, localStyles.createBtn]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Text style={styles.maintext}>Erstellen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, localStyles.createBtn]}
                onPress={handleCancel}
              >
                <Text style={styles.maintext}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Delete campaign modal ── */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kampagne löschen</Text>
            <Text style={styles.modalText}>
              „{deleteTarget?.name}" und alle enthaltenen Aufnahmen löschen?
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "stretch",
    padding: 24,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    color: "#222",
    marginBottom: 12,
  },
  createRow: {
    flexDirection: "row",
    gap: 10,
  },
  createBtn: {
    flex: 1,
  },
});
