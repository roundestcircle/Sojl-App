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
Definiert globale Farben: `primary: '#145600'` (dunkelgrün), `brown: '#b45f06'`, `resultBackground` (Hintergrundfarbe der Ergebnis-Boxen). Wird von nahezu allen Screens und Komponenten importiert.

### `styles/styles.ts`
Globales `StyleSheet`-Objekt mit wiederverwendbaren Stilen. Enthält u.a. `container`, `actionButton`, `input`, `sectionTitle`, `fieldLabel`, `section`, `formRow`, `halfField`, `badge`/`badgeText`, Modal-Stile, `readonlyInput` (grauer Hintergrund für automatisch berechnete Felder), `resultBox`/`resultValue`/`resultLabel` (Ergebnisanzeigen in Tools). `resetButton` liefert nur visuelle Defaults (Farbe, Padding); Positionierung übernimmt der jeweilige Aufrufer.

---

## App-Screens (`app/`)

### `app/_layout.tsx`
Wurzel-Stack-Navigator. Ruft `initDatabase()` einmalig in einem `useEffect` auf. Legt dunkles Grün als globale Header-Farbe fest und zeigt auf allen Screens ein Haus-Icon als `headerRight`. Die Segmente `mapping` und `tools` erhalten `headerShown: false` (eigene innere Stack-Navigatoren).

### `app/index.tsx`
Startbildschirm mit Navigations-Buttons zu Kartierung, Bodenfarbe, weitere Kartierungsunterstützung und About. Fußzeile zeigt App-Icon und Versionsnummer (aus `Constants.expoConfig.version`).

### `app/+not-found.tsx`
404-Fallback-Screen mit Link zurück zur Startseite.

### `app/about.tsx`
Statischer Infoscreen über das Bachelorprojekt. Zeigt GitHub-Link, Kontakt-E-Mail und YouTube-Link.

### `app/soilcolor.tsx`
Dünner Wrapper, der `PictureTaker` in einem Fullscreen-Container rendert.

---

## Kartierungs-Screens (`app/mapping/`)

### `app/mapping/_layout.tsx`
Innerer Stack-Navigator für alle Kartierungs-Routen.

### `app/mapping/index.tsx`
Feldkampagnen-Listenscreen mit `FlatList`, Lösch-Modal (langer Druck), "Neue Kampagne"-Modal und `InstructionModal` beim ersten Aufruf. Nutzt `formatDate` aus `utils/formatDate.ts` für die Zeitanzeige. `ResetInstructionButton` wird mit explizitem `position: 'relative', alignSelf: 'stretch'` inline in der `bottomBar` gerendert, damit er nicht absolut über der Schaltfläche "+ Neue Kampagne" liegt.

### `app/mapping/kampagne/[kampagneId]/index.tsx`
Kampagnen-Detailscreen. Listet Aufnahmen mit Status-Badge und ZIP-Export. Verwendet `getAufnahmenWithHorizontCount` für eine einzige SQL-Abfrage statt N+1 Lookups. "Kampagne beenden" mit Warn-Modal bei offenen Aufnahmen.

### `app/mapping/[aufnahmeId]/index.tsx`
Zentraler Aufnahme-Screen mit Standortdaten-Button, Horizont-Liste und Abschließen-Button. `deriveStandortStatus` ermittelt `leer`/`begonnen`/`abgeschlossen` anhand von `STANDORT_REQUIRED_FOR_VOLLSTAENDIG`. Verwendet den geteilten `<Badge>` für die Standortdaten-Statusanzeige.

### `app/mapping/[aufnahmeId]/standort.tsx`
Standortdaten-Formular-Screen. Lädt Aufnahme und alle Horizonte per `useFocusEffect`, rendert `AufnahmeForm` in einer `KeyboardAwareScrollView` (scrollt fokussierte Inputs automatisch über die Tastatur). Verwendet das `useDebouncedCallback`-Hook (250 ms) für die Datenbankschreibungen, damit nicht jeder Tastenanschlag ein vollständiges UPDATE auslöst. Berechnet `calcGrundigkeit` (Summe aller Horizont-Mächtigkeiten) und reicht Horizonte als Prop weiter (für FK/nFK/S-Wert-Berechnung in `AufnahmeForm`).

