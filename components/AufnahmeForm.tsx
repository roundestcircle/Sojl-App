import { useState, useEffect, useRef } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import * as Location from "expo-location";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { latLonToUTM, utmToLatLon } from "@/utils/utmConversion";
import type { Aufnahme, AufnahmeDetails } from "@/utils/MappingQueries";
import type { Horizont } from "@/utils/HorizonQueries";
import { calcProfileFKOrNFK, rateFK, rateNFK } from "@/utils/MappingMaths";
import DropdownField from "@/components/DropdownField";
import LabeledDropdownField, {
  type LabeledOption,
  type LabeledSection,
} from "@/components/LabeledDropdownField";
import BodenTypTool from "@/components/BodenTypTool";
import HorizontLexikonContent from "@/components/HorizontLexikonContent";
import CollapsibleSection from "@/components/CollapsibleSection";

// ─── Dropdown options ──────────────────────────────────────────────────────────

const EXPOS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];

const RELIEFPOS_OPTIONS: LabeledOption[] = [
  { code: "Z", label: "Zentrallage" },
  { code: "R", label: "Randlage" },
  { code: "G", label: "Grenzlage" },
  { code: "D", label: "distal (Schwemmfächer)" },
  { code: "P", label: "proximal (Schwemmfächer)" },
  { code: "K", label: "Kulminationslage" },
  { code: "S", label: "Sattelpunkt" },
  { code: "T", label: "Tiefenlage" },
  { code: "O", label: "Oberhang" },
  { code: "M", label: "Mittelhang" },
  { code: "U", label: "Unterhang" },
  { code: "A", label: "Hangschulter" },
  { code: "F", label: "Hangfuß" },
  { code: "nb", label: "nicht bestimmt" },
];

const WITTERUNG_OPTIONS: LabeledOption[] = [
  { code: "WT1", label: "keine Niederschläge innerhalb des letzten Monats" },
  { code: "WT2", label: "keine Niederschläge innerhalb der letzten Woche" },
  {
    code: "WT3",
    label: "keine Niederschläge innerhalb der letzten 24 Stunden",
  },
  {
    code: "WT4",
    label:
      "regnerisch mit nicht sehr starken Niederschlägen innerhalb der letzten 24 Stunden",
  },
  {
    code: "WT5",
    label:
      "stärkere Regenfälle seit mehreren Tagen oder Starkregen innerhalb der letzten 24 Stunden",
  },
  { code: "WT6", label: "extrem niederschlagsreiche Zeit oder Schneeschmelze" },
  { code: "WT7", label: "Frost seit mehreren Tagen" },
  { code: "nb", label: "nicht bestimmt" },
];

