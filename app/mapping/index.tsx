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
import { InstructionModal } from "@/components/InstructionModal";

export default function FeldkampagnenScreen() {
  const [kampagnen, setKampagnen] = useState<Feldkampagne[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useFocusEffect(
    useCallback(() => {
      setKampagnen(getAllFeldkampagnen());
    }, []),
  );

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createFeldkampagne(name);
    setCreating(false);
    setNewName("");
    router.push(`/mapping/kampagne/${id}` as any);
  };

  const handleCancel = () => {
    setCreating(false);
    setNewName("");
  };

  const [deleteTarget, setDeleteTarget] = useState<Feldkampagne | null>(null);

  const handleDelete = (item: Feldkampagne) => setDeleteTarget(item);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteFeldkampagne(deleteTarget.id);
    setKampagnen(getAllFeldkampagnen());
    setDeleteTarget(null);
  };

  return (
    <View style={styles.containerfull}>

      <InstructionModal
        storageKey="mappingDontShowAgain"
        instructionText="Erstelle eine neue Kampagne. Innerhalb der Kampagne kannst du mehrere Bodenaufnahmen erstellen und in diesen deine erhobenen Daten eintragen. Die Daten werden automatisch gespeichert. Am Ende kannst du sowohl einzelne Aufnahmen als auch die gesamte Kampagne als ZIP exportieren. Diese Datei enthält zwei CSV-Dateien mit den Aufnahme- und Horizontdaten."
      />

      <FlatList
        data={kampagnen}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Noch keine Kampagnen vorhanden.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={localStyles.row}
            onPress={() => router.push(`/mapping/kampagne/${item.id}` as any)}
            onLongPress={() => handleDelete(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSub}>{formatDate(item.erstellt_am)}</Text>
            </View>
            <Text style={localStyles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.button, localStyles.newBtn]}
        onPress={() => setCreating(true)}
      >
        <Text style={styles.maintext}>+ Neue Kampagne</Text>
      </TouchableOpacity>

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
          <View style={[styles.modalContent, { width: '100%', maxWidth: 9999 }]}>
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
      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kampagne löschen</Text>
            <Text style={styles.modalText}>
              „{deleteTarget?.name}" und alle enthaltenen Aufnahmen löschen?
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  chevron: {
    fontSize: 28,
    color: colors.primary,
    marginLeft: 8,
  },
  newBtn: {
    marginVertical: 12,
  },
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
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
});
