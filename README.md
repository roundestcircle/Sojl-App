# Sojl-App

Diese App ist ein Freizeitprojekt von mir. Sie dient der Bodenaufnahme im Feld nach der deutschen KA6. Mich hat aber das nasse Papier, die viel zu teure Farbtafel und die nervige Excelübertragung der Bodenaufnahmen in der Praxis genervt. Dieses Problem will ich mit einer App lösen. 

Ich studiere irgendwas mit Boden im Bachelor, bin aber kein Experte und bestimmt kein Programmierer. Ich habe für die App viel Claude Code verwendet, aber so gut es geht überprüft, dass der Code sinnvoll und die Ergebnisse korrekt sind. Dennoch ist die App ein Prototyp und kann noch Fehler enthalten, die ich übersehen habe. Vielleicht hilft sie euch trotzdem schon in der Praxis. Sie ist kostenlos und Open Source und soll das auch bleiben.  

## Download

Ladet euch die .apk unter Releases herunter und installiert sie auf eurem Android-Gerät. Wenn apkpure ihre Upload-Seite gefixt kriegen, findet ihr sie auch dort.

Ich habe nicht vor, sie im iOS App-Store zu veröffentlichen.

## Funktionalität

Die App besteht aus mehreren Komponenten:

Die Hauptkomponente ist die Möglichkeit des Erstellens von Bodenaufnahmen und Feldkampagnen, Data Entry und dann dem Exportieren der aufgenommenen Daten als ZIP-Datei mit zwei Tabellen (`aufnahmen.csv` und `horizonte.csv`).

Aus dem Data Entry Formular können einige Bestimmungshilfen aufgerufen werden. Diese Bestimmungshilfen können auch unabhängig von einer spezifischen Aufnahme genutzt werden.

- Bestimmungshilfe zur Bodenfarbe mithilfe der Kamera und einer Graukarte
- Bestimmungshilfe zum Anteil etwa von Skelett über ein Raster, das sich beim Scrollen prozentual schwarz füllt
- Bestimmungshilfen über Decisiontrees zu:
    - Carbonatgehalt
    - Bodenart
    - Bodentyp
    - Lagerungsdichte (KA5)
    - Packungsdichte (KA6)
    - Feinwurzeln
    - Gefüge
- Unvollständiges Horizontlexikon und Humusformlexikon zur schnellen Recherche
- Berechnungstools zur Berechnung/Abschätzung von:
    - KAK und Basensättigung
    - Humusgehalt
    - Gesamtem Porenvolumen sowie Luftkapazität und (nutzbare) Feldkapazität.

Dazu kommen zwei Funktionen rund um die Feldarbeit:

- **Ort finden** — ein Kompasspfeil mit Live-Entfernung führt euch zu den Koordinaten einer Aufnahme. In der Kampagnenübersicht lassen sich zusätzlich alle Aufnahmen in eurer Nähe hervorheben.
- **Import** — eine bereits exportierte Kampagne lässt sich als ZIP wieder einlesen, und eine am Rechner geplante Kampagne könnt ihr als GPX-Datei importieren, um die Punkte im Feld abzulaufen.

Genaue Erklärungen zur Nutzung der Hilfen findet ihr in der App selber und bald bei https://www.youtube.com/@SojlBodenkunde. 

## Funktionsweise der Tools

### Ort finden und Standortverfolgung

Beide Funktionen arbeiten rein auf dem Gerät mit dem GPS-Signal, es werden keine Karten geladen und keine Daten verschickt.

**„Ort finden"** öffnet ihr in einer Aufnahme unter den Standortdaten. Die App abonniert die eigene Position und die Kompassausrichtung des Geräts und zeigt einen Pfeil, der auf die Zielkoordinaten der Aufnahme zeigt, sowie die verbleibende Entfernung. Die Distanz wird über die Haversine-Formel berechnet (Kugelerde, für Feldentfernungen völlig ausreichend), die Peilung als Anfangspeilung im Uhrzeigersinn von Nord. Der Pfeil wird um `Peilung − Geräteausrichtung` gedreht, zeigt also unabhängig davon, wie ihr das Handy haltet, in die richtige Richtung. Als Ziel werden die GPS-Koordinaten der Aufnahme genutzt; sind nur UTM-Werte eingetragen, rechnet die App diese vorher um. Ohne jegliche Koordinaten ist der Button deaktiviert. Wenn das Gerät keinen Kompass hat, wird das gemeldet — die Entfernung funktioniert trotzdem.

**„Standort verfolgen"** ist der Schalter in der Kampagnenübersicht. Solange er aktiv ist, wird für jede Aufnahme mit Koordinaten laufend die Distanz zu eurer aktuellen Position berechnet und in der Liste angezeigt. Aufnahmen, die näher als 5 m sind (bei ungenauem GPS-Signal entsprechend der gemeldeten Genauigkeit), werden grün hervorgehoben; damit die Markierung nicht flackert, verschwindet sie erst wieder, wenn ihr euch 3 m weiter entfernt habt. Das hilft vor allem beim Wiederfinden von Punkten einer geplanten Kampagne. Die Standortabfrage wird beim Ausschalten und beim Verlassen des Screens wieder beendet, damit sie nicht im Hintergrund weiterläuft.

