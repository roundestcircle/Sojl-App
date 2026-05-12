import { Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { styles } from '@/styles/styles';

export default function ToolsIndex() {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10, alignItems: 'stretch', gap: 15 }}>
      <Link href="/tools/horizonte" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Horizontlexikon</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/bodenart" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Bodenart bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/bodentyp" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Bodentyp bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/anteil" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Anteil schätzen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/humusgehalt" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Humusgehalt bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/carbonat" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Carbonatgehalt bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/lagerungsdichte" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Lagerungsdichte bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/feinwurzeln" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Feinwurzeln bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/gefuege" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Gefüge bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}
