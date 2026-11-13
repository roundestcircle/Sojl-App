import type { ReactNode } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing } from "@/styles/theme";

/**
 * Fullscreen slide-up modal with a "Schließen" header, used to host a
 * Bestimmungshilfe/Lexikon from inside a form or another tool. `headerLeft`
 * renders an optional extra control on the left side of the header.
 */
export function ToolModal({
  visible,
  onClose,
  headerLeft,
  padded = false,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  headerLeft?: ReactNode;
  /** Adds padding around the content (camera / share scroller). */
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={localStyles.safeArea}>
        <View
          style={[
            localStyles.header,
            { justifyContent: headerLeft ? "space-between" : "flex-end" },
          ]}
        >
          {headerLeft}
          <TouchableOpacity
            style={localStyles.close}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color={colors.primary} />
            <Text style={localStyles.closeText}>Schließen</Text>
          </TouchableOpacity>
        </View>
        {padded ? <View style={localStyles.padded}>{children}</View> : children}
      </SafeAreaView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  close: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  closeText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: "600",
  },
  padded: {
    flex: 1,
    padding: spacing.screen,
  },
});
