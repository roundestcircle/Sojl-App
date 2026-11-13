/**
 * Pure build/parse logic of the campaign ZIP (kampagne.csv, aufnahmen.csv,
 * horizonte.csv). No Expo or SQLite imports, so the whole export → import
 * round trip is unit-testable; csvExport.ts and zipImport.ts wrap it with
 * file, share-sheet and DB access.
 *
 * The CSV columns come from lib/db/columns.ts: a few meta columns followed by
 * every data column, so a new DB column is exported and imported automatically.
 * Values are written as `String(value)` (dot decimals) and null as "".
 */
import Papa from "papaparse";
import JSZip from "jszip";
import type { Aufnahme, AufnahmeDetails } from "@/lib/db/aufnahmeQueries";
import type { Feldkampagne } from "@/lib/db/feldkampagneQueries";
import type { Horizont, HorizontData } from "@/lib/db/horizontQueries";
import {
  AUFNAHME_DETAIL_COLUMNS,
  AUFNAHME_REAL_COLUMNS,
  HORIZONT_DATA_COLUMNS,
  HORIZONT_REAL_COLUMNS,
} from "@/lib/db/columns";
import { parseDecimal } from "@/lib/number";

// ─── File layout ──────────────────────────────────────────────────────────────

export const KAMPAGNE_CSV = "kampagne.csv";
export const AUFNAHMEN_CSV = "aufnahmen.csv";
export const HORIZONTE_CSV = "horizonte.csv";

/** UTF-8 byte order mark, so Excel opens the CSVs with the right encoding. */
export const CSV_BOM = "﻿";

const KAMPAGNE_COLUMNS = ["name", "status", "erstellt_am"] as const;
const AUFNAHME_META_COLUMNS = [
  "aufnahme_id",
  "nummer",
  "name",
  "erstellt_am",
  "status",
] as const;
const HORIZONT_META_COLUMNS = ["aufnahme_id", "horizont_nr", "status"] as const;

const KAMPAGNE_STATUS = ["offen", "abgeschlossen"] as const;
const AUFNAHME_STATUS = ["offen", "abgeschlossen"] as const;
const HORIZONT_STATUS = ["leer", "angefangen", "vollstaendig"] as const;

// ─── Export ───────────────────────────────────────────────────────────────────

export type KampagneMeta = Pick<
  Feldkampagne,
  "name" | "status" | "erstellt_am"
>;

export type CampaignExport = {
  /** Null for a single-Aufnahme export (no kampagne.csv is written). */
  kampagne: KampagneMeta | null;
  aufnahmen: readonly Aufnahme[];
  horizonte: readonly Horizont[];
};

type Cell = string | number | null | undefined;

function toCsv(
  columns: readonly string[],
  rows: readonly Record<string, Cell>[],
): string {
  const data = rows.map((row) =>
    columns.map((c) => (row[c] == null ? "" : String(row[c]))),
  );
  return CSV_BOM + Papa.unparse({ fields: [...columns], data });
}

export function buildKampagneCsv(kampagne: KampagneMeta): string {
  return toCsv(KAMPAGNE_COLUMNS, [kampagne]);
}

export function buildAufnahmenCsv(aufnahmen: readonly Aufnahme[]): string {
  return toCsv(
    [...AUFNAHME_META_COLUMNS, ...AUFNAHME_DETAIL_COLUMNS],
    aufnahmen.map((a) => ({ ...a, aufnahme_id: a.id })),
  );
}

export function buildHorizonteCsv(horizonte: readonly Horizont[]): string {
  return toCsv(
    [...HORIZONT_META_COLUMNS, ...HORIZONT_DATA_COLUMNS],
    horizonte.map((h) => ({ ...h, horizont_nr: h.nummer })),
  );
}

/** Packs a campaign (or a single Aufnahme) into the export ZIP. */
export async function packCampaignZip(
  content: CampaignExport,
): Promise<Uint8Array> {
  const zip = new JSZip();
  if (content.kampagne) {
    zip.file(KAMPAGNE_CSV, buildKampagneCsv(content.kampagne));
  }
  zip.file(AUFNAHMEN_CSV, buildAufnahmenCsv(content.aufnahmen));
  zip.file(HORIZONTE_CSV, buildHorizonteCsv(content.horizonte));
  return zip.generateAsync({ type: "uint8array" });
}

// ─── Import: CSV parsing ──────────────────────────────────────────────────────

type CsvRow = Record<string, string | undefined>;

const PARSE_ERROR_TEXT: Record<Papa.ParseError["code"], string> = {
  MissingQuotes: "Anführungszeichen nicht geschlossen",
  InvalidQuotes: "ungültige Anführungszeichen",
  TooFewFields: "zu wenige Spalten",
  TooManyFields: "zu viele Spalten",
  UndetectableDelimiter: "Trennzeichen nicht erkannt",
};

/** Spreadsheet row number of a data row (row 1 is the header). */
const sheetRow = (dataIndex: number) => dataIndex + 2;

