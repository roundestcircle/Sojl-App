import { useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

/**
 * Drives a soft 600ms scroll-to-end when the keyboard appears while a tagged
 * input (e.g. Notizen) is focused. Used by both AufnahmeForm/standort.tsx and
 * HorizonForm to keep the multiline field visible above the keyboard.
 *
 * Returns:
 *   ref           — attach to the ScrollView
 *   onFocus       — wire to the input's onFocus
 *   onBlur        — wire to the input's onBlur
 *   onScroll      — wire to the ScrollView's onScroll
 *   onContentSizeChange / onLayout — wire to the ScrollView
 */
export function useNotizenScroll() {
  const scrollViewRef = useRef<ScrollView>(null);
  const notizenFocused = useRef(false);
  const currentScrollY = useRef(0);
  const contentH = useRef(0);
  const layoutH = useRef(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    const sub = Keyboard.addListener("keyboardDidShow", () => {
      if (notizenFocused.current) setTimeout(slowScrollToEnd, 100);
    });
    return () => sub.remove();
  }, [scrollAnim]);

  return {
    scrollViewRef,
    onNotizenFocus: () => {
      notizenFocused.current = true;
    },
    onNotizenBlur: () => {
      notizenFocused.current = false;
    },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      currentScrollY.current = e.nativeEvent.contentOffset.y;
    },
    onContentSizeChange: (_w: number, h: number) => {
      contentH.current = h;
    },
    onLayout: (e: { nativeEvent: { layout: { height: number } } }) => {
      layoutH.current = e.nativeEvent.layout.height;
    },
  };
}
