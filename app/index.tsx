import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href={"/mapping" as any} style={styles.button}>
        <Text style={styles.maintext}>
        Kartierung
        </Text>
      </Link>
      <Link href="/soiltexture" style={styles.button}>
        <Text style={styles.maintext}>
        Nur Bodenart bestimmen
        </Text>
      </Link>
      <Link href="/soilcolor" style={styles.button}>
        <Text style={styles.maintext}>
        Nur Bodenfarbe bestimmen
        </Text>
      </Link>
      <Link href="/soilshare" style={styles.button}>
        <Text style={styles.maintext}>
        Nur Bodenanteil (z.B. Skelett) bestimmen
        </Text>
      </Link>
      <Link href="/about" style={styles.button}>
        <Text style={styles.maintext}>
        About
        </Text>
      </Link>
      <View style={styles.footnote}>
        <Text>
          Version 0.1, 15.1.2026
        </Text>
      </View>
    </View>
  );
}