### `app/mapping/[aufnahmeId]/horizon/[nr].tsx`
Horizont-Formularscreen. Rendert `HorizontFormular` in einer `KeyboardAwareScrollView` (scrollt fokussierte Inputs automatisch über die Tastatur) — gleiches Muster wie `standort.tsx`. `handleSave` persistiert alle Felder einschließlich aller erweiterten Felder, serialisiert `probennummern` als JSON und speichert alle Porenkennwert-Felder sowie `kak`, `basensaettigung` und `tonanteil`. Speicherung erfolgt debounced (250 ms) via `useDebouncedCallback`; ausstehende Schreibungen werden beim Unmount geflusht.

---

## Kartierungsunterstützungs-Screens (`app/tools/`)

### `app/tools/_layout.tsx`
Innerer Stack-Navigator für Tool-Screens.

### `app/tools/index.tsx`
Übersichtsscreen aller verfügbaren Kartierungstools. Datengesteuert über `TOOL_SECTIONS` (Lexika, Bestimmungshilfen, Berechnungshilfen) mit einem einzigen `.map()` über `<Link>`.

### `app/tools/horizonte.tsx` / `humusformen.tsx`
Lexikon-Wrapper: rendert `HorizontLexikonContent` bzw. `HumusformLexikonContent` im Fullscreen.

### `app/tools/bodenart.tsx` / `bodentyp.tsx` / `anteil.tsx` / `carbonat.tsx` / `lagerungsdichte.tsx` / `feinwurzeln.tsx` / `gefuege.tsx` / `humusgehalt.tsx` / `kak.tsx` / `basensaettigung.tsx`
Dünne Wrapper für die jeweiligen Tool-Komponenten. Kein eigener Zustand außer `anteil.tsx` (paddingHorizontal).

### `app/tools/aufnahme-redirect.tsx`
Platzhalter-Screen für Tools, die nur innerhalb einer Aufnahme nutzbar sind (Porenvolumen & Feldkapazität, S-Wert). Liest `title` aus den Such-Parametern und bietet einen Button zur Kartierung.

---

## Komponenten (`components/`)

### `components/Badge.tsx`
Geteilte farbige Pille (`label`, `color`). Verwendet von `StatusBadge`, `HorizonButton` und der Standortdaten-Statusanzeige.

### `components/StatusBadge.tsx`
Pill für `"offen"` (amber) / `"abgeschlossen"` (grün). Dünner Wrapper um `<Badge>`.

### `components/HorizonButton.tsx`
Zeilenlayout-Button für einen Horizont mit Status-Badge via `<Badge>` (`leer` grau, `angefangen` amber, `vollstaendig` grün).

### `components/CollapsibleSection.tsx`
Wiederverwendbare aufklappbare Sektion. Props: `title`, `expanded`, `onToggle`, `children?`. Zeigt Pfeil-Chevron und rendert Inhalt nur wenn `expanded`.

### `components/InfoButton.tsx`
Kleiner Fragezeichen-Button, der ein Erklär-Modal mit übergebenem Text öffnet. Nutzt globalen `actionButton`-Stil für die Schließen-Aktion.

### `components/InstructionModal.tsx`
Erstnutzer-Anleitungs-Modal mit `AsyncStorage`-Persistenz. Exportiert auch `ResetInstructionButton`, der den "Nicht mehr anzeigen"-Schlüssel löscht und einen optionalen `onReset`-Callback ausführt (üblich: Parent erhöht einen `modalKey` zur Wiederanzeige).

### `components/LabeledDropdownField.tsx`
Wiederverwendbares Dropdown mit Modal-Sheet. Akzeptiert entweder `LabeledOption[]` (`{ code, label? }`), eine `LabeledSection[]`-Liste (für `SectionList` mit Gruppen-Headers) oder eine reine `string[]` (Kurzform für Code-only-Optionen). Tap auf bereits aktive Option hebt Auswahl auf.

