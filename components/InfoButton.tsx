import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";

export default function InfoButton({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={localStyles.infoBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={localStyles.infoBtnText}>?</Text>
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={localStyles.infoOverlay}>
          <View style={localStyles.infoCard}>
            <Text style={localStyles.infoText}>{text}</Text>
            <TouchableOpacity
              style={[styles.actionButton, { alignSelf: "stretch", marginTop: 12 }]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.actionButtonText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 12,
    fontWeight: "700",
  },
  infoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 32,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
