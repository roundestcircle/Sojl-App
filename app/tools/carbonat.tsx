import { View } from 'react-native';
import CarbonatTool from '@/components/CarbonatTool';

/** Standalone screen wrapper for the carbonate content (Carbonatgehalt) determination tool. */
export default function CarbonatScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CarbonatTool />
    </View>
  );
}