### `components/DecisionTree.tsx`
Generische Entscheidungsbaum-Komponente mit History-Stack, Zurück, Neu starten, `InstructionModal` und optionalem `hint`-Text. History wird über funktionale Setter aktualisiert (verliert bei schnellen Doppel-Taps keine Einträge). `console.warn` bei fehlender Knoten-ID.

### `components/TexTree.tsx` / `BodenTypTool.tsx` / `GefuegeTool.tsx` / `CarbonatTool.tsx` / `FeinwurzelnTool.tsx` / `LagerungsdichteTool.tsx`
Dünne Wrapper um `DecisionTree` mit den jeweiligen Baumdaten aus `utils/trees/`. Alle akzeptieren optionalen `onConfirm`-Prop.

### `components/HumusgehaltTool.tsx`
Berechnungstool für Humusgehalt nach Renger et al. (1987). Eingaben: Munsell-Chroma (3 Buttons), Value, Bodenart + "Aus BA abschätzen"-Button, Tongehalt (%), pH. "Aus BA abschätzen" setzt den Tongehalt auf den KA6-Mittelpunkt und zeigt darunter den KA6-Bereich (z.B. "KA6-Bereich: 17–25 %") via `clayRange`-State. Bei unbekannter Bodenart wird ein Fehler angezeigt. Nutzt `bodenartToClay` aus `utils/bodenartClay` und `chromaToClass` aus `utils/renger1987`. Props: `onConfirm(klasse, pct)`, `initialFarbeMunsell`, `initialPH`, `initialBodenart`.

### `components/KAKTool.tsx`
Standalone-Tool zur KAK-Berechnung (Kationenaustauschkapazität). Eingaben: Bodenart, Humusform (Mull/Moder/Rohhumus als Buttons), Humusgehalt (%). Ruft `calcKAK` aus `MappingMaths` und zeigt das Ergebnis inkl. KA6-Bewertung via `rateKAK`.

### `components/BasensaettigungTool.tsx`
Standalone-Tool zur Basensättigungs-Berechnung. Eingaben: pH (CaCl₂), Humusgehalt (%). Verwendet `calcBasensaettigung` + `humusGroupLabel` aus `utils/BasensaettigungLookup`.

### `components/HorizonForm.tsx`
React-Hook-Form-Formular für einen Horizont. Auto-speichert via `watch` (Abonnement wird via `onSaveRef` gegen `onSave`-Identitätswechsel abgesichert, damit kein Erst-Tick verloren geht). Felder mit Formblatt-Nummern (KA5/Aufnahmeformblatt) in Klammern. Sektionen:
- **Horizontname (58)**: Freitext + Lexikon-Button.
- **Tiefe (cm) (26)**: Von / Bis.
- **Bodenart / Textur (44)**: + Bestimmungshilfe (TexTree).
- **Bodeneigenschaften**: Tonanteil (mit "Abschätzen"-Button aus Bodenart — setzt Mittelpunkt des KA6-Bereichs, zeigt Bereich als Hinweistext via `tonanteilRange`-State, persistiert), Skelettanteil (45), pH, Bodenfarbe (28) + Bestimmungshilfe (PictureTaker), Humusgehalt (29) + Bestimmungshilfe, Carbonatgehalt (48), Lagerungsdichte (42), Feinwurzeln (41a), Gefüge (35).
- **Notizen (57)**.
- **Erweiterte Bodenaufnahme** (CollapsibleSection, eingeklappt): 14 einfache Felder (30–49), Substratkennzeichnung-Unterabschnitt (43, 51, 55, 52a, 52b, 53, 54), Geruch (56), Substratart, Probennummern (59) mit dynamischer Liste via `useFieldArray`.
- **Automatisch berechnete Werte** (CollapsibleSection, eingeklappt): Mächtigkeit (dm) via `calcMaechtigkeitDm`; GPV, LK, FK, nFK je Vol% + l/m² mit verbaler Bewertung; KAK via `calcKAK` (mit `rateKAK`); Basensättigung via `calcBasensaettigung`. Berechnungen werden in `useEffect`-Hooks getriggert und via `setValue` persistiert.

