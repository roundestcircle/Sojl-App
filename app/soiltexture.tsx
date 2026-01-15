import { View } from 'react-native';
import TexTreeScreen from '../components/TexTreeScreen';
import { styles } from '../styles/styles.js';

export default function SoilTextureScreen() {
  return (
    <View style={styles.container}>
      <TexTreeScreen />
    </View>
  );
}
