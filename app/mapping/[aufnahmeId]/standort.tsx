import { useCallback, useState, useRef, useEffect } from "react";
import { ScrollView, ActivityIndicator, View, KeyboardAvoidingView, Platform, Animated, Keyboard } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { getAufnahme, saveAufnahmeDetails, type AufnahmeDetails } from "@/utils/MappingQueries";
import { getHorizonteForAufnahme, type Horizont } from "@/utils/HorizonQueries";
import { calcGrundigkeitCm } from "@/utils/MappingMaths";
import AufnahmeForm from "@/components/AufnahmeForm";
import type { Aufnahme } from "@/utils/MappingQueries";

/**
 * Standortdaten screen.
 * Renders AufnahmeForm for the location and profile fields of an Aufnahme.
 * Autosaves on every form change via the onSave callback.
 */
export default function StandortScreen() {
  const { aufnahmeId: param } = useLocalSearchParams<{ aufnahmeId: string }>();
  const aufnahmeId = parseInt(param, 10);

  // The Aufnahme record loaded from the database, used to seed form defaults
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  const [calcGrundigkeit, setCalcGrundigkeit] = useState('');
  const [horizonte, setHorizonte] = useState<Horizont[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const notizenFocused = useRef(false);
  const currentScrollY = useRef(0);
  const contentH = useRef(0);
  const layoutH = useRef(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const slowScrollToEnd = () => {
    const target = Math.max(0, contentH.current - layoutH.current);
    scrollAnim.setValue(currentScrollY.current);
    const listener = scrollAnim.addListener(({ value }) => {
      scrollViewRef.current?.scrollTo({ y: value, animated: false });
    });
    Animated.timing(scrollAnim, {
      toValue: target,
      duration: 600,
      useNativeDriver: false,
    }).start(() => scrollAnim.removeListener(listener));
  };

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (notizenFocused.current) setTimeout(slowScrollToEnd, 100);
    });
    return () => sub.remove();
  }, []);

  // Reload the record and recalculate derived values whenever the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setAufnahme(getAufnahme(aufnahmeId));
      const h = getHorizonteForAufnahme(aufnahmeId);
      setHorizonte(h);
      setCalcGrundigkeit(calcGrundigkeitCm(h.map(hz => hz.maechtigk_dm ?? '')));
    }, [aufnahmeId]),
  );

  /**
   * Persists partial form data on every watch callback from AufnahmeForm.
   * Called on every keystroke/change, so no explicit save button is needed.
   */
  const handleSave = useCallback((data: AufnahmeDetails) => {
    saveAufnahmeDetails(aufnahmeId, data);
  }, [aufnahmeId]);

  if (!aufnahme) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(e) => { currentScrollY.current = e.nativeEvent.contentOffset.y; }}
        onContentSizeChange={(_, h) => { contentH.current = h; }}
        onLayout={(e) => { layoutH.current = e.nativeEvent.layout.height; }}
      >
        <AufnahmeForm
          initialData={aufnahme}
          onSave={handleSave}
          calcGrundigkeit={calcGrundigkeit}
          horizonte={horizonte}
          onNotizenFocus={() => { notizenFocused.current = true; }}
          onNotizenBlur={() => { notizenFocused.current = false; }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