Alle Felder verwenden `Controller` (keine uncontrolled Inputs mehr). Einheiten (Vol%, l/m², cmol_c/kg, %) werden über den geteilten `localStyles.unit`-Stil (`color: colors.primary`, `fontSize: 13`) neben den jeweiligen Inputs angezeigt — analog zu `AufnahmeForm`. Der `Lagerungsdichte`-Modal-Handler (`onConfirm`) extrahiert beim Übernehmen alle numerischen Teile, normalisiert Komma → Punkt und übernimmt einen einzelnen Wert oder einen Bereich im Format `1.2 - 1.5` (statt die Einheit `kg/dm³` mitzukopieren). Das Formular ist scrollfrei — das Scrolling (inkl. Keyboard-Avoidance über `KeyboardAwareScrollView`) übernimmt der umgebende Screen, parallel zu `AufnahmeForm`.

### `components/AufnahmeForm.tsx`
React-Hook-Form-Formular für Standortdaten einer Aufnahme. Auto-speichert via `watch` (mit `onSaveRef`-Schutz wie bei `HorizonForm`). Dropdown-Optionen kommen aus `utils/aufnahmeOptions.ts`. Felder mit Formblatt-Nummern in Klammern. Sektionen:
- **Standortdaten**: Ostwert (6a), Nordwert (6b), Zone — oder Dezimalgrad — umschaltbar; GPS-Button; Höhe (8a).
- **Profil**: Bodentyp (60) + Abk. + Bestimmungshilfe, Humusform (63) + Abk., Ausgangsgestein (62).
- **Standorteigenschaften**: Reliefposition (15), Exposition (13), Nutzung (18), Vegetation (19) — alle als `LabeledDropdownField`.
- **Klimadaten**: Witterung (20), Mittl. Niederschlag, Mittl. Temperatur.
- **Notizen**: einfaches Multiline-Feld; Keyboard-Scroll erfolgt zentral in der `KeyboardAwareScrollView` des Screens.
- **Erweiterte Bodenaufnahme** (CollapsibleSection, eingeklappt): 17 Felder (Hangneigung … Erosionsgrad), datengesteuert via `.map()` über `[name, label, placeholder]`-Tupel.
- **Automatisch berechnete Werte** (CollapsibleSection, eingeklappt): Gründigkeit (cm), readonly, vom Screen befüllt. Effektiver Wurzelraum (cm), editierbar, wird in DB gespeichert. Feldkapazität bis 1 m (l/m² + Bewertung), Nutzbare Feldkapazität (l/m² + Bewertung) und S-Wert (im eff. Wurzelraum, mol_c/m² + Bewertung) — alle readonly, berechnet aus den per Prop übergebenen Horizonten via `calcProfileFKOrNFK` und `calcProfileSWert`.

Props: `initialData`, `onSave`, `calcGrundigkeit?`, `horizonte?`. Einheiten (`cm`, `mm`, `°C`, `l/m²`) werden über `localStyles.unit` neben den jeweiligen Inputs angezeigt (Effektiver Wurzelraum, Mittl. Niederschlag, Mittl. Temperatur, Gründigkeit, Feldkapazität, Nutzbare Feldkapazität).

### `components/PictureTaker.tsx`
Kamera-Screen für die Bodenfarb-Analyse. Overlay-Rechtecke (Greycard und Bodenprobe) werden aus `utils/cameraOverlay.ts` (`OVERLAY_FRACTIONS.*.display`) berechnet, sodass UI und Extraktor dieselbe Quelle teilen. Akzeptiert optionalen `onConfirm(munsell)`-Prop.

### `components/SoilShareScroll.tsx`
Visueller Anteil-Schätzer via Skia-Canvas + unsichtbarer `ScrollView` (0–100 %). Fisher-Yates-Shuffle mit fixem Seed für reproduzierbares Layout.

### `components/HorizontLexikonContent.tsx`
Such- und SectionList-basiertes Horizontsymbol-Lexikon. Dünner Wrapper um `<LexikonContent>` mit Daten aus `utils/horizonData.ts`.

### `components/HumusformLexikonContent.tsx`
Such- und SectionList-basiertes Humusform-Lexikon. Dünner Wrapper um `<LexikonContent>` mit Daten aus `utils/humusformData.ts`. Unterstützt zwei Item-Typen (Symbol-Reihe vs. Paragraph mit Horizont-Sequenz).