const NUTZUNG_SECTIONS: LabeledSection[] = [
  {
    title: "Landwirtschaft",
    data: [
      { code: "L", label: "landwirtschaftliche Nutzung allgemein" },
      { code: "A", label: "Acker allgemein" },
      { code: "AK", label: "Kurzumtriebsplantage" },
      { code: "AG", label: "Agroforst" },
      { code: "G", label: "Grünland allgemein" },
      { code: "GI", label: "Grünland intensiv" },
      { code: "GE", label: "Grünland extensiv" },
      { code: "GW", label: "Grünland-Wechselwirtschaft" },
      { code: "GD", label: "Weide" },
      {
        code: "GS",
        label:
          "Streuobstwiese, Grünland mit Wert-, Energieholz oder Obstbäumen",
      },
      { code: "S", label: "Sonderkultur" },
      { code: "SD", label: "Dauerkultur" },
      { code: "SH", label: "Hopfen" },
      { code: "SO", label: "Obst" },
      { code: "SW", label: "Wein" },
    ],
  },
  {
    title: "Wald und Forst",
    data: [
      { code: "F", label: "Wald und Forst allgemein" },
      { code: "FP", label: "Pflanzung, Aufforstung, Baumschule" },
      { code: "FN", label: "Naturwaldparzelle" },
      { code: "FW", label: "Waldweide" },
    ],
  },
  {
    title: "Brache",
    data: [
      { code: "B", label: "Brache allgemein" },
      { code: "BA", label: "Ackerbrache" },
      { code: "BG", label: "Grünlandbrache" },
      { code: "BI", label: "Industriebrache" },
    ],
  },
  {
    title: "Ödland",
    data: [
      {
        code: "O",
        label: "Ödland allgemein (naturnah, ungenutzt oder extensiv genutzt)",
      },
      { code: "OF", label: "Feucht-, Sumpf-, Wasserfläche" },
      { code: "OR", label: "Trockenfläche" },
      { code: "OK", label: "Kussgelände, Gehölz" },
      { code: "OT", label: "Hutung" },
      { code: "OH", label: "Heide" },
    ],
  },
  {
    title: "Sonstige Nutzung",
    data: [
      { code: "N", label: "Sonstige Nutzung" },
      { code: "NS", label: "Sportanlage, Spielplatz" },
      { code: "NK", label: "Kinderspielfläche" },
      { code: "NP", label: "Park-, Grün-, Freizeitanlage" },
      {
        code: "NG",
        label:
          "Kleingartenanlage, Haus- und Kleingarten, Nutzgarten, Gartenland",
      },
      { code: "NF", label: "Friedhof" },
      { code: "NT", label: "Truppenübungsplatz" },
      { code: "NA", label: "Wildacker" },
      { code: "NM", label: "Mischnutzung, Streunutzung" },
    ],
  },
  {
    title: "Versiegelt und bebaut",
    data: [
      { code: "VS", label: "Versiegelte und bebaute Flächen allgemein" },
      {
        code: "VE",
        label: "städtisch geprägte Fläche, Siedlung, Dorfanlage, Wohngebiet",
      },
      { code: "VK", label: "Verkehrsfläche" },
      { code: "VI", label: "Industrie- und Gewerbefläche" },
      { code: "VP", label: "Parkplatz" },
    ],
  },
  {
    title: "Auftrags- und Abbauflächen",
    data: [
      { code: "DK", label: "Auftragsflächen allgemein" },
      { code: "DH", label: "Kippe (Verfüllung)" },
      { code: "DE", label: "Halde (Aufschüttung)" },
      { code: "TB", label: "Abbauflächen, Abtragsflächen allgemein (Tagebau)" },
      { code: "TE", label: "Braunkohletagebau" },
      { code: "TS", label: "Erztagebau" },
      { code: "ZR", label: "Stein- und Erdenabbau (Steinbruch, Grube)" },
    ],
  },
  {
    title: "Sonstiges",
    data: [{ code: "nb", label: "nicht bestimmt" }],
  },
];

