# OpenSoil – Dateiübersicht

Kurze Zusammenfassung aller Quelldateien des Projekts.

---

## Konfiguration

### `app.json`
Expo-Projektkonfiguration. Definiert App-Name (`bachelorproject`), Version, Icons, Splash-Screen, und Plugins: `expo-router`, `expo-location` (mit deutschem Berechtigungstext), `expo-camera`, `expo-font`, `expo-image`. Aktiviert `typedRoutes` und den React Compiler unter `experiments`.

### `tsconfig.json`
TypeScript-Konfiguration. Erweitert `expo/tsconfig.base`, aktiviert `strict`-Modus und mappt den Alias `@/*` auf das Projektstamm­verzeichnis. Erlaubt `esModuleInterop` und `allowSyntheticDefaultImports`.

### `package.json`
Abhängigkeiten und NPM-Skripte. Wichtigste Dependencies: `expo`, `expo-router`, `expo-sqlite`, `expo-camera`, `expo-location`, `expo-sharing`, `expo-file-system`, `@shopify/react-native-skia`, `react-hook-form`, `papaparse`, `jszip`, `@react-native-async-storage/async-storage`. Dev-Dependencies: TypeScript 5.9, ESLint mit Expo-Config, `@types/papaparse`, `@types/jszip`.

---

## Styles

### `styles/colors.ts`
Definiert zwei globale Farben: `primary: '#145600'` (dunkelgrün) und `brown: '#b45f06'`. Wird von nahezu allen Screens und Komponenten importiert.

### `styles/styles.ts`
Globales `StyleSheet`-Objekt mit wiederverwendbaren Stilen:
- `container` – Zentriertes Flex-Layout für normale Screens.
- `containerfull` – Vollflächen-Wrapper ohne Zentrierung.
- `button` – Weißer Button mit grünem Rahmen (borderWidth 3, borderRadius 10, borderColor primary, width 100%).
- `actionButton` / `actionButtonText` – Gefüllter grüner Button (backgroundColor primary, borderRadius 8) ohne feste Breite; wird für Aktions-Buttons wie "GPS bestimmen", "Horizont hinzufügen" etc. verwendet.
- `maintext` – Fett, 18 px, dunkelgrau.
- `cameraContainer`, `labelContainer`, `label` – Für den Kamera-/Anteil-Screen.
- `modalOverlay`, `modalContent`, `modalTitle`, `modalText`, `checkboxContainer`, `checkbox*`, `modalButton*`, `resetButton*` – Vollständiges Style-Set für Modals.
- Formular-Stile: `input`, `sectionTitle`, `fieldLabel`, `section`, `formRow`, `halfField`, `emptyText`, `list`, `rowTitle`, `rowSub`.

---

## App-Screens (`app/`)

### `app/_layout.tsx`
Wurzel-Stack-Navigator der gesamten App. Ruft `initDatabase()` beim Start auf. Legt dunkles Grün als globale Header-Farbe fest. Zeigt auf allen Screens (außer Home) ein Haus-Icon (`Ionicons "home"`) als `headerRight`, das per `router.replace('/')` zur Startseite navigiert. Das `mapping`-Segment erhält `headerShown: false`, damit der innere Stack seinen eigenen Header zeigt.

### `app/index.tsx`
Startbildschirm. Enthält Navigations-Buttons zu den Hauptfunktionen: Kartierung (`/mapping`), Bodenart (`/tools/bodenart`), Bodenfarbe (`/soilcolor`), Anteil (`/tools/anteil`) und Über die App (`/about`). Fußzeile zeigt App-Icon und Versionsnummer (dynamisch aus `app.json` via `expo-constants`).

### `app/+not-found.tsx`
404-Fallback-Screen mit Link zurück zur Startseite. Wird von Expo Router automatisch angezeigt, wenn keine Route übereinstimmt.

