# Sojl – Architektur

Überblick über Aufbau, Datenfluss und Konventionen der App. Bewusst auf
Modul-Ebene gehalten: Details zu einzelnen Funktionen stehen als Kommentar im
Code und veralten dort nicht.

Stack: Expo (SDK 58) · React Native 0.88 · expo-router · expo-sqlite ·
react-hook-form · @shopify/react-native-skia · TypeScript (strict).

---

## Ordnerstruktur

```
app/                    Screens (expo-router, dateibasiertes Routing)
  mapping/              Kartierung: Kampagnen → Aufnahmen → Horizonte
  tools/                Kartierungsunterstützung (Bestimmungs-/Berechnungshilfen, Lexika)
components/
  ui/                   Generische Bausteine (Button, NavRow, Dialog/ConfirmDialog, StatusBadge,
                        ChoiceChips, TextField, ValidatedField, Dropdown, ToolModal, Instruction, …)
  forms/                Formulare der Kartierung
    aufnahme/           Standortdaten-Formular, in Sektionen zerlegt
    horizont/           Horizont-Formular, in Sektionen zerlegt
    shared.tsx          Gemeinsame Formular-Bausteine (ReadonlyField, RatingField, …)
  tools/                Bestimmungshilfen (TreeTool für alle Entscheidungsbäume, Rechner, Kamera, Kompass)
  lexikon/              Nachschlage-Inhalte (Horizonte, Humusformen, Funktionsweise)
lib/                    Logik ohne UI
  db/                   SQLite-Schema + CRUD je Tabelle
  calc/                 KA5/KA6-Berechnungen und Nachschlagetabellen
  color/                Bodenfarbe: Bildanalyse und Munsell-Matching
  geo/                  Distanz/Peilung, WGS84 ⇄ UTM
  io/                   ZIP/CSV-Export und -Import, GPX-Import
  validation/           Eingabevalidierung der Formularfelder
data/                   Statische Daten (Munsell-Chips, Lexika, Dropdown-Optionen)
  trees/                Entscheidungsbäume der Bestimmungshilfen (Registry: index.ts → TREE_TOOLS)
hooks/                  React-Hooks (Autosave, Live-Standort, Debounce)
styles/                 Design-Tokens (theme.ts: Farben, Schriftgrößen, Abstände) und geteilte Text-/Layout-Styles
scripts/                Offline-Skripte (z. B. Erzeugung von data/munsellData.ts)
docs/                   Diese Dokumentation
```

**Abhängigkeitsrichtung:** `app → components → lib/data/hooks → styles`.
`lib/` und `data/` importieren nie aus `components/` (Ausnahme: reine
Typ-Imports wie `LabeledOption`). Alles in `lib/calc`, `lib/geo`, `lib/io/gpx`
und `lib/color/munsellLookup` ist frei von React/Expo und deshalb unit-testbar.

---

## Routen

| Route                                 | Inhalt                                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                                   | Startseite, ZIP-/GPX-Import                                                                   |
| `/mapping`                            | Liste der Feldkampagnen                                                                       |
| `/mapping/kampagne/[kampagneId]`      | Aufnahmen einer Kampagne, Export, „Standort verfolgen“ (Näherung ≥ 5 m bzw. GPS-Genauigkeit)  |
| `/mapping/[aufnahmeId]`               | Aufnahme: Horizontliste, Status, „Ort finden“                                                 |
| `/mapping/[aufnahmeId]/standort`      | Standortdaten (`AufnahmeForm`)                                                                |
| `/mapping/[aufnahmeId]/horizont/[nr]` | Horizont (`HorizontForm`)                                                                     |
| `/tools`                              | Übersicht der Kartierungsunterstützung                                                        |
| `/tools/<tool>`                       | Einzelnes Tool, z. B. `bodenart`, `bodenfarbe`, `kak` – dünne Wrapper um `components/tools/*` |
| `/about`                              | Projektinfo + Funktionsweise der Berechnungen                                                 |

Jeder Bereich (`mapping/`, `tools/`) hat einen eigenen Stack-Navigator in `_layout.tsx`.

