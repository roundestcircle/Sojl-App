import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize } from "@/styles/theme";

/**
 * Every status shown in the app: Kampagne/Aufnahme (offen, abgeschlossen),
 * Standortdaten (leer, begonnen, abgeschlossen) and Horizont (leer,
 * angefangen, vollstaendig).
 */
export type Status =
  | "offen"
  | "abgeschlossen"
  | "leer"
  | "begonnen"
  | "angefangen"
  | "vollstaendig";

const STATUS: Record<Status, { label: string; color: string }> = {
  leer: { label: "leer", color: colors.statusEmpty },
  offen: { label: "offen", color: colors.statusStarted },
  begonnen: { label: "begonnen", color: colors.statusStarted },
  angefangen: { label: "begonnen", color: colors.statusStarted },
  vollstaendig: { label: "vollständig", color: colors.statusDone },
  abgeschlossen: { label: "abgeschlossen", color: colors.statusDone },
};

/** Coloured pill with the label of a status. */
export default function StatusBadge({ status }: { status: Status }) {
  const { label, color } = STATUS[status];
  return (
    <View style={[localStyles.badge, { backgroundColor: color }]}>
      <Text style={localStyles.text}>{label}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
