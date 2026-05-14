import { Linking, Text, View } from "react-native";
import { styles } from "../styles/styles";

/**
 * About screen – shows a brief project description and contact links.
 * Part of a Bachelor's thesis on digitalizing soil mapping.
 */
export default function AboutScreen() {
  return (
    <View style={[styles.container, { justifyContent: "flex-start" }]}>
      <Text style={styles.text}>
        Diese App ist ein Freizeitprojekt von mir. Sie dient der Bodenaufnahme
        im Feld nach der deutschen KA6. Mich hat aber das nasse Papier, die viel
        zu teure Farbtafel und die nervige Excelübetragung der Bodenaufnahmen in
        der Praxis genervt. Diese Problem will ich mit einer App lösen.
      </Text>
      <Text style={styles.text}>
        Ich studiere irgendwas mit Boden im Bachelor, bin aber kein Experte und
        bestimmt kein Programmierer. Die App ist noch ein Prototyp und kann noch
        Fehler enthalten, die ich übersehen habe. Vielleicht hilft sie euch
        trotzdem schon in der Praxis. Sie ist kostenlos und Open Source, und
        soll das auch bleiben.
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
        auch ein paar Tutorials geben. Schickt mir gerne alle Vorschläge die ihr
        habt, Fehler die euch aufgefallen sind oder sonstiges Feedback.
      </Text>
    </View>
  );
}
