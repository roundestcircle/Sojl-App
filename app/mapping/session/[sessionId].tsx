import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahmenForFeldkampagne,
  getFeldkampagne,
} from "@/utils/FeldkampagneQueries";
import { getHorizonteForAufnahme } from "@/utils/HorizonQueries";
import { exportAufnahmeAsCSV } from "@/utils/csvExport";
import type { Aufnahme } from "@/utils/MappingQueries";

type AufnahmeRow = Aufnahme & { horizontCount: number };

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const id = parseInt(sessionId, 10);

  const [sessionName, setSessionName] = useState("");
  const [aufnahmen, setAufnahmen] = useState<AufnahmeRow[]>([]);
  const [exportingId, setExportingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const session = getFeldkampagne(id);
      setSessionName(session?.name ?? "");

      const rows = getAufnahmenForFeldkampagne(id).map((a) => ({
        ...a,
        horizontCount: getHorizonteForAufnahme(a.id).length,
      }));
      setAufnahmen(rows);
    }, [id]),
  );

  const handleExport = async (aufnahme: AufnahmeRow) => {
    try {
      setExportingId(aufnahme.id);
      await exportAufnahmeAsCSV(aufnahme);
    } catch (e) {
      Alert.alert("Export fehlgeschlagen", String(e));
    } finally {
      setExportingId(null);
    }
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
              onPress={() =>
                router.push(`/mapping/${item.id}/HorizonOverview`)
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  Aufnahme {aufnahmen.length - index}
                </Text>
                <Text style={styles.rowSub}>
                  {formatDate(item.erstellt_am)} · {item.horizontCount} Horizont{item.horizontCount !== 1 ? "e" : ""}
                </Text>
              </View>
              <View
                style={[
                  localStyles.badge,
                  { backgroundColor: item.status === "abgeschlossen" ? colors.primary : "#e0a020" },
                ]}
              >
                <Text style={localStyles.badgeText}>
                  {item.status === "abgeschlossen" ? "abgeschlossen" : "offen"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.exportBtn}
              onPress={() => handleExport(item)}
              disabled={exportingId === item.id}
            >
              {exportingId === item.id ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={localStyles.exportText}>CSV</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, localStyles.newBtn]}
        onPress={() => router.push(`/mapping/soilmapping?sessionId=${id}`)}
      >
        <Text style={styles.maintext}>+ Neue Aufnahme</Text>
      </TouchableOpacity>

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
    borderWidth: 5,
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
  exportBtn: {
    width: 56,
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
  newBtn: {
    marginVertical: 12,
  },
});