### `components/LexikonContent.tsx`
Generischer Such-+-SectionList-Shell für Wörterbuch-artige Inhalte. Verwaltet Suchfeld, `useMemo`-Filter und Scroll-to-Top bei Filteränderung. Generisch über `<TItem, TSection>`; Aufrufer liefern Daten, `filterItem`, `renderItem`, `keyExtractor` und optional `emptyContent`.

---

## Hilfsfunktionen (`utils/`)

### `utils/db.ts`
Öffnet die SQLite-Datenbank (`bodenaufnahme.db`). `initDatabase()` erstellt drei Tabellen mit vollständigem Schema und führt danach additive Migrationen via `ALTER TABLE … ADD COLUMN` (in try/catch) durch:
- `feldkampagnen`: id, name, erstellt_am, status
- `aufnahmen`: alle Standort-, Profil-, Klima-, Erweiterte- und Profilkennzeichnungs-Felder + `effektiver_wurzelraum REAL` (Migration)
- `horizonte`: alle Basis- und erweiterten Felder + `probennummern` + 8 Porenkennwert-Spalten (`gpv_pct` … `nfk_lm2`) + `kak`, `basensaettigung`, `tonanteil` (alle TEXT, Migrationen)

### `utils/MappingQueries.ts`
CRUD für `aufnahmen`. Typ `Aufnahme` und `AufnahmeDetails` umfassen alle Formularfelder inkl. `effektiver_wurzelraum: number | null`. `saveAufnahmeDetails` speichert alle Felder in einem UPDATE. `createAufnahme` legt einen Datensatz mit `INSERT … SELECT COALESCE(MAX(nummer),0)+1` in einem Statement an (rennsicher). Exportiert `STANDORT_REQUIRED_FOR_VOLLSTAENDIG` — die Pflichtfelder-Liste, die der Aufnahme-Screen für die Status-Ableitung nutzt. Weitere Funktionen: `getAufnahme`, `deleteAufnahme`, `closeAufnahme`, `reopenAufnahme`.

### `utils/HorizonQueries.ts`
CRUD für `horizonte`. Typ `Horizont` umfasst alle Basis- und erweiterten Felder inkl. `probennummern` (JSON-String), 8 Porenkennwert-Felder, `kak`, `basensaettigung` und `tonanteil`. `saveHorizont` aktualisiert alle Felder; Status wird aus `HORIZONT_REQUIRED_FOR_VOLLSTAENDIG` abgeleitet (`vollstaendig` wenn alle Pflichtfelder ausgefüllt, sonst `angefangen`). `addHorizont` nutzt ein einzelnes `INSERT … SELECT COALESCE(MAX(nummer),0)+1`. Weitere Funktionen: `deleteHorizont`, `getHorizonteForAufnahme`, `getHorizont`.

### `utils/FeldkampagneQueries.ts`
CRUD für `feldkampagnen`. Funktionen: `createFeldkampagne`, `getAllFeldkampagnen`, `getFeldkampagne`, `getAufnahmenForFeldkampagne`, `getAufnahmenWithHorizontCount` (Aufnahmen + COUNT(Horizonte) per korreliertem Subquery in einer Abfrage), `closeFeldkampagne`, `deleteFeldkampagne`.

### `utils/csvExport.ts`
Exportiert Aufnahmen + Horizonte als ZIP mit `aufnahmen.csv` und `horizonte.csv`. Enthält alle Felder inkl. `effektiver_wurzelraum`, `tonanteil`, der 8 Porenkennwert-Spalten, `kak` und `basensaettigung`. Öffentlich: `exportAufnahmeAsZip`, `exportKampagneAsZip`.

