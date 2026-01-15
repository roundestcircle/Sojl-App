import { Text, View } from 'react-native';
import { styles } from '../styles/styles.js';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This App is Part of Bachelors Thesis about digitizing Soil Mapping and creating opportunities in Soil Citizen
      Science. 
      </Text>
      <Text style={styles.text}>Find out more at https://github.com/roundestcircle/OpenSoil or write me an email at jakob.friehmelt@student.uni-halle.de
      </Text>
    </View>
  );
}
