import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BodenTypTool from "@/components/BodenTypTool";
import HorizontLexikonContent from "@/components/HorizontLexikonContent";
import { colors } from "@/styles/colors";

/**
 * Standalone screen wrapper for the BodenTypTool.
 * Accessible from the Tools overview without a form context (no onConfirm callback).
 * Includes a button to open the Horizontlexikon as a modal reference.
 */
export default function BodentypScreen() {
  const [lexikonVisible, setLexikonVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* ── Lexikon shortcut ── */}
      <View style={localStyles.topBar}>
        <TouchableOpacity
          style={localStyles.lexikonBtn}
          onPress={() => setLexikonVisible(true)}
        >
          <Text style={localStyles.lexikonBtnText}>Horizontlexikon</Text>
        </TouchableOpacity>
      </View>

      <BodenTypTool />

      {/* ── Horizontlexikon modal ── */}
      <Modal
        visible={lexikonVisible}
        animationType="slide"
        onRequestClose={() => setLexikonVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setLexikonVisible(false)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <HorizontLexikonContent />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  lexikonBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  lexikonBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalClose: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