### `utils/MappingMaths.ts`
Reine Berechnungsfunktionen:
- `calcMaechtigkeitDm(tiefeOben, tiefeUnten)` → Mächtigkeit in dm als String.
- `calcGrundigkeitCm(maechtigkeiten[])` → Summe aller Mächtigkeiten in cm als String.
- `rateGPV`, `rateLK`, `rateFK`, `rateNFK`, `rateKAK`, `rateSWert` → verbale Bewertung anhand KA6-Schwellwerten. `Rating` ist eine Obermenge aller Labels; nicht jede Funktion nutzt jedes Bucket (Domain-Asymmetrie ist dokumentiert).
- `calcPoreCapacities(bodenart, lagerungsdichte, humusPct, skelettPct, maechtigkDm)` → `PoreResult | null`. Pipeline: `PoreLookUp` → Humuskorrektur (interpoliert zwischen h2–h5) → Skelettkorrektur `(100 − Skelett%) / 100` → Skalierung auf l/m² via `Vol% × Mächtigkeit_dm`.
- `calcKAK(bodenart, humusform, humusPct)` → KAK in cmolc/kg, mineralischer Basiswert aus `KAK_BASE` + Humusbeitrag (Faktor je Humusform × Humus%).
- `calcProfileFKOrNFK(horizonte, depthLimitCm, field)` → Profilsumme von `fk_lm2` oder `nfk_lm2` über alle Horizonte bis `depthLimitCm`; überlaufende Horizonte werden proportional geklippt.
- `calcProfileSWert(horizonte, depthLimitCm)` → S-Wert (Sorptionssumme) über alle Horizonte bis `depthLimitCm`. A-Horizonte (Match `/^[a-z]*A/`) gehen voll ein, alle anderen mit Faktor 0.5. Benötigt KAK, Basensättigung und Lagerungsdichte je Horizont.

### `utils/PoreLookUp.ts`
Nachschlagetabelle und Hilfsfunktionen für Porenkennwerte nach KA6:
- `soilLookup`: `bodenart → SoilHydraulics[]` (eine Zeile je Bulk-Density-Klasse).
- `bodenartToLookupKey(bodenart)` → normalisiert KA6-Kürzel (z.B. `Su2`→`Su`, `Tu3`→`Tu3_4`).
- `soilGroupFromBodenart(bodenart)` → Bodengruppe (`Ss | S_other | U_L_except_Lt | Lt_Tone`) für Humuskorrektur.
- `parseDensityMidpoint(lagerungsdichte)` → repräsentativer Dichte-Wert aus Bereichsstrings (`1,2–1,4`), `>/<`-Präfixen (±0.15-Heuristik, nicht echter Mittelpunkt — dokumentiert) oder einfachen Zahlen.
- `getDensityClass(midpoint, lookupKey)` → wählt die passende Dichteklasse.
- `getHumusAdjustmentInterpolated(group, property, humusPct)` → interpolierte Humuskorrektur zwischen h2/h3/h4/h5.
- `lookupPoreValues(bodenart, lagerungsdichte)` → kombiniert alle Schritte zum finalen `SoilHydraulics`-Objekt oder `null`.
- `anmoorig_sand` / `anmoorig_loam_clay`-Einträge sind als Referenz vorhanden, aber aktuell unerreichbar (TODO-Kommentar im Code).

### `utils/BasensaettigungLookup.ts`
Digitisierte Kurven (drei Humusgruppen) für die Berechnung der Basensättigung aus pH (CaCl₂). API: `calcBasensaettigung(pH, humusPct)` → BS in % oder leer; `humusGroupLabel(humusPct)` → menschenlesbares Gruppen-Label. Linearer Interpolations-Helper `interpBS`.

### `utils/bodenartClay.ts`
KA6-Tabelle C51: Bodenart-Kürzel → Ton-Bereich in Masse-%. Typ `ClayRange = { min, max }`. `bodenartToClay(bodenart)` → `ClayRange | null` (versucht zuerst exakten Treffer, dann Strip trailing digits als Fallback). `bodenartToClayMidpoint(bodenart)` → `number | null` (gerundeter Mittelpunkt). 32 Einträge von Ss bis Tt.

### `utils/renger1987.ts`
Humusgehalt-Schätzung nach Renger et al. (1987) via trilineare Interpolation (Achsen: Value 1/3/5/7 × pH 3/5/7 × clay 2/8/25/65 %, jeweils für die Chroma-Klassen high/mid/low). API: `estimateHumus`, `humusKlasse`, `parseMunsell`, `chromaToClass`. Bodenart→Ton-Lookup wurde in `utils/bodenartClay.ts` ausgelagert. ⚠️ Tabellenwerte sind Näherungen.

