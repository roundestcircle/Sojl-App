import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { styles } from "@/styles/styles";

export default function ColorPickerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");

const overlayStyles = {
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
    top: '45%',
    right: '42%',
    width: '16%',
    height: '10%',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent'
  }
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
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setUri(null)}>
        <Text style={styles.maintext}>Neues Foto aufnehmen</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setUri(null)}>
        <Text style={styles.maintext}>Farbe bestimmen</Text>
      </TouchableOpacity>
    </View>
  );
};

const renderCamera = () => {
  return (
    <View style={[styles.cameraContainer, { gap: 15, justifyContent: 'space-between' }]}>
      <Text style={styles.maintext}>
        Bitte platzieren sie die Bodenprobe im kleinen, die GreyCard im großen Rechteck.
      </Text>
      
      <View style={{ position: 'relative', width: '100%', aspectRatio: 3/4, overflow: 'hidden' }}>
        <CameraView
          style={{ width: '100%', height: '100%' }}
          ref={ref}
          mode={mode}
          facing={facing}
          responsiveOrientationWhenOrientationLocked
        />
        
        <View style={overlayStyles.largeRectangle} />
        <View style={overlayStyles.smallRectangle} />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.maintext}>Foto aufnehmen</Text>
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={styles.containerfull}>
      {uri ? renderPicture(uri) : renderCamera()}
    </View>
  );
}


