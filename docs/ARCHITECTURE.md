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
  ui/                   Generische Bausteine (Badge, InfoButton, ValidatedField, Dropdown, …)
  forms/                Formulare der Kartierung
    aufnahme/           Standortdaten-Formular, in Sektionen zerlegt
    horizont/           Horizont-Formular, in Sektionen zerlegt
    shared.tsx          Gemeinsame Formular-Bausteine (ToolModal, ReadonlyField, …)
  tools/                Bestimmungshilfen (Entscheidungsbäume, Rechner, Kamera, Kompass)
  lexikon/              Nachschlage-Inhalte (Horizonte, Humusformen, Funktionsweise)
lib/                    Logik ohne UI
  db/                   SQLite-Schema + CRUD je Tabelle
  calc/                 KA5/KA6-Berechnungen und Nachschlagetabellen
  color/                Bodenfarbe: Bildanalyse und Munsell-Matching
  geo/                  Distanz/Peilung, WGS84 ⇄ UTM
  io/                   ZIP/CSV-Export und -Import, GPX-Import
  validation/           Eingabevalidierung der Formularfelder
data/                   Statische Daten (Munsell-Chips, Lexika, Dropdown-Optionen)
  trees/                Entscheidungsbäume der Bestimmungshilfen
hooks/                  React-Hooks
styles/                 Globale Farben und StyleSheet
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
| `/mapping/kampagne/[kampagneId]`      | Aufnahmen einer Kampagne, Export, „Standort verfolgen“ (5 m-Näherung)                         |
| `/mapping/[aufnahmeId]`               | Aufnahme: Horizontliste, Status, „Ort finden“                                                 |
| `/mapping/[aufnahmeId]/standort`      | Standortdaten (`AufnahmeForm`)                                                                |
| `/mapping/[aufnahmeId]/horizont/[nr]` | Horizont (`HorizontForm`)                                                                     |
| `/tools`                              | Übersicht der Kartierungsunterstützung                                                        |
| `/tools/<tool>`                       | Einzelnes Tool, z. B. `bodenart`, `bodenfarbe`, `kak` – dünne Wrapper um `components/tools/*` |
| `/about`                              | Projektinfo + Funktionsweise der Berechnungen                                                 |

Jeder Bereich (`mapping/`, `tools/`) hat einen eigenen Stack-Navigator in `_layout.tsx`.

---

## Datenmodell (`lib/db`)

SQLite-Datenbank `bodenaufnahme.db`, angelegt in `initDatabase()` beim App-Start.

```
feldkampagnen 1 ── n aufnahmen 1 ── n horizonte
```

- **feldkampagnen** – Name, Erstelldatum, Status (`offen`/`abgeschlossen`).
- **aufnahmen** – Koordinaten (GPS + UTM), Profil-, Standort-, Klima- und
  erweiterte Felder, `name` (z. B. GPX-Wegpunktname), Status.
- **horizonte** – Felder des Aufnahmeformblatts, berechnete Werte (Porenkennwerte,
  KAK, Basensättigung, TRD), `probennummern` als JSON-String, Status
  (`leer`/`angefangen`/`vollstaendig`).

Schemaänderungen erfolgen **additiv** per `ALTER TABLE … ADD COLUMN` im
try/catch in `db.ts`; bestehende Installationen werden so beim Start migriert.
Neue Spalten müssen zusätzlich in `*Queries.ts`, in `lib/io/csvExport.ts` und
`lib/io/zipImport.ts` ergänzt werden, sonst gehen sie beim Export/Import verloren.

---

## Formulare (`components/forms`)

Beide Formulare speichern **automatisch**: eine einmalige `watch`-Subscription
ruft `onSave` über eine Ref auf; der Screen schreibt debounced (250 ms,
`hooks/useDebouncedCallback`) in die Datenbank und flusht beim Verlassen.

- **`aufnahme/`** – `AufnahmeForm` hält Formularzustand und Koordinatenmodus
  (UTM ⇄ Dezimalgrad). Die Umrechnung DB-Zeile ⇄ Formularwerte steckt rein
  funktional in `types.ts` (`toAufnahmeFormDefaults`, `toAufnahmeDetails`).
  Profilwerte (FK bis 1 m, nFK und S-Wert im eff. Wurzelraum) werden aus den
  übergebenen Horizonten berechnet.
- **`horizont/`** – `HorizontForm` hält Formularzustand und das gerade offene
  Tool. `useHorizontCalculations` hält alle abgeleiteten Felder aktuell:

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

- **Export**: `csvExport.ts` schreibt `aufnahmen.csv` + `horizonte.csv` in ein ZIP.
- **ZIP-Import**: `zipImport.ts` liest ein solches ZIP und legt in **einer**
  Transaktion eine neue Kampagne an (Status, Datum, Namen bleiben erhalten).
- **GPX-Import**: `gpx.ts` parst `<wpt>`-Wegpunkte (abhängigkeitsfrei),
  `gpxImport.ts` legt pro Wegpunkt eine leere Aufnahme mit Koordinaten an.

---

## Farberkennung (`lib/color`)

Die gesamte Farbmathematik läuft im **linearen Licht**; erst der Anzeigewert
wird nach sRGB zurückkodiert. Die Referenz-Chips (`data/munsellData.ts`) werden
offline per `npm run generate:munsell` aus `scripts/data/real.dat` (RIT Munsell
Renotation Dataset) erzeugt.

```
PictureTaker.tsx  (components/tools)
  CameraView (Vorschau, bildschirmfüllend, center-crop "cover")
    │  onLayout → previewAspect = Breite / Höhe
    ▼
  "Foto aufnehmen" → takePictureAsync() → photo.uri
    ▼
extractSoilColor(imageUri, previewAspect)            [lib/color/soilColorExtractor.ts]
  Skia: Bild dekodieren → readPixels()   (RGBA, 8-bit)
    │
    ├── getSamplingRect("greyCard", W, H, previewAspect)     [lib/color/cameraOverlay.ts]
    │     Foto auf previewAspect zuschneiden → sichtbarer Bereich → Sample-Rechteck
    │        ▼
    │     Pixel linearisieren und mitteln → greyCardLinear
    │        ▼
    │     Korrekturfaktoren = linear(sRGB 128) / greyCardLinear   (pro Kanal)
    │
    ├── getSamplingRect("soilSample", …) → Pixel linearisieren und mitteln → soilLinear
    ▼
  Weißabgleich: soilLinear × Faktoren → correctedLinear (geklemmt 0..1)
    │
    ├── linearRgbToMunsell(correctedLinear)              [lib/color/munsellLookup.ts]
    │     → Lab (D65) → CIEDE2000-Nearest-Neighbor über alle Chips
    │     → z. B. "7.5YR 4/4"
    │
    └── nach sRGB zurückkodieren → nur für die Anzeige
```

**Annahmen:** Vorschau skaliert mit "cover"; analysiert wird nur der sichtbare
Bildausschnitt, damit die gemittelten Pixel zu den weißen Hilfsrechtecken passen.
Die Greycard-Messfläche ist absichtlich kleiner als die angezeigte Box
(Randartefakte). `cameraOverlay.ts` ist die einzige Quelle der Rechtecke für UI
und Extraktion.

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
