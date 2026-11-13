import { useState } from "react";
import { Linking, Text, View } from "react-native";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import FunktionsweiseContent from "@/components/lexikon/FunktionsweiseContent";
import { styles } from "@/styles/styles";
import { spacing } from "@/styles/theme";

export default function AboutScreen() {
  const [allgemeinesExpanded, setAllgemeinesExpanded] = useState(true);
  const [funktionsweiseExpanded, setFunktionsweiseExpanded] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.screen, paddingTop: 10 }}>
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
            und bestimmt kein Programmierer. Ich habe für die App viel Claude
            Code verwendet, aber so gut es geht überprüft, dass der Code
            sinnvoll und die Ergebnisse korrekt sind. Dennoch ist die App noch
            ein Prototyp und kann noch Fehler enthalten, die ich übersehen habe.
            Vielleicht hilft sie euch trotzdem schon in der Praxis. Sie ist
            kostenlos und Open Source und soll das auch bleiben.
          </Text>
          <Text style={styles.text}>
            Schaut euch gerne den Quellcode{" "}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL("https://github.com/roundestcircle/Sojl-App")
              }
            >
              auf GitHub
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
              hier auf YouTube
            </Text>{" "}
            auch ein paar Tutorials geben. Schickt mir gerne alle Vorschläge,
            die ihr habt, Fehler, die euch aufgefallen sind, oder sonstiges
            Feedback.
          </Text>
        </CollapsibleSection>

        {/* The list needs the remaining screen height to scroll, so it is
            rendered below the section instead of as its child. */}
        <CollapsibleSection
          title="Funktionsweise der Tools"
          expanded={funktionsweiseExpanded}
          onToggle={() => setFunktionsweiseExpanded((v) => !v)}
        />
      </View>

      {funktionsweiseExpanded && <FunktionsweiseContent />}
    </View>
  );
}