### Import von Kampagnen

Es gibt zwei Importwege, beide über die Buttons auf dem Startbildschirm.

**Begonnene Kampagne importieren (ZIP)** ist das Gegenstück zum Export. Ihr wählt eine zuvor von der App exportierte ZIP-Datei aus (`aufnahmen.csv` + `horizonte.csv`, bei Kampagnen-Exporten zusätzlich `kampagne.csv`), und die App baut daraus eine **neue** Kampagne mit allen Aufnahmen und Horizonten wieder auf. Status, Erstellungsdatum, Namen und Nummern der Aufnahmen und Horizonte bleiben dabei erhalten. Der Kampagnenname, -status und das -datum kommen aus `kampagne.csv`; fehlt diese Datei (ältere Exporte, Export einer einzelnen Aufnahme), wird der Name aus dem Dateinamen abgeleitet. Der Import läuft komplett in einer Datenbank-Transaktion: entweder er geht ganz durch, oder es bleibt gar nichts halb Importiertes zurück. Das ist praktisch, um eine Aufnahme auf einem anderen Gerät weiterzuführen oder ein Backup zurückzuspielen.

**Geplante Kampagne importieren (GPX)** ist für die Vorplanung am Rechner gedacht. Ihr setzt eure geplanten Bohrpunkte z.B. in QGIS oder einem GPS-Tool als Wegpunkte, exportiert sie als GPX und importiert die Datei. Die App legt eine neue Kampagne an und pro Wegpunkt eine leere Aufnahme mit bereits eingetragenen GPS- und UTM-Koordinaten sowie dem Wegpunktnamen. Im Feld müsst ihr dann nur noch die Punkte ablaufen — wobei euch „Standort verfolgen" und „Ort finden" von oben helfen. Gelesen werden ausschließlich `<wpt>`-Wegpunkte; Routen und Tracks werden ignoriert, Wegpunkte ohne brauchbare Koordinaten übersprungen.

### Humusberechnung

Die Humusberechnung basiert auf dem Diagramm nach Renger (1987). Die Linien wurden manuell digitalisiert und als Lookup-Table hinterlegt. Falls notwendig interpoliert die App zwischen den Punkten. Die Einordnung in Humusklassen erfolgt nach Tabelle C33 der KA6.

### Berechnung der KAK

Die Berechnung der KAK basiert noch auf zwei Tabellen der KA5. Das Berechnungsverfahren wird demnächst angepasst.

### Berechnung der Basensättigung/S-Wert

Die Berechnung der Basensättigung basiert auf einem Diagramm, das mithilfe von WebPlotDigitizer digitalisiert wurde. Die App interpoliert zwischen den Punkten des Lookup-Tables. Auch dies ist ein veralteter Prozess, der demnächst an die KA6 angepasst wird.

### Berechnung der Porenvolumen und Feldkapazitäten

Basiert auf den Tabellen B3, B6 und B9 der KA6. Die App interpoliert zwischen den Tabellenpunkten für die eingegebenen Bodeneigenschaften.

### Berechnung der Trockenrohdichten

Basiert auf Tabelle B2 der KA6.

### S-Wert im effektiven Wurzelraum (Profilsumme)

Wird in der Aufnahme unter „Automatisch berechnete Werte“ aus den Horizontdaten berechnet. Pro Horizont: KAK [cmolc/kg] × Basensättigung/100 × Trockenrohdichte [kg/dm³] × Mächtigkeit [dm], umgerechnet auf cmolc/m². Als Trockenrohdichte dient der Mittelwert der eingetragenen Klasse (z. B. 1,2–1,4 → 1,3). A-Horizonte gehen voll ein, alle anderen Horizonte mit dem Faktor 0,5. Summiert wird bis zur Tiefe des effektiven Wurzelraums; ein Horizont, der über diese Grenze reicht, wird anteilig abgeschnitten. Fehlen in einem Horizont innerhalb dieser Tiefe KAK, Basensättigung oder Trockenrohdichte oder haben die Tiefenangaben Lücken bzw. Überlappungen, wird „unvollständig“ angezeigt. Der Skelettanteil wird bisher nicht abgezogen. Die Summe wird in fünf Klassen von „sehr gering“ (<100 cmolc/m²) bis „sehr hoch“ (≥20 000 cmolc/m²) eingestuft.

### Bestimmung der Lagerungsdichte

