import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ToolModal } from "@/components/ui/ToolModal";
import TreeTool from "@/components/tools/TreeTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import { colors } from "@/styles/colors";

/**
 * Standalone screen for the Bodentyp decision tree.
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

      <TreeTool kind="bodentyp" />

      {/* ── Horizontlexikon modal ── */}
      <ToolModal
        visible={lexikonVisible}
        onClose={() => setLexikonVisible(false)}
      >
        <HorizontLexikonContent />
      </ToolModal>
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
});
