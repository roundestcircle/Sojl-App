import { View } from 'react-native';
import SoilShareScroll from '@/components/SoilShareScroll';

/** Standalone screen wrapper for the coarse fraction share (Anteil) estimation tool. */
export default function AnteilScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <SoilShareScroll />
    </View>
  );
}
