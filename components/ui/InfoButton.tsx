import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Dialog, { dialogText } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { colors, fontSize } from "@/styles/theme";

/** Small (?) next to a heading that opens an explanation popup. */
export default function InfoButton({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={localStyles.infoBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Erklärung anzeigen"
      >
        <Text style={localStyles.infoBtnText}>?</Text>
      </TouchableOpacity>
      <Dialog visible={visible} onClose={close}>
        <Text style={dialogText}>{text}</Text>
        <Button title="Schließen" onPress={close} />
      </Dialog>
    </>
  );
}

const localStyles = StyleSheet.create({
  infoBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
});
