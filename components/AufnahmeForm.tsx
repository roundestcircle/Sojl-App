import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Location from 'expo-location';
import { styles } from '@/styles/styles';
import { colors } from '@/styles/colors';
import { latLonToUTM, utmToLatLon } from '@/utils/utmConversion';
import type { Aufnahme, AufnahmeDetails } from '@/utils/MappingQueries';
import DropdownField from '@/components/DropdownField';

// ─── Dropdown options (placeholders where noted) ──────────────────────────────

const RELIEFPOS  = ['K', 'O', 'M', 'U', 'H', 'T', 'E'];
const EXPOS      = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
const WITTERUNG  = ['WT1', 'WT2', 'WT3', 'WT4', 'WT5']; // placeholder
const NUTZUNG    = ['A', 'G', 'F', 'W', 'B'];            // placeholder
const VEGETATION = ['LWB', 'NWB', 'MB', 'KR', 'GR'];    // placeholder

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
};

type Props = {
  initialData: Aufnahme;
  onSave: (data: AufnahmeDetails) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseZone(s: string): { number: number; hemisphere: 'N' | 'S' } | null {
  const m = s.trim().toUpperCase().match(/^(\d+)([NS])$/);
  if (!m) return null;
  return { number: parseInt(m[1], 10), hemisphere: m[2] as 'N' | 'S' };
}

const parseNum = (s: string | undefined): number | null => {
  const n = parseFloat(s ?? '');
  return isNaN(n) ? null : n;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AufnahmeForm({ initialData, onSave }: Props) {
  let initUtm: { easting: string; northing: string; zone: string } | null = null;
  let initDeg: { lat: string; lon: string } | null = null;

  if (initialData.utm_easting != null && initialData.utm_northing != null && initialData.utm_zone) {
    initUtm = {
      easting: String(initialData.utm_easting),
      northing: String(initialData.utm_northing),
      zone: initialData.utm_zone,
    };
  }
  if (initialData.gps_lat != null && initialData.gps_lon != null) {
    initDeg = { lat: initialData.gps_lat.toFixed(6), lon: initialData.gps_lon.toFixed(6) };
  }
  if (!initUtm && initDeg) {
    const utm = latLonToUTM(parseFloat(initDeg.lat), parseFloat(initDeg.lon));
    initUtm = { easting: String(utm.easting), northing: String(utm.northing), zone: utm.label };
  }
  if (!initDeg && initUtm) {
    const z = parseZone(initUtm.zone);
    if (z) {
      try {
        const { lat, lon } = utmToLatLon(parseFloat(initUtm.easting), parseFloat(initUtm.northing), z.number, z.hemisphere);
        initDeg = { lat: lat.toFixed(6), lon: lon.toFixed(6) };
      } catch {}
    }
  }

  const [mode, setMode] = useState<'utm' | 'degrees'>('utm');
  const modeRef = useRef<'utm' | 'degrees'>('utm');
  const [locating, setLocating] = useState(false);

  const { control, setValue, watch, getValues } = useForm<FormData>({
    defaultValues: {
      easting:       initUtm?.easting ?? '',
      northing:      initUtm?.northing ?? '',
      zone:          initUtm?.zone ?? '',
      lat:           initDeg?.lat ?? '',
      lon:           initDeg?.lon ?? '',
      notizen:       initialData.notizen ?? '',
      bodentyp:      initialData.bodentyp ?? '',
      bodtyp_abk:    initialData.bodtyp_abk ?? '',
      humusform:     initialData.humusform ?? '',
      humsfrm_abk:   initialData.humsfrm_abk ?? '',
      m_ue_nn:       initialData.m_ue_nn != null ? String(initialData.m_ue_nn) : '',
      witterung:     initialData.witterung ?? '',
      mittl_n:       initialData.mittl_n != null ? String(initialData.mittl_n) : '',
      mittl_temp:    initialData.mittl_temp != null ? String(initialData.mittl_temp) : '',
      nutzung:       initialData.nutzung ?? '',
      vegetation:    initialData.vegetation ?? '',
      reliefpos:     initialData.reliefpos ?? '',
      expos:         initialData.expos ?? '',
      ausgangsgestein: initialData.ausgangsgestein ?? '',
      grundigkeit:   initialData.grundigkeit != null ? String(initialData.grundigkeit) : '',
    },
  });

  useEffect(() => {
    const { unsubscribe } = watch((data) => {
      let gps_lat: number | null = null;
      let gps_lon: number | null = null;
      let utm_easting: number | null = null;
      let utm_northing: number | null = null;
      let utm_zone: string | null = null;

      if (modeRef.current === 'utm') {
        const e = parseFloat(data.easting ?? '');
        const n = parseFloat(data.northing ?? '');
        const z = parseZone(data.zone ?? '');
        if (!isNaN(e) && !isNaN(n) && z) {
          utm_easting = e;
          utm_northing = n;
          utm_zone = (data.zone ?? '').trim().toUpperCase();
          try {
            const res = utmToLatLon(e, n, z.number, z.hemisphere);
            gps_lat = res.lat;
            gps_lon = res.lon;
          } catch {}
        }
      } else {
        const lat = parseFloat(data.lat ?? '');
        const lon = parseFloat(data.lon ?? '');
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
        gps_lat, gps_lon, utm_easting, utm_northing, utm_zone,
        notizen:       data.notizen || null,
        bodentyp:      data.bodentyp || null,
        bodtyp_abk:    data.bodtyp_abk || null,
        humusform:     data.humusform || null,
        humsfrm_abk:   data.humsfrm_abk || null,
        m_ue_nn:       parseNum(data.m_ue_nn),
        witterung:     data.witterung || null,
        mittl_n:       parseNum(data.mittl_n),
        mittl_temp:    parseNum(data.mittl_temp),
        nutzung:       data.nutzung || null,
        vegetation:    data.vegetation || null,
        reliefpos:     data.reliefpos || null,
        expos:         data.expos || null,
        ausgangsgestein: data.ausgangsgestein || null,
        grundigkeit:   parseNum(data.grundigkeit),
      });
    });
    return unsubscribe;
  }, [onSave]);

  const handleToggleMode = () => {
    const newMode = mode === 'utm' ? 'degrees' : 'utm';
    modeRef.current = newMode;
    if (newMode === 'degrees') {
      const e = parseFloat(getValues('easting'));
      const n = parseFloat(getValues('northing'));
      const z = parseZone(getValues('zone'));
      if (!isNaN(e) && !isNaN(n) && z) {
        try {
          const { lat, lon } = utmToLatLon(e, n, z.number, z.hemisphere);
          setValue('lat', lat.toFixed(6));
          setValue('lon', lon.toFixed(6));
        } catch {}
      }
    } else {
      const lat = parseFloat(getValues('lat'));
      const lon = parseFloat(getValues('lon'));
      if (!isNaN(lat) && !isNaN(lon)) {
        const utm = latLonToUTM(lat, lon);
        setValue('easting', String(utm.easting));
        setValue('northing', String(utm.northing));
        setValue('zone', utm.label);
      }
    }
    setMode(newMode);
  };

  const handleGetLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Keine Berechtigung', 'GPS-Zugriff wurde verweigert.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const utm = latLonToUTM(latitude, longitude);
      setValue('easting', String(utm.easting));
      setValue('northing', String(utm.northing));
      setValue('zone', utm.label);
      setValue('lat', latitude.toFixed(6));
      setValue('lon', longitude.toFixed(6));
    } catch {
      Alert.alert('Fehler', 'Standort konnte nicht bestimmt werden.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.section}>

      {/* ── Standortdaten ── */}
      <Text style={styles.sectionTitle}>Standortdaten</Text>

      <TouchableOpacity style={styles.actionButton} onPress={handleGetLocation} disabled={locating}>
        {locating
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.actionButtonText}>GPS automatisch bestimmen</Text>
        }
      </TouchableOpacity>

      {mode === 'utm' ? (
        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Easting (m)</Text>
            <Controller control={control} name="easting" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} keyboardType="number-pad" placeholder="z.B. 692000"
                placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
            )} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Northing (m)</Text>
            <Controller control={control} name="northing" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} keyboardType="number-pad" placeholder="z.B. 5334000"
                placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
            )} />
          </View>
          <View style={[styles.halfField, { flex: 0.6 }]}>
            <Text style={styles.fieldLabel}>Zone</Text>
            <Controller control={control} name="zone" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="32N" placeholderTextColor={colors.primary + '66'}
                autoCapitalize="characters" onChangeText={onChange} value={value} />
            )} />
          </View>
        </View>
      ) : (
        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Breite (°)</Text>
            <Controller control={control} name="lat" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="z.B. 51.5074"
                placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
            )} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Länge (°)</Text>
            <Controller control={control} name="lon" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="z.B. 9.3456"
                placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
            )} />
          </View>
        </View>
      )}

      <TouchableOpacity style={localStyles.toggleButton} onPress={handleToggleMode}>
        <Text style={localStyles.toggleText}>
          {mode === 'utm' ? 'Zu Dezimalgrad wechseln' : 'Zu UTM wechseln'}
        </Text>
      </TouchableOpacity>

      {/* ── Profil ── */}
      <Text style={[styles.sectionTitle, localStyles.sectionGap]}>Profil</Text>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Bodentyp</Text>
          <Controller control={control} name="bodentyp" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="z.B. Braunerde"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
        <View style={[styles.halfField, { flex: 0.6 }]}>
          <Text style={styles.fieldLabel}>Abk.</Text>
          <Controller control={control} name="bodtyp_abk" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="BB" autoCapitalize="characters"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Humusform</Text>
          <Controller control={control} name="humusform" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="z.B. F-Mull"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
        <View style={[styles.halfField, { flex: 0.6 }]}>
          <Text style={styles.fieldLabel}>Abk.</Text>
          <Controller control={control} name="humsfrm_abk" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="mf"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Ausgangsgestein</Text>
      <Controller control={control} name="ausgangsgestein" render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} placeholder="z.B. Kalkstein"
          placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
      )} />

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Gründigkeit (cm)</Text>
          <Controller control={control} name="grundigkeit" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} keyboardType="number-pad" placeholder="z.B. 60"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Höhe (m ü. NN)</Text>
          <Controller control={control} name="m_ue_nn" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} keyboardType="number-pad" placeholder="z.B. 350"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
      </View>

      {/* ── Standorteigenschaften ── */}
      <Text style={[styles.sectionTitle, localStyles.sectionGap]}>Standorteigenschaften</Text>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Reliefposition</Text>
          <Controller control={control} name="reliefpos" render={({ field: { onChange, value } }) => (
            <DropdownField value={value} options={RELIEFPOS} placeholder="Auswählen…" onChange={onChange} />
          )} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Exposition</Text>
          <Controller control={control} name="expos" render={({ field: { onChange, value } }) => (
            <DropdownField value={value} options={EXPOS} placeholder="Auswählen…" onChange={onChange} />
          )} />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Nutzung</Text>
          <Controller control={control} name="nutzung" render={({ field: { onChange, value } }) => (
            <DropdownField value={value} options={NUTZUNG} placeholder="Auswählen…" onChange={onChange} />
          )} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Vegetation</Text>
          <Controller control={control} name="vegetation" render={({ field: { onChange, value } }) => (
            <DropdownField value={value} options={VEGETATION} placeholder="Auswählen…" onChange={onChange} />
          )} />
        </View>
      </View>

      {/* ── Klimadaten ── */}
      <Text style={[styles.sectionTitle, localStyles.sectionGap]}>Klimadaten</Text>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Witterung</Text>
          <Controller control={control} name="witterung" render={({ field: { onChange, value } }) => (
            <DropdownField value={value} options={WITTERUNG} placeholder="Auswählen…" onChange={onChange} />
          )} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Mittl. Niederschlag (mm)</Text>
          <Controller control={control} name="mittl_n" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} keyboardType="number-pad" placeholder="z.B. 700"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Mittl. Temperatur (°C)</Text>
          <Controller control={control} name="mittl_temp" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="z.B. 9.5"
              placeholderTextColor={colors.primary + '66'} onChangeText={onChange} value={value} />
          )} />
        </View>
      </View>

      {/* ── Notizen ── */}
      <Text style={[styles.sectionTitle, localStyles.sectionGap]}>Notizen</Text>
      <Controller control={control} name="notizen" render={({ field: { onChange, value } }) => (
        <TextInput style={[styles.input, localStyles.multiline]} placeholder="Freitext…"
          placeholderTextColor={colors.primary + '66'} multiline numberOfLines={3}
          onChangeText={onChange} value={value} />
      )} />

    </View>
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
    alignSelf: 'flex-start',
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