### `app/about.tsx`
Statischer Infoscreen über das Bachelorprojekt. Zeigt GitHub-Link und Kontakt-E-Mail.

### `app/soilcolor.tsx`
Dünner Wrapper, der `PictureTaker` in einem Fullscreen-Container rendert. Kein eigener Zustand.

---

## Kartierungs-Screens (`app/mapping/`)

### `app/mapping/_layout.tsx`
Innerer Stack-Navigator für alle Kartierungs-Routen. Registriert: `index`, `kampagne/[kampagneId]/index`, `[aufnahmeId]/index`, `[aufnahmeId]/standort`, `[aufnahmeId]/horizon/[nr]`. Zeigt eigene Header mit Haus-Icon (`headerRight`) auf allen Screens. Der Root-Navigator setzt `headerShown: false` für das `mapping`-Segment.

### `app/mapping/index.tsx`
Feldkampagnen-Listenscreen. Zeigt alle vorhandenen Kampagnen in einer `FlatList` mit Status-Badge (`offen`/`abgeschlossen`) je Zeile via `StatusBadge`; langer Druck öffnet ein styled Modal zur Bestätigung des Löschvorgangs (rot/grau gestapelte Buttons). "Neue Kampagne"-Button öffnet ein `Modal` mit `TextInput` für den Namen – keyboard-sicher über `KeyboardAvoidingView`. Nach dem Erstellen wird zu `kampagne/[id]` navigiert. Zeigt beim ersten Aufruf ein `InstructionModal` mit Erklärung des Kartierungsworkflows.

### `app/mapping/kampagne/[kampagneId]/index.tsx`
Kampagnen-Detailscreen. Setzt den Header-Titel dynamisch auf den Kampagnennamen via `useLayoutEffect`. Listet alle Aufnahmen mit kampagnen-lokalem Nummer (`Aufnahme {nummer}`), Horizontanzahl, Status-Badge (`StatusBadge`, offen/abgeschlossen) und ZIP-Export-Button je Zeile. Langer Druck öffnet ein Lösch-Modal. "Kampagne beenden" prüft, ob noch offene Aufnahmen vorhanden sind; falls ja, erscheint ein Warn-Modal mit "Trotzdem beenden"-Option, andernfalls wird die Kampagne direkt per `closeFeldkampagne()` abgeschlossen und zu `/mapping` navigiert. Unten: "Neue Aufnahme", "Kampagne beenden", "Kampagne exportieren (ZIP)".

### `app/mapping/[aufnahmeId]/index.tsx`
Zentraler Aufnahme-Screen. Setzt den Header-Titel dynamisch auf `Aufnahme {nummer}`. Enthält:
- **Standortdaten-Button**: Gleiche Optik wie `HorizonButton` (Rahmen, Badge). Status-Badge leitet sich aus dem Füllstand der Aufnahme ab: `leer` (nichts ausgefüllt) → grau, `begonnen` (teilweise) → amber, `abgeschlossen` (alle 14 Profilfelder + GPS ausgefüllt) → grün. Navigiert zu `[aufnahmeId]/standort`.
- **Horizont-Liste**: Vertikale Liste aus `HorizontButton`-Komponenten. "+ Horizont hinzufügen"-Button fügt einen neuen leeren Horizont an.
- **Abschließen-Button**: Markiert die Aufnahme als abgeschlossen und navigiert zurück zur Kampagne. Bei unvollständigen Horizonten öffnet sich ein Bestätigungs-Modal.

### `app/mapping/[aufnahmeId]/standort.tsx`
Screen für das Standortdaten-Formular einer Aufnahme. Lädt per `useFocusEffect` die Aufnahme-Daten aus SQLite, rendert `AufnahmeForm` in einer `ScrollView` und speichert auto-saves auf jede Änderung.

