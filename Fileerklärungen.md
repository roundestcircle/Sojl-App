# OpenSoil – Dateiübersicht

Kurze Zusammenfassung aller Quelldateien des Projekts.

---

## Konfiguration

### `app.json`
Expo-Projektkonfiguration. Definiert App-Name (`bachelorproject`), Version, Icons, Splash-Screen, und Plugins: `expo-router`, `expo-location` (mit deutschem Berechtigungstext), `expo-camera`, `expo-font`, `expo-image`. Aktiviert `typedRoutes` und den React Compiler unter `experiments`.

### `tsconfig.json`
TypeScript-Konfiguration. Erweitert `expo/tsconfig.base`, aktiviert `strict`-Modus und mappt den Alias `@/*` auf das Projektstamm­verzeichnis. Erlaubt `esModuleInterop` und `allowSyntheticDefaultImports`.

### `package.json`
Abhängigkeiten und NPM-Skripte. Wichtigste Dependencies: `expo`, `expo-router`, `expo-sqlite`, `expo-camera`, `expo-location`, `expo-sharing`, `expo-file-system` (v18), `@shopify/react-native-skia`, `react-hook-form`, `papaparse`, `@react-native-async-storage/async-storage`. Dev-Dependencies: TypeScript 5.9, ESLint mit Expo-Config, `@types/papaparse`.

---

## Styles

### `styles/colors.ts`
Definiert zwei globale Farben: `primary: '#145600'` (dunkelgrün) und `brown: '#b45f06'`. Wird von nahezu allen Screens und Komponenten importiert.

### `styles/styles.ts`
Globales `StyleSheet`-Objekt mit wiederverwendbaren Stilen:
- `container` – Zentriertes Flex-Layout für normale Screens.
- `containerfull` – Vollflächen-Wrapper ohne Zentrierung.
- `button` – Weißer Button mit grünem Rahmen (borderWidth 5, borderRadius 10, borderColor primary).
- `maintext` – Fett, 18 px, dunkelgrau.
- `cameraContainer`, `labelContainer`, `label` – Für den Kamera-/Anteil-Screen.
- `modalOverlay`, `modalContent`, `modalTitle`, `modalText`, `checkboxContainer`, `checkbox*`, `modalButton*`, `resetButton*` – Vollständiges Style-Set für Instruction-Modals.

---

## App-Screens (`app/`)

### `app/_layout.tsx`
Wurzel-Stack-Navigator der gesamten App. Ruft `initDatabase()` beim Start auf. Legt ein dunkles Grün als globale Header-Farbe fest. Das `mapping`-Segment erhält `headerShown: false`, damit der innere Stack seinen eigenen Header zeigen kann ohne doppelten Header.

### `app/index.tsx`
Startbildschirm. Enthält Navigations-Buttons zu den Hauptfunktionen: Kartierung (`/mapping`), Bodenart (`/soiltexture`), Bodenfarbe (`/soilcolor`), Anteil (`/soilshare`) und Über die App (`/about`).

### `app/+not-found.tsx`
404-Fallback-Screen mit Link zurück zur Startseite. Wird von Expo Router automatisch angezeigt, wenn keine Route übereinstimmt.

### `app/about.tsx`
Statischer Infoscreen über das Bachelorprojekt. Zeigt GitHub-Link und Kontakt-E-Mail.

### `app/soilcolor.tsx`
Dünner Wrapper, der `PictureTakerScreen` in einem Fullscreen-Container rendert. Kein eigener Zustand.

### `app/soiltexture.tsx`
Dünner Wrapper für `TexTreeScreen`. Kein eigener Zustand.

### `app/soilshare.tsx`
Wrapper für `SoilShareScroll`. Setzt den Navigations-Titel via `useLayoutEffect` auf "Anteil".

---

## Kartierungs-Screens (`app/mapping/`)

### `app/mapping/_layout.tsx`
Innerer Stack-Navigator für alle Kartierungs-Routen. Registriert: `index`, `session/[sessionId]`, `soilmapping`, `[id]/HorizonOverview`, `[id]/horizon/[nr]`. Zeigt eigene Header, da der Root-Navigator `headerShown: false` setzt.

### `app/mapping/index.tsx`
Feldkampagnen-Listenscreen. Zeigt alle vorhandenen Kampagnen in einer `FlatList`; langer Druck löscht eine Kampagne (mit Bestätigungsdialog). Der "Neue Kampagne"-Button öffnet ein `Modal` mit einem `TextInput` für den Kampagnennamen – keyboard-sicher über `KeyboardAvoidingView` innerhalb des Modals. Nach dem Erstellen wird zu `/mapping/session/[id]` navigiert.

### `app/mapping/session/[sessionId].tsx`
Session-Detailscreen. Listet alle Aufnahmen der Kampagne mit Horizontanzahl, Status-Badge (offen/abgeschlossen) und einem CSV-Export-Button je Zeile. "Neue Aufnahme" navigiert zu `soilmapping` mit `?sessionId=` als Query-Parameter.

