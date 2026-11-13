import { Fragment } from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import type { Href } from "expo-router";
import NavRow from "@/components/ui/NavRow";
import { styles } from "@/styles/styles";
import { spacing } from "@/styles/theme";

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
      {
        label: "Lagerungsdichte bestimmen (KA5)",
        href: "/tools/lagerungsdichte",
      },
      {
        label: "Packungsdichte bestimmen (KA6)",
        href: "/tools/packungsdichte",
      },
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
    <ScrollView contentContainerStyle={localStyles.content}>
      {TOOL_SECTIONS.map((section, sIdx) => (
        <Fragment key={sIdx}>
          {section.title != null && (
            <Text style={[styles.sectionTitle, localStyles.heading]}>
              {section.title}
            </Text>
          )}
          {section.items.map((item) => (
            <NavRow key={item.label} title={item.label} href={item.href} />
          ))}
        </Fragment>
      ))}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    gap: 10,
  },
  heading: {
    marginTop: spacing.sm,
  },
});
