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

const overlayStyles: { largeRectangle: ViewStyle; smallRectangle: ViewStyle } = {
  largeRectangle: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: '50%',
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'transparent'
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

export default function PictureTakerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [soilColor, setSoilColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [munsellColor, setMunsellColor] = useState<string | null>(null);
  const [isExtractingColor, setIsExtractingColor] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const handleReset = () => {
    // Force InstructionModal to remount by changing its key
    setModalKey(prev => prev + 1);
  };

  if (!permission) {
    return null;
  }

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

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) setUri(photo.uri);
  };

  const handleExtractSoilColor = async (photoUri: string) => {
    try {
      setIsExtractingColor(true);
      const { correctedColor, correctedColorMunsell } = await extractSoilColor(photoUri);
      setSoilColor(correctedColor);
      setMunsellColor(correctedColorMunsell.full);
    } catch (error) {
      console.error('Error extracting soil color:', error);
      setSoilColor(null);
      setMunsellColor(null);
    } finally {
      setIsExtractingColor(false);
    }
  };

const renderPicture = (uri: string) => {
  return (
    <View style={[styles.cameraContainer, { gap: 15, justifyContent: 'space-between' }]}>
      
      <View style={{ position: 'relative', width: '100%', aspectRatio: 3/4 }}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
        />
        
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />
      </View>

      {soilColor && (
        <View style={{backgroundColor: colors.primary, borderRadius: 25, padding: 20, gap: 10, minWidth: '100%', alignItems: 'center'}}>
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
      
      {!soilColor && (
        <TouchableOpacity 
          style={[styles.button, , { position: 'absolute', bottom: 160 }]} 
          onPress={() => handleExtractSoilColor(uri)}
          disabled={isExtractingColor}>
          {isExtractingColor ? (
            <ActivityIndicator color={styles.maintext.color} size={styles.maintext.fontSize} />
          ) : (
            <Text style={styles.maintext}>Farbe bestimmen</Text>
          )}
        </TouchableOpacity>
      )}

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

const renderCamera = () => {
  return (
    <View style={[styles.cameraContainer, { gap: 15, justifyContent: 'space-between' }]}>
      
      <View style={{ position: 'relative', width: '100%', aspectRatio: 3/4, overflow: 'hidden' }}>
        <CameraView
          style={{ width: '100%', height: '100%' }}
          ref={ref}
          mode="picture"
          facing="back"
          responsiveOrientationWhenOrientationLocked
        />
        
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />
      </View>

      <Text style={[styles.maintext, { position: 'absolute', bottom: 160 }]}>
        Bitte platzieren sie die Bodenprobe im kleinen, die GreyCard im großen Rechteck.
      </Text>
      
      <TouchableOpacity style={[styles.button, { position: 'absolute', bottom: 70 }]} onPress={takePicture}>
        <Text style={styles.maintext}>Foto aufnehmen</Text>
      </TouchableOpacity>

    </View>
  );
};

  return (
    <View style={styles.containerfull}>
      <InstructionModal
        key={modalKey} // remount when key changes
        title="Anleitung"
        instructionText="Platziere die Bodenprobe im kleinen, die GreyCard im großen Rechteck. Du kannst jede beliebige 18%-Greycard vom Fotofchhandel oder Amazon verwenden. Drücke auf 'Foto aufnehmen'."
        storageKey="soilColDontShowAgain"
      />
      {uri ? renderPicture(uri) : renderCamera()}
      <ResetInstructionButton
        storageKey="soilColDontShowAgain"
        onReset={handleReset}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 0, right: 0 }}
      />
    </View>
  );
}


