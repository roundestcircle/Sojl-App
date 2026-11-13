import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { File } from "expo-file-system";
import { styles } from "@/styles/styles";
import {
  ColorExtractionError,
  extractSoilColor,
  type SoilColorResult,
} from "@/lib/color/soilColorExtractor";
import { OVERLAY_DISPLAY, type OverlayRect } from "@/lib/color/cameraOverlay";
import { POOR_MATCH_DELTA_E00 } from "@/lib/color/munsellLookup";
import {
  InstructionModal,
  ResetInstructionButton,
} from "@/components/ui/InstructionModal";

/**
 * Best-effort deletion of a captured photo from the cache. `takePictureAsync`
 * writes a JPEG to the cache directory on every capture; without this they
 * accumulate. Safe to call with null or an already-deleted file.
 */
const deleteCachedPhoto = (photoUri: string | null) => {
  if (!photoUri) return;
  try {
    const file = new File(photoUri);
    if (file.exists) file.delete();
  } catch {
    // Ignore — the file may already be gone; cleanup is best-effort.
  }
};

/**
 * Guide boxes over the preview. They come from `lib/color/cameraOverlay.ts`,
 * the single source of the rectangles for UI and extraction.
 */
const guideBox = (rect: OverlayRect, borderWidth: number): ViewStyle => ({
  position: "absolute",
  top: `${rect.top * 100}%`,
  left: `${rect.left * 100}%`,
  width: `${rect.width * 100}%`,
  height: `${rect.height * 100}%`,
  borderWidth,
  borderColor: "white",
  backgroundColor: "transparent",
});

const overlayStyles = {
  largeRectangle: guideBox(OVERLAY_DISPLAY.greyCard, 3),
  smallRectangle: guideBox(OVERLAY_DISPLAY.soilSample, 2),
  topBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    marginTop: 0,
  } satisfies ViewStyle,
  errorBox: {
    backgroundColor: "rgba(253, 236, 234, 0.95)",
    borderRadius: 10,
    padding: 12,
  } satisfies ViewStyle,
  errorText: { color: "#b3261e", fontSize: 15, textAlign: "center" as const },
  hintText: {
    color: "#8a4b00",
    fontSize: 14,
    textAlign: "center" as const,
  },
};

const CAPTURE_ERROR =
  "Das Foto konnte nicht aufgenommen werden. Bitte erneut versuchen.";
const EXTRACTION_ERROR =
  "Die Farbe konnte nicht bestimmt werden. Bitte ein neues Foto aufnehmen.";

type Props = { onConfirm?: (munsell: string) => void };

