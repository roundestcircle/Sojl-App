import { useCallback, useState } from "react";
import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { styles } from "@/styles/styles";
import {
  getAllFeldkampagnen,
  createFeldkampagne,
  deleteFeldkampagne,
  type Feldkampagne,
} from "@/lib/db/feldkampagneQueries";
import { exportKampagneAsZip } from "@/lib/io/csvExport";
import { HelpButton, useInstruction } from "@/components/ui/Instruction";
import Button from "@/components/ui/Button";
import Dialog, { ConfirmDialog } from "@/components/ui/Dialog";
import NavRow from "@/components/ui/NavRow";
import StatusBadge from "@/components/ui/StatusBadge";
import TextField from "@/components/ui/TextField";
import { formatDate } from "@/lib/formatDate";
import { fontSize, spacing } from "@/styles/theme";

const INSTRUCTION =
  "Erstelle eine neue Kampagne. Innerhalb der Kampagne kannst du mehrere Bodenaufnahmen erstellen und in diesen deine erhobenen Daten eintragen. Die Daten werden automatisch gespeichert. Am Ende kannst du sowohl einzelne Aufnahmen als auch die gesamte Kampagne als ZIP exportieren. Diese Datei enthält zwei CSV-Dateien mit den Aufnahme- und Horizontdaten.\n\n" +
  'Mit „Standort verfolgen" in einer Kampagne werden Aufnahmen in deiner Nähe (unter 5 m) grün hervorgehoben und ihre Distanz wird angezeigt. Über „Ort finden" in einer Aufnahme weisen dir ein Kompasspfeil und die Entfernung den Weg zu ihren Koordinaten.';

/**
 * Feldkampagnen overview screen.
 * Lists all campaigns with their status badge; long-pressing a row opens a delete confirmation.
 * The "Neue Kampagne" button opens a creation modal and navigates directly into the new campaign.
 */
export default function FeldkampagnenScreen() {
  // Full list of campaigns, reloaded on every focus to reflect changes from child screens
  const [kampagnen, setKampagnen] = useState<Feldkampagne[]>([]);
  const instruction = useInstruction("mappingDontShowAgain", INSTRUCTION);
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

  /** Exports a Feldkampagne as a ZIP and opens the system share dialog. */
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

  /**
   * Creates a new Feldkampagne with the current name, then navigates to its detail screen.
   * No-ops if the name is empty.
   */
  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createFeldkampagne(name);
    setCreating(false);
    setNewName("");
    router.push(`/mapping/kampagne/${id}`);
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
      {instruction.modal}

      <FlatList
        data={kampagnen}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Noch keine Kampagnen vorhanden.</Text>
        }
        renderItem={({ item }) => (
          <NavRow
            title={item.name}
            subtitle={formatDate(item.erstellt_am)}
            badge={<StatusBadge status={item.status} />}
            onPress={() => router.push(`/mapping/kampagne/${item.id}`)}
            onLongPress={() => handleDelete(item)}
            action={{
              label: "ZIP",
              accessibilityLabel: "Kampagne als ZIP exportieren",
              onPress: () => handleExport(item),
              loading: exportingId === item.id,
            }}
          />
        )}
      />

      <View style={[styles.bottomBar, localStyles.row]}>
        <Button
          title="Neue Kampagne"
          icon="add"
          variant="outline"
          style={localStyles.grow}
          onPress={() => setCreating(true)}
        />
        <HelpButton onPress={instruction.show} />
      </View>

      <Dialog visible={creating} onClose={handleCancel} title="Neue Kampagne">
        <TextField
          style={localStyles.nameInput}
          placeholder="Kampagnenname"
          value={newName}
          onChangeText={setNewName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <View style={localStyles.row}>
          <Button
            title="Erstellen"
            style={localStyles.grow}
            onPress={handleCreate}
            disabled={!newName.trim()}
          />
          <Button
            title="Abbrechen"
            variant="neutral"
            style={localStyles.grow}
            onPress={handleCancel}
          />
        </View>
      </Dialog>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Kampagne löschen"
        message={`„${deleteTarget?.name}“ und alle enthaltenen Aufnahmen löschen?`}
        confirmLabel="Löschen"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  nameInput: {
    fontSize: fontSize.lg,
  },
});
