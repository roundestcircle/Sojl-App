// InstructionModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/styles';
import { ViewStyle } from 'react-native';

interface InstructionModalProps {
  title?: string;           // default "Anleitung"
  instructionText: string;
  storageKey: string;       // e.g. 'soilShareDontShowAgain'
  children?: React.ReactNode; // optional extra content inside modal
  onClose?: () => void;     // callback when modal is closed
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  title = "Anleitung",
  instructionText,
  storageKey,
  children,
  onClose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        setShowModal(saved !== 'true');
      } catch (error) {
        console.error(error);
        setShowModal(true);
      }
    };
    checkAndLoad();
  }, [storageKey]);

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await AsyncStorage.setItem(storageKey, 'true');
      } catch (error) {
        console.error(error);
      }
    }
    setShowModal(false);
    onClose?.();
  };

  return (
    <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{instructionText}</Text>
          {children}
          <Pressable style={styles.checkboxContainer} onPress={() => setDontShowAgain(!dontShowAgain)}>
            <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
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

// Separate reset button component (optional)
export const ResetInstructionButton: React.FC< { 
  storageKey: string; 
  onReset?: () => void;
  style?: ViewStyle; // custom style overrides
} > = ({ storageKey, onReset, style }) => {
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      onReset?.();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <TouchableOpacity style={[styles.resetButton, style]} onPress={handleReset}>
      <Text style={styles.resetButtonText}>Anleitung erneut zeigen</Text>
    </TouchableOpacity>
  );
};