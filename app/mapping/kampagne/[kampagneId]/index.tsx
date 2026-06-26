import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
import * as Location from "expo-location";
import { haversineMeters, bearingDegrees, smoothHeading } from "@/utils/geo";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  getAufnahmenWithHorizontCount,
  getFeldkampagne,
  closeFeldkampagne,
} from "@/utils/FeldkampagneQueries";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/utils/formatDate";
import { exportAufnahmeAsZip, exportKampagneAsZip } from "@/utils/csvExport";
import {
  createAufnahme,
  deleteAufnahme,
  type Aufnahme,
} from "@/utils/MappingQueries";

// Extends Aufnahme with a derived horizon count used in the list subtitle
type AufnahmeRow = Aufnahme & { horizontCount: number };

// A row is highlighted green once the user is within this many metres of it.
const PROXIMITY_RADIUS_M = 5;

// Light smoothing for the per-row compass; only re-render the list when the
// heading has moved at least this many degrees, to keep the FlatList calm.
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
  // The user's current position while tracking (null when off or not yet fixed)
  const [currentPos, setCurrentPos] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  // The device's smoothed compass heading while tracking (null when unavailable)
  const [heading, setHeading] = useState<number | null>(null);
  // Active position/heading subscriptions; removed when tracking stops
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const headingRef = useRef<Location.LocationSubscription | null>(null);
  // Smoothed heading accumulator (decoupled from the throttled state above)
  const smoothedHeadingRef = useRef<number | null>(null);
  // True between a start request and its matching stop. Lets the async
  // startTracking bail (and tear down any watch it just created) if tracking was
  // switched off while a watchPosition/watchHeading promise was still in flight.
  const wantTrackingRef = useRef(false);

  /** Stops the location/heading watches and clears the current position. */
  const stopTracking = useCallback(() => {
    wantTrackingRef.current = false;
    watchRef.current?.remove();
    watchRef.current = null;
    headingRef.current?.remove();
    headingRef.current = null;
    smoothedHeadingRef.current = null;
    setTracking(false);
    setCurrentPos(null);
    setHeading(null);
  }, []);

  /** Requests permission and starts watching the device position + heading. */
  const startTracking = useCallback(async () => {
    wantTrackingRef.current = true;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (!wantTrackingRef.current) return;
    if (status !== "granted") {
      wantTrackingRef.current = false;
      Alert.alert(
        "Standort nicht verfügbar",
        "Bitte erlaube den Zugriff auf den Standort, um Aufnahmen in der Nähe zu erkennen.",
      );
      return;
    }
    const posSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1 },
      (loc) =>
        setCurrentPos({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        }),
    );
    if (!wantTrackingRef.current) {
      posSub.remove();
      return;
    }
    watchRef.current = posSub;
    const headSub = await Location.watchHeadingAsync((h) => {
      // trueHeading is -1 when unavailable; fall back to magnetic heading.
      const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
      const smoothed = smoothHeading(
        smoothedHeadingRef.current,
        raw,
        ROW_HEADING_SMOOTHING,
      );
      smoothedHeadingRef.current = smoothed;
      // Only push to state (re-rendering the list) on meaningful changes.
      setHeading((prev) => {
        if (prev == null) return smoothed;
        const delta = Math.abs(((smoothed - prev + 540) % 360) - 180);
        return delta >= ROW_HEADING_THRESHOLD_DEG ? smoothed : prev;
      });
    });
    if (!wantTrackingRef.current) {
      headSub.remove();
      watchRef.current?.remove();
      watchRef.current = null;
      return;
    }
    headingRef.current = headSub;
    setTracking(true);
  }, []);

  /** Toggles the proximity detector on/off. */
  const handleToggleTracking = () => {
    if (tracking) stopTracking();
    else startTracking();
  };

  // Stop tracking when leaving the screen (blur) and on unmount.
  useFocusEffect(
    useCallback(() => {
      return () => stopTracking();
    }, [stopTracking]),
  );
  useEffect(() => () => stopTracking(), [stopTracking]);

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
        renderItem={({ item }) => {
          // Distance to this row's coordinates while tracking (null otherwise).
          const distance =
            currentPos && item.gps_lat != null && item.gps_lon != null
              ? haversineMeters(
                  currentPos.lat,
                  currentPos.lon,
                  item.gps_lat,
                  item.gps_lon,
                )
              : null;
          const isNear = distance != null && distance <= PROXIMITY_RADIUS_M;
          // Bearing to this row, rotated by the device heading so the little
          // arrow points the way you'd walk to reach the Aufnahme.
          const arrowAngle =
            distance != null &&
            heading != null &&
            currentPos &&
            item.gps_lat != null &&
            item.gps_lon != null
              ? bearingDegrees(
                  currentPos.lat,
                  currentPos.lon,
                  item.gps_lat,
                  item.gps_lon,
                ) - heading
              : null;

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
          onPress={handleToggleTracking}
        >
          <Text style={[styles.maintext, tracking && { color: "#fff" }]}>
            {tracking ? "Standortverfolgung stoppen" : "Standort verfolgen"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const aufnahmeId = createAufnahme(0, id);
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