### `app/mapping/[aufnahmeId]/horizon/[nr].tsx`
Einzelner Horizont-Formularscreen. Setzt den Header-Titel auf `Horizont {nummer}` via `useLayoutEffect`. Lädt per `useFocusEffect` die Horizont-Daten aus SQLite, rendert `HorizontFormular` und speichert auto-saves auf jede Änderung via `saveHorizont`.

---

## Kartierungsunterstützungs-Screens (`app/tools/`)

### `app/tools/_layout.tsx`
Innerer Stack-Navigator für alle Kartierungsunterstützungs-Tools. Registriert alle Tool-Screens mit deutschen Titeln: `bodenart`, `bodentyp`, `anteil`, `humusgehalt`, `carbonat`, `lagerungsdichte`, `feinwurzeln`, `gefuege`, `horizonte`. Zeigt Haus-Icon als `headerRight`. `gefuegestabilitaet` und `pflanzenreste` wurden entfernt.

### `app/tools/index.tsx`
Übersichtsscreen der verfügbaren Kartierungstools. Links zu: Horizontlexikon, Bodenart bestimmen, Bodentyp bestimmen, Anteil schätzen, Humusgehalt bestimmen, Carbonatgehalt bestimmen, **Lagerungsdichte bestimmen**, Feinwurzeln bestimmen, Gefüge bestimmen. Gefügestabilität und Pflanzenreste wurden entfernt.

### `app/tools/bodenart.tsx`
Dünner Wrapper für `TexTree`. Kein eigener Zustand.

### `app/tools/bodentyp.tsx`
Dünner Wrapper für `BodenTypTool`. Kein eigener Zustand.

### `app/tools/anteil.tsx`
Wrapper für `SoilShareScroll` mit `paddingHorizontal: 20`.

### `app/tools/humusgehalt.tsx`
Wrapper für `HumusgehaltTool`. Kein eigener Zustand, kein `onConfirm` (standalone-Nutzung).

### `app/tools/carbonat.tsx`
Wrapper für `CarbonatTool`.

### `app/tools/lagerungsdichte.tsx`
Wrapper für `LagerungsdichteTool`. Ersetzt den früheren `pflanzenreste.tsx`-Screen.

### `app/tools/feinwurzeln.tsx`
Wrapper für `FeinwurzelnTool`.

### `app/tools/gefuege.tsx`
Wrapper für `GefuegeTool`.

---

## Komponenten (`components/`)

### `components/DecisionTree.tsx`
Generische, wiederverwendbare Entscheidungsbaum-Komponente. Enthält die gesamte Navigationslogik (History-Stack, Zurück, Neu starten). Props: `tree` (DecisionTreeData), `onConfirm` (optional), `instructionText`, `storageKey`. Zeigt an Ergebnis-Knoten: grüne Ergebniskarte, "Wert übernehmen"- und "Neu Starten"-Button. Zeigt optionalen `hint`-Text (kleiner, grau) unterhalb der Frage. Rendert `InstructionModal` beim ersten Aufruf und `ResetInstructionButton` am unteren Rand. Layout: Frage im Normalfluss (`marginBottom: 16`), Optionen darunter — verhindert Kollision mit Zurück-/Instruktions-Buttons.

### `components/TexTree.tsx`
Dünner Wrapper um `DecisionTree` mit `SoilTexTree`-Daten. Akzeptiert optionalen `onConfirm`-Prop.

### `components/BodenTypTool.tsx`
Dünner Wrapper um `DecisionTree` mit `BodenTypTree`-Daten für die Bodentyp-Bestimmung. Akzeptiert optionalen `onConfirm`-Prop.

### `components/GefuegeTool.tsx`
Dünner Wrapper um `DecisionTree` mit `GefuegeFormTree`-Daten für die Gefüge-Bestimmung. Akzeptiert optionalen `onConfirm`-Prop.

### `components/CarbonatTool.tsx`
Dünner Wrapper um `DecisionTree` mit `KarbonatGehaltTree`-Daten für die Carbonatgehalt-Bestimmung. Akzeptiert optionalen `onConfirm`-Prop.