/**
 * Parses a CSV with a header row into string records. Throws a German error
 * naming the file and row of the first parse problem.
 */
export function parseCsv(
  text: string,
  fileName: string,
): { rows: CsvRow[]; fields: string[] } {
  const result = Papa.parse<CsvRow>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: true,
    // Our exports use ","; ";" is accepted for files re-saved by a German Excel.
    delimitersToGuess: [",", ";"],
  });
  // An undetectable delimiter only means "single column" and falls back to ",".
  const error = result.errors.find((e) => e.code !== "UndetectableDelimiter");
  if (error) {
    const where = error.row != null ? `, Zeile ${sheetRow(error.row)}` : "";
    throw new Error(
      `Fehler in ${fileName}${where}: ${PARSE_ERROR_TEXT[error.code] ?? error.message}.`,
    );
  }
  return { rows: result.data, fields: result.meta.fields ?? [] };
}

function requireColumn(fields: string[], column: string, fileName: string) {
  if (!fields.includes(column)) {
    throw new Error(
      `Ungültige Datei: Spalte "${column}" fehlt in ${fileName}.`,
    );
  }
}

/** Inverse of the export's `String(value)` / "" for TEXT columns. */
function textOrNull(s: string | undefined): string | null {
  return s == null || s === "" ? null : s;
}

/** A positive integer, or null when empty / not a whole number ≥ 1. */
function positiveInt(s: string | undefined): number | null {
  const n = parseDecimal(s);
  return n != null && Number.isInteger(n) && n >= 1 ? n : null;
}

function oneOf<T extends string>(
  allowed: readonly T[],
  s: string | undefined,
): T | null {
  const t = s?.trim() ?? "";
  return (allowed as readonly string[]).includes(t) ? (t as T) : null;
}

/**
 * Accepts SQLite timestamps ("YYYY-MM-DD HH:MM:SS"), also with "T" or without
 * seconds; anything else yields null (the importer then uses "now").
 */
export function normalizeTimestamp(s: string | undefined): string | null {
  const m = s
    ?.trim()
    .match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?(?:\.\d+)?Z?$/);
  return m ? `${m[1]} ${m[2]}${m[3] ?? ":00"}` : null;
}

/** Maps the data columns of a row: REAL columns via parseDecimal, others as text. */
function mapDataColumns<C extends string>(
  row: CsvRow,
  columns: readonly C[],
  real: ReadonlySet<string>,
): Record<C, string | number | null> {
  const out = {} as Record<C, string | number | null>;
  for (const c of columns) {
    out[c] = real.has(c) ? parseDecimal(row[c]) : textOrNull(row[c]);
  }
  return out;
}

export type ParsedKampagne = {
  name: string | null;
  status: Feldkampagne["status"] | null;
  erstellt_am: string | null;
};

export type ParsedAufnahme = {
  /** aufnahme_id of the exporting device; links the horizonte.csv rows. */
  sourceId: string;
  nummer: number | null;
  name: string | null;
  erstellt_am: string | null;
  status: Aufnahme["status"] | null;
  details: AufnahmeDetails;
};

export type ParsedHorizont = {
  aufnahmeSourceId: string;
  /** horizont_nr as exported (null when missing or not a positive integer). */
  nr: number | null;
  status: Horizont["status"] | null;
  data: HorizontData;
};

export function parseKampagneCsv(text: string): ParsedKampagne | null {
  const row = parseCsv(text, KAMPAGNE_CSV).rows[0];
  if (!row) return null;
  return {
    name: row.name?.trim() || null,
    status: oneOf(KAMPAGNE_STATUS, row.status),
    erstellt_am: normalizeTimestamp(row.erstellt_am),
  };
}

export function parseAufnahmenCsv(text: string): ParsedAufnahme[] {
  const { rows, fields } = parseCsv(text, AUFNAHMEN_CSV);
  requireColumn(fields, "aufnahme_id", AUFNAHMEN_CSV);
  const seen = new Set<string>();
  return rows.map((row, i) => {
    const sourceId = row.aufnahme_id?.trim() ?? "";
    if (sourceId === "" || seen.has(sourceId)) {
      throw new Error(
        `Fehler in ${AUFNAHMEN_CSV}, Zeile ${sheetRow(i)}: aufnahme_id ${
          sourceId === "" ? "fehlt" : `"${sourceId}" doppelt`
        }.`,
      );
    }
    seen.add(sourceId);
    return {
      sourceId,
      nummer: positiveInt(row.nummer),
      name: textOrNull(row.name),
      erstellt_am: normalizeTimestamp(row.erstellt_am),
      status: oneOf(AUFNAHME_STATUS, row.status),
      details: mapDataColumns(
        row,
        AUFNAHME_DETAIL_COLUMNS,
        AUFNAHME_REAL_COLUMNS,
      ) as AufnahmeDetails,
    };
  });
}

