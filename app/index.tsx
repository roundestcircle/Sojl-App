import { Link } from 'expo-router';
import { View } from 'react-native';
import { styles } from '../styles/styles.js';

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/soiltexture" style={styles.button}>
        Just Determine Soil Texture
      </Link>
      <Link href="/soilcolor" style={styles.button}>
        Just Determine Soil Color
      </Link>
      <Link href="/soilmapping" style={styles.button}>
        Start Mapping
      </Link>
      <Link href="/about" style={styles.button}>
        About
      </Link>
    </View>
  );
}
