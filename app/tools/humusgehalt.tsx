import { View } from 'react-native';
import HumusgehaltTool from '@/components/HumusgehaltTool';

/** Standalone screen wrapper for the humus content (Humusgehalt) determination tool. */
export default function HumusgehaltScreen() {
  return (
    <View style={{ flex: 1 }}>
      <HumusgehaltTool />
    </View>
  );
}
