import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View, ViewStyle, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { extractSoilColor } from "../utils/soilColorExtractor";
import { InstructionModal, ResetInstructionButton } from "./InstructionModal";

/**
 * Overlay rectangles guide proper positioning:
 * - largeRectangle: For grey card reference (18% grey card)
 * - smallRectangle: For soil sample placement
 */
const overlayStyles: { largeRectangle: ViewStyle; smallRectangle: ViewStyle } = {
  largeRectangle: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: '50%',
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'transparent' // Transparent so camera view shows through
  },
  smallRectangle: {
    position: 'absolute',
    top: '65%',
    right: '42%',
    width: '16%',
    height: '10%',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent'
  }
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
  const [soilColor, setSoilColor] = useState<{ r: number; g: number; b: number } | null>(null);
  
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
    setModalKey(prev => prev + 1);
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
        <TouchableOpacity 
            style={styles.button}
            onPress={requestPermission} >
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
      const { correctedColor, correctedColorMunsell } = await extractSoilColor(photoUri);
      setSoilColor(correctedColor); // Store RGB values
      setMunsellColor(correctedColorMunsell.full); // Store full Munsell notation
    } catch (error) {
      console.error('Error extracting soil color:', error);
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
      <View style={[styles.cameraContainer, { gap: 5 }]}>
        
        {/* Display captured photo with overlay guides */}
        <View style={{ width: '100%', aspectRatio: 3/4 }}>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Overlay rectangles showing where grey card and sample should be positioned */}
          <View style={overlayStyles.largeRectangle} />
          <View style={overlayStyles.smallRectangle} />
        </View>

        {/* Display extracted color results once available */}
        {soilColor && (
          <View style={{backgroundColor: colors.primary, borderRadius: 10, padding: 20, gap: 10, minWidth: '100%', alignItems: 'center'}}>
            <Text style={[styles.maintext, { color: '#fff' }]}>
              RGB: R={soilColor.r} G={soilColor.g} B={soilColor.b}
            </Text>
            {munsellColor && (
              <Text style={[styles.maintext, { color: '#fff' }]}>
                Munsell: {munsellColor}
              </Text>
            )}
          </View>
        )}

        {munsellColor && onConfirm && (
          <TouchableOpacity style={[styles.actionButton, { alignSelf: 'stretch' }]} onPress={() => onConfirm(munsellColor)}>
            <Text style={styles.actionButtonText}>Wert übernehmen</Text>
          </TouchableOpacity>
        )}

        {/* Extract color button - Only visible if color hasn't been extracted yet */}
        {!soilColor && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleExtractSoilColor(uri)}
            disabled={isExtractingColor}>
            {isExtractingColor ? (
              <ActivityIndicator color={styles.maintext.color} size={styles.maintext.fontSize} />
            ) : (
              <Text style={styles.maintext}>Farbe bestimmen</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Retake photo button - Clears current photo and extracted results */}
        <TouchableOpacity 
          style={[styles.button, { position: 'absolute', bottom: 70 }]}
          onPress={() => {
            setUri(null);
            setSoilColor(null);
            setMunsellColor(null);
          }}>
          <Text style={[styles.maintext]}>Neues Foto aufnehmen</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders the camera capture screen
   * Shows live camera feed with overlay guides for proper positioning
   */
  const renderCamera = () => {
    return (
      <View style={[styles.cameraContainer, { gap: 15 }]}>
        
        {/* Live camera feed with overlay guides */}
        <View style={{ width: '100%', aspectRatio: 3/4, overflow: 'hidden' }}>
          <CameraView
            style={{ width: '100%', height: '100%' }}
            ref={ref}
            mode="picture"
            facing="back"
            responsiveOrientationWhenOrientationLocked
          />
          
          {/* Overlay rectangles guide proper positioning */}
          <View style={overlayStyles.largeRectangle} />
          <View style={overlayStyles.smallRectangle} />
        </View>

        {/* Instruction text for proper positioning */}
        <Text style={[styles.maintext]}>
          Bitte platzieren sie die Bodenprobe im kleinen, die GreyCard im großen Rechteck.
        </Text>
        
        {/* Capture photo button */}
        <TouchableOpacity style={[styles.button, { position: 'absolute', bottom: 70 }]} onPress={takePicture}>
          <Text style={styles.maintext}>Foto aufnehmen</Text>
        </TouchableOpacity>

      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Instruction Modal - Displays usage instructions and tips */}
      <InstructionModal
        key={modalKey} // Remount when key changes to reset shown state
        title="Anleitung"
        instructionText="Platziere die Bodenprobe im kleinen, die GreyCard im großen Rechteck. Du kannst jede beliebige 18%-Greycard vom Fotofchhandel oder Amazon verwenden. Drücke auf 'Foto aufnehmen'."
        storageKey="soilColDontShowAgain"
      />
      
      {/* Conditionally render camera or picture review screen */}
      {uri ? renderPicture(uri) : renderCamera()}
      
      {/* Reset instruction button - Allows user to show instructions again */}
      <ResetInstructionButton
        storageKey="soilColDontShowAgain"
        onReset={handleReset}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 0, right: 0 }}
      />
    </View>
  );
}


