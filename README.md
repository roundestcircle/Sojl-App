# Sojl-App

Diese App ist ein Freizeitprojekt von mir. Sie dient der Bodenaufnahme im Feld nach der deutschen KA6. Mich hat aber das nasse Papier, die viel zu teure Farbtafel und die nervige Excelübetragung der Bodenaufnahmen in der Praxis genervt. Diese Problem will ich mit einer App lösen. 

Ich studiere irgendwas mit Boden im Bachelor, bin aber kein Experte und bestimmt kein Programmierer. Ich habe für die App viel Claude Code verwendet, aber so gut es geht überprüft dass der Code sinnvoll und die Ergebnisse korrekt sind. Dennnoch ist die App ein Prototyp und kann noch Fehler enthalten, die ich übersehen habe. Vielleicht hilft sie euch trotzdem schon in der Praxis. Sie ist kostenlos und Open Source, und soll das auch bleiben.  

## Download

Ladet euch die .apk unter releases herunter, und installiert sie auf eurem Android-Gerät. Wenn apkpure ihre Upload-Seite gefixed kriegen findet ihr sie auch dort.

Ich habe nicht vor, sie im iOS App-Store zu veröffentlichen.

## Funktionalität

Die App besteht aus mehreren Komponenten:

Die Hauptkomponente ist die Möglichkeit des Erstellens von Bodenaufnahmen und Feldkampagnen, Data Entry und dann dem Exportieren der aufgenommenen Daten als .csv Datei.

Aus dem Data Entry Formular können einige Bestimmungshilfen aufgerufen werden. Diese Bestimmungshilfen können auch unabhängig von einer spezifischen Aufnahme genutzt werden.

- Bestimmungshilfe zur Bodenfarbe mithilfe der Kamera und einer Greycard
- Bestimmungshilfe zum Anteil etwa von Skelett über Vergleichsbilder
- Bestimmungshilfen über Decisiontrees zu:
    - Carbonatgehalt
    - Bodenart
    - Bodentyp
    - Lagerungsdichte
    - Feinwurzeln
    - Gefüge
- Unvollständiges Horizontlexikon zur schnellen Recherche
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

**„Standort verfolgen"** ist der Schalter in der Kampagnenübersicht. Solange er aktiv ist, wird für jede Aufnahme mit Koordinaten laufend die Distanz zu eurer aktuellen Position berechnet und in der Liste angezeigt. Aufnahmen, die näher als 5 m sind, werden grün hervorgehoben. Das hilft vor allem beim Wiederfinden von Punkten einer geplanten Kampagne. Die Standortabfrage wird beim Ausschalten und beim Verlassen des Screens wieder beendet, damit sie nicht im Hintergrund weiterläuft.

### Import von Kampagnen

Es gibt zwei Importwege, beide über die Buttons auf dem Startbildschirm.

**Begonnene Kampagne importieren (ZIP)** ist das Gegenstück zum Export. Ihr wählt eine zuvor von der App exportierte ZIP-Datei aus (`aufnahmen.csv` + `horizonte.csv`), und die App baut daraus eine **neue** Kampagne mit allen Aufnahmen und Horizonten wieder auf. Status, Erstellungsdatum und Namen der Aufnahmen bleiben dabei erhalten. Der Kampagnenname wird aus dem Dateinamen abgeleitet. Der Import läuft komplett in einer Datenbank-Transaktion: entweder er geht ganz durch, oder es bleibt gar nichts halb Importiertes zurück. Das ist praktisch, um eine Aufnahme auf einem anderen Gerät weiterzuführen oder ein Backup zurückzuspielen.

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

Hat keine spezifische Entsprechung in der KA6, sondern lässt sich für verschiedene Anteile verwenden, z.B. Skelett, Grobporen etc.

### Bestimmung der Bodenfarbe

Die Farbbestimmung erfolgt vollautomatisch aus einem Foto, das die Bodenprobe zusammen mit einer 18 %-Graukarte zeigt. Der Ablauf gliedert sich in vier Schritte:

1. **Pixelauslese** — Die App liest die RGBA-Pixeldaten des Fotos pixelgenau mit Skia aus.

2. **Weißabgleich über Graukarte** — Aus dem mittleren Bereich der Graukarte (60 % Bildbreite, 35 % Bildhöhe) wird der mittlere RGB-Wert berechnet. Da eine 18 %-Graukarte theoretisch den Wert (128, 128, 128) haben sollte, ergibt sich pro Kanal ein Korrekturfaktor von `128 / gemessenem Wert`. Das kompensiert Farbstiche durch wechselnde Lichtverhältnisse.

3. **Probenfarbe ermitteln und korrigieren** — Aus dem kleinen Probenfeld (16 % Bildbreite, 10 % Bildhöhe, unten mittig) wird ebenfalls der mittlere RGB-Wert bestimmt. Anschließend wird jeder Kanal mit dem zugehörigen Korrekturfaktor multipliziert.

4. **Munsell-Zuweisung** — Der korrigierte RGB-Wert wird in den CIE-L\*a\*b\*-Farbraum umgerechnet (Gamma-Korrektur → lineares sRGB → XYZ mit D65-Weißpunkt → L\*a\*b\*). Danach sucht die App im vorberechneten [RIT-Munsell-Renotation-Datensatz](https://www.rit.edu/science/munsell-color-science-lab-educational-resources) den Eintrag mit dem kleinsten CIE76-ΔE-Abstand (euklidische Distanz im Lab-Raum) und gibt die zugehörige Munsell-Notation aus.

## Kontakt

sojlbodenkunde@gmail.com 