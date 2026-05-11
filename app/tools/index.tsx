import { Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { styles } from '@/styles/styles';


/**
 * Tools overview screen.
 * Lists all available soil determination tools as navigation links,
 * plus reference tools under a separate section.
 */
export default function ToolsIndex() {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center', gap: 15 }}>
      <Link href="/tools/horizonte" style={styles.button}>
        <Text style={styles.maintext}>Horizontlexikon</Text>
      </Link>
      <Link href="/tools/bodenart" style={styles.button}>
        <Text style={styles.maintext}>Bodenart bestimmen</Text>
      </Link>
      <Link href="/tools/bodentyp" style={styles.button}>
        <Text style={styles.maintext}>Bodentyp bestimmen</Text>
      </Link>
      <Link href="/tools/anteil" style={styles.button}>
        <Text style={styles.maintext}>Anteil schätzen</Text>
      </Link>
      <Link href="/tools/humusgehalt" style={styles.button}>
        <Text style={styles.maintext}>Humusgehalt bestimmen</Text>
      </Link>
      <Link href="/tools/carbonat" style={styles.button}>
        <Text style={styles.maintext}>Carbonatgehalt bestimmen</Text>
      </Link>
      <Link href="/tools/lagerungsdichte" style={styles.button}>
        <Text style={styles.maintext}>Lagerungsdichte bestimmen</Text>
      </Link>
      <Link href="/tools/feinwurzeln" style={styles.button}>
        <Text style={styles.maintext}>Feinwurzeln bestimmen</Text>
      </Link>
      <Link href="/tools/gefuege" style={styles.button}>
        <Text style={styles.maintext}>Gefüge bestimmen</Text>
      </Link>

    </ScrollView>
  );
}