---

## Datenmodell (`lib/db`)

SQLite-Datenbank `bodenaufnahme.db`. Schema und Migration laufen beim ersten
Import von `lib/db/db.ts` (also vor jeder Abfrage, auch bei Deep Links);
Fremdschlüssel sind eingeschaltet (`PRAGMA foreign_keys = ON`), Löschen
kaskadiert also von Kampagne → Aufnahmen → Horizonte.

```
feldkampagnen 1 ── n aufnahmen 1 ── n horizonte
```

- **feldkampagnen** – Name, Erstelldatum, Status (`offen`/`abgeschlossen`).
- **aufnahmen** – Koordinaten (GPS + UTM), Profil-, Standort-, Klima- und
  erweiterte Felder, `name` (z. B. GPX-Wegpunktname), Status.
- **horizonte** – Felder des Aufnahmeformblatts, berechnete Werte (Porenkennwerte,
  KAK, Basensättigung, TRD), `probennummern` als JSON-String, Status
  (`leer`/`angefangen`/`vollstaendig`, abgeleitet in `horizontStatus()`).
  `nummer` läuft immer lückenlos 1..n (Löschen nummeriert nach).

Die Datenspalten stehen **einmal** in `lib/db/columns.ts`
(`AUFNAHME_DETAIL_COLUMNS`, `HORIZONT_DATA_COLUMNS`, numerische Spalten in den
`*_REAL_COLUMNS`-Sets). Daraus entstehen die Migration (`db.ts` ergänzt beim
Start fehlende Spalten, rein additiv), die UPDATE-Statements, CSV-Export und
ZIP-Import sowie die Formulartypen. Neue Spalte = Eintrag in `columns.ts` +
Feld im Zeilentyp in `*Queries.ts`.

---

## Formulare (`components/forms`)

Beide Formulare speichern **automatisch**: `hooks/useFormAutosave` meldet jede
Wertänderung (auch berechnete Felder) an `onSave`; der Screen schreibt über
`hooks/useAutosave` debounced (250 ms) in die Datenbank und flusht beim
Verlassen des Screens, beim Wechsel der App in den Hintergrund und beim Unmount.
Zahleneingaben werden mit `parseDecimal` (`lib/number.ts`) gelesen, das das
Dezimalkomma akzeptiert.

- **`aufnahme/`** – `AufnahmeForm` hält Formularzustand und Koordinatenmodus
  (UTM ⇄ Dezimalgrad). Die Umrechnung DB-Zeile ⇄ Formularwerte steckt rein
  funktional in `types.ts` (`toAufnahmeFormDefaults`, `toAufnahmeDetails`).
  Gespeicherte Koordinaten bleiben unverändert, bis der Nutzer ein
  Koordinatenfeld bearbeitet (Eingabe oder GPS); erst dann werden sie aus dem
  bearbeiteten Format übernommen und ins andere umgerechnet. Profilwerte (FK bis
  1 m, nFK und S-Wert im eff. Wurzelraum) werden aus den übergebenen Horizonten
  berechnet und als „unvollständig“ angezeigt, wenn die Horizonte den
  Tiefenbereich nicht lückenlos ab 0 cm abdecken oder Werte fehlen. Ändert sich
  die Humusform, rechnet der Standort-Screen die KAK aller Horizonte neu.
- **`horizont/`** – `HorizontForm` hält Formularzustand und das gerade offene
  Tool. `useHorizontCalculations` hält alle abgeleiteten Felder aktuell; die
  eigentliche Berechnung ist die reine Funktion `deriveHorizont`
  (`lib/calc/deriveHorizont.ts`), geschrieben werden nur geänderte Felder:

  ```
  Farbe + pH + Tonanteil ──► Humus % ──► Humusklasse, KAK, Basensättigung
  Bodenart + Packungsdichte ──► TRD ──┐
  Tiefe oben/unten ──► Mächtigkeit ───┼──► GPV / LK / FK / nFK (Vol% + l/m²)
  Humus %, Skelettanteil ─────────────┘
  ```

  Bestimmungshilfen werden über `HorizontToolModals` geöffnet und schreiben ihr
  Ergebnis per `setValue` ins Feld.

