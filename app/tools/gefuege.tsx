import { View } from 'react-native';
import GefuegeTool from '@/components/GefuegeTool';

/** Standalone screen wrapper for the soil structure (Gefüge) determination tool. */
export default function GefuegeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GefuegeTool />
    </View>
  );
}
