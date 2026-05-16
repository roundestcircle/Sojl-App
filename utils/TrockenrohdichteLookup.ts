/**
 * Mittlere Trockenrohdichten (TRD) für die Klassen der effektiven Lagerungsdichte (Ld)
 * bzw. Packungsdichte (Pd), abhängig von der Bodenart (Mineralböden mit Humusgehalten < 1 %).
 * Quelle: KA6 Tabelle B2 (Renger et al. 2009). Angaben in g/cm³ (entspricht kg/dm³).
 *
 * Layout: TRD_TABLE[bodenart][pdClass-1] mit pdClass ∈ {1,2,3,4,5}.
 */
const TRD_TABLE: Record<string, readonly [number, number, number, number, number]> = {
  Ss:  [1.18, 1.40, 1.63, 1.83, 1.98],
  Sl2: [1.15, 1.37, 1.60, 1.80, 1.95],
  Sl3: [1.13, 1.35, 1.58, 1.78, 1.93],
  Sl4: [1.10, 1.32, 1.55, 1.75, 1.90],
  Slu: [1.09, 1.31, 1.54, 1.74, 1.89],
  St2: [1.14, 1.36, 1.59, 1.79, 1.94],
  St3: [1.09, 1.31, 1.54, 1.74, 1.89],
  Su2: [1.17, 1.39, 1.62, 1.82, 1.97],
  Su3: [1.15, 1.37, 1.60, 1.80, 1.95],
  Su4: [1.14, 1.36, 1.59, 1.79, 1.94],
  Ls2: [1.05, 1.27, 1.50, 1.70, 1.85],
  Ls3: [1.06, 1.28, 1.51, 1.71, 1.86],
  Ls4: [1.07, 1.29, 1.52, 1.72, 1.87],
  Lt2: [1.01, 1.23, 1.46, 1.66, 1.81],
  Lt3: [0.96, 1.18, 1.41, 1.61, 1.76],
  Lts: [1.00, 1.22, 1.45, 1.65, 1.80],
  Lu:  [1.03, 1.25, 1.48, 1.68, 1.83],
  Uu:  [1.09, 1.31, 1.54, 1.74, 1.89],
  Uls: [1.08, 1.30, 1.53, 1.73, 1.88],
  Us:  [1.12, 1.34, 1.57, 1.77, 1.92],
  Ut2: [1.07, 1.29, 1.52, 1.72, 1.87],
  Ut3: [1.05, 1.27, 1.50, 1.70, 1.85],
  Ut4: [1.02, 1.24, 1.47, 1.67, 1.82],
  Tt:  [0.81, 1.03, 1.26, 1.46, 1.61],
  Tl:  [0.90, 1.12, 1.35, 1.55, 1.70],
  Tu2: [0.90, 1.12, 1.35, 1.55, 1.70],
  Tu3: [0.96, 1.18, 1.41, 1.61, 1.76],
  Tu4: [0.99, 1.21, 1.44, 1.64, 1.79],
  Ts2: [0.92, 1.14, 1.37, 1.57, 1.72],
  Ts3: [0.99, 1.21, 1.44, 1.64, 1.79],
  Ts4: [1.04, 1.26, 1.49, 1.69, 1.84],
};

/**
 * Looks up the mean Trockenrohdichte (g/cm³) for a bodenart + Pd-class.
 * Returns empty string if either input is invalid or the bodenart is not in the
 * KA6 reference table. Result is formatted with a comma as decimal separator
 * to match German formatting elsewhere in the form.
 */
export function lookupTrockenrohdichte(
  bodenart: string,
  packungsdichte: string,
): string {
  const ba = bodenart.trim();
  const row = TRD_TABLE[ba];
  if (!row) return "";
  const pdMatch = packungsdichte.trim().match(/Pd([1-5])/i);
  if (!pdMatch) return "";
  const idx = parseInt(pdMatch[1], 10) - 1;
  return row[idx].toFixed(2).replace(".", ",");
}
