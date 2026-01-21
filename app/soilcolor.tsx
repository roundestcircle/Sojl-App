import { View } from 'react-native';
import ColorPickerScreen from '../components/ColorPickerScreen';
import { styles } from '../styles/styles.js';

export default function SoilColorScreen() {
return (
  <View style={styles.container}>
    <ColorPickerScreen />
  </View>
);
}