Bestimmungsschlüssel für die Feldansprache der Lagerungsdichte nach KA5. Zuerst wird zwischen leichten Böden (Sand, Schluff, leichter Lehm) und schweren Böden (schwerer Lehm, Ton) unterschieden, danach nach dem Verhalten der Probe bei der Probenahme, beim Eindrücken eines Messers bzw. beim Aufprall und Zerdrücken. Ergebnis ist ein geschätzter Bereich der Lagerungsdichte in kg/dm³ mit den dafür typischen Gefügeformen. Für die Ansprache nach KA6 gibt es das Tool zur Packungsdichte.

### Bestimmung der Packungsdichteklassen

Basiert auf Tabelle C47 der KA6. Damit zusammenhängend werden auch die Tabellen C45, C39, C43, C38 und C41 verwendet.

### Bestimmung der Feinwurzeln

Basiert auf Tabelle C45 der KA6.

### Bestimmung der Gefügeform

Basiert auf Tabelle C38 der KA6.

### Bestimmung der Carbonatklassen

Basiert auf Tabelle C61 der KA6.

### Bestimmung der Bodenart

Basiert auf Tabelle C51 der KA6.

### Abschätzung des Tongehalts

Basiert auf Tabelle C51 der KA6. Diese Abschätzung ist recht grob und sollte angepasst werden.

### Bestimmung des Bodentyps

Basiert auf dem graphischen Bestimmungsschlüssel von Einar Eberhardt (Abb. C18 der KA6) sowie Tabelle C83.

### Bestimmung eines Anteils

Hat keine spezifische Entsprechung in der KA6, sondern lässt sich für verschiedene Anteile verwenden, z. B. Skelett, Grobporen etc. Der Bildschirm ist in ein Raster aus Quadraten aufgeteilt, die beim Scrollen in zufälliger Reihenfolge schwarz eingefärbt werden. Der Zähler zeigt den Anteil schwarzer Fläche in Prozent (0–100 %). Diesen Anteil vergleicht ihr visuell mit dem Anteil der Komponente in eurer Probe.

### Bestimmung der Bodenfarbe

Die Farbbestimmung erfolgt automatisch aus einem Foto, das die Bodenprobe zusammen mit einer neutralgrauen Graukarte zeigt. Der Ablauf gliedert sich in vier Schritte:

1. **Pixelauslese** — Die App liest die RGBA-Pixeldaten der beiden Messflächen pixelgenau mit Skia aus.

2. **Weißabgleich über Graukarte** — Aus dem oberen Teil des Graukarten-Rechtecks (60 % Bildbreite, 35 % Bildhöhe; bewusst so gewählt, dass er nicht mit dem Probenfeld überlappt) wird die mittlere Farbe berechnet. Alle Rechnungen laufen dabei im linearen Licht: Jeder sRGB-Wert wird vor dem Mitteln über die sRGB-Übertragungsfunktion linearisiert. Als Zielwert für die Graukarte dient der lineare Wert von sRGB 128 (mittleres Grau), pro Kanal ergibt sich also ein Korrekturfaktor von `linear(128) / gemessenem Wert`. Das kompensiert Farbstiche und Helligkeitsunterschiede durch wechselnde Lichtverhältnisse.

3. **Probenfarbe ermitteln und korrigieren** — Aus dem kleinen Probenfeld (16 % Bildbreite, 10 % Bildhöhe, unten mittig) wird ebenfalls die mittlere lineare Farbe bestimmt und jeder Kanal mit dem zugehörigen Korrekturfaktor multipliziert. Ausgewertet wird nur der Bildausschnitt, den ihr in der Vorschau seht, damit die Messflächen genau den weißen Hilfsrechtecken entsprechen.

4. **Munsell-Zuweisung** — Die korrigierte Farbe wird direkt aus dem linearen Licht in den CIE-L\*a\*b\*-Farbraum umgerechnet (lineares sRGB → XYZ mit D65-Weißpunkt → L\*a\*b\*). Danach sucht die App im vorberechneten [RIT-Munsell-Renotation-Datensatz](https://www.rit.edu/science/munsell-color-science-lab-educational-resources) den Eintrag mit dem kleinsten CIEDE2000-Farbabstand und gibt die zugehörige Munsell-Notation aus. Die Renotation-Daten beziehen sich auf Normlichtart C und wurden dafür vorab per Bradford-Transformation nach D65 umgerechnet; verwendet werden nur Chips, die im sRGB-Farbraum darstellbar sind. CIEDE2000 bildet die menschliche Farbwahrnehmung gerade bei den wenig gesättigten Bodenfarben deutlich besser ab als der einfache euklidische Abstand (CIE76).

## Entwicklung

Aufbau, Datenmodell und Konventionen stehen in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Die wichtigsten Befehle:

```bash
npm install
npm start           # Expo-Entwicklungsserver
npm run typecheck   # TypeScript
npm run lint        # ESLint + Prettier
npm test            # Unit-Tests
```

## Kontakt

sojlbodenkunde@gmail.com 