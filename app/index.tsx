import { Link } from 'expo-router';
import { Text, View, Image } from 'react-native';
import Constants from 'expo-constants';
import { styles } from '../styles/styles';

/**
 * Home screen – main entry point.
 * Provides navigation links to the mapping workflow, soil color tool, additional tools, and the about page.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Link href={"/mapping" as any} style={styles.button}>
        <Text style={styles.maintext}>
        Kartierung
        </Text>
      </Link>
      <Link href="/soilcolor" style={styles.button}>
        <Text style={styles.maintext}>
        Nur Bodenfarbe bestimmen
        </Text>
      </Link>
      <Link href={"/tools" as any} style={styles.button}>
        <Text style={styles.maintext}>
        Weitere Kartierungsunterstützung
        </Text>
      </Link>
      <Link href="/about" style={styles.button}>
        <Text style={styles.maintext}>
        About
        </Text>
      </Link>
      <View style={styles.footnote}>
        <Image source={require('../assets/images/icon.png')} style={{ width: 48, height: 48, borderRadius: 10 }} />
        <Text style={{ fontSize: 9 }}>Version {Constants.expoConfig?.version ?? ''}</Text>
      </View>
    </View>
  );
}
