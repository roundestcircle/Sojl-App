import { useEffect, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Dialog, { dialogText } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { colors, fontSize, radius } from "@/styles/theme";

/**
 * Instructions popup that opens automatically until the user ticks
 * "Nicht mehr anzeigen" (persisted in AsyncStorage under `storageKey`).
 *
 * Returns the dialog element to render and `show()` to open it again, e.g.
 * from a {@link HelpButton}. Unticking the box on a later visit re-enables the
 * automatic display.
 */
export function useInstruction(
  storageKey: string,
  text: string,
  title = "Anleitung",
): { modal: ReactNode; show: () => void } {
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        const optedOut = saved === "true";
        setDontShowAgain(optedOut);
        setVisible(!optedOut);
      })
      .catch((error) => {
        console.error(error);
        setVisible(true); // show when the preference can't be read
      });
  }, [storageKey]);

  const close = () => {
    setVisible(false);
    const write = dontShowAgain
      ? AsyncStorage.setItem(storageKey, "true")
      : AsyncStorage.removeItem(storageKey);
    write.catch((error) => console.error(error));
  };

  const modal = (
    <Dialog visible={visible} onClose={close} title={title}>
      <Text style={dialogText}>{text}</Text>
      <Pressable
        style={localStyles.checkboxRow}
        onPress={() => setDontShowAgain((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: dontShowAgain }}
      >
        <View
          style={[localStyles.checkbox, dontShowAgain && localStyles.checked]}
        >
          {dontShowAgain && (
            <Ionicons name="checkmark" size={18} color={colors.white} />
          )}
        </View>
        <Text style={localStyles.checkboxLabel}>Nicht mehr anzeigen</Text>
      </Pressable>
      <Button title="OK" onPress={close} />
    </Dialog>
  );

  return { modal, show: () => setVisible(true) };
}

/** Square "?" button that reopens a tool's instructions. */
export function HelpButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      style={[localStyles.help, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Anleitung anzeigen"
    >
      <Ionicons name="help" size={28} color={colors.primary} />
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: fontSize.sm,
    color: colors.textBody,
  },
  help: {
    width: 62,
    minHeight: 48,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
});
