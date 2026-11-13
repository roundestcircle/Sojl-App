import type { ReactNode } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/colors";

/**
 * Fullscreen slide-up modal with a "✕ Schließen" header, used to host a
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
  /** Adds 20px padding around the content (camera / share scroller). */
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
          <TouchableOpacity onPress={onClose}>
            <Text style={localStyles.close}>✕ Schließen</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  close: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  padded: {
    flex: 1,
    padding: 20,
  },
});