Feldbeschriftungen tragen die Nummer des KA5/KA6-Aufnahmeformblatts in Klammern.

---

## Berechnungen (`lib/calc`)

| Modul                       | Grundlage                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- |
| `deriveHorizont.ts`         | Alle berechneten Horizontwerte in einem Durchgang (nutzt die Module unten)    |
| `mappingMaths.ts`           | Mächtigkeit, Gründigkeit, Porenkennwerte, KAK, Profilsummen, Bewertungsstufen |
| `poreLookup.ts`             | Porenkennwerte je Bodenart/TRD, Humuskorrektur (KA6 B3/B6/B9)                 |
| `trockenrohdichteLookup.ts` | TRD aus Bodenart + Packungsdichteklasse (KA6 B2)                              |
| `packungsdichteScoring.ts`  | Packungsdichte-Klasse aus fünf gewichteten Merkmalen (KA6 C47)                |
| `renger1987.ts`             | Humusgehalt aus Munsell, pH, Ton (Renger et al. 1987, digitalisiert)          |
| `bodenartClay.ts`           | Tonanteil-Bereich je Bodenart (KA6 C51)                                       |
| `basensaettigungLookup.ts`  | Basensättigung aus pH und Humus (digitalisierte Kurven)                       |

⚠️ Digitalisierte Diagramme (Renger, Basensättigung) sind Näherungen.

---

## Import / Export (`lib/io`)

- **Format**: `campaignArchive.ts` (rein, ohne Expo/SQLite) baut und parst die
  CSVs aus den Spaltenlisten in `lib/db/columns.ts`: `aufnahmen.csv`,
  `horizonte.csv` und bei Kampagnen-Exporten `kampagne.csv` (Name, Status,
  Datum). UTF-8 mit BOM, Trennzeichen `,`, Dezimalpunkt.
- **Export**: `csvExport.ts` schreibt die CSVs in ein ZIP und öffnet den Teilen-Dialog.
- **ZIP-Import**: `zipImport.ts` legt in **einer** Transaktion eine neue
  Kampagne an (inkl. Kampagne selbst – ein Fehler hinterlässt nichts). Status,
  Datum, Namen und Nummern von Aufnahmen und Horizonten bleiben erhalten;
  CSV-Fehler brechen mit Zeilenangabe ab.
- **GPX-Import**: `gpx.ts` parst `<wpt>`-Wegpunkte (abhängigkeitsfrei, CDATA,
  Entities, Namespace-Präfixe), `gpxImport.ts` legt pro Wegpunkt eine leere
  Aufnahme mit Koordinaten an.

---

## Farberkennung (`lib/color`)

Die gesamte Farbmathematik läuft im **linearen Licht**; erst der Anzeigewert
wird nach sRGB zurückkodiert. Die Referenz-Chips (`data/munsellData.ts`) werden
offline per `npm run generate:munsell` aus `scripts/data/real.dat` (RIT Munsell
Renotation Dataset) erzeugt: xyY (Lichtart C) → XYZ → Bradford-Adaption nach
D65 → Lab (D65); nur Chips im sRGB-Gamut werden übernommen.

Module: `colorMath.ts` (sRGB ⇄ linear, LUT, Mittelwert in linearem Licht),
`cameraOverlay.ts` (Rechtecke, Zuschnitt, Orientierungsprüfung),
`munsellLookup.ts` (Lab, CIEDE2000, nächster Chip) – alle rein und getestet;
`soilColorExtractor.ts` bindet Skia an.

