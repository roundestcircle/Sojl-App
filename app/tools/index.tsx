import { Fragment } from "react";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { Link, type Href } from "expo-router";
import { styles } from "@/styles/styles";

type ToolLink = {
  label: string;
  href: Href;
};

type ToolSection = {
  /** Header above this group; undefined renders no header (top group). */
  title?: string;
  items: ToolLink[];
};

const TOOL_SECTIONS: ToolSection[] = [
  {
    items: [
      { label: "Horizontlexikon", href: "/tools/horizonte" },
      { label: "Humusformlexikon", href: "/tools/humusformen" },
    ],
  },
  {
    title: "Bestimmungshilfen",
    items: [
      { label: "Bodenart bestimmen", href: "/tools/bodenart" },
      { label: "Bodentyp bestimmen", href: "/tools/bodentyp" },
      { label: "Anteil schätzen", href: "/tools/anteil" },
      { label: "Carbonatgehalt bestimmen", href: "/tools/carbonat" },
      { label: "Lagerungsdichte bestimmen", href: "/tools/lagerungsdichte" },
      { label: "Feinwurzeln bestimmen", href: "/tools/feinwurzeln" },
      { label: "Gefüge bestimmen", href: "/tools/gefuege" },
    ],
  },
  {
    title: "Berechnungshilfen",
    items: [
      { label: "Humusgehalt bestimmen", href: "/tools/humusgehalt" },
      { label: "KAK berechnen", href: "/tools/kak" },
      { label: "Basensättigung berechnen", href: "/tools/basensaettigung" },
      {
        label: "Porenvolumen & Feldkapazität berechnen",
        href: {
          pathname: "/tools/aufnahme-redirect",
          params: { title: "Porenvolumen & Feldkapazität berechnen" },
        },
      },
      {
        label: "S-Wert berechnen",
        href: {
          pathname: "/tools/aufnahme-redirect",
          params: { title: "S-Wert berechnen" },
        },
      },
    ],
  },
];

export default function ToolsIndex() {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
      }}
    >
      {TOOL_SECTIONS.map((section, sIdx) => (
        <Fragment key={sIdx}>
          {section.title != null && (
            <>
              <View style={{ height: 8 }} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </>
          )}
          {section.items.map((item) => (
            <Link key={item.label} href={item.href} asChild>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonLabel}>{item.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </Fragment>
      ))}
    </ScrollView>
  );
}
