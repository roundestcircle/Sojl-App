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
Globales `StyleSheet`-Objekt mit wiederverwendbaren Stilen. Enthält u.a. `container`, `actionButton`, `input`, `sectionTitle`, `fieldLabel`, `section`, `formRow`, `halfField`, Modal-Stile und `readonlyInput` (grauer Hintergrund für automatisch berechnete Felder).

---

## App-Screens (`app/`)

### `app/_layout.tsx`
Wurzel-Stack-Navigator. Ruft `initDatabase()` beim Start auf. Legt dunkles Grün als globale Header-Farbe fest. Zeigt auf allen Screens ein Haus-Icon als `headerRight`. Das `mapping`-Segment erhält `headerShown: false`.

### `app/index.tsx`
Startbildschirm mit Navigations-Buttons zu: Kartierung, Bodenart, Bodenfarbe, Anteil, Über die App. Fußzeile zeigt App-Icon und Versionsnummer.

### `app/+not-found.tsx`
404-Fallback-Screen mit Link zurück zur Startseite.

### `app/about.tsx`
Statischer Infoscreen über das Bachelorprojekt. Zeigt GitHub-Link und Kontakt-E-Mail.

### `app/soilcolor.tsx`
Dünner Wrapper, der `PictureTaker` in einem Fullscreen-Container rendert.

---

## Kartierungs-Screens (`app/mapping/`)

### `app/mapping/_layout.tsx`
Innerer Stack-Navigator für alle Kartierungs-Routen.

### `app/mapping/index.tsx`
Feldkampagnen-Listenscreen mit `FlatList`, Lösch-Modal (langer Druck), "Neue Kampagne"-Modal und `InstructionModal` beim ersten Aufruf.

### `app/mapping/kampagne/[kampagneId]/index.tsx`
Kampagnen-Detailscreen. Listet Aufnahmen mit Status-Badge und ZIP-Export. "Kampagne beenden" mit Warn-Modal bei offenen Aufnahmen.

### `app/mapping/[aufnahmeId]/index.tsx`
Zentraler Aufnahme-Screen mit Standortdaten-Button, Horizont-Liste und Abschließen-Button.

### `app/mapping/[aufnahmeId]/standort.tsx`
Standortdaten-Formular-Screen. Lädt Aufnahme und alle Horizonte per `useFocusEffect`, rendert `AufnahmeForm` in einer `ScrollView`. Enthält `KeyboardAvoidingView` + `Animated`-Scroll-Logik (600 ms), damit das Notizen-Feld beim Öffnen der Tastatur sichtbar bleibt. Berechnet `calcGrundigkeit` (Summe aller Horizont-Mächtigkeiten) und reicht Horizonte als Prop weiter (für FK/nFK-Berechnung in `AufnahmeForm`).

### `app/mapping/[aufnahmeId]/horizon/[nr].tsx`
Horizont-Formularscreen. Rendert `HorizontFormular` in `KeyboardAvoidingView`. `handleSave` persistiert alle Felder einschließlich aller erweiterten Felder, serialisiert `probennummern` als JSON, und speichert alle 8 Porenkennwert-Felder (`gpv_pct`, `gpv_lm2`, `lk_pct`, `lk_lm2`, `fk_pct`, `fk_lm2`, `nfk_pct`, `nfk_lm2`).

---

## Kartierungsunterstützungs-Screens (`app/tools/`)

### `app/tools/_layout.tsx`
Innerer Stack-Navigator für Tool-Screens: `bodenart`, `bodentyp`, `anteil`, `humusgehalt`, `carbonat`, `lagerungsdichte`, `feinwurzeln`, `gefuege`, `horizonte`.

### `app/tools/index.tsx`
Übersichtsscreen aller verfügbaren Kartierungstools.

### `app/tools/bodenart.tsx` / `bodentyp.tsx` / `anteil.tsx` / `humusgehalt.tsx` / `carbonat.tsx` / `lagerungsdichte.tsx` / `feinwurzeln.tsx` / `gefuege.tsx`
Dünne Wrapper für die jeweiligen Tool-Komponenten. Kein eigener Zustand außer `anteil.tsx` (paddingHorizontal).

---

## Komponenten (`components/`)

### `components/CollapsibleSection.tsx`
Wiederverwendbare aufklappbare Sektion. Props: `title`, `expanded`, `onToggle`, `children?`. Zeigt Pfeil-Chevron und rendert Inhalt nur wenn `expanded`.

### `components/DecisionTree.tsx`
Generische Entscheidungsbaum-Komponente mit History-Stack, Zurück, Neu starten, `InstructionModal` und optionalem `hint`-Text.