export default function PictureTaker({ onConfirm }: Props) {
  // Request and track camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Reference to the camera component
  const ref = useRef<CameraView>(null);

  // On-screen aspect ratio (width / height) of the camera preview. The preview
  // is centre-cropped to fill the screen, so the extractor needs it to sample
  // the region of the photo the user framed. Capture is blocked until layout
  // has reported it; the value is kept while the CameraView is unmounted.
  const [previewAspect, setPreviewAspect] = useState<number | null>(null);

  // Store the URI of the taken photo
  const [uri, setUri] = useState<string | null>(null);

  // Mirror the current URI in a ref so the unmount cleanup can delete whatever
  // photo is still pending if the user navigates away without resetting.
  const uriRef = useRef<string | null>(null);
  useEffect(() => {
    uriRef.current = uri;
  }, [uri]);

  // Async results that arrive after unmount must not touch state, and a photo
  // captured after unmount must still be cleaned up.
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      deleteCachedPhoto(uriRef.current);
    };
  }, []);

  // Synchronous guard against double taps (state updates land too late).
  const busyRef = useRef(false);

  const [result, setResult] = useState<SoilColorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  // Key to force remount of InstructionModal after reset
  const [modalKey, setModalKey] = useState(0);

  /**
   * Resets the instruction modal to show again
   * Used when user clicks the reset instruction button
   */
  const handleReset = () => {
    // Force InstructionModal to remount by changing its key
    setModalKey((prev) => prev + 1);
  };

  if (!permission) {
    return null;
  }

  // Show permission request if not yet granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.maintext}>
          Zum Farbe bestimmen benötigt die App Zugriff auf deine Kamera.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.maintext}>Zugriff erlauben</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.text}>
              Der Kamerazugriff wurde abgelehnt. Du kannst ihn in den
              Einstellungen der App wieder erlauben.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                Linking.openSettings().catch(() => {
                  setError("Die Einstellungen konnten nicht geöffnet werden.");
                });
              }}
            >
              <Text style={styles.maintext}>Einstellungen öffnen</Text>
            </TouchableOpacity>
            {error && <Text style={overlayStyles.errorText}>{error}</Text>}
          </>
        )}
      </View>
    );
  }

  /** Captures a photo and replaces (and deletes) any previous one. */
  const takePicture = async () => {
    if (busyRef.current || previewAspect === null) return;
    busyRef.current = true;
    setIsCapturing(true);
    setError(null);
    try {
      const photo = await ref.current?.takePictureAsync();
      if (!photo?.uri) throw new Error("No photo returned");
      if (!mountedRef.current) {
        deleteCachedPhoto(photo.uri);
        return;
      }
      deleteCachedPhoto(uriRef.current);
      setResult(null);
      setUri(photo.uri);
    } catch {
      if (mountedRef.current) setError(CAPTURE_ERROR);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setIsCapturing(false);
    }
  };

  /**
   * White-balances the photo with the grey card and looks up the nearest
   * Munsell chip.
   * @param photoUri - URI of the photo to analyze
   */
  const handleExtractSoilColor = async (photoUri: string) => {
    if (busyRef.current || previewAspect === null) return;
    busyRef.current = true;
    setIsExtractingColor(true);
    setError(null);
    try {
      const res = await extractSoilColor(photoUri, previewAspect);
      if (mountedRef.current) setResult(res);
    } catch (e) {
      if (mountedRef.current) {
        setResult(null);
        setError(
          e instanceof ColorExtractionError ? e.message : EXTRACTION_ERROR,
        );
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setIsExtractingColor(false);
    }
  };

  const renderError = (message: string | null) =>
    message ? (
      <View style={[overlayStyles.topBox, overlayStyles.errorBox]}>
        <Text style={overlayStyles.errorText}>{message}</Text>
      </View>
    ) : null;

  /**
   * Renders the picture review screen
   * Displays the captured photo with overlay rectangles and extracted color results
   * @param uri - URI of the captured photo
   */
  const renderPicture = (uri: string) => {
    return (
      <View style={{ flex: 1, paddingBottom: 70 }}>
        <Image
          source={{ uri }}
          contentFit="cover"
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
        />
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />

        {result && (
          <View
            style={[
              styles.resultBox,
              overlayStyles.topBox,
              { backgroundColor: "rgba(220, 240, 210, 0.93)" },
            ]}
          >
            <Text style={styles.resultValue}>{result.munsell}</Text>
            <Text style={styles.resultLabel}>
              RGB: R={result.rgb.r} G={result.rgb.g} B={result.rgb.b}
            </Text>
            {result.distance > POOR_MATCH_DELTA_E00 && (
              <Text style={overlayStyles.hintText}>
                {`Schlechte Übereinstimmung (ΔE00 = ${result.distance.toFixed(1)}): ` +
                  "Die Farbe liegt außerhalb der Referenzfarben oder Belichtung " +
                  "bzw. Greycard passen nicht. Bitte mit der Farbtafel prüfen."}
              </Text>
            )}
          </View>
        )}
        {renderError(error)}

        <View
          style={{
            position: "absolute",
            bottom: 70,
            left: 0,
            right: 0,
            gap: 10,
          }}
        >
          {result && onConfirm && (
            <TouchableOpacity
              style={[styles.actionButton, { alignSelf: "stretch" }]}
              onPress={() => {
                onConfirm(result.munsell);
                // Value handed off; the photo is no longer needed.
                deleteCachedPhoto(uri);
              }}
            >
              <Text style={styles.actionButtonText}>Wert übernehmen</Text>
            </TouchableOpacity>
          )}
          {!result && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleExtractSoilColor(uri)}
              disabled={isExtractingColor}
            >
              {isExtractingColor ? (
                <ActivityIndicator
                  color={styles.maintext.color}
                  size={styles.maintext.fontSize}
                />
              ) : (
                <Text style={styles.maintext}>Farbe bestimmen</Text>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            disabled={isExtractingColor}
            onPress={() => {
              deleteCachedPhoto(uri);
              setUri(null);
              setResult(null);
              setError(null);
            }}
          >
            <Text style={styles.maintext}>Neues Foto aufnehmen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Renders the camera capture screen
   * Shows live camera feed with overlay guides for proper positioning
   */
  const renderCamera = () => {
    const canCapture =
      previewAspect !== null && cameraError === null && !isCapturing;
    return (
      <View style={{ flex: 1, paddingBottom: 70 }}>
        <CameraView
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            overflow: "hidden",
          }}
          ref={ref}
          mode="picture"
          facing="back"
          responsiveOrientationWhenOrientationLocked
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) setPreviewAspect(width / height);
          }}
          onMountError={(e) =>
            setCameraError(
              `Die Kamera konnte nicht gestartet werden (${e.message}).`,
            )
          }
        />
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />
        {renderError(cameraError ?? error)}

        <View style={{ position: "absolute", bottom: 70, left: 0, right: 0 }}>
          <TouchableOpacity
            style={[styles.button, !canCapture && { opacity: 0.5 }]}
            onPress={takePicture}
            disabled={!canCapture}
          >
            {isCapturing ? (
              <ActivityIndicator
                color={styles.maintext.color}
                size={styles.maintext.fontSize}
              />
            ) : (
              <Text style={styles.maintext}>Foto aufnehmen</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Instruction Modal - Displays usage instructions and tips */}
      <InstructionModal
        key={modalKey} // Remount when key changes to reset shown state
        title="Anleitung"
        instructionText="Platziere die Bodenprobe im kleinen, die GreyCard im großen Rechteck. Du kannst jede beliebige 18%-Greycard vom Fotofachhandel oder Amazon verwenden. Drücke auf 'Foto aufnehmen'."
        storageKey="soilColDontShowAgain"
      />

      {/* Conditionally render camera or picture review screen */}
      {uri ? renderPicture(uri) : renderCamera()}

      {/* Reset instruction button - Allows user to show instructions again */}
      <ResetInstructionButton
        storageKey="soilColDontShowAgain"
        onReset={handleReset}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 16,
          paddingHorizontal: 0,
        }}
      />
    </View>
  );
}
