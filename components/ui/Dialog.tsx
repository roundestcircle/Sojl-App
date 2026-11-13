import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button, { type ButtonVariant } from "@/components/ui/Button";
import { colors, fontSize, radius, spacing } from "@/styles/theme";

type DialogProps = {
  visible: boolean;
  /** Called on back button, backdrop tap and the header ✕. */
  onClose: () => void;
  title?: string;
  /** Shows a close icon in the header (needs `title`). */
  closeIcon?: boolean;
  /** Pads the body. Turn off for edge-to-edge lists. */
  padded?: boolean;
  /** `top` pins the card to the upper part of the screen (keeps lists clear of the keyboard). */
  position?: "center" | "top";
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Centred card over a dimmed backdrop. Base for all small popups (info,
 * confirmations, suggestion lists, dropdowns, instructions).
 */
export default function Dialog({
  visible,
  onClose,
  title,
  closeIcon = false,
  padded = true,
  position = "center",
  style,
  children,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[
          localStyles.overlay,
          position === "top" && localStyles.overlayTop,
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Schließen"
        />
        <View
          style={[
            localStyles.card,
            position === "top" && localStyles.cardTop,
            style,
          ]}
        >
          {title != null && (
            <View
              style={[localStyles.header, !padded && localStyles.headerDivider]}
            >
              <Text style={localStyles.title}>{title}</Text>
              {closeIcon && (
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Schließen"
                >
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View
            style={[
              localStyles.content,
              padded && localStyles.body,
              padded && title != null && localStyles.bodyBelowTitle,
            ]}
          >
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** Colour of the confirm button. */
  tone?: Extract<ButtonVariant, "filled" | "danger" | "warning">;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Yes/no question with a coloured confirm button and an "Abbrechen" button. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  tone = "filled",
  onConfirm,
  onCancel,
}: ConfirmProps) {
  return (
    <Dialog visible={visible} onClose={onCancel} title={title}>
      <Text style={dialogText}>{message}</Text>
      <View style={localStyles.buttons}>
        <Button title={confirmLabel} variant={tone} onPress={onConfirm} />
        <Button title="Abbrechen" variant="neutral" onPress={onCancel} />
      </View>
    </Dialog>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.xl,
  },
  overlayTop: {
    justifyContent: "flex-start",
    paddingTop: "30%",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: "hidden",
    maxHeight: "85%",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  cardTop: {
    maxHeight: "65%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  headerDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.primary,
  },
  // Lets long lists shrink to the card's max height and scroll.
  content: {
    flexShrink: 1,
  },
  body: {
    padding: 20,
    gap: spacing.md,
  },
  bodyBelowTitle: {
    paddingTop: 0,
  },
  buttons: {
    gap: 10,
    marginTop: spacing.sm,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.textBody,
    lineHeight: 24,
  },
});

/** Body text style of dialogs. */
export const dialogText = localStyles.text;