### `components/TexTree.tsx` / `BodenTypTool.tsx` / `GefuegeTool.tsx` / `CarbonatTool.tsx` / `FeinwurzelnTool.tsx` / `LagerungsdichteTool.tsx`
Dünne Wrapper um `DecisionTree` mit den jeweiligen Baumdaten. Alle akzeptieren optionalen `onConfirm`-Prop.

### `components/HumusgehaltTool.tsx`
Berechnungstool für Humusgehalt nach Renger et al. (1987). Eingaben: Munsell-Chroma (3 Buttons), Value, Bodenart + "Ton abschätzen"-Button, Tongehalt (%), pH. Bei unbekannter Bodenart zeigt "Ton abschätzen" ein Modal mit allen gültigen KA5-Kürzeln (S, Su, Sl, Slu, Us, Ut, St, Ls, Lu, Ts, Lts, Lt, Tl, Tu, T — mit optionaler Ziffernendung). Props: `onConfirm(klasse, pct)`, `initialFarbeMunsell`, `initialPH`, `initialBodenart`.

### `components/HorizonForm.tsx`
React-Hook-Form-Formular für einen Horizont. Auto-speichert via `watch`. Felder mit Formblatt-Nummern (KA5/Aufnahmeformblatt) in Klammern. Sektionen:
- **Horizontname (58)**: Freitext + Lexikon-Button.
- **Tiefe (cm) (26)**: Von / Bis.
- **Bodenart / Textur (44)**: + Bestimmungshilfe (TexTree).
- **Bodeneigenschaften**: Skelettanteil (45), pH, Bodenfarbe (28) + Bestimmungshilfe (PictureTaker), Humusgehalt (29) + Bestimmungshilfe, Carbonatgehalt (48), Lagerungsdichte (42), Feinwurzeln (41a), Gefüge (35).
- **Notizen (57)**.
- **Erweiterte Bodenaufnahme** (CollapsibleSection, eingeklappt): 14 einfache Felder (30–49), Substratkennzeichnung-Unterabschnitt (43, 51, 55, 52a, 52b, 53, 54), Geruch (56), Substratart, Probennummern (59) mit dynamischer Liste via `useFieldArray`.
- **Automatisch berechnete Werte** (CollapsibleSection, eingeklappt): Mächtigkeit (dm), readonly, via `calcMaechtigkeitDm`. GPV, LK, FK, nFK — je Vol% + l/m², GPV/LK zusätzlich mit verbaler Bewertung. Berechnung per `calcPoreCapacities`-Effect (abhängig von Bodenart, Lagerungsdichte, Humus%, Skelettanteil, Tiefe); Werte werden via `setValue` in Formfelder geschrieben und beim nächsten `watch`-Tick persistiert.

Keyboard-Avoidance: `KeyboardAvoidingView` im Screen + `Animated`-Scroll (600 ms) bei Tastaturöffnung wenn Notizen fokussiert.

### `components/AufnahmeForm.tsx`
React-Hook-Form-Formular für Standortdaten einer Aufnahme. Auto-speichert via `watch`. Felder mit Formblatt-Nummern in Klammern. Sektionen:
- **Standortdaten**: Ostwert (6a), Nordwert (6b), Zone — oder Dezimalgrad — umschaltbar; GPS-Button; Höhe (8a).
- **Profil**: Bodentyp (60) + Abk. + Bestimmungshilfe, Humusform (63) + Abk., Ausgangsgestein (62).
- **Standorteigenschaften**: Reliefposition (15), Exposition (13), Nutzung (18), Vegetation (19) — alle als `DropdownField`.
- **Klimadaten**: Witterung (20), Mittl. Niederschlag, Mittl. Temperatur.
- **Notizen**: mit `onNotizenFocus`/`onNotizenBlur`-Callbacks für Keyboard-Scroll im Screen.
- **Erweiterte Bodenaufnahme** (CollapsibleSection, eingeklappt): Hangneigung (12), Reliefformtyp (14), Mikrorelief (16), Nat. Bodenabtrag (17a), Künstl. Bodenabtrag (17b), Anthropogene Veränderungen (21), Bodenoberfläche (22), Versiegelungsart (23), Regenwürmer (24), Substratsyst. Einheit (61), Hydrogeniet. Moortyp (64), Durchwurzelbarer Bodenraum (65), Wasserstand u. GOF (66), Grundnässestufe (67), Besond. Wasserverhältnisse (68), Stau-/Haftnässestufe (69), Erosionsgrad (70).
- **Automatisch berechnete Werte** (CollapsibleSection, eingeklappt): Gründigkeit (cm), readonly, vom Screen befüllt. Effektiver Wurzelraum (cm), editierbar, wird in DB gespeichert. Feldkapazität bis 1 m (l/m² + Bewertung) und Nutzbare Feldkapazität (l/m² + Bewertung) — beides readonly, berechnet via `calcProfileFKOrNFK` aus den per Prop übergebenen Horizonten. FK nutzt immer 1 m als Tiefengrenze, nFK nutzt den eingegebenen effektiven Wurzelraum.

