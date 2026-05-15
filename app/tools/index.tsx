import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { styles } from "@/styles/styles";

export default function ToolsIndex() {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
      }}
    >
      <Link href="/tools/horizonte" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Horizontlexikon</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/humusformen" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Humusformlexikon</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>

      <View style={{ height: 8 }} />

      <Text style={styles.sectionTitle}>Bestimmungshilfen</Text>

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

      <View style={{ height: 8 }} />

      <Text style={styles.sectionTitle}>Berechnungshilfen</Text>

      <Link href="/tools/humusgehalt" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Humusgehalt bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/kak" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>KAK berechnen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/tools/basensaettigung" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Basensättigung berechnen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link
        href={{
          pathname: "/tools/aufnahme-redirect",
          params: { title: "Porenvolumen & Feldkapazität berechnen" },
        }}
        asChild
      >
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>
            Porenvolumen & Feldkapazität berechnen
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link
        href={{
          pathname: "/tools/aufnahme-redirect",
          params: { title: "S-Wert berechnen" },
        }}
        asChild
      >
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>S-Wert berechnen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}
