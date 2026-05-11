import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { styles } from "@/styles/styles";
import {
  closeAufnahme,
  getAufnahme,
  saveAufnahmeDetails,
  type Aufnahme,
  type AufnahmeDetails,
} from "@/utils/MappingQueries";
import { addHorizont, getHorizonteForAufnahme, type Horizont } from "@/utils/HorizonQueries";
import HorizontButton from "@/components/HorizonButton";
import AufnahmeForm from "@/components/AufnahmeForm";

export default function HorizonOverview() {
  const { aufnahmeId: aufnahmeIdParam } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(aufnahmeIdParam, 10);

  const navigation = useNavigation();
  const [horizonte, setHorizonte] = useState<Horizont[]>([]);
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  const [showUnvollstaendigModal, setShowUnvollstaendigModal] = useState(false);

  useLayoutEffect(() => {
    if (aufnahme) {
      navigation.setOptions({ title: `Aufnahme ${aufnahme.nummer ?? aufnahme.id}` });
    }
  }, [navigation, aufnahme]);

  useFocusEffect(
    useCallback(() => {
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
      setAufnahme(getAufnahme(aufnahmeId));
    }, [aufnahmeId]),
  );

  const handleSaveDetails = (data: AufnahmeDetails) => {
    saveAufnahmeDetails(aufnahmeId, data);
  };

  const handleAddHorizont = () => {
    addHorizont(aufnahmeId);
    setHorizonte(getHorizonteForAufnahme(aufnahmeId));
  };

  const handleHorizontPress = (horizont: Horizont) => {
    router.push(`/mapping/${aufnahmeId}/horizon/${horizont.nummer}`);
  };

  const doClose = () => {
    closeAufnahme(aufnahmeId);
    const kampagneId = aufnahme?.feldkampagne_id;
    if (kampagneId != null) {
      router.replace(`/mapping/kampagne/${kampagneId}` as any);
    } else {
      router.replace("/mapping" as any);
    }
  };

  const handleAbschliessen = () => {
    const offene = horizonte.filter((h) => h.status !== "vollstaendig");
    if (offene.length > 0) {
      setShowUnvollstaendigModal(true);
    } else {
      doClose();
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        {aufnahme && (
          <AufnahmeForm initialData={aufnahme} onSave={handleSaveDetails} />
        )}

        {/* ── Horizon list ── */}
        <View style={localStyles.horizonList}>
          {horizonte.map((horizont) => (
            <HorizontButton
              key={horizont.id}
              horizont={horizont}
              onPress={() => handleHorizontPress(horizont)}
            />
          ))}
          <TouchableOpacity style={styles.actionButton} onPress={handleAddHorizont}>
            <Text style={styles.actionButtonText}>+ Horizont hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* ── Close button ── */}
        <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={handleAbschliessen}>
          <Text style={styles.maintext}>Abschließen</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showUnvollstaendigModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aufnahme unvollständig</Text>
            <Text style={styles.modalText}>Trotzdem abschließen?</Text>
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowUnvollstaendigModal(false); doClose(); }}
              >
                <Text style={styles.modalButtonText}>Trotzdem abschließen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setShowUnvollstaendigModal(false)}
              >
                <Text style={styles.modalButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  horizonList: {
    gap: 12,
    paddingVertical: 8,
  },
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
});
