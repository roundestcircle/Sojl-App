import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { extractSoilColor } from "../utils/soilColorExtractor";
import { OVERLAY_FRACTIONS } from "@/utils/cameraOverlay";
import { InstructionModal, ResetInstructionButton } from "./InstructionModal";

/**
 * Overlay rectangles guide proper positioning. Display fractions are kept in
 * sync with the sampling rectangles in `utils/cameraOverlay.ts`; the grey card
 * display rect is intentionally taller than its sampling rect so the user has
 * slack while aligning.
 */
const greyCardDisplay = OVERLAY_FRACTIONS.greyCard.display;
const soilSampleDisplay = OVERLAY_FRACTIONS.soilSample.display;

const overlayStyles: { largeRectangle: ViewStyle; smallRectangle: ViewStyle } =
  {
    largeRectangle: {
      position: "absolute",
      top: `${greyCardDisplay.top * 100}%`,
      left: `${greyCardDisplay.left * 100}%`,
      width: `${greyCardDisplay.width * 100}%`,
      height: `${greyCardDisplay.height * 100}%`,
      borderWidth: 3,
      borderColor: "white",
      backgroundColor: "transparent",
    },
    smallRectangle: {
      position: "absolute",
      top: `${soilSampleDisplay.top * 100}%`,
      left: `${soilSampleDisplay.left * 100}%`,
      width: `${soilSampleDisplay.width * 100}%`,
      height: `${soilSampleDisplay.height * 100}%`,
      borderWidth: 2,
      borderColor: "white",
      backgroundColor: "transparent",
    },
  };

type Props = { onConfirm?: (munsell: string) => void };

export default function PictureTaker({ onConfirm }: Props) {
  // Request and track camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Reference to the camera component
  const ref = useRef<CameraView>(null);

  // Store the URI of the taken photo
  const [uri, setUri] = useState<string | null>(null);

  // Store extracted RGB color values
  const [soilColor, setSoilColor] = useState<{
    r: number;
    g: number;
    b: number;
  } | null>(null);

  // Store Munsell color notation
  const [munsellColor, setMunsellColor] = useState<string | null>(null);

  // Loading state while extracting color
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
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.maintext}>Zugriff erlauben</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Captures a photo from the camera
   * Stores the image URI for processing
   */
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) setUri(photo.uri); // Save image URI
  };

  /**
   * Extracts soil color from the photo using AI-based analysis
   * Accounts for the grey card reference for accurate color correction
   * @param photoUri - URI of the photo to analyze
   */
  const handleExtractSoilColor = async (photoUri: string) => {
    try {
      setIsExtractingColor(true);
      // Extract color and convert to Munsell notation
      const { correctedColor, correctedColorMunsell } =
        await extractSoilColor(photoUri);
      setSoilColor(correctedColor); // Store RGB values
      setMunsellColor(correctedColorMunsell.full); // Store full Munsell notation
    } catch (error) {
      console.error("Error extracting soil color:", error);
      setSoilColor(null);
      setMunsellColor(null);
    } finally {
      setIsExtractingColor(false);
    }
  };

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
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
        />
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />

        {soilColor && (
          <View
            style={[
              styles.resultBox,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                marginTop: 0,
                backgroundColor: "rgba(220, 240, 210, 0.93)",
              },
            ]}
          >
            {munsellColor && (
              <Text style={styles.resultValue}>{munsellColor}</Text>
            )}
            <Text style={styles.resultLabel}>
              RGB: R={soilColor.r} G={soilColor.g} B={soilColor.b}
            </Text>
          </View>
        )}

        <View
          style={{
            position: "absolute",
            bottom: 70,
            left: 0,
            right: 0,
            gap: 10,
          }}
        >
          {munsellColor && onConfirm && (
            <TouchableOpacity
              style={[styles.actionButton, { alignSelf: "stretch" }]}
              onPress={() => onConfirm(munsellColor)}
            >
              <Text style={styles.actionButtonText}>Wert übernehmen</Text>
            </TouchableOpacity>
          )}
          {!soilColor && (
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
            onPress={() => {
              setUri(null);
              setSoilColor(null);
              setMunsellColor(null);
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
        />
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />

        <View style={{ position: "absolute", bottom: 70, left: 0, right: 0 }}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.maintext}>Foto aufnehmen</Text>
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
