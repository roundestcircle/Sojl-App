/**
 * Per-field input validators for HorizonForm + AufnahmeForm.
 *
 * Each validator returns either:
 *   { valid: true, normalized?: string }                      ← input acceptable
 *   { valid: false, suggestion: SuggestionPayload }           ← input malformed
 *
 * `normalized` lets callers replace user input with the canonical form on blur
 * (e.g. "su2 " → "Su2"). Empty values are always considered valid; callers can
 * suppress the warning icon when the value is empty.
 *
 * Suggestion payloads are consumed by ValidatedField, which renders either a
 * read-only range hint or a tappable list of canonical codes.
 */

import { MUNSELL_DATA } from "@/utils/munsellData";

// ─── Suggestion payload shapes ────────────────────────────────────────────────

export type RangeSuggestion = {
  kind: "range";
  min: number;
  max: number;
  unit?: string;
  integer?: boolean;
  description: string;
};

export type ListItem = { value: string; label?: string };

export type ListSuggestion = {
  kind: "list";
  description: string;
  items: ListItem[];
};

export type SuggestionPayload = RangeSuggestion | ListSuggestion;

export type ValidationResult =
  | { valid: true; normalized?: string }
  | { valid: false; suggestion: SuggestionPayload };

// ─── KA5/KA6 canonical code lists ─────────────────────────────────────────────

/** Closed list of KA5/KA6 bodenart codes. Case-insensitive match, returns canonical case. */
const BODENART_CODES: readonly string[] = [
  "Ss",
  "Sl2",
  "Sl3",
  "Sl4",
  "Slu",
  "Su2",
  "Su3",
  "Su4",
  "St2",
  "St3",
  "Ls2",
  "Ls3",
  "Ls4",
  "Lt2",
  "Lt3",
  "Lts",
  "Lu",
  "Ts2",
  "Ts3",
  "Ts4",
  "Tl",
  "Tu2",
  "Tu3",
  "Tu4",
  "Uu",
  "Us",
  "Uls",
  "Ut2",
  "Ut3",
  "Ut4",
  "Tt",
];

const BODENART_LABELS: Record<string, string> = {
  Ss: "Reinsand",
  Sl2: "schwach lehmiger Sand",
  Sl3: "mittel lehmiger Sand",
  Sl4: "stark lehmiger Sand",
  Slu: "schluffig-lehmiger Sand",
  Su2: "schwach schluffiger Sand",
  Su3: "mittel schluffiger Sand",
  Su4: "stark schluffiger Sand",
  St2: "schwach toniger Sand",
  St3: "mittel toniger Sand",
  Ls2: "schwach sandiger Lehm",
  Ls3: "mittel sandiger Lehm",
  Ls4: "stark sandiger Lehm",
  Lt2: "schwach toniger Lehm",
  Lt3: "mittel toniger Lehm",
  Lts: "sandig-toniger Lehm",
  Lu: "schluffiger Lehm",
  Ts2: "schwach sandiger Ton",
  Ts3: "mittel sandiger Ton",
  Ts4: "stark sandiger Ton",
  Tl: "lehmiger Ton",
  Tu2: "schwach schluffiger Ton",
  Tu3: "mittel schluffiger Ton",
  Tu4: "stark schluffiger Ton",
  Uu: "Reinschluff",
  Us: "sandiger Schluff",
  Uls: "sandig-lehmiger Schluff",
  Ut2: "schwach toniger Schluff",
  Ut3: "mittel toniger Schluff",
  Ut4: "stark toniger Schluff",
  Tt: "Reinton",
};

const BODENART_CANONICAL: Map<string, string> = new Map(
  BODENART_CODES.map((c) => [c.toLowerCase(), c]),
);

const BODENART_LIST_ITEMS: ListItem[] = BODENART_CODES.map((value) => ({
  value,
  label: BODENART_LABELS[value],
}));

// ─── Munsell lookup ───────────────────────────────────────────────────────────

const MUNSELL_SET: Set<string> = new Set(
  MUNSELL_DATA.map((e) => e.munsell.toUpperCase().replace(/\s+/g, " ").trim()),
);

const MUNSELL_RE = /^([\d.]+\s*[A-Z]{1,3})\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/i;

/** "10yr 4/3" → "10YR 4/3". Returns null when the structure is wrong. */
function canonicalizeMunsell(input: string): string | null {
  const m = input.trim().match(MUNSELL_RE);
  if (!m) return null;
  const hue = m[1].toUpperCase().replace(/\s+/g, "");
  return `${hue} ${m[2]}/${m[3]}`;
}

// ─── "nicht bestimmt" sentinel ────────────────────────────────────────────────

/** Accepts "nb" (any case) as a valid sentinel meaning "nicht bestimmt". */
function isNb(raw: string): boolean {
  return raw.trim().toLowerCase() === "nb";
}

// ─── Generic numeric range validator ──────────────────────────────────────────