### `utils/utmConversion.ts`
Bidirektionale WGS84 ↔ UTM-Konvertierung: `latLonToUTM` (gültig für lat ∈ [-80°, +84°], normale UTM-Zonen — Sonderzonen N/Svalbard nicht behandelt), `utmToLatLon`.

### `utils/soilColorExtractor.ts`
Bildanalyse für Bodenfarbe: Lädt das Bild via `Skia.Image.MakeImageFromEncoded`, liest Pixel (RGBA-Annahme, dokumentiert), mittelt die Greycard-Region (via `getSamplingRect("greyCard", …)` aus `cameraOverlay`) für die Korrekturfaktoren und mittelt anschließend die Bodenprobe-Region. Skia-Image wird im `finally` mit `image.dispose()` freigegeben. Ergebnis-RGB → Munsell via `rgbToMunsell`.

### `utils/cameraOverlay.ts`
Zentrale Quelle der Overlay-Rechtecke für Kamera-UI und Pixel-Extraktion. `OVERLAY_FRACTIONS` liefert je Region (`greyCard`, `soilSample`) zwei Rechtecke: `display` (was der User sieht) und `sample` (was der Extraktor mittelt). Greycard-`sample` ist absichtlich kürzer als `display`, um Randartefakte zu vermeiden. `getSamplingRect(type, w, h)` rechnet die `sample`-Bruchteile in Pixel-Koordinaten.

### `utils/munsellLookup.ts`
RGB → Munsell via Delta-E-Abstand im CIE-Lab-Farbraum. `MUNSELL_LAB` wird einmalig beim Modul-Laden aus `MUNSELL_DATA` vorberechnet, sodass je Aufruf nur die Eingabefarbe konvertiert wird; der Loop arbeitet mit quadrierten Abständen und zieht erst am Ende einmal die Wurzel.

### `utils/munsellData.ts`
Statisches RIT Munsell Renotation Dataset. Nur von `munsellLookup.ts` verwendet.

### `utils/DecisionTreeTypes.ts`
Typen für Entscheidungsbäume: `TreeOption`, `InnerNode` (mit optionalem `hint`), `ResultNode`, `TreeNode`, `DecisionTreeData`.

### `utils/horizonData.ts`
Statische `HORIZON_SECTIONS`-Liste für `HorizontLexikonContent` (Hauptsymbole, Suffixe, Hydromorphie-Merkmale, …). Typen: `HorizonEntry`, `HorizonSection`.

### `utils/humusformData.ts`
Statische `HUMUSFORM_SECTIONS`-Liste für `HumusformLexikonContent`. Discriminated-Union-Typ `HumusformEntry` (`kind: "symbol"` mit `{symbol, description}` oder `kind: "paragraph"` mit `{body, horizonSequence?}`).

### `utils/aufnahmeOptions.ts`
Dropdown-Daten für `AufnahmeForm` (aus dem Aufnahmeformblatt): `EXPOS`, `RELIEFPOS_OPTIONS`, `WITTERUNG_OPTIONS`, `NUTZUNG_SECTIONS` (gruppiert), `VEGETATION_SECTIONS` (gruppiert). Datentypen kommen aus `LabeledDropdownField`.

### `utils/useDebouncedCallback.ts`
Hook: gibt eine stabile Callback-Wrapper zurück, die Aufrufe um `delayMs` debounced. Ausstehende Aufrufe werden beim Unmount automatisch geflusht — verhindert Datenverlust beim Verlassen des Screens.

### `utils/formatDate.ts`
Geteilte `formatDate(iso)`-Funktion: ISO-Datetime → `"YYYY-MM-DD HH:MM"` für die Listen-Anzeige.

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

---

## Skripte (`scripts/`)

### `scripts/generateMunsellData.js`
Erzeugt `utils/munsellData.ts` aus dem RIT Munsell Renotation Dataset (`real.dat`). Wendet eine Bradford-Chromatic-Adaptation (Illuminant C → D65) an und konvertiert xyY → XYZ → sRGB. Wird nur manuell ausgeführt, nicht zur Laufzeit.
