import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles/styles";

interface InstructionModalProps {
  title?: string; // default "Anleitung"
  instructionText: string;
  storageKey: string; // AsyncStorage key used to persist "don't show again"
  children?: React.ReactNode; // optional extra content inside the modal body
  onClose?: () => void; // callback fired when the modal is dismissed
}

/**
 * Auto-showing instruction modal.
 * On mount it checks AsyncStorage for the given storageKey; if not set, the modal
 * is displayed immediately. The user can suppress future appearances via the
 * "Nicht mehr anzeigen" checkbox.
 */
export const InstructionModal: React.FC<InstructionModalProps> = ({
  title = "Anleitung",
  instructionText,
  storageKey,
  children,
  onClose,
}) => {
  // Whether the modal is currently visible (initially false until async check resolves)
  const [showModal, setShowModal] = useState(false);
  // Tracks the state of the "don't show again" checkbox
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    /**
     * Reads the stored preference and shows the modal unless the user previously
     * opted out.
     */
    const checkAndLoad = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        setShowModal(saved !== "true");
      } catch (error) {
        console.error(error);
        setShowModal(true); // Default to showing if storage read fails
      }
    };
    checkAndLoad();
  }, [storageKey]);

  /**
   * Closes the modal and, when the checkbox is ticked, persists the "don't show again"
   * flag to AsyncStorage so it stays suppressed across app restarts.
   */
  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await AsyncStorage.setItem(storageKey, "true");
      } catch (error) {
        console.error(error);
      }
    }
    setShowModal(false);
    onClose?.();
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{instructionText}</Text>
          {children}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View
              style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}
            >
              {dontShowAgain && <Text style={styles.modalButtonText}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Nicht mehr anzeigen</Text>
          </Pressable>
          <TouchableOpacity style={styles.modalButton} onPress={handleClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Standalone button that clears the "don't show again" flag from AsyncStorage
 * and calls an optional callback so the parent can remount InstructionModal.
 */
export const ResetInstructionButton: React.FC<{
  storageKey: string;
  onReset?: () => void;
  style?: StyleProp<ViewStyle>; // custom style overrides
}> = ({ storageKey, onReset, style }) => {
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      onReset?.();
    } catch (error) {
      console.error(error);
    }
  };
  // If the caller passed explicit positioning (e.g. `position: 'absolute'`) treat
  // the `style` prop as button/style overrides. Otherwise render the button in
  // a container that pins it to the bottom of the page with 16px horizontal
  // padding and 16px bottom spacing so it matches other full-width buttons.
  const hasExplicitPosition = !!StyleSheet.flatten(style)?.position;

  if (hasExplicitPosition) {
    return (
      <TouchableOpacity style={[styles.resetButton, style]} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Anleitung erneut zeigen</Text>
      </TouchableOpacity>
    );
  }

  const containerStyle: ViewStyle = {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity style={[styles.resetButton, { alignSelf: "stretch" }]} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Anleitung erneut zeigen</Text>
      </TouchableOpacity>
    </View>
  );
};
