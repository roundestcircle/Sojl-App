import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { styles } from '@/styles/styles';

export default function ToolsIndex() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <Link href="/tools/pflanzenreste" style={styles.button}>
        <Text style={styles.maintext}>Pflanzenreste bestimmen</Text>
      </Link>
      <Link href="/tools/feinwurzeln" style={styles.button}>
        <Text style={styles.maintext}>Feinwurzeln bestimmen</Text>
      </Link>
      <Link href="/tools/gefuegestabilitaet" style={styles.button}>
        <Text style={styles.maintext}>Gefügestabilität bestimmen</Text>
      </Link>
      <Link href="/tools/gefuege" style={styles.button}>
        <Text style={styles.maintext}>Gefüge bestimmen</Text>
      </Link>
    </ScrollView>
  );
}