Props: `initialData`, `onSave`, `calcGrundigkeit?`, `horizonte?`, `onNotizenFocus?`, `onNotizenBlur?`.

### `components/PictureTaker.tsx`
Kamera-Screen für die Bodenfarb-Analyse. Kamera und Foto-Review nutzen `flex: 1` mit `paddingBottom: 70`, Buttons als Overlays (`position: absolute, bottom: 70`), Ergebniskarte oben. Kamera- und Bildansicht haben `borderRadius: 10`. Akzeptiert optionalen `onConfirm`-Prop.

### `components/DropdownField.tsx`
Wiederverwendbares Dropdown. Zeigt Wert als Button; Antippen öffnet Modal mit `FlatList`. Erneutes Antippen hebt Auswahl auf.

### `components/StatusBadge.tsx`
Farbige Pill für `"offen"` (amber) / `"abgeschlossen"` (grün).

### `components/HorizonButton.tsx`
Zeilenlayout-Button für einen Horizont mit Status-Badge (`leer` grau, `angefangen` amber, `vollstaendig` grün).

### `components/InstructionModal.tsx`
Erstnutzer-Anleitungs-Modal mit `AsyncStorage`-Persistenz. Exportiert auch `ResetInstructionButton`.

### `components/SoilShareScroll.tsx`
Visueller Anteil-Schätzer via Skia-Canvas + unsichtbarer `ScrollView` (0–100 %).

---

## Hilfsfunktionen (`utils/`)

### `utils/db.ts`
Öffnet die SQLite-Datenbank (`bodenaufnahme.db`). `initDatabase()` erstellt drei Tabellen mit vollständigem Schema und führt danach additive Migrationen via `ALTER TABLE … ADD COLUMN` (in try/catch) durch:
- `feldkampagnen`: id, name, erstellt_am, status
- `aufnahmen`: alle Standort-, Profil-, Klima-, Erweiterte- und Profilkennzeichnungs-Felder (ca. 40 Spalten) + `effektiver_wurzelraum REAL` (Migration)
- `horizonte`: alle Horizont-Felder einschließlich aller erweiterten Felder und `probennummern` (ca. 45 Spalten) + `gpv_pct`, `gpv_lm2`, `lk_pct`, `lk_lm2`, `fk_pct`, `fk_lm2`, `nfk_pct`, `nfk_lm2` (alle TEXT, Migration)

### `utils/MappingQueries.ts`
CRUD für `aufnahmen`. Typ `Aufnahme` und `AufnahmeDetails` umfassen alle Formularfelder inkl. `effektiver_wurzelraum: number | null`. `saveAufnahmeDetails` speichert alle Felder in einem UPDATE. Funktionen: `createAufnahme`, `getAufnahme`, `saveAufnahmeDetails`, `deleteAufnahme`, `closeAufnahme`, `reopenAufnahme`.

### `utils/HorizonQueries.ts`
CRUD für `horizonte`. Typ `Horizont` umfasst alle Basis- und Erweiterten-Felder inkl. `probennummern` (JSON-String) sowie die 8 Porenkennwert-Felder `gpv_pct`, `gpv_lm2`, `lk_pct`, `lk_lm2`, `fk_pct`, `fk_lm2`, `nfk_pct`, `nfk_lm2` (alle `string | null`). `saveHorizont` aktualisiert alle Felder inkl. Porenwerte; Status wird abgeleitet (`vollstaendig` wenn `farbe_munsell` + `bodenart` belegt). Funktionen: `addHorizont`, `deleteHorizont`, `getHorizonteForAufnahme`, `getHorizont`, `saveHorizont`.

### `utils/FeldkampagneQueries.ts`
CRUD für `feldkampagnen`. Funktionen: `createFeldkampagne`, `getAllFeldkampagnen`, `getFeldkampagne`, `getAufnahmenForFeldkampagne`, `closeFeldkampagne`, `deleteFeldkampagne`.

### `utils/csvExport.ts`
Exportiert Aufnahmen + Horizonte als ZIP mit `aufnahmen.csv` und `horizonte.csv` (alle Felder inkl. der 8 Porenkennwert-Spalten). Öffentlich: `exportAufnahmeAsZip`, `exportKampagneAsZip`.

