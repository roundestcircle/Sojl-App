import { Link } from 'expo-router';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { styles } from '../styles/styles';

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href={"/mapping" as any} asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Kartierung</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/soilcolor" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Nur Bodenfarbe bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href={"/tools" as any} asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Weitere Kartierungsunterstützung</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/about" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>About</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <View style={styles.footnote}>
        <Image source={require('../assets/images/icon.png')} style={{ width: 48, height: 48, borderRadius: 10 }} />
        <Text style={{ fontSize: 9 }}>Version {Constants.expoConfig?.version ?? ''}</Text>
      </View>
    </View>
  );
}
