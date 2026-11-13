import type { Aufnahme } from "@/lib/db/aufnahmeQueries";
import type { Horizont } from "@/lib/db/horizontQueries";
import {
  AUFNAHME_DETAIL_COLUMNS,
  HORIZONT_DATA_COLUMNS,
} from "@/lib/db/columns";
import {
  CSV_BOM,
  buildAufnahmenCsv,
  buildHorizonteCsv,
  buildKampagneCsv,
  groupHorizonte,
  normalizeTimestamp,
  orderAufnahmen,
  packCampaignZip,
  parseAufnahmenCsv,
  parseCsv,
  parseHorizonteCsv,
  parseKampagneCsv,
  unpackCampaignZip,
  type ParsedAufnahme,
  type ParsedHorizont,
} from "@/lib/io/campaignArchive";
import { campaignNameFromFile, sqliteTimestamp } from "@/lib/io/importUtils";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function emptyAufnahme(): Aufnahme {
  const a = {
    id: 0,
    nummer: null,
    name: null,
    feldkampagne_id: 1,
    erstellt_am: "2026-05-01 08:00:00",
    status: "offen",
  } as Record<string, unknown>;
  for (const c of AUFNAHME_DETAIL_COLUMNS) a[c] = null;
  return a as Aufnahme;
}

function emptyHorizont(): Horizont {
  const h = { id: 0, aufnahme_id: 0, nummer: 1, status: "leer" } as Record<
    string,
    unknown
  >;
  for (const c of HORIZONT_DATA_COLUMNS) h[c] = null;
  return h as Horizont;
}

const aufnahme1: Aufnahme = {
  ...emptyAufnahme(),
  id: 17,
  nummer: 1,
  name: 'Hang, oben "Süd"',
  erstellt_am: "2026-05-01 08:00:00",
  status: "abgeschlossen",
  gps_lat: 51.533412,
  gps_lon: 9.935512,
  utm_easting: 564123.4,
  utm_northing: 5709876.1,
  utm_zone: "32N",
  m_ue_nn: -3.5,
  bodentyp: "Braunerde",
  humusform: "Mull",
  expos: "SSO",
  mittl_n: 650,
  mittl_temp: 8.5,
  notizen: "Zeile 1\nZeile 2, mit Komma\r\nÄÖÜ äöü ß",
};

const aufnahme2: Aufnahme = {
  ...emptyAufnahme(),
  id: 18,
  nummer: 2,
  erstellt_am: "2026-05-01 09:30:00",
};

const horizonte: Horizont[] = [
  {
    ...emptyHorizont(),
    aufnahme_id: 17,
    nummer: 1,
    status: "vollstaendig",
    horizontname: "Ah",
    tiefe_oben: "0",
    tiefe_unten: "12",
    ph_cacl2: 5.5,
    bodenart: "Uls",
    humus: "h4",
    humus_pct: "4,5",
    probennummern: '["P1","P2, \\"neu\\""]',
    notizen: 'Wurzeln; "viele"\nGrus',
  },
  {
    ...emptyHorizont(),
    aufnahme_id: 17,
    nummer: 2,
    status: "angefangen",
    horizontname: "Bv",
    ph_cacl2: 6,
  },
];

/** What the importer should yield for an exported Aufnahme / Horizont. */
const expectedAufnahme = (a: Aufnahme): ParsedAufnahme => ({
  sourceId: String(a.id),
  nummer: a.nummer,
  name: a.name,
  erstellt_am: a.erstellt_am,
  status: a.status,
  details: Object.fromEntries(
    AUFNAHME_DETAIL_COLUMNS.map((c) => [c, a[c]]),
  ) as ParsedAufnahme["details"],
});

const expectedHorizont = (h: Horizont): ParsedHorizont => ({
  aufnahmeSourceId: String(h.aufnahme_id),
  nr: h.nummer,
  status: h.status,
  data: Object.fromEntries(
    HORIZONT_DATA_COLUMNS.map((c) => [c, h[c]]),
  ) as ParsedHorizont["data"],
});

// ─── Round trip ───────────────────────────────────────────────────────────────