const VEGETATION_SECTIONS: LabeledSection[] = [
  {
    title: "Getreide",
    data: [
      { code: "GE", label: "Getreide" },
      { code: "GEW", label: "Weizen" },
      { code: "GEG", label: "Gerste" },
      { code: "GER", label: "Roggen" },
      { code: "GEH", label: "Hafer" },
      { code: "GET", label: "Triticale" },
      { code: "GES", label: "Hirse" },
    ],
  },
  {
    title: "Hackfrüchte",
    data: [
      { code: "HF", label: "Hackfrüchte" },
      { code: "HFK", label: "Kartoffel" },
      { code: "HFZ", label: "Zuckerrübe" },
      { code: "HFF", label: "Futterrübe" },
      { code: "HFG", label: "Feldgemüse" },
      { code: "HFM", label: "Mais" },
    ],
  },
  {
    title: "Leguminosen",
    data: [
      { code: "LG", label: "Leguminosen" },
      { code: "LGB", label: "Bohne" },
      { code: "LGE", label: "Erbse" },
      { code: "LGK", label: "Klee" },
      { code: "LGL", label: "Lupine" },
    ],
  },
  {
    title: "Ölsaaten",
    data: [
      { code: "OE", label: "Ölsaaten" },
      { code: "OEL", label: "Lein" },
      { code: "OEM", label: "Mohn" },
      { code: "OER", label: "Raps" },
      { code: "OEP", label: "Rübsen" },
      { code: "OES", label: "Sonnenblume" },
    ],
  },
  {
    title: "Ackergras / Zwischenfrüchte",
    data: [
      { code: "GA", label: "Ackergras" },
      { code: "ZF", label: "Zwischenfrüchte" },
    ],
  },
  {
    title: "Sonstige Ackerkulturen",
    data: [
      { code: "SO", label: "Sonstige" },
      { code: "SOH", label: "Hanf" },
      { code: "SOT", label: "Tabak" },
      { code: "SOW", label: "Wein" },
      { code: "SOS", label: "Spargel" },
      { code: "SOP", label: "Hopfen" },
    ],
  },
  {
    title: "Obst und Nuss",
    data: [
      { code: "OB", label: "Obst-, Nussgehölze, -gewächse" },
      { code: "OBA", label: "Apfel" },
      { code: "OBB", label: "Birne" },
      { code: "OBK", label: "Kirsche" },
      { code: "OBP", label: "Pflaume" },
      { code: "OBJ", label: "Johannisbeere" },
      { code: "OBH", label: "Heidelbeere" },
      { code: "OBE", label: "Erdbeere" },
      { code: "NUH", label: "Haselnuss" },
      { code: "NUW", label: "Walnuss" },
    ],
  },
  {
    title: "Weide und Wiese",
    data: [
      { code: "WD", label: "Weiden" },
      { code: "WDF", label: "Fettweide" },
      { code: "WS", label: "Wiesen" },
      { code: "WST", label: "Trocken- und Magerrasen" },
      { code: "WSF", label: "Feuchtwiese" },
    ],
  },
  {
    title: "Laubgehölze",
    data: [
      { code: "LW", label: "Laubgehölze" },
      { code: "LWA", label: "Ahorn" },
      { code: "LWI", label: "Birke" },
      { code: "LWB", label: "Buche" },
      { code: "LWE", label: "Eiche" },
      { code: "LWL", label: "Linde" },
      { code: "LUU", label: "Ulme" },
      { code: "LWR", label: "Erle" },
      { code: "LWS", label: "Esche" },
      { code: "LWW", label: "Weide" },
      { code: "LWP", label: "Pappel" },
      { code: "LWO", label: "sonstige Laubgehölze" },
    ],
  },
  {
    title: "Nadelgehölze",
    data: [
      { code: "NW", label: "Nadelgehölze" },
      { code: "NWF", label: "Fichte" },
      { code: "NWK", label: "Kiefer" },
      { code: "NWT", label: "Tanne" },
      { code: "NWD", label: "Douglasie" },
      { code: "NWL", label: "Lärche" },
      { code: "NWO", label: "sonstige Nadelgehölze" },
    ],
  },
  {
    title: "Naturnahe Pflanzengesellschaften",
    data: [
      { code: "NP", label: "naturnahe Pflanzengesellschaften" },
      {
        code: "NPT",
        label: "naturnahe Pflanzengesellschaften trockener Standorte",
      },
      {
        code: "NPN",
        label: "naturnahe Pflanzengesellschaften nasser Standorte",
      },
      {
        code: "NPS",
        label: "naturnahe Pflanzengesellschaften von Salzstandorten",
      },
      { code: "RP", label: "Ruderal- und Pioniergesellschaften" },
    ],
  },
  {
    title: "Sonstiges",
    data: [
      { code: "nv", label: "nicht vorhanden / ohne Vegetation" },
      { code: "nb", label: "nicht bestimmt" },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  easting: string;
  northing: string;
  zone: string;
  lat: string;
  lon: string;
  notizen: string;
  bodentyp: string;
  bodtyp_abk: string;
  humusform: string;
  humsfrm_abk: string;
  m_ue_nn: string;
  witterung: string;
  mittl_n: string;
  mittl_temp: string;
  nutzung: string;
  vegetation: string;
  reliefpos: string;
  expos: string;
  ausgangsgestein: string;
  grundigkeit: string;
  effektiver_wurzelraum: string;
  hangneigung: string;
  reliefformtyp: string;
  mikrorelief: string;
  nat_bodenabtrag: string;
  kuenstl_bodenabtrag: string;
  anthropogene_veraend: string;
  bodenoberflaeche: string;
  versiegelungsart: string;
  regenwuermer: string;
  substratsyst_einheit: string;
  hydrogeniet_moortyp: string;
  durchwurzelbarer_bodenraum: string;
  wasserstand_gof: string;
  grundnaessestufe: string;
  besond_wasserverh: string;
  stau_haftnaessestufe: string;
  erosionsgrad: string;
};

type Props = {
  initialData: Aufnahme;
  onSave: (data: AufnahmeDetails) => void;
  calcGrundigkeit?: string;
  horizonte?: Horizont[];
  onNotizenFocus?: () => void;
  onNotizenBlur?: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parses a UTM zone string like "32N" into its numeric zone and hemisphere components. */
function parseZone(
  s: string,
): { number: number; hemisphere: "N" | "S" } | null {
  const m = s
    .trim()
    .toUpperCase()
    .match(/^(\d+)([NS])$/);
  if (!m) return null;
  return { number: parseInt(m[1], 10), hemisphere: m[2] as "N" | "S" };
}

/** Parses a string to a float, returning null if the result is NaN. */
const parseNum = (s: string | undefined): number | null => {
  const n = parseFloat(s ?? "");
  return isNaN(n) ? null : n;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Site data form for an Aufnahme.
 * Supports both UTM and decimal-degree coordinate entry with live bidirectional conversion.
 * All field changes autosave via the onSave callback (no explicit save button).
 * A "Bodentyp bestimmen" modal embeds the BodenTypTool and splits its result
 * into the Abk. and Bodentyp fields automatically.
 */
export default function AufnahmeForm({
  initialData,
  onSave,
  calcGrundigkeit,
  horizonte = [],
  onNotizenFocus,
  onNotizenBlur,
}: Props) {
  // Derive initial UTM and lat/lon values from whichever coordinate format is stored
  let initUtm: { easting: string; northing: string; zone: string } | null =
    null;
  let initDeg: { lat: string; lon: string } | null = null;

  if (
    initialData.utm_easting != null &&
    initialData.utm_northing != null &&
    initialData.utm_zone
  ) {
    initUtm = {
      easting: String(initialData.utm_easting),
      northing: String(initialData.utm_northing),
      zone: initialData.utm_zone,
    };
  }
  if (initialData.gps_lat != null && initialData.gps_lon != null) {
    initDeg = {
      lat: initialData.gps_lat.toFixed(6),
      lon: initialData.gps_lon.toFixed(6),
    };
  }
  if (!initUtm && initDeg) {
    const utm = latLonToUTM(parseFloat(initDeg.lat), parseFloat(initDeg.lon));
    initUtm = {
      easting: String(utm.easting),
      northing: String(utm.northing),
      zone: utm.label,
    };
  }
  if (!initDeg && initUtm) {
    const z = parseZone(initUtm.zone);
    if (z) {
      try {
        const { lat, lon } = utmToLatLon(
          parseFloat(initUtm.easting),
          parseFloat(initUtm.northing),
          z.number,
          z.hemisphere,
        );
        initDeg = { lat: lat.toFixed(6), lon: lon.toFixed(6) };
      } catch {}
    }
  }

  // Which coordinate input mode is currently shown
  const [mode, setMode] = useState<"utm" | "degrees">("utm");
  // Ref mirrors mode so the watch callback (running in a closure) always sees the current value
  const modeRef = useRef<"utm" | "degrees">("utm");
  const isFirstWatch = useRef(true);
  // Drives the spinner on the GPS button while location is being fetched
  const [locating, setLocating] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [erweiterteExpanded, setErweiterteExpanded] = useState(false);
  // Controls visibility of the Bodentyp determination modal
  const [bodentypModal, setBodentypModal] = useState(false);
  // Controls visibility of the Horizontlexikon modal (openable from within the Bodentyp modal)
  const [lexikonVisible, setLexikonVisible] = useState(false);

  const { control, setValue, watch, getValues } = useForm<FormData>({
    defaultValues: {
      easting: initUtm?.easting ?? "",
      northing: initUtm?.northing ?? "",
      zone: initUtm?.zone ?? "",
      lat: initDeg?.lat ?? "",
      lon: initDeg?.lon ?? "",
      notizen: initialData.notizen ?? "",
      bodentyp: initialData.bodentyp ?? "",
      bodtyp_abk: initialData.bodtyp_abk ?? "",
      humusform: initialData.humusform ?? "",
      humsfrm_abk: initialData.humsfrm_abk ?? "",
      m_ue_nn: initialData.m_ue_nn != null ? String(initialData.m_ue_nn) : "",
      witterung: initialData.witterung ?? "",
      mittl_n: initialData.mittl_n != null ? String(initialData.mittl_n) : "",
      mittl_temp:
        initialData.mittl_temp != null ? String(initialData.mittl_temp) : "",
      nutzung: initialData.nutzung ?? "",
      vegetation: initialData.vegetation ?? "",
      reliefpos: initialData.reliefpos ?? "",
      expos: initialData.expos ?? "",
      ausgangsgestein: initialData.ausgangsgestein ?? "",
      grundigkeit:
        initialData.grundigkeit != null ? String(initialData.grundigkeit) : "",
      effektiver_wurzelraum:
        initialData.effektiver_wurzelraum != null
          ? String(initialData.effektiver_wurzelraum)
          : "",
      hangneigung: initialData.hangneigung ?? "",
      reliefformtyp: initialData.reliefformtyp ?? "",
      mikrorelief: initialData.mikrorelief ?? "",
      nat_bodenabtrag: initialData.nat_bodenabtrag ?? "",
      kuenstl_bodenabtrag: initialData.kuenstl_bodenabtrag ?? "",
      anthropogene_veraend: initialData.anthropogene_veraend ?? "",
      bodenoberflaeche: initialData.bodenoberflaeche ?? "",
      versiegelungsart: initialData.versiegelungsart ?? "",
      regenwuermer: initialData.regenwuermer ?? "",
      substratsyst_einheit: initialData.substratsyst_einheit ?? "",
      hydrogeniet_moortyp: initialData.hydrogeniet_moortyp ?? "",
      durchwurzelbarer_bodenraum: initialData.durchwurzelbarer_bodenraum ?? "",
      wasserstand_gof: initialData.wasserstand_gof ?? "",
      grundnaessestufe: initialData.grundnaessestufe ?? "",
      besond_wasserverh: initialData.besond_wasserverh ?? "",
      stau_haftnaessestufe: initialData.stau_haftnaessestufe ?? "",
      erosionsgrad: initialData.erosionsgrad ?? "",
    },
  });

  useEffect(() => {
    if (calcGrundigkeit !== undefined) setValue("grundigkeit", calcGrundigkeit);
  }, [calcGrundigkeit]);

  const watchedEffektiverWurzelraum = watch("effektiver_wurzelraum");
  const profileFK = calcProfileFKOrNFK(horizonte, 100, "fk_lm2");
  const effWzNum = parseFloat(watchedEffektiverWurzelraum);
  const profileNFK = calcProfileFKOrNFK(horizonte, effWzNum, "nfk_lm2");

  useEffect(() => {
    const { unsubscribe } = watch((data) => {
      if (isFirstWatch.current) {
        isFirstWatch.current = false;
        return;
      }
      let gps_lat: number | null = null;
      let gps_lon: number | null = null;
      let utm_easting: number | null = null;
      let utm_northing: number | null = null;
      let utm_zone: string | null = null;

      if (modeRef.current === "utm") {
        const e = parseFloat(data.easting ?? "");
        const n = parseFloat(data.northing ?? "");
        const z = parseZone(data.zone ?? "");
        if (!isNaN(e) && !isNaN(n) && z) {
          utm_easting = e;
          utm_northing = n;
          utm_zone = (data.zone ?? "").trim().toUpperCase();
          try {
            const res = utmToLatLon(e, n, z.number, z.hemisphere);
            gps_lat = res.lat;
            gps_lon = res.lon;
          } catch {}
        }
      } else {
        const lat = parseFloat(data.lat ?? "");
        const lon = parseFloat(data.lon ?? "");
        if (!isNaN(lat) && !isNaN(lon)) {
          gps_lat = lat;
          gps_lon = lon;
          const utm = latLonToUTM(lat, lon);
          utm_easting = utm.easting;
          utm_northing = utm.northing;
          utm_zone = utm.label;
        }
      }

      onSave({
        gps_lat,
        gps_lon,
        utm_easting,
        utm_northing,
        utm_zone,
        notizen: data.notizen || null,
        bodentyp: data.bodentyp || null,
        bodtyp_abk: data.bodtyp_abk || null,
        humusform: data.humusform || null,
        humsfrm_abk: data.humsfrm_abk || null,
        m_ue_nn: parseNum(data.m_ue_nn),
        witterung: data.witterung || null,
        mittl_n: parseNum(data.mittl_n),
        mittl_temp: parseNum(data.mittl_temp),
        nutzung: data.nutzung || null,
        vegetation: data.vegetation || null,
        reliefpos: data.reliefpos || null,
        expos: data.expos || null,
        ausgangsgestein: data.ausgangsgestein || null,
        grundigkeit: parseNum(data.grundigkeit),
        effektiver_wurzelraum: parseNum(data.effektiver_wurzelraum),
        hangneigung: data.hangneigung || null,
        reliefformtyp: data.reliefformtyp || null,
        mikrorelief: data.mikrorelief || null,
        nat_bodenabtrag: data.nat_bodenabtrag || null,
        kuenstl_bodenabtrag: data.kuenstl_bodenabtrag || null,
        anthropogene_veraend: data.anthropogene_veraend || null,
        bodenoberflaeche: data.bodenoberflaeche || null,
        versiegelungsart: data.versiegelungsart || null,
        regenwuermer: data.regenwuermer || null,
        substratsyst_einheit: data.substratsyst_einheit || null,
        hydrogeniet_moortyp: data.hydrogeniet_moortyp || null,
        durchwurzelbarer_bodenraum: data.durchwurzelbarer_bodenraum || null,
        wasserstand_gof: data.wasserstand_gof || null,
        grundnaessestufe: data.grundnaessestufe || null,
        besond_wasserverh: data.besond_wasserverh || null,
        stau_haftnaessestufe: data.stau_haftnaessestufe || null,
        erosionsgrad: data.erosionsgrad || null,
      });
    });
    return unsubscribe;
  }, [onSave]);

  /**
   * Toggles between UTM and decimal-degree input modes.
   * Converts the currently filled coordinates to the other format so no data is lost.
   */
  const handleToggleMode = () => {
    const newMode = mode === "utm" ? "degrees" : "utm";
    modeRef.current = newMode;
    if (newMode === "degrees") {
      const e = parseFloat(getValues("easting"));
      const n = parseFloat(getValues("northing"));
      const z = parseZone(getValues("zone"));
      if (!isNaN(e) && !isNaN(n) && z) {
        try {
          const { lat, lon } = utmToLatLon(e, n, z.number, z.hemisphere);
          setValue("lat", lat.toFixed(6));
          setValue("lon", lon.toFixed(6));
        } catch {}
      }
    } else {
      const lat = parseFloat(getValues("lat"));
      const lon = parseFloat(getValues("lon"));
      if (!isNaN(lat) && !isNaN(lon)) {
        const utm = latLonToUTM(lat, lon);
        setValue("easting", String(utm.easting));
        setValue("northing", String(utm.northing));
        setValue("zone", utm.label);
      }
    }
    setMode(newMode);
  };

  /**
   * Requests GPS location, converts it to UTM, and populates both coordinate fields.
   * Shows an alert if permission is denied or the location cannot be determined.
   */
  const handleGetLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Keine Berechtigung", "GPS-Zugriff wurde verweigert.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      const utm = latLonToUTM(latitude, longitude);
      setValue("easting", String(utm.easting));
      setValue("northing", String(utm.northing));
      setValue("zone", utm.label);
      setValue("lat", latitude.toFixed(6));
      setValue("lon", longitude.toFixed(6));
    } catch {
      Alert.alert("Fehler", "Standort konnte nicht bestimmt werden.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <>
      <View style={styles.section}>
        {/* ── Standortdaten ── */}
        <Text style={styles.sectionTitle}>Standortdaten</Text>

        {mode === "utm" ? (
          <View style={styles.formRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Ostwert (6a)</Text>
              <Controller
                control={control}
                name="easting"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="z.B. 692000"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Nordwert (6b)</Text>
              <Controller
                control={control}
                name="northing"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="z.B. 5334000"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={[styles.halfField, { flex: 0.6 }]}>
              <Text style={styles.fieldLabel}>Zone</Text>
              <Controller
                control={control}
                name="zone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="32N"
                    placeholderTextColor={colors.primary + "66"}
                    autoCapitalize="characters"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Breite (°)</Text>
              <Controller
                control={control}
                name="lat"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="z.B. 51.5074"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Länge (°)</Text>
              <Controller
                control={control}
                name="lon"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="z.B. 9.3456"
                    placeholderTextColor={colors.primary + "66"}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={localStyles.toggleButton}
          onPress={handleToggleMode}
        >
          <Text style={localStyles.toggleText}>
            {mode === "utm" ? "Zu Dezimalgrad wechseln" : "Zu UTM wechseln"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGetLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>
              GPS automatisch bestimmen
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Höhe (m ü. NN) (8a)</Text>
        <Controller
          control={control}
          name="m_ue_nn"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="z.B. 350"
              placeholderTextColor={colors.primary + "66"}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* ── Profil ── */}
        <Text style={[styles.sectionTitle, localStyles.sectionGap]}>
          Profil
        </Text>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Bodentyp (60)</Text>
            <Controller
              control={control}
              name="bodentyp"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Braunerde"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={[styles.halfField, { flex: 0.6 }]}>
            <Text style={styles.fieldLabel}>Abk.</Text>
            <Controller
              control={control}
              name="bodtyp_abk"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="BB"
                  autoCapitalize="characters"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setBodentypModal(true)}
        >
          <Text style={styles.actionButtonText}>Bodentyp bestimmen</Text>
        </TouchableOpacity>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Humusform (63)</Text>
            <Controller
              control={control}
              name="humusform"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="z.B. F-Mull"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={[styles.halfField, { flex: 0.6 }]}>
            <Text style={styles.fieldLabel}>Abk.</Text>
            <Controller
              control={control}
              name="humsfrm_abk"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="mf"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Ausgangsgestein (62)</Text>
        <Controller
          control={control}
          name="ausgangsgestein"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="z.B. Kalkstein"
              placeholderTextColor={colors.primary + "66"}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {/* ── Standorteigenschaften ── */}
        <Text style={[styles.sectionTitle, localStyles.sectionGap]}>
          Standorteigenschaften
        </Text>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Reliefposition (15)</Text>
            <Controller
              control={control}
              name="reliefpos"
              render={({ field: { onChange, value } }) => (
                <LabeledDropdownField
                  value={value}
                  options={RELIEFPOS_OPTIONS}
                  placeholder="Auswählen…"
                  onChange={onChange}
                />
              )}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Exposition (13)</Text>
            <Controller
              control={control}
              name="expos"
              render={({ field: { onChange, value } }) => (
                <DropdownField
                  value={value}
                  options={EXPOS}
                  placeholder="Auswählen…"
                  onChange={onChange}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Nutzung (18)</Text>
            <Controller
              control={control}
              name="nutzung"
              render={({ field: { onChange, value } }) => (
                <LabeledDropdownField
                  value={value}
                  sections={NUTZUNG_SECTIONS}
                  placeholder="Auswählen…"
                  onChange={onChange}
                />
              )}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Vegetation (19)</Text>
            <Controller
              control={control}
              name="vegetation"
              render={({ field: { onChange, value } }) => (
                <LabeledDropdownField
                  value={value}
                  sections={VEGETATION_SECTIONS}
                  placeholder="Auswählen…"
                  onChange={onChange}
                />
              )}
            />
          </View>
        </View>

        {/* ── Klimadaten ── */}
        <Text style={[styles.sectionTitle, localStyles.sectionGap]}>
          Klimadaten
        </Text>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Witterung (20)</Text>
            <Controller
              control={control}
              name="witterung"
              render={({ field: { onChange, value } }) => (
                <LabeledDropdownField
                  value={value}
                  options={WITTERUNG_OPTIONS}
                  placeholder="Auswählen…"
                  onChange={onChange}
                />
              )}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Mittl. Niederschlag (mm)</Text>
            <Controller
              control={control}
              name="mittl_n"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="z.B. 700"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Mittl. Temperatur (°C)</Text>
            <Controller
              control={control}
              name="mittl_temp"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="z.B. 9.5"
                  placeholderTextColor={colors.primary + "66"}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* ── Notizen ── */}
        <Text style={[styles.sectionTitle, localStyles.sectionGap]}>
          Notizen
        </Text>
        <Controller
          control={control}
          name="notizen"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, localStyles.multiline]}
              placeholder="Freitext…"
              placeholderTextColor={colors.primary + "66"}
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              value={value}
              onFocus={onNotizenFocus}
              onBlur={onNotizenBlur}
            />
          )}
        />

        <CollapsibleSection
          title="Erweiterte Bodenaufnahme"
          expanded={erweiterteExpanded}
          onToggle={() => setErweiterteExpanded((v) => !v)}
        >
          <Text style={styles.erweiterteHint}>
            Hierfür stehen noch keine Bestimmungshilfen zur Verfügung. Bitte
            nutzt die KA6 für die korrekte Formatierung der Werte.
          </Text>

          <Text style={styles.fieldLabel}>Hangneigung (12)</Text>
          <Controller
            control={control}
            name="hangneigung"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="z.B. 5°"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Reliefformtyp (14)</Text>
          <Controller
            control={control}
            name="reliefformtyp"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="z.B. Kuppe"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Mikrorelief (16)</Text>
          <Controller
            control={control}
            name="mikrorelief"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="z.B. eben"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Natürlicher Bodenabtrag (17a)</Text>
          <Controller
            control={control}
            name="nat_bodenabtrag"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Künstlicher Bodenabtrag (17b)</Text>
          <Controller
            control={control}
            name="kuenstl_bodenabtrag"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Anthropogene Veränderungen (21)</Text>
          <Controller
            control={control}
            name="anthropogene_veraend"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Bodenoberfläche (22)</Text>
          <Controller
            control={control}
            name="bodenoberflaeche"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Versiegelungsart (23)</Text>
          <Controller
            control={control}
            name="versiegelungsart"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Regenwürmer (24)</Text>
          <Controller
            control={control}
            name="regenwuermer"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>
            Substratsystematische Einheit (61)
          </Text>
          <Controller
            control={control}
            name="substratsyst_einheit"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Hydrogeniet. Moortyp (64)</Text>
          <Controller
            control={control}
            name="hydrogeniet_moortyp"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Durchwurzelbarer Bodenraum (65)</Text>
          <Controller
            control={control}
            name="durchwurzelbarer_bodenraum"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Wasserstand u. GOF (66)</Text>
          <Controller
            control={control}
            name="wasserstand_gof"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Grundnässestufe (67)</Text>
          <Controller
            control={control}
            name="grundnaessestufe"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Besond. Wasserverhältnisse (68)</Text>
          <Controller
            control={control}
            name="besond_wasserverh"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Stau-/Haftnässestufe (69)</Text>
          <Controller
            control={control}
            name="stau_haftnaessestufe"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.fieldLabel}>Erosionsgrad (70)</Text>
          <Controller
            control={control}
            name="erosionsgrad"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Automatisch berechnete Werte"
          expanded={autoExpanded}
          onToggle={() => setAutoExpanded((v) => !v)}
        >
          <Text style={styles.fieldLabel}>Gründigkeit (cm)</Text>
          <Controller
            control={control}
            name="grundigkeit"
            render={({ field: { value } }) => (
              <TextInput
                style={[styles.input, styles.readonlyInput]}
                placeholder="Wird automatisch berechnet"
                placeholderTextColor={colors.primary + "66"}
                value={value}
                editable={false}
              />
            )}
          />

          <Text style={[styles.fieldLabel, { marginTop: 8 }]}>
            Effektiver Wurzelraum (cm)
          </Text>
          <Controller
            control={control}
            name="effektiver_wurzelraum"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="z.B. 80"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <View style={localStyles.poreBlock}>
            <Text style={styles.sectionTitle}>Feldkapazität bis 1 m</Text>
            <Text style={styles.fieldLabel}>l/m²</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              placeholder="Wird berechnet…"
              placeholderTextColor={colors.primary + "66"}
              value={profileFK != null ? profileFK.toFixed(1) : ""}
              editable={false}
            />
            <Text style={styles.fieldLabel}>Bewertung</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              placeholder="Wird berechnet…"
              placeholderTextColor={colors.primary + "66"}
              value={profileFK != null ? rateFK(profileFK) : ""}
              editable={false}
            />
          </View>

          <View style={localStyles.poreBlock}>
            <Text style={styles.sectionTitle}>Nutzbare Feldkapazität</Text>
            <Text style={styles.fieldLabel}>l/m²</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              placeholder="Wird berechnet…"
              placeholderTextColor={colors.primary + "66"}
              value={profileNFK != null ? profileNFK.toFixed(1) : ""}
              editable={false}
            />
            <Text style={styles.fieldLabel}>Bewertung</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              placeholder="Wird berechnet…"
              placeholderTextColor={colors.primary + "66"}
              value={profileNFK != null ? rateNFK(profileNFK) : ""}
              editable={false}
            />
          </View>
        </CollapsibleSection>
      </View>

      <Modal
        visible={bodentypModal}
        animationType="slide"
        onRequestClose={() => setBodentypModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity
              style={localStyles.lexikonBtn}
              onPress={() => setLexikonVisible(true)}
            >
              <Text style={localStyles.lexikonBtnText}>Horizontlexikon</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBodentypModal(false)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <BodenTypTool
            onConfirm={(v) => {
              const [typPart, name] = v.split(" – ");
              setValue("bodtyp_abk", typPart.replace(/^Typ\s+/, ""));
              setValue("bodentyp", name ?? v);
              setBodentypModal(false);
            }}
          />
        </SafeAreaView>
      </Modal>

      <Modal
        visible={lexikonVisible}
        animationType="slide"
        onRequestClose={() => setLexikonVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setLexikonVisible(false)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <HorizontLexikonContent />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  sectionGap: {
    marginTop: 16,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalClose: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  lexikonBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  lexikonBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  poreBlock: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
});