### `components/FeinwurzelnTool.tsx`
Dünner Wrapper um `DecisionTree` mit `FeinwurzelIntensityTree`-Daten für die Feinwurzel-Intensitätsbestimmung. Akzeptiert optionalen `onConfirm`-Prop.

### `components/LagerungsdichteTool.tsx`
Dünner Wrapper um `DecisionTree` mit `LagerungsdichteTree`-Daten für die Lagerungsdichte-Bestimmung. Akzeptiert optionalen `onConfirm`-Prop. Ersetzt das frühere `PflanzenresteTool` vollständig.

### `components/HumusgehaltTool.tsx`
Interaktives Berechnungstool für den Humusgehalt nach Renger et al. (1987). Eingaben: Munsell-Chroma (3-Button-Auswahl: hoch/mittel/niedrig), Munsell-Value, Bodenart (mit "Ton abschätzen"-Button → `bodenartToClay()`), Tongehalt (%), pH (CaCl₂). Ergebnis wird live per `useMemo` mit trilinearer Interpolation aus `utils/renger1987.ts` berechnet. Props: `onConfirm(klasse, pct)` (optional), `initialFarbeMunsell`, `initialPH`, `initialBodenart` (Pre-fill aus HorizonForm). Bestätigen übergibt Klasse (h1–h6) und Prozentwert getrennt.

### `components/StatusBadge.tsx`
Wiederverwendbare Status-Badge-Komponente. Nimmt `status: "offen" | "abgeschlossen"` und rendert eine farbige Pill (amber für offen, primary-Grün für abgeschlossen). Wird in der Kampagnenliste und der Aufnahmeliste verwendet.