### `app/mapping/soilmapping.tsx`
Horizont-Anzahl-Picker für eine neue Aufnahme. Liest `sessionId` aus Query-Parametern, erstellt via `createAufnahme(anzahl, sessionId)` eine neue Aufnahme mit leeren Horizonten und navigiert zur HorizonOverview.

### `app/mapping/[id]/HorizonOverview.tsx`
Zentraler Mapping-Screen. Enthält:
- **Standortdaten**: GPS-Button ("GPS automatisch bestimmen" via `expo-location`), UTM-Easting/Northing-Eingabefelder, Zonenbezeichnung, Notizen-Feld. GPS konvertiert WGS84 → UTM zur Anzeige; beim Speichern wird UTM → WGS84 zurückkonvertiert für die DB.
- **Horizont-Raster**: Grid aus `HorizontButton`-Komponenten, navigiert bei Druck zu `horizon/[nr]`.
- **Abschließen-Button**: Speichert Standortdaten, schließt die Aufnahme ab, navigiert zurück zur Session-Detailseite.

### `app/mapping/[id]/horizon/[nr].tsx`
Einzelner Horizont-Formularscreen. Lädt per `useFocusEffect` die Horizont-Daten aus SQLite, rendert `HorizontFormular` und speichert beim Submit via `saveHorizont` (inkl. `horizontname`).

---

## Komponenten (`components/`)

### `components/HorizonButton.tsx`
Klickbarer Button für einen einzelnen Horizont. Die Hintergrundfarbe spiegelt den Status wider:
- `leer` → grau
- `angefangen` → amber
- `vollstaendig` → grün

Zeigt `H{nummer} – {horizontname}` (oder nur `H{nummer}` wenn kein Name). Stil entspricht `styles.button` (borderRadius 10, borderWidth 5, borderColor primary).

### `components/HorizonForm.tsx`
React-Hook-Form-Formular für einen einzelnen Horizont. Felder: Horizontname, Tiefe Von/Bis, Bodenart (Platzhalter-TextInput), Anteil (Platzhalter-TextInput), Notizen (mehrzeilig). Der Typ `HorizontFormData` umfasst `horizontname`, `farbe`, `bodenart`, `anteil`, `notizen`, `tiefe_oben`, `tiefe_unten`. Farbe und Bodenart sind als Platzhalter markiert (TODO: durch spezialisierte Felder ersetzen).

### `components/ColorPicker.tsx`
Enthält `extractSoilColor` – Kernfunktion der Farbanalyse. Verwendet Skia, um Bildpixel zu lesen. Probiert einen Graukarten-Bereich (Mitte 60×35 % des Bildes) und einen Bodenproben-Bereich (unten Mitte 16×10 %). Berechnet Korrekturfaktoren (Zielwert 128 für 18 %-Graukarte), wendet diese auf die Bodenfarbe an und konvertiert anschließend zu Munsell.

### `components/ColorPickerField.tsx`
Leere Datei (Platzhalter für zukünftige Integration als React-Hook-Form-Feld-Komponente).

### `components/TexTreeField.tsx`
Leere Datei (Platzhalter für zukünftige Integration des Textur-Entscheidungsbaums als Formularfeld).

### `components/SoilShareField.tsx`
Leere Datei (Platzhalter für zukünftige Integration der Anteil-Visualisierung als Formularfeld).

### `components/InstructionModal.tsx`
Wiederverwendbares Modal für Erstnutzer-Anleitungen. Speichert "Nicht mehr anzeigen"-Präferenz in `AsyncStorage` (Schlüssel per `storageKey`-Prop). Exportiert zusätzlich `ResetInstructionButton`, der das AsyncStorage-Flag löscht und so das Modal zurücksetzt.

### `components/PictureTakerScreen.tsx`
Kamera-Screen für die Bodenfarb-Analyse. Zwei Zustände:
1. **Kamera-Ansicht**: Live-Vorschau mit Overlay-Rechtecken, die Position von Graukarte (groß) und Bodenprobe (klein) anzeigen. Button "Foto aufnehmen".
2. **Foto-Review**: Zeigt das aufgenommene Bild mit Overlays. Button "Farbe bestimmen" ruft `extractSoilColor` auf und zeigt RGB + Munsell. Button "Neues Foto aufnehmen" setzt zurück.

Verwaltet Kamera-Berechtigung (expo-camera), Lade-Zustand während der Farb­extraktion und ein zurücksetzbares `InstructionModal`.

### `components/SoilShareScroll.tsx`
Visueller Anteil-Schätzer. Rendert ein Skia-Canvas mit bis zu 1000 schwarzen Quadraten in einem zufällig gemischten Grid (deterministisch per Seed 42 und Fisher-Yates). Eine unsichtbare `ScrollView` (5× Bildschirmhöhe) liegt darüber; ihr Scroll-Fortschritt (0–100 %) bestimmt, wie viele Quadrate sichtbar sind. Zeigt den Prozentwert zentriert. Zeigt `InstructionModal` beim ersten Aufruf.