describe("CSV export → import round trip", () => {
  it("restores Aufnahmen exactly", () => {
    const csv = buildAufnahmenCsv([aufnahme2, aufnahme1]);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(parseAufnahmenCsv(csv)).toEqual([
      expectedAufnahme(aufnahme2),
      expectedAufnahme(aufnahme1),
    ]);
  });

  it("restores Horizonte exactly (incl. ph as number, JSON probennummern)", () => {
    const parsed = parseHorizonteCsv(buildHorizonteCsv(horizonte));
    expect(parsed).toEqual(horizonte.map(expectedHorizont));
    expect(parsed[0].data.ph_cacl2).toBe(5.5);
    expect(JSON.parse(parsed[0].data.probennummern!)).toEqual([
      "P1",
      'P2, "neu"',
    ]);
  });

  it("restores the Kampagne metadata", () => {
    const k = {
      name: "Exkursion 2.5, Göttingen",
      status: "abgeschlossen" as const,
      erstellt_am: "2026-04-30 12:00:00",
    };
    expect(parseKampagneCsv(buildKampagneCsv(k))).toEqual(k);
  });

  it("exports null and empty strings both as empty cells, imported as null", () => {
    const h = { ...emptyHorizont(), aufnahme_id: 1, horizontname: "" };
    const parsed = parseHorizonteCsv(buildHorizonteCsv([h]));
    expect(parsed[0].data.horizontname).toBeNull();
    expect(parsed[0].data.bodenart).toBeNull();
  });

  it("writes the column lists as headers, meta columns first", () => {
    const header = (csv: string) => csv.slice(1).split("\r\n")[0].split(",");
    expect(header(buildAufnahmenCsv([]))).toEqual([
      "aufnahme_id",
      "nummer",
      "name",
      "erstellt_am",
      "status",
      ...AUFNAHME_DETAIL_COLUMNS,
    ]);
    expect(header(buildHorizonteCsv([]))).toEqual([
      "aufnahme_id",
      "horizont_nr",
      "status",
      ...HORIZONT_DATA_COLUMNS,
    ]);
  });

  it("round-trips through the ZIP (incl. BOM and UTF-8)", async () => {
    const bytes = await packCampaignZip({
      kampagne: {
        name: "Übung",
        status: "offen",
        erstellt_am: "2026-04-30 12:00:00",
      },
      aufnahmen: [aufnahme2, aufnahme1],
      horizonte,
    });
    const parsed = await unpackCampaignZip(bytes);
    expect(parsed.kampagne).toEqual({
      name: "Übung",
      status: "offen",
      erstellt_am: "2026-04-30 12:00:00",
    });
    expect(parsed.aufnahmen).toEqual([
      expectedAufnahme(aufnahme2),
      expectedAufnahme(aufnahme1),
    ]);
    expect(parsed.horizonte).toEqual(horizonte.map(expectedHorizont));
  });

  it("omits kampagne.csv for single-Aufnahme exports", async () => {
    const bytes = await packCampaignZip({
      kampagne: null,
      aufnahmen: [aufnahme1],
      horizonte: [],
    });
    const parsed = await unpackCampaignZip(bytes);
    expect(parsed.kampagne).toBeNull();
    expect(parsed.horizonte).toEqual([]);
  });
});

// ─── Parsing details ──────────────────────────────────────────────────────────

describe("parseCsv", () => {
  it("strips the BOM so the first header is usable", () => {
    const { rows, fields } = parseCsv(`${CSV_BOM}a,b\r\n1,2\r\n`, "x.csv");
    expect(fields).toEqual(["a", "b"]);
    expect(rows).toEqual([{ a: "1", b: "2" }]);
  });

  it("accepts files re-saved with ';' and decimal commas", () => {
    const parsed = parseAufnahmenCsv(
      "aufnahme_id;nummer;gps_lat;notizen\r\n5;1;51,5;a, b\r\n",
    );
    expect(parsed[0].details.gps_lat).toBe(51.5);
    expect(parsed[0].details.notizen).toBe("a, b");
  });

  it("reports the first parse error with its row in German", () => {
    expect(() => parseCsv("a,b\r\n1,2\r\n3\r\n", "horizonte.csv")).toThrow(
      "Fehler in horizonte.csv, Zeile 3: zu wenige Spalten.",
    );
    expect(() => parseCsv('a,b\r\n1,"2\r\n', "aufnahmen.csv")).toThrow(
      /Fehler in aufnahmen\.csv.*Anführungszeichen/,
    );
  });

  it("requires aufnahme_id and rejects duplicates", () => {
    expect(() => parseAufnahmenCsv("name\r\nx\r\n")).toThrow(
      'Spalte "aufnahme_id" fehlt',
    );
    expect(() => parseAufnahmenCsv("aufnahme_id\r\n1\r\n1\r\n")).toThrow(
      'Zeile 3: aufnahme_id "1" doppelt',
    );
  });

  it("drops unknown status values and invalid timestamps", () => {
    const [a] = parseAufnahmenCsv(
      "aufnahme_id,status,erstellt_am\r\n1,fertig,gestern\r\n",
    );
    expect(a.status).toBeNull();
    expect(a.erstellt_am).toBeNull();
    const [h] = parseHorizonteCsv("aufnahme_id,status\r\n1,kaputt\r\n");
    expect(h.status).toBeNull();
    expect(parseKampagneCsv("name,status\r\nK,zu\r\n")?.status).toBeNull();
  });
});