### `components/HorizonButton.tsx`
Klickbarer Button für einen einzelnen Horizont. Zeilenlayout (weiß, volle Breite, borderWidth 3) mit rechtsbündigem Status-Badge:
- `leer` → grau (#6c757d)
- `angefangen` → amber (#e0a020)
- `vollstaendig` → grün (primary)

Zeigt `H{nummer} – {horizontname}` (oder nur `H{nummer}` wenn kein Name).

### `components/HorizonForm.tsx`
React-Hook-Form-Formular für einen einzelnen Horizont. Auto-speichert auf jede Feldänderung via `watch`-Subscription. Alle Felder mit Tool-Button verwenden `Controller` (reaktiver `value`-Prop), damit Werte aus Tool-Modals sofort im Feld erscheinen. `activeModal`-State steuert, welches der parallelen (nicht verschachtelten) Modals geöffnet ist.

Felder in Sektionen:
- **Horizontname**: Freies Textfeld mit Horizontlexikon-Button (öffnet `HorizontLexikonContent`-Modal).
- **Bodenfarbe (Munsell)**: Ganz oben — Texteingabe + "Farbe bestimmen"-Button → PictureTaker-Modal. Pre-filled per `watch('farbe_munsell')` für den HumusgehaltTool.
- **Tiefe Von/Bis** (cm).
- **Bodenart / Textur**: Texteingabe + "bestimmen"-Button → TexTree-Modal.
- **Skelettanteil**: Texteingabe (mit `%`-Suffix, rein visuell) + "bestimmen"-Button → SoilShareScroll-Modal.
- **Bodeneigenschaften**: pH (CaCl₂), Mächtigkeit (dm), Humusgehalt (zwei Felder: Kürzel `h1`–`h6` + Prozentwert mit `%`-Suffix, beide per HumusgehaltTool befüllbar), Carbonatgehalt (+CarbonatTool), Lagerungsdichte (+LagerungsdichteTool), Feinwurzeln (+FeinwurzelnTool), Lagerungsart, Gefüge (+GefuegeTool).
- **Notizen**: Mehrzeiliges Textfeld.

Jedes Tool-Modal hat einen "Schließen"-Header-Button und wird in `SafeAreaView` eingebettet. `Gefügestabilität` und `Pflanzenreste` wurden entfernt.

### `components/AufnahmeForm.tsx`
React-Hook-Form-Formular für alle Standortdaten einer Aufnahme. Auto-speichert auf jede Änderung via `watch`-Subscription. Felder in Sektionen:
- **Standortdaten**: GPS automatisch bestimmen (Button unterhalb der Koordinatenfelder); UTM (Easting, Northing, Zone) oder Dezimalgrad (Breite, Länge) – umschaltbar. Speichert beide Formate gleichzeitig in die DB. Verwendet `modeRef` gegen stale-closure-Probleme.
- **Profil**: Bodentyp + Abk. (mit "Bodentyp bestimmen"-Button → BodenTypTool-Modal), Humusform + Abk., Ausgangsgestein, Gründigkeit (cm), Höhe (m ü. NN).
- **Standorteigenschaften**: Reliefposition, Exposition, Nutzung, Vegetation – alle vier als `DropdownField`.
- **Klimadaten**: Witterung (Dropdown), Mittl. Niederschlag (mm), Mittl. Temperatur (°C).
- **Notizen**: Mehrzeiliges Textfeld.

### `components/DropdownField.tsx`
Wiederverwendbares Dropdown-Eingabefeld. Zeigt den aktuellen Wert als Button (im `styles.input`-Look); bei Antippen öffnet sich ein zentriertes Modal mit einer `FlatList` der Optionen. Ausgewählte Option wird hervorgehoben; erneutes Antippen derselben Option hebt die Auswahl auf.

### `components/InstructionModal.tsx`
Wiederverwendbares Modal für Erstnutzer-Anleitungen. Speichert "Nicht mehr anzeigen"-Präferenz in `AsyncStorage` (Schlüssel per `storageKey`-Prop). Exportiert zusätzlich `ResetInstructionButton`, der das AsyncStorage-Flag löscht und so das Modal zurücksetzt.

### `components/PictureTaker.tsx`
Kamera-Screen für die Bodenfarb-Analyse. Akzeptiert optionalen `onConfirm`-Prop (wird nur angezeigt, wenn aus `HorizonForm` geöffnet). Zwei Zustände:
1. **Kamera-Ansicht**: Live-Vorschau mit Overlay-Rechtecken für Graukarte (groß) und Bodenprobe (klein). Button "Foto aufnehmen".
2. **Foto-Review**: Zeigt Bild mit Overlays, RGB + Munsell nach Analyse. "Wert übernehmen"-Button übergibt Munsell-String an `onConfirm`. "Neues Foto aufnehmen" setzt zurück.

Verwaltet Kamera-Berechtigung, Lade-Zustand und `InstructionModal`.

### `components/SoilShareScroll.tsx`
Visueller Anteil-Schätzer. Akzeptiert optionalen `onConfirm`-Prop. Rendert ein Skia-Canvas mit bis zu 1000 schwarzen Quadraten (deterministisch per Seed 42, Fisher-Yates-Shuffle). Eine unsichtbare `ScrollView` (5× Bildschirmhöhe) steuert den Prozentsatz (0–100 %). "Wert übernehmen"-Button am unteren Rand übergibt den Prozentwert. Zeigt `InstructionModal` beim ersten Aufruf.

---

## Hilfsfunktionen (`utils/`)

### `utils/db.ts`
Öffnet die SQLite-Datenbank (`bodenaufnahme.db`). `initDatabase()` erstellt drei Tabellen:
- `feldkampagnen` (id, name, erstellt_am, status)
- `aufnahmen` (id, feldkampagne_id, erstellt_am, gps_lat, gps_lon, notizen, status)
- `horizonte` (id, aufnahme_id, nummer, farbe_munsell, farbe_rgb, bodenart, anteil, notizen, status)

Enthält ALTER-TABLE-Migrationen (try/catch, sicher bei Wiederholung) für:
- `horizonte`: `horizontname`, `tiefe_oben`, `tiefe_unten`, `ph_cacl2`, `humus`, `humus_pct`, `carbonat`, `lagerungsdichte`, `feinwurzeln`, `lagerungsart`, `maechtigk_dm` — sowie ein `RENAME COLUMN pflanzenreste TO lagerungsdichte` für bestehende Installationen.
- `aufnahmen`: `feldkampagne_id`, `utm_easting`, `utm_northing`, `utm_zone`, `nummer`, `bodentyp`, `bodtyp_abk`, `humusform`, `humsfrm_abk`, `m_ue_nn`, `witterung`, `mittl_n`, `mittl_temp`, `nutzung`, `vegetation`, `reliefpos`, `expos`, `ausgangsgestein`, `grundigkeit`
- `feldkampagnen`: `status`

`trennbarkeit` und `pflanzenreste` wurden aus der Spaltenstruktur entfernt; `gefuegestabilitaet` wurde nie hinzugefügt.

### `utils/DecisionTreeTypes.ts`
Gemeinsame TypeScript-Typen für alle Entscheidungsbäume:
- `TreeOption` – `{ text, next }`
- `InnerNode` – `{ id, question, hint?, options[] }` (`hint` optional, wird als kleinerer grauer Text unterhalb der Frage angezeigt)
- `ResultNode` – `{ id, question, result: { title, description } }`
- `TreeNode` – Union aus `InnerNode | ResultNode`
- `DecisionTreeData` – `InnerNode & { nodes: Record<string, TreeNode> }` (Wurzelknoten mit vollständiger Knotenmap)

### `utils/FeldkampagneQueries.ts`
CRUD für die `feldkampagnen`-Tabelle. Typ `Feldkampagne` enthält: `id`, `name`, `erstellt_am`, `status` (`"offen" | "abgeschlossen"`). Funktionen:
- `createFeldkampagne(name)` → neue ID
- `getAllFeldkampagnen()` → alle, neueste zuerst
- `getFeldkampagne(id)` → Einzeldatensatz
- `getAufnahmenForFeldkampagne(sessionId)` → alle zugehörigen Aufnahmen
- `closeFeldkampagne(id)` → setzt Status auf `'abgeschlossen'`
- `deleteFeldkampagne(id)` → löscht per CASCADE auch alle Aufnahmen und Horizonte

### `utils/MappingQueries.ts`
CRUD für die `aufnahmen`-Tabelle. Typ `Aufnahme` enthält: `id`, `nummer`, `feldkampagne_id`, `erstellt_am`, `status`, GPS-Felder (`gps_lat`, `gps_lon`, `utm_easting`, `utm_northing`, `utm_zone`), Profilfelder (`bodentyp`, `bodtyp_abk`, `humusform`, `humsfrm_abk`, `ausgangsgestein`, `grundigkeit`, `m_ue_nn`), Standortfelder (`reliefpos`, `expos`, `nutzung`, `vegetation`), Klimafelder (`witterung`, `mittl_n`, `mittl_temp`), `notizen`. `AufnahmeDetails` ist ein Pick aller Felder außer `id`, `nummer`, `feldkampagne_id`, `erstellt_am`, `status`. Funktionen:
- `createAufnahme(anzahlHorizonte, feldkampagneId)` – legt Aufnahme an, vergibt `nummer` als MAX(nummer)+1 innerhalb der Kampagne.
- `getAufnahme(id)`
- `saveAufnahmeDetails(id, AufnahmeDetails)` – speichert alle 20 Formularfelder.
- `deleteAufnahme(id)` – löscht Aufnahme + Horizonte per CASCADE.
- `closeAufnahme(id)` / `reopenAufnahme(id)` – Status-Steuerung.

### `utils/HorizonQueries.ts`
CRUD für die `horizonte`-Tabelle. Typ `Horizont` umfasst alle Formularfelder: `horizontname`, `tiefe_oben`, `tiefe_unten`, `farbe_munsell`, `farbe_rgb`, `bodenart`, `anteil`, `notizen`, `ph_cacl2`, `humus`, `humus_pct`, `carbonat`, `lagerungsdichte`, `feinwurzeln`, `lagerungsart`, `maechtigk_dm`, `status`. (`pflanzenreste` und `trennbarkeit` wurden entfernt.) Funktionen:
- `addHorizont(aufnahmeId)` – fügt neuen leeren Horizont an (MAX(nummer)+1).
- `getHorizonteForAufnahme(aufnahmeId)` – alle Horizonte sortiert nach nummer.
- `getHorizont(aufnahmeId, nummer)` – Einzeldatensatz.
- `saveHorizont(aufnahmeId, nummer, data)` – aktualisiert alle 16 Felder; Status wird automatisch abgeleitet: `vollstaendig` wenn `farbe_munsell` und `bodenart` beide belegt, sonst `angefangen`.

### `utils/csvExport.ts`
Exportiert Aufnahmen + Horizonte als ZIP-Datei mit zwei CSVs:
- `aufnahmen.csv` – eine Zeile pro Aufnahme mit allen Standort-, Profil- und Klimadaten.
- `horizonte.csv` – eine Zeile pro Horizont mit allen Bodeneigenschaftsfeldern, verknüpft via `aufnahme_id`. Enthält `humus`, `humus_pct`, `carbonat`, `lagerungsdichte`, `feinwurzeln`, `lagerungsart`, `maechtigk_dm`; `pflanzenreste` und `trennbarkeit` wurden entfernt.

Interne Funktion `buildAndShareZip(aufnahmen, zipFilename, dialogTitle)` wird von beiden öffentlichen Funktionen genutzt:
- `exportAufnahmeAsZip(aufnahme)` – exportiert eine einzelne Aufnahme.
- `exportKampagneAsZip(kampagneId, kampagneName)` – exportiert alle Aufnahmen einer Kampagne.

Verwendet `JSZip` (typ: `uint8array`), schreibt via `expo-file-system` (`File`/`Paths`-API) in den App-Cache und öffnet das native Share-Sheet via `expo-sharing`.

### `utils/renger1987.ts`
Digitalisierte Lookup-Tabelle und Berechnungsfunktionen für die Humusgehalt-Schätzung nach Renger et al. (1987). Da das Original ein grafisches Nomogramm ohne hinterlegte Formeln ist, werden die Werte per trilinearer Interpolation aus einem 3D-Gitter abgeschätzt.

Drei Tabellen `HIGH`/`MID`/`LOW` (Chroma-Klassen) sind je als `[valueIdx][phIdx][clayIdx]` indiziert. Achsen: `VALUE_GRID` (1–7), `PH_GRID` (3–7), `CLAY_GRID` (2, 5, 8, 17, 25, 45, 65 %).

Öffentliche API:
- `estimateHumus(value, chromaClass, pH, clay)` → Humusgehalt % (gerundet auf 0,1).
- `humusKlasse(humus)` → `{ klasse: 'h1'–'h6', label: string }`.
- `bodenartToClay(bodenart)` → Tongehalt % aus KA5-Kürzel (stripped von Ziffernsuffix, z. B. "Su2" → "Su"). Gibt `null` zurück wenn unbekannt.
- `parseMunsell(s)` → `{ value, chroma } | null` aus "10YR 4/3".
- `chromaToClass(chroma)` → `ChromaClass`.

⚠️ Tabellenwerte sind Näherungen — vom Nutzer zur Überprüfung gegen das Original-Diagramm vorgemerkt.

### `utils/utmConversion.ts`
Bidirektionale WGS84 ↔ UTM-Konvertierung (Transversale Mercator-Projektion, WGS84-Ellipsoid):
- `latLonToUTM(lat, lon)` → `{ easting, northing, zone, hemisphere, label }` (label z. B. "32N")
- `utmToLatLon(easting, northing, zone, hemisphere)` → `{ lat, lon }`

### `utils/soilColorExtractor.ts`
Koordiniert die Bildanalyse für die Bodenfarbe. Lädt das Bild mit Skia, liest Pixeldaten, berechnet per `extractColorFromRegion` Durchschnittsfarben für Graukarten- und Bodenprobenbereich, leitet Korrekturfaktoren ab (Ziel: RGB 128 für 18 %-Graukarte), wendet diese an und ruft `rgbToMunsell` für die Munsell-Notation auf.

### `utils/munsellLookup.ts`
RGB-zu-Munsell-Konvertierung per Delta-E-Farbabstand. Konvertiert RGB → CIE Lab (mit Gamma-Korrektur und D65-Weißpunkt), sucht dann im `MUNSELL_DATA`-Datensatz den ähnlichsten Eintrag per euklidischem Lab-Abstand und gibt die Munsell-Notation zurück.

### `utils/munsellData.ts`
Großes statisches Datenarray mit dem RIT Munsell Renotation Dataset: jeweils RGB-Werte und die zugehörige Munsell-Notation. Wird ausschließlich von `munsellLookup.ts` importiert.

### `utils/MappingMaths.ts`
Leere Datei (Platzhalter für zukünftige Kartierungs-Berechnungsfunktionen).

---

## Entscheidungsbaum-Daten (`utils/trees/`)

Alle Dateien exportieren eine typisierte `DecisionTreeData`-Konstante und importieren die Typen aus `../DecisionTreeTypes`.

### `utils/trees/SoilTexTree.ts`
Entscheidungsbaum zur Bodenart-Bestimmung (Fingerprobe). Navigiert durch Ausroll-, Haftungs- und Oberflächenmerkmale zu den Bodenarten der deutschen Bodensystematik (Ss, Su, Sl, Uls, Lt, Tu2, Tt etc.).

### `utils/trees/BodenTypTree.ts`
Entscheidungsbaum zur Bodentyp-Bestimmung nach KA5. Zweistufig: erst Klassen-Ebene (organisch/mineralisch, Wassereinfluss, Unterbodenhorizonte), dann Feinbestimmung der Typen je Klasse (z. B. Gley, Pseudogley, Braunerde, Parabraunerde, Podsol). Alle Knoten enthalten `hint`-Texte mit diagnostischen Kriterien.

### `utils/trees/GefuegeTree.ts`
Entscheidungsbaum zur Gefüge-Bestimmung. Unterscheidet Einzelkorn-, Kohärent-, Kittgefüge und aggregierte Formen (Krümel, Schwamm, Feinkoagulat, Subpolyeder, Polyeder, Prisma, Säule, Platte) anhand von Aggregatform, Oberflächenbeschaffenheit und Orientierung.

### `utils/trees/CarbonateTree.ts`
Entscheidungsbaum zur Carbonatgehalt-Bestimmung (Salzsäureprobe). Sieben Stufen von `c0` (karbonatfrei) bis `c6` (extrem karbonatreich ≥ 50 Gew.%) anhand der Stärke der HCl-Reaktion.

### `utils/trees/WurzelTree.ts`
Entscheidungsbaum zur Feinwurzel-Intensitätsbestimmung. Sieben Stufen von `Wf0` (keine Wurzeln) bis `Wf6` (extrem stark / Wurzelfilz) anhand der Anzahl sichtbarer Feinwurzeln pro dm².

### `utils/trees/LagerungsdichteTree.ts`
Entscheidungsbaum zur Lagerungsdichte-Bestimmung im Gelände (Stechzylinderprobe und Fingerprobe). Klassifiziert nach KA5-Stufen von `Ld1` (sehr locker) bis `Ld5` (sehr fest).