### `components/TexTreeScreen.tsx`
Interaktiver Entscheidungsbaum zur Bodenart-Bestimmung. Navigiert durch `SoilTexTree` per Ja/Nein-Buttons, speichert den Pfad in einem History-Stack für Zurück-Navigation. Am Ergebnis-Knoten wird die Bodenart als grüne Karte angezeigt; danach erscheint ein "Neu Starten"-Button. Zeigt `InstructionModal` beim ersten Aufruf.

---

## Hilfsfunktionen (`utils/`)

### `utils/db.ts`
Öffnet die SQLite-Datenbank (`bodenaufnahme.db`). `initDatabase()` erstellt drei Tabellen:
- `feldkampagnen` (id, name, erstellt_am)
- `aufnahmen` (id, feldkampagne_id, erstellt_am, gps_lat, gps_lon, notizen, status)
- `horizonte` (id, aufnahme_id, nummer, farbe_munsell, farbe_rgb, bodenart, anteil, notizen, status)

Enthält zwei ALTER-TABLE-Migrationen (mit try/catch): `feldkampagne_id` zu `aufnahmen` und `horizontname` zu `horizonte`.

### `utils/FeldkampagneQueries.ts`
CRUD für die `feldkampagnen`-Tabelle:
- `createFeldkampagne(name)` → neue ID
- `getAllFeldkampagnen()` → alle, neueste zuerst
- `getFeldkampagne(id)` → Einzeldatensatz
- `getAufnahmenForFeldkampagne(sessionId)` → alle zugehörigen Aufnahmen
- `deleteFeldkampagne(id)` → löscht per CASCADE auch alle Aufnahmen und Horizonte

### `utils/MappingQueries.ts`
CRUD für die `aufnahmen`-Tabelle. Typ `Aufnahme` hat `feldkampagne_id: number | null`. Wichtige Funktionen:
- `createAufnahme(anzahlHorizonte, feldkampagneId)` – legt Aufnahme + n leere Horizonte an
- `getAufnahme(id)`, `getAllAufnahmen()`
- `saveAufnahmeDetails(id, {gps_lat, gps_lon, notizen})` – Standortdaten
- `closeAufnahme(id)` / `reopenAufnahme(id)` – Status-Steuerung

### `utils/HorizonQueries.ts`
CRUD für die `horizonte`-Tabelle. Typ `Horizont` umfasst `horizontname: string | null`. `saveHorizont` aktualisiert alle Felder inkl. `horizontname`. Status wird automatisch abgeleitet: `vollstaendig` wenn `farbe_munsell` und `bodenart` beide belegt, sonst `angefangen`.

### `utils/csvExport.ts`
`exportAufnahmeAsCSV(aufnahme)`: Lädt alle Horizonte der Aufnahme, baut CSV-Zeilen (eine je Horizont) mit Metadaten (GPS, Datum), schreibt die Datei in den App-Cache via `expo-file-system` v18 (`new File(Paths.cache, filename)`, `file.write(csv)`) und öffnet das native Share-Sheet via `expo-sharing`.

### `utils/utmConversion.ts`
Bidirektionale WGS84 ↔ UTM-Konvertierung (Transversale Mercator-Projektion, WGS84-Ellipsoid):
- `latLonToUTM(lat, lon)` → `{ easting, northing, zone, hemisphere, label }`
- `utmToLatLon(easting, northing, zone, hemisphere)` → `{ lat, lon }`

Verwendet Standard-TM-Formeln mit den Konstanten a, f, k0 des WGS84-Ellipsoids.

### `utils/SoilTexTree.ts`
Statische Datenstruktur des Bodenart-Entscheidungsbaums. Enthält Fragen und Antwort­optionen (mit `next`-Verweisen auf Folgeknoten) sowie Ergebnis­knoten mit `title` und `description`. Wird von `TexTreeScreen` traversiert.

### `utils/soilColorExtractor.ts`
Koordiniert die Bildanalyse für die Bodenfarbe. Lädt das Bild mit Skia, liest Pixeldaten, berechnet per `extractColorFromRegion` Durchschnittsfarben für Graukarten- und Bodenprobenbereich, leitet Korrekturfaktoren ab (Ziel: RGB 128 für 18 %-Graukarte), wendet diese an und ruft `rgbToMunsell` für die Munsell-Notation auf.

### `utils/munsellLookup.ts`
RGB-zu-Munsell-Konvertierung per Delta-E-Farbabstand. Konvertiert RGB → CIE Lab (mit Gamma-Korrektur und D65-Weißpunkt), sucht dann im `MUNSELL_DATA`-Datensatz den ähnlichsten Eintrag per euklidischem Lab-Abstand und gibt die Munsell-Notation zurück.

### `utils/munsellData.ts`
Großes statisches Datenarray mit dem RIT Munsell Renotation Dataset: jeweils RGB-Werte und die zugehörige Munsell-Notation. Wird ausschließlich von `munsellLookup.ts` importiert.

### `utils/MappingMaths.ts`
Leere Datei (Platzhalter für zukünftige Kartierungs-Berechnungsfunktionen).
