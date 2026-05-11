import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { styles } from '@/styles/styles';

export default function ToolsIndex() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Link href="/tools/bodenart" style={styles.button}>
        <Text style={styles.maintext}>Bodenart bestimmen</Text>
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
      <Link href="/tools/trennbarkeit" style={styles.button}>
        <Text style={styles.maintext}>Trennbarkeit bestimmen</Text>
      </Link>
      <Link href="/tools/lagerungsart" style={styles.button}>
        <Text style={styles.maintext}>Lagerungsart bestimmen</Text>
      </Link>
    </ScrollView>
  );
}
