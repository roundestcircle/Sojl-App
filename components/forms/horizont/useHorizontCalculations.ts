import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  calcMaechtigkeitDm,
  calcPoreCapacities,
  calcKAK,
} from "@/lib/calc/mappingMaths";
import { calcBasensaettigung } from "@/lib/calc/basensaettigungLookup";
import { lookupTrockenrohdichte } from "@/lib/calc/trockenrohdichteLookup";
import {
  humusKlasse,
  estimateHumus,
  parseMunsell,
  chromaToClass,
} from "@/lib/calc/renger1987";
import type { HorizontFormData } from "./types";

const PORE_FIELDS = [
  "gpv_pct",
  "gpv_lm2",
  "lk_pct",
  "lk_lm2",
  "fk_pct",
  "fk_lm2",
  "nfk_pct",
  "nfk_lm2",
] as const;

/**
 * Keeps all derived ("Automatisch berechnete Werte") fields of the Horizont
 * form in sync with their inputs. Each value is written back via setValue so
 * it is autosaved together with the user-entered fields.
 *
 * Dependency chain: Farbe + pH + Tonanteil → Humus% → Humusklasse / KAK / BS;
 * Bodenart + Packungsdichte → TRD → Porenkennwerte.
 */
export function useHorizontCalculations(
  methods: UseFormReturn<HorizontFormData>,
  humusform: string | undefined,
) {
  const { watch, setValue } = methods;

  const farbe = watch("farbe_munsell");
  const ph = watch("ph_cacl2");
  const bodenart = watch("bodenart");
  const tiefeOben = watch("tiefe_oben");
  const tiefeUnten = watch("tiefe_unten");
  const packungsdichte = watch("packungsdichte");
  const trockenrohdichte = watch("trockenrohdichte");
  const humusPct = watch("humus_pct");
  const anteil = watch("anteil");
  const tonanteil = watch("tonanteil");

  useEffect(() => {
    setValue("maechtigk_dm", calcMaechtigkeitDm(tiefeOben, tiefeUnten));
  }, [tiefeOben, tiefeUnten, setValue]);

  // TRD = f(bodenart, packungsdichte-class) per KA6 Tabelle B2. Empty when either
  // is missing or the bodenart isn't in the reference table.
  useEffect(() => {
    setValue(
      "trockenrohdichte",
      lookupTrockenrohdichte(bodenart, packungsdichte),
    );
  }, [bodenart, packungsdichte, setValue]);

  useEffect(() => {
    const result = calcPoreCapacities(
      bodenart,
      trockenrohdichte,
      humusPct,
      anteil,
      calcMaechtigkeitDm(tiefeOben, tiefeUnten),
    );
    PORE_FIELDS.forEach((f) => setValue(f, result ? result[f] : ""));
  }, [
    bodenart,
    trockenrohdichte,
    humusPct,
    anteil,
    tiefeOben,
    tiefeUnten,
    setValue,
  ]);

  useEffect(() => {
    const pct = parseFloat(humusPct);
    setValue("humus", !isNaN(pct) && pct > 0 ? humusKlasse(pct).klasse : "");
  }, [humusPct, setValue]);

  // Humusgehalt nach Renger (1987) from Munsell value/chroma, pH and clay content.
  useEffect(() => {
    const parsed = parseMunsell(farbe);
    const pH = parseFloat(ph);
    const clay = parseFloat(tonanteil);
    if (
      !parsed ||
      isNaN(pH) ||
      isNaN(clay) ||
      parsed.value < 1 ||
      parsed.value > 8 ||
      pH < 2 ||
      pH > 9 ||
      clay < 0 ||
      clay > 100
    ) {
      setValue("humus_pct", "");
      return;
    }
    setValue(
      "humus_pct",
      String(
        estimateHumus(parsed.value, chromaToClass(parsed.chroma), pH, clay),
      ),
    );
  }, [farbe, ph, tonanteil, setValue]);

  useEffect(() => {
    setValue("kak", calcKAK(bodenart, humusform ?? "", humusPct));
  }, [bodenart, humusform, humusPct, setValue]);

  useEffect(() => {
    setValue("basensaettigung", calcBasensaettigung(ph, humusPct));
  }, [ph, humusPct, setValue]);
}
