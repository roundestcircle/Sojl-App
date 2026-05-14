import { View } from "react-native";
import PictureTaker from "../components/PictureTaker";
import { styles } from "../styles/styles";

/**
 * Standalone soil color screen.
 * Hosts PictureTaker without the surrounding mapping workflow,
 * accessible directly from the home screen.
 */
export default function SoilColorScreen() {
  return (
    <View style={styles.containerfull}>
      <PictureTaker />
    </View>
  );
}