```
PictureTaker.tsx  (components/tools)
  CameraView (Vorschau, bildschirmfüllend, center-crop "cover")
    │  onLayout → previewAspect = Breite / Höhe
    │  ("Foto aufnehmen" ist gesperrt, bis previewAspect bekannt ist)
    ▼
  "Foto aufnehmen" → takePictureAsync() → photo.uri   (vorheriges JPEG wird gelöscht)
    ▼
extractSoilColor(imageUri, previewAspect)            [lib/color/soilColorExtractor.ts]
  Skia: Bild dekodieren (W × H)
    │
    ├── orientationMatches(W, H, previewAspect)              [lib/color/cameraOverlay.ts]
    │     Foto quer, Vorschau hoch (oder umgekehrt) → ColorExtractionError
    │     ("Bitte im Hochformat fotografieren"), Anzeige in PictureTaker
    │
    ├── getSamplingRect("greyCard", W, H, previewAspect)
    │     Foto auf previewAspect zuschneiden → sichtbarer Bereich → Sample-Rechteck
    │        ▼
    │     image.readPixels(x, y, {RGBA_8888, Unpremul}) – nur dieses Rechteck
    │        ▼
    │     Pixel linearisieren (LUT) und mitteln → greyCardLinear
    │        ▼
    │     Korrekturfaktoren = linear(sRGB 128) / greyCardLinear   (pro Kanal)
    │
    ├── getSamplingRect("soilSample", …) → readPixels → linearisieren, mitteln → soilLinear
    ▼
  Weißabgleich: soilLinear × Faktoren → correctedLinear (geklemmt 0..1)
    │
    ├── linearRgbToMunsell(correctedLinear)              [lib/color/munsellLookup.ts]
    │     → XYZ → Lab (D65) → CIEDE2000-Nearest-Neighbor über alle Chips
    │     → { munsell: "7.5YR 4/4", distance: ΔE00 }
    │     distance > POOR_MATCH_DELTA_E00 (5) → Hinweis "Schlechte Übereinstimmung"
    │
    └── nach sRGB zurückkodieren → nur für die Anzeige
```

**Weißabgleich:** Der Code skaliert die gemessene Greycard pro Kanal auf
`linear(sRGB 128)` ≈ 0,216 (`TARGET_GREY_LINEAR` in `soilColorExtractor.ts`).
Das ist ein reiner Kanal-Gain in linearem Licht; welcher Reflexionsgrad der
Karte diesem Zielwert entspricht, legt der Code nicht fest (offene Frage B3.1).

**Messflächen** (Anteile des sichtbaren Bildausschnitts, `cameraOverlay.ts`):

| Bereich    | angezeigte Box (oben–unten) | gemessen (oben–unten) |
| ---------- | --------------------------- | --------------------- |
| Greycard   | 0,25–0,75, links 0,20–0,80  | 0,25–0,60             |
| Bodenprobe | 0,65–0,75, links 0,42–0,58  | identisch             |

Die Bodenprobe-Box liegt innerhalb der Greycard-Box. Das Greycard-Messband ist
deshalb absichtlich **oben ausgerichtet** (nicht zentriert): Ein zentriertes
Band (0,325–0,675) würde die Bodenprobe-Box überlappen und Bodenpixel in die
Grau-Referenz mischen; die Unterkante 0,60 lässt einen Abstand zur Box.

**Annahmen:** Vorschau skaliert mit "cover"; analysiert wird nur der sichtbare
Bildausschnitt, damit die gemittelten Pixel zu den weißen Hilfsrechtecken
passen. Foto und Vorschau müssen dieselbe Orientierung haben.
`cameraOverlay.ts` ist die einzige Quelle der Rechtecke für UI und Extraktion.

---

## Konventionen

- **Benennung:** Komponenten-Dateien in PascalCase (`HorizontForm.tsx`), alle
  anderen Module in camelCase (`poreLookup.ts`). Fachbegriffe bleiben deutsch und
  einheitlich: **Horizont**, Aufnahme, Feldkampagne, Bodenart …
- **Imports:** immer über den Alias `@/…` (Projektwurzel); innerhalb eines
  Formular-Ordners relativ (`./types`, `../shared`).
- **Tests:** neben dem Modul in `__tests__/` (`npm test`, jest-expo).
- **Qualität:** `npm run typecheck`, `npm run lint` (ESLint + Prettier) und
  `npm test` müssen fehlerfrei durchlaufen.