### `utils/MappingMaths.ts`
Reine Berechnungsfunktionen:
- `calcMaechtigkeitDm(tiefeOben, tiefeUnten)` → Mächtigkeit in dm als String.
- `calcGrundigkeitCm(maechtigkeiten[])` → Summe aller Mächtigkeiten in cm als String.
- `rateGPV`, `rateLK`, `rateFK`, `rateNFK` → verbale Bewertung (`sehr gering`…`sehr hoch`) eines Porenkennwerts anhand KA6-Schwellwerten.
- `calcPoreCapacities(bodenart, lagerungsdichte, humusPct, skelettPct, maechtigkDm)` → `PoreResult | null`. Pipeline: Nachschlagen in `PoreLookUp` → Humuskorrektur (interpoliert zwischen h2–h5) → Skelettkorrektur `(100 − Skelett%) / 100` → Skalierung auf l/m² via `Vol% × Mächtigkeit_dm`. Gibt `null` zurück wenn Bodenart oder Lagerungsdichte nicht auflösbar.
- `calcProfileFKOrNFK(horizonte, depthLimitCm, field)` → Profilsumme von `fk_lm2` oder `nfk_lm2` über alle Horizonte bis `depthLimitCm` (cm). Horizonte, die die Tiefengrenze überschreiten, werden proportional geklippt; Horizonte, die unterhalb beginnen, werden ignoriert. Gibt `null` zurück wenn kein Horizont einen gültigen Wert liefert.

### `utils/PoreLookUp.ts`
Nachschlagetabelle und Hilfsfunktionen für Porenkennwerte nach KA6:
- `PORE_TABLE`: Lookup `bodenart → lagerungsdichteKlasse → { totalPorosity, airCapacity, fieldCapacity, availableWater }` in Vol%.
- `bodenartToLookupKey(bodenart)` → normalisiert KA6-Kürzel (z.B. `Su2`→`Su`, `Tu3`→`Tu3_4`) für den Tabellenzugriff.
- `CLAY_KEYS`: Set der Tonbodenarten, die eine zusätzliche Dichteklasse `<1.2` haben.
- `soilGroupFromBodenart(bodenart)` → Bodengruppe (`'sand'|'silt'|'loam'|'clay'`) für Humuskorrektur.
- `parseDensityMidpoint(lagerungsdichte)` → mittlere Lagerungsdichte aus Bereichsstrings (`1,2–1,4`), `>/<`-Präfixen oder einfachen Zahlen.
- `getDensityClass(midpoint, lookupKey)` → wählt die nächstliegende Dichteklasse aus der Tabelle.
- `getHumusAdjustmentInterpolated(group, property, humusPct)` → interpolierte Humuskorrektur zwischen h2/h3/h4/h5-Klassen.
- `lookupPoreValues(bodenart, lagerungsdichte)` → kombiniert alle obigen Schritte zum finalen `SoilHydraulics`-Objekt oder `null`.

### `utils/DecisionTreeTypes.ts`
Typen für Entscheidungsbäume: `TreeOption`, `InnerNode` (mit optionalem `hint`), `ResultNode`, `TreeNode`, `DecisionTreeData`.

### `utils/renger1987.ts`
Humusgehalt-Schätzung nach Renger et al. (1987) via trilinearer Interpolation. API: `estimateHumus`, `humusKlasse`, `bodenartToClay`, `parseMunsell`. ⚠️ Tabellenwerte sind Näherungen.

### `utils/utmConversion.ts`
Bidirektionale WGS84 ↔ UTM-Konvertierung: `latLonToUTM`, `utmToLatLon`.

### `utils/soilColorExtractor.ts`
Bildanalyse für Bodenfarbe: Graukarten-Korrektur + `rgbToMunsell`.

### `utils/munsellLookup.ts`
RGB → Munsell via Delta-E-Abstand im CIE-Lab-Farbraum.

### `utils/munsellData.ts`
Statisches RIT Munsell Renotation Dataset. Nur von `munsellLookup.ts` verwendet.

---

## Entscheidungsbaum-Daten (`utils/trees/`)

### `utils/trees/SoilTexTree.ts`
Bodenart-Bestimmung per Fingerprobe (Fingerprobe → KA5-Kürzel).

### `utils/trees/BodenTypTree.ts`
Bodentyp-Bestimmung nach KA5, zweistufig mit `hint`-Texten an allen Knoten.

### `utils/trees/GefuegeTree.ts`
Gefüge-Bestimmung (Einzelkorn, Kohärent, Kittgefüge, aggregierte Formen).

### `utils/trees/CarbonateTree.ts`
Carbonatgehalt-Bestimmung per HCl-Probe, Stufen c0–c6.

### `utils/trees/WurzelTree.ts`
Feinwurzel-Intensität Wf0–Wf6 nach Anzahl pro dm².

### `utils/trees/LagerungsdichteTree.ts`
Lagerungsdichte Ld1–Ld5 per Stechzylinder- und Fingerprobe.