function validateRange(
  raw: string,
  opts: {
    min: number;
    max: number;
    unit?: string;
    integer?: boolean;
    description: string;
  },
): ValidationResult {
  if (isNb(raw)) return { valid: true, normalized: "nb" };
  const cleaned = raw.trim().replace(/,/g, ".");
  if (cleaned === "") return { valid: true };
  const n = Number(cleaned);
  const fail: ValidationResult = {
    valid: false,
    suggestion: {
      kind: "range",
      min: opts.min,
      max: opts.max,
      unit: opts.unit,
      integer: opts.integer,
      description: opts.description,
    },
  };
  if (!Number.isFinite(n)) return fail;
  if (opts.integer && !Number.isInteger(n)) return fail;
  if (n < opts.min || n > opts.max) return fail;
  return { valid: true };
}

// ─── Field validators ─────────────────────────────────────────────────────────

export function validateTiefe(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 0,
    max: 250,
    unit: "cm",
    integer: true,
    description:
      "Tiefe in ganzen Zentimetern. Übliche Profilreichweite einer KA6-Aufnahme ist 0–250 cm.",
  });
}

export function validateTonanteil(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 0,
    max: 100,
    unit: "%",
    description: "Tonanteil in Prozent (0–100).",
  });
}

export function validateHumusgehalt(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 0,
    max: 100,
    unit: "%",
    description: "Humusgehalt in Massenprozent (0–100).",
  });
}

export function validateAnteil(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 0,
    max: 100,
    unit: "%",
    integer: true,
    description: "Skelettanteil in Prozent (0–100).",
  });
}

export function validatePh(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 2.0,
    max: 9.0,
    description: "pH (CaCl₂), sinnvoller Bereich für mineralische Böden 2,0–9,0.",
  });
}

export function validateEffektiverWurzelraum(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 0,
    max: 200,
    unit: "cm",
    integer: true,
    description:
      "Effektiver Wurzelraum in cm (0–200). Tiefe, bis zu der Pflanzenwurzeln das Wasser noch effektiv ausschöpfen können.",
  });
}

export function validateBodenart(raw: string): ValidationResult {
  if (isNb(raw)) return { valid: true, normalized: "nb" };
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: true };
  const canonical = BODENART_CANONICAL.get(trimmed.toLowerCase());
  if (canonical) {
    return { valid: true, normalized: canonical };
  }
  return {
    valid: false,
    suggestion: {
      kind: "list",
      description:
        "KA5-Bodenartcode. Eine Auswahl tippen, um sie automatisch einzusetzen.",
      items: BODENART_LIST_ITEMS,
    },
  };
}

export function validateMunsell(raw: string): ValidationResult {
  if (isNb(raw)) return { valid: true, normalized: "nb" };
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: true };
  const canonical = canonicalizeMunsell(trimmed);
  if (!canonical) {
    // Bad structure entirely → suggest format + nearest hues we can detect from prefix
    return {
      valid: false,
      suggestion: {
        kind: "range",
        min: 0,
        max: 0,
        description:
          "Format: \"<HUE> <Value>/<Chroma>\", z.B. 10YR 4/3. HUE z.B. 10YR, 7.5YR, 2.5Y, 10Y, 5GY ...",
      },
    };
  }
  if (MUNSELL_SET.has(canonical.toUpperCase())) {
    return { valid: true, normalized: canonical };
  }
  // Structurally fine but not in the dataset → suggest nearest by hue prefix
  const hue = canonical.split(" ")[0];
  const matches = MUNSELL_DATA.filter((e) => e.munsell.startsWith(hue + " "))
    .slice(0, 40)
    .map((e) => ({ value: e.munsell }));
  return {
    valid: false,
    suggestion: {
      kind: "list",
      description:
        `Diese Munsell-Farbe (${canonical}) ist nicht im RIT-Datensatz enthalten. Bekannte Farben für ${hue}:`,
      items:
        matches.length > 0
          ? matches
          : [
              {
                value: "10YR 4/3",
                label: "Beispielwert; bitte gültigen Hue verwenden",
              },
            ],
    },
  };
}

export function validateMunsellValue(raw: string): ValidationResult {
  return validateRange(raw, {
    min: 1,
    max: 8,
    description: "Munsell Value (feucht), Helligkeit zwischen 1 (dunkel) und 8 (hell).",
  });
}

// ─── Cross-field check ────────────────────────────────────────────────────────

/** True when both depths parse and oben >= unten (logically wrong). */
export function tiefeOrderInvalid(oben: string, unten: string): boolean {
  const o = parseFloat(oben);
  const u = parseFloat(unten);
  if (isNaN(o) || isNaN(u)) return false;
  return o >= u;
}

export const TIEFE_ORDER_SUGGESTION: SuggestionPayload = {
  kind: "range",
  min: 0,
  max: 250,
  unit: "cm",
  integer: true,
  description:
    "Tiefe oben muss kleiner als Tiefe unten sein. Bitte beide Werte prüfen.",
};
