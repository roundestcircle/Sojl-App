import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles.js';

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/soilmapping" style={styles.button}>
        Kartierung beginnen
      </Link>
      <Link href="/soiltexture" style={styles.button}>
        Nur Bodenart bestimmen
      </Link>
      <Link href="/soilcolor" style={styles.button}>
        Nur Bodenfarbe bestimmen
      </Link>
      <Link href="/about" style={styles.button}>
        About
      </Link>
      <View style={styles.footnote}>
        <Text>
          Version 0.1, 15.1.2026
        </Text>
      </View>
    </View>
  );
}
