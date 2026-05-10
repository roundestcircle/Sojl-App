import { View } from 'react-native';
import PictureTaker from '../components/PictureTaker';
import { styles } from '../styles/styles';

export default function SoilColorScreen() {
return (
  <View style={styles.containerfull}>
    <PictureTaker />
  </View>
);
}
