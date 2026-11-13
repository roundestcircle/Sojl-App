import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { styles } from "@/styles/styles";
import type { Aufnahme, AufnahmeDetails } from "@/lib/db/aufnahmeQueries";
import type { Horizont } from "@/lib/db/horizontQueries";
import StandortSection from "./StandortSection";
import ProfilSection from "./ProfilSection";
import StandorteigenschaftenSection from "./StandorteigenschaftenSection";
import ErweiterteSection from "./ErweiterteSection";
import BerechneteWerteSection from "./BerechneteWerteSection";
import { PLACEHOLDER_COLOR } from "../shared";
import {
  toAufnahmeFormDefaults,
  toAufnahmeDetails,
  utmStringsToDegrees,
  degreeStringsToUtm,
  type AufnahmeFormData,
  type CoordMode,
} from "./types";

type Props = {
  initialData: Aufnahme;
  onSave: (data: AufnahmeDetails) => void;
  /** Gründigkeit computed by the screen from all Horizonte (cm). */
  calcGrundigkeit?: string;
  /** All Horizonte of this Aufnahme, for the profile-level FK/nFK/S-Wert sums. */
  horizonte?: Horizont[];
};

/**
 * Site data ("Standortdaten") form for an Aufnahme.
 * Supports UTM and decimal-degree coordinate entry with conversion on toggle.
 * All field changes autosave via onSave (no explicit save button).
 *
 * Scrolling (incl. keyboard avoidance) is handled by the surrounding screen.
 */
export default function AufnahmeForm({
  initialData,
  onSave,
  calcGrundigkeit,
  horizonte = [],
}: Props) {
  const methods = useForm<AufnahmeFormData>({
    defaultValues: toAufnahmeFormDefaults(initialData),
  });
  const { control, setValue, getValues, watch } = methods;

  // Which coordinate input mode is shown. The ref mirrors it so the autosave
  // subscription (a long-lived closure) always sees the current value.
  const [mode, setMode] = useState<CoordMode>("utm");
  const modeRef = useRef<CoordMode>("utm");
  const isFirstWatch = useRef(true);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (calcGrundigkeit !== undefined) setValue("grundigkeit", calcGrundigkeit);
  }, [calcGrundigkeit, setValue]);

  // Autosave: subscribe once and dispatch through onSaveRef so the subscription
  // survives onSave identity changes (would otherwise drop the first tick after resub).
  useEffect(() => {
    const { unsubscribe } = watch((data) => {
      if (isFirstWatch.current) {
        isFirstWatch.current = false;
        return;
      }
      onSaveRef.current(
        toAufnahmeDetails(data as Partial<AufnahmeFormData>, modeRef.current),
      );
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Switches coordinate input mode, converting the current values so nothing is lost. */
  const handleToggleMode = () => {
    const newMode: CoordMode = mode === "utm" ? "degrees" : "utm";
    modeRef.current = newMode;
    if (newMode === "degrees") {
      const deg = utmStringsToDegrees(
        getValues("easting"),
        getValues("northing"),
        getValues("zone"),
      );
      if (deg) {
        setValue("lat", deg.lat);
        setValue("lon", deg.lon);
      }
    } else {
      const utm = degreeStringsToUtm(getValues("lat"), getValues("lon"));
      if (utm) {
        setValue("easting", utm.easting);
        setValue("northing", utm.northing);
        setValue("zone", utm.zone);
      }
    }
    setMode(newMode);
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.section}>
        <StandortSection mode={mode} onToggleMode={handleToggleMode} />
        <ProfilSection />
        <StandorteigenschaftenSection />

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Notizen</Text>
        <Controller
          control={control}
          name="notizen"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              placeholder="Freitext…"
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <ErweiterteSection />
        <BerechneteWerteSection horizonte={horizonte} />
      </View>
    </FormProvider>
  );
}