describe("normalizeTimestamp", () => {
  it.each([
    ["2026-05-01 08:00:00", "2026-05-01 08:00:00"],
    ["2026-05-01T08:00:00", "2026-05-01 08:00:00"],
    ["2026-05-01T08:00:00.123Z", "2026-05-01 08:00:00"],
    ["2026-05-01 08:00", "2026-05-01 08:00:00"],
    ["01.05.2026 08:00", null],
    ["", null],
    [undefined, null],
  ])("%p → %p", (input, expected) => {
    expect(normalizeTimestamp(input)).toBe(expected);
  });
});

// ─── Import ordering ──────────────────────────────────────────────────────────

const parsedAufnahme = (
  sourceId: string,
  nummer: number | null,
  erstellt_am: string | null,
): ParsedAufnahme => ({
  ...expectedAufnahme(emptyAufnahme()),
  sourceId,
  nummer,
  erstellt_am,
});

describe("orderAufnahmen", () => {
  it("keeps exported nummern and inserts in that order", () => {
    const rows = [
      parsedAufnahme("c", 3, "2026-05-03 00:00:00"),
      parsedAufnahme("a", 1, "2026-05-01 00:00:00"),
      parsedAufnahme("b", 2, "2026-05-02 00:00:00"),
    ];
    expect(
      orderAufnahmen(rows).map((r) => [r.aufnahme.sourceId, r.nummer]),
    ).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  it("without nummern inserts oldest first (export is newest first)", () => {
    const rows = [
      parsedAufnahme("c", null, "2026-05-02 00:00:00"),
      parsedAufnahme("b", null, "2026-05-02 00:00:00"),
      parsedAufnahme("a", null, "2026-05-01 00:00:00"),
    ];
    expect(orderAufnahmen(rows)).toEqual(
      ["a", "b", "c"].map((id) => ({
        aufnahme: rows.find((r) => r.sourceId === id),
        nummer: null,
      })),
    );
  });

  it("falls back to creation order when nummern are duplicated", () => {
    const rows = [
      parsedAufnahme("b", 1, "2026-05-02 00:00:00"),
      parsedAufnahme("a", 1, "2026-05-01 00:00:00"),
    ];
    expect(
      orderAufnahmen(rows).map((r) => [r.aufnahme.sourceId, r.nummer]),
    ).toEqual([
      ["a", null],
      ["b", null],
    ]);
  });
});

describe("groupHorizonte", () => {
  const h = (aufnahme: string, nr: number | null, name: string) => ({
    ...expectedHorizont({ ...emptyHorizont(), horizontname: name }),
    aufnahmeSourceId: aufnahme,
    nr,
  });

  it("sorts by horizont_nr, renumbers 1..n and counts orphans", () => {
    const { byAufnahme, orphans } = groupHorizonte(
      [
        h("1", 3, "C"),
        h("1", null, "X"),
        h("1", 1, "A"),
        h("2", 2, "B2"),
        h("2", 2, "B2b"),
        h("9", 1, "orphan"),
      ],
      new Set(["1", "2"]),
    );
    expect(orphans).toBe(1);
    const summary = (id: string) =>
      byAufnahme.get(id)!.map((x) => [x.nummer, x.data.horizontname]);
    expect(summary("1")).toEqual([
      [1, "A"],
      [2, "C"],
      [3, "X"],
    ]);
    expect(summary("2")).toEqual([
      [1, "B2"],
      [2, "B2b"],
    ]);
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

describe("campaignNameFromFile", () => {
  it.each([
    ["Exkursion 2.5.gpx", "Exkursion 2.5"],
    ["kampagne_Test.zip", "kampagne_Test"],
    ["Profil.GPX", "Profil"],
    ["  Name  .zip", "Name"],
    [".gpx", "Importierte Kampagne"],
  ])("%p → %p", (file, name) => {
    expect(campaignNameFromFile(file)).toBe(name);
  });
});

describe("sqliteTimestamp", () => {
  it("formats UTC like SQLite datetime('now')", () => {
    expect(sqliteTimestamp(new Date(Date.UTC(2026, 10, 13, 7, 5, 9)))).toBe(
      "2026-11-13 07:05:09",
    );
  });
});
