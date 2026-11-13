import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ToolModal } from "@/components/ui/ToolModal";
import TreeTool from "@/components/tools/TreeTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import Button from "@/components/ui/Button";
import { colors, spacing } from "@/styles/theme";

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
        <Button
          title="Horizontlexikon"
          variant="outline"
          size="sm"
          onPress={() => setLexikonVisible(true)}
        />
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
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    alignItems: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
