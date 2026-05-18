import { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CollapsibleSection from "@/components/CollapsibleSection";
import FunktionsweiseContent from "@/components/FunktionsweiseContent";
import { colors } from "../styles/colors";
import { styles } from "../styles/styles";

export default function AboutScreen() {
  const [allgemeinesExpanded, setAllgemeinesExpanded] = useState(true);
  const [funktionsweiseExpanded, setFunktionsweiseExpanded] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
        <CollapsibleSection
          title="Allgemeines"
          expanded={allgemeinesExpanded}
          onToggle={() => setAllgemeinesExpanded((v) => !v)}
        >
          <Text style={styles.text}>
            Diese App ist ein Freizeitprojekt von mir. Sie dient der
            Bodenaufnahme im Feld nach der deutschen KA6. Mich hat aber das
            nasse Papier, die viel zu teure Farbtafel und die nervige
            Excelübertragung der Bodenaufnahmen in der Praxis genervt. Dieses
            Problem will ich mit einer App lösen.
          </Text>
          <Text style={styles.text}>
            Ich studiere irgendwas mit Boden im Bachelor, bin aber kein Experte
            und bestimmt kein Programmierer. Die App ist noch ein Prototyp und
            kann noch Fehler enthalten, die ich übersehen habe. Vielleicht hilft
            sie euch trotzdem schon in der Praxis. Sie ist kostenlos und Open
            Source, und soll das auch bleiben.
          </Text>
          <Text style={styles.text}>
            Schaut euch gerne den Quellcode{" "}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL("https://github.com/roundestcircle/Sojl-App")
              }
            >
              auf Github
            </Text>{" "}
            an oder schreibt mir eine{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("mailto:sojlbodenkunde@gmail.com")}
            >
              Mail.
            </Text>{" "}
            Bald soll es{" "}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL("https://www.youtube.com/@SojlBodenkunde")
              }
            >
              hier auf Youtube
            </Text>{" "}
            auch ein paar Tutorials geben. Schickt mir gerne alle Vorschläge die
            ihr habt, Fehler die euch aufgefallen sind oder sonstiges Feedback.
          </Text>
        </CollapsibleSection>

        <View style={styles.section}>
          <TouchableOpacity
            style={localStyles.header}
            onPress={() => setFunktionsweiseExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Funktionsweise der Tools</Text>
            <Text style={localStyles.chevron}>
              {funktionsweiseExpanded ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {funktionsweiseExpanded && <FunktionsweiseContent />}
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevron: {
    fontSize: 12,
    color: colors.primary,
  },
});
