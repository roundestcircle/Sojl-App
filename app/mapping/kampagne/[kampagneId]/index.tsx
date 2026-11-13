import { useCallback, useLayoutEffect, useMemo, useState } from "react";
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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import {
  haversineMeters,
  bearingDegrees,
  isWithinProximity,
} from "@/lib/geo/geo";
import { storedLatLon } from "@/lib/geo/coordinates";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahmenWithHorizontCount,
  getFeldkampagne,
  closeFeldkampagne,
} from "@/lib/db/feldkampagneQueries";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/formatDate";
import { exportAufnahmeAsZip, exportKampagneAsZip } from "@/lib/io/csvExport";
import {
  createAufnahme,
  deleteAufnahme,
  type Aufnahme,
} from "@/lib/db/aufnahmeQueries";

// Extends Aufnahme with a derived horizon count used in the list subtitle
type AufnahmeRow = Aufnahme & { horizontCount: number };

// Distance (m) and bearing (° from true north) from the user to an Aufnahme.
type RowNav = { distance: number; bearing: number };

/**
 * Ids of the Aufnahmen the user is currently at. Each row keeps its previous
 * state for the hysteresis in `isWithinProximity`, so the highlight does not
 * flicker while the GPS fix jitters around the radius.
 */
function nextNearIds(
  prev: ReadonlySet<number>,
  nav: ReadonlyMap<number, RowNav>,
  accuracy: number | null | undefined,
): ReadonlySet<number> {
  const ids = new Set<number>();
  for (const [id, { distance }] of nav) {
    if (isWithinProximity(distance, accuracy, prev.has(id))) ids.add(id);
  }
  return ids;
}

// Per-row compass: light heading smoothing, list re-render only on changes of
// at least this many degrees.
const ROW_HEADING_SMOOTHING = 0.2;
const ROW_HEADING_THRESHOLD_DEG = 2;

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
  // Whether the live proximity detector is active
  const [tracking, setTracking] = useState(false);
  const { pos: currentPos, heading } = useLiveLocation(tracking, {
    headingSmoothing: ROW_HEADING_SMOOTHING,
    headingThresholdDeg: ROW_HEADING_THRESHOLD_DEG,
    onError: (_status, message) => {
      setTracking(false);
      Alert.alert("Standort nicht verfügbar", message);
    },
  });

  // Stop tracking when leaving the screen (the hook also cleans up on unmount).
  useFocusEffect(
    useCallback(() => {
      return () => setTracking(false);
    }, []),
  );

  // WGS84 position of each Aufnahme: GPS, else derived from UTM (CSV imports).
  const targets = useMemo(
    () => aufnahmen.map((a) => ({ id: a.id, ll: storedLatLon(a) })),
    [aufnahmen],
  );

  // Distance and bearing to every located Aufnahme while tracking.
  const nav = useMemo(() => {
    const m = new Map<number, RowNav>();
    if (!currentPos) return m;
    for (const { id, ll } of targets) {
      if (!ll) continue;
      m.set(id, {
        distance: haversineMeters(
          currentPos.lat,
          currentPos.lon,
          ll.lat,
          ll.lon,
        ),
        bearing: bearingDegrees(currentPos.lat, currentPos.lon, ll.lat, ll.lon),
      });
    }
    return m;
  }, [currentPos, targets]);

  // Rows within reach; recomputed from the previous set whenever `nav` changes
  // (state adjusted during render, see React docs "storing information from
  // previous renders").
  const [near, setNear] = useState<{
    nav: ReadonlyMap<number, RowNav>;
    ids: ReadonlySet<number>;
  }>(() => ({ nav, ids: new Set() }));
  if (near.nav !== nav) {
    setNear({ nav, ids: nextNearIds(near.ids, nav, currentPos?.accuracy) });
  }

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
    setAufnahmen(getAufnahmenWithHorizontCount(id));
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
    // Pop back to the campaign list instead of pushing a second copy of it;
    // replaces this screen when the list is not in the stack (e.g. after import).
    router.dismissTo("/mapping");
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
        renderItem={({ item }) => {
          // Distance/bearing while tracking (undefined otherwise or without
          // coordinates).
          const rowNav = nav.get(item.id);
          const distance = rowNav?.distance ?? null;
          const isNear = near.ids.has(item.id);
          // Bearing rotated by the device heading so the little arrow points
          // the way you'd walk to reach the Aufnahme.
          const arrowAngle =
            rowNav && heading != null ? rowNav.bearing - heading : null;

          return (
            <View
              style={[
                styles.listRow,
                isNear && {
                  borderColor: colors.primary,
                  backgroundColor: "#dff0d8",
                },
              ]}
            >
              <TouchableOpacity
                style={styles.listRowMain}
                onPress={() => router.push(`/mapping/${item.id}`)}
                onLongPress={() => setDeleteTarget(item)}
              >
                <View style={{ flex: 1 }}>
                  <View style={localStyles.titleRow}>
                    <Text style={[styles.rowTitle, localStyles.titleText]}>
                      Aufnahme {item.nummer ?? item.id}
                      {item.name ? ` – ${item.name}` : ""}
                    </Text>
                    {arrowAngle != null && (
                      <Text
                        style={[
                          localStyles.miniArrow,
                          { transform: [{ rotate: `${arrowAngle}deg` }] },
                        ]}
                      >
                        ↑
                      </Text>
                    )}
                  </View>
                  <Text style={styles.rowSub}>
                    {formatDate(item.erstellt_am)} · {item.horizontCount}{" "}
                    Horizont
                    {item.horizontCount !== 1 ? "e" : ""}
                    {distance != null
                      ? ` · Distanz: ${Math.round(distance)} m`
                      : ""}
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
          );
        }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.button,
            tracking && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setTracking((t) => !t)}
        >
          <Text style={[styles.maintext, tracking && { color: "#fff" }]}>
            {tracking ? "Standortverfolgung stoppen" : "Standort verfolgen"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const aufnahmeId = createAufnahme(id);
            router.push(`/mapping/${aufnahmeId}`);
          }}
        >
          <Text style={styles.maintext}>+ Neue Aufnahme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBeenden}>
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
            <Text style={styles.actionButtonText}>
              Kampagne exportieren (ZIP)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Offene Aufnahmen Warnung ── */}
      <Modal
        visible={showOffeneWarnung}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOffeneWarnung(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offene Aufnahmen</Text>
            <Text style={styles.modalText}>
              {aufnahmen.filter((a) => a.status !== "abgeschlossen").length}{" "}
              Aufnahme
              {aufnahmen.filter((a) => a.status !== "abgeschlossen").length !==
              1
                ? "n sind"
                : " ist"}{" "}
              noch offen. Kampagne trotzdem beenden?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e0a020" }]}
                onPress={() => {
                  setShowOffeneWarnung(false);
                  doBeenden();
                }}
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
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
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

const localStyles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Lets the title shrink/wrap so the arrow always stays visible beside it.
  titleText: {
    flexShrink: 1,
  },
  miniArrow: {
    marginLeft: 8,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.primary,
  },
});