export function parseHorizonteCsv(text: string): ParsedHorizont[] {
  const { rows, fields } = parseCsv(text, HORIZONTE_CSV);
  if (rows.length > 0) requireColumn(fields, "aufnahme_id", HORIZONTE_CSV);
  return rows.map((row) => ({
    aufnahmeSourceId: row.aufnahme_id?.trim() ?? "",
    nr: positiveInt(row.horizont_nr),
    status: oneOf(HORIZONT_STATUS, row.status),
    data: mapDataColumns(
      row,
      HORIZONT_DATA_COLUMNS,
      HORIZONT_REAL_COLUMNS,
    ) as HorizontData,
  }));
}

// ─── Import: ordering ─────────────────────────────────────────────────────────

/** Stable sort by a numeric key (null last), independent of engine stability. */
function sortByKey<T>(items: readonly T[], key: (t: T) => number | null): T[] {
  return items
    .map((item, i) => ({ item, i, k: key(item) ?? Infinity }))
    .sort((a, b) => a.k - b.k || a.i - b.i)
    .map((x) => x.item);
}

/**
 * Returns the Aufnahmen in insertion order with the nummer to restore.
 *
 * When every row carries a distinct nummer, they are inserted in that order and
 * keep it. Otherwise (older exports without the column, or edited files) they
 * are inserted oldest first with nummer null, so the DB numbers them 1..n in
 * creation order. The export lists them newest first, hence the reversal as
 * the tie-breaker for equal or missing timestamps.
 */
export function orderAufnahmen(
  aufnahmen: readonly ParsedAufnahme[],
): { aufnahme: ParsedAufnahme; nummer: number | null }[] {
  const nummern = aufnahmen.map((a) => a.nummer);
  const complete =
    nummern.every((n) => n != null) && new Set(nummern).size === nummern.length;
  if (complete) {
    return sortByKey(aufnahmen, (a) => a.nummer).map((aufnahme) => ({
      aufnahme,
      nummer: aufnahme.nummer,
    }));
  }
  const oldestFirst = sortByKey([...aufnahmen].reverse(), (a) =>
    a.erstellt_am == null ? null : Date.parse(a.erstellt_am.replace(" ", "T")),
  );
  return oldestFirst.map((aufnahme) => ({ aufnahme, nummer: null }));
}

/**
 * Groups the Horizont rows by their Aufnahme, sorted by horizont_nr and
 * renumbered 1..n (rows without a valid number go last, in file order).
 * Rows whose aufnahme_id is not in aufnahmen.csv are counted as orphans.
 */
export function groupHorizonte(
  horizonte: readonly ParsedHorizont[],
  aufnahmeIds: ReadonlySet<string>,
): {
  byAufnahme: Map<string, (ParsedHorizont & { nummer: number })[]>;
  orphans: number;
} {
  const grouped = new Map<string, ParsedHorizont[]>();
  let orphans = 0;
  for (const h of horizonte) {
    if (!aufnahmeIds.has(h.aufnahmeSourceId)) {
      orphans++;
      continue;
    }
    const list = grouped.get(h.aufnahmeSourceId) ?? [];
    list.push(h);
    grouped.set(h.aufnahmeSourceId, list);
  }
  const byAufnahme = new Map<string, (ParsedHorizont & { nummer: number })[]>();
  for (const [id, list] of grouped) {
    byAufnahme.set(
      id,
      sortByKey(list, (h) => h.nr).map((h, i) => ({ ...h, nummer: i + 1 })),
    );
  }
  return { byAufnahme, orphans };
}

// ─── Import: ZIP ──────────────────────────────────────────────────────────────

export type ParsedCampaign = {
  /** Null for single-Aufnahme exports and exports from older app versions. */
  kampagne: ParsedKampagne | null;
  aufnahmen: ParsedAufnahme[];
  horizonte: ParsedHorizont[];
};

/** Reads and parses an export ZIP. Throws German errors for invalid files. */
export async function unpackCampaignZip(
  bytes: Uint8Array,
): Promise<ParsedCampaign> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new Error("Ungültige Datei: keine lesbare ZIP-Datei.");
  }
  const kampagneEntry = zip.file(KAMPAGNE_CSV);
  const aufnahmenEntry = zip.file(AUFNAHMEN_CSV);
  const horizonteEntry = zip.file(HORIZONTE_CSV);
  if (!aufnahmenEntry || !horizonteEntry) {
    throw new Error(
      `Ungültige Datei: ${AUFNAHMEN_CSV} und/oder ${HORIZONTE_CSV} fehlt.`,
    );
  }

  const kampagne = kampagneEntry
    ? parseKampagneCsv(await kampagneEntry.async("string"))
    : null;
  const aufnahmen = parseAufnahmenCsv(await aufnahmenEntry.async("string"));
  const horizonte = parseHorizonteCsv(await horizonteEntry.async("string"));
  if (aufnahmen.length === 0) {
    throw new Error("Ungültige Datei: keine Aufnahmen enthalten.");
  }
  return { kampagne, aufnahmen, horizonte };
}
