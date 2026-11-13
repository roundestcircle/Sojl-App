import { colors } from "@/styles/colors";
import Badge from "@/components/ui/Badge";

type Props = {
  status: "offen" | "abgeschlossen";
};

/**
 * Colored pill badge showing the open/closed status of a Kampagne or Aufnahme.
 * Green for abgeschlossen, amber for offen.
 */
export default function StatusBadge({ status }: Props) {
  return (
    <Badge
      label={status}
      color={
        status === "abgeschlossen" ? colors.statusDone : colors.statusStarted
      }
    />
  );
}
