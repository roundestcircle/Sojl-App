import { Linking, Text, View } from 'react-native';
import { styles } from '../styles/styles';

/**
 * About screen – shows a brief project description and contact links.
 * Part of a Bachelor's thesis on digitalizing soil mapping.
 */
export default function AboutScreen() {
  return (
    <View style={[styles.container, { justifyContent: 'flex-start' }]}>
      <Text style={styles.text}>This App is Part of Bachelors Thesis about digitizing Soil Mapping and creating opportunities in Soil Citizen
      Science. 
      </Text>
      <Text style={styles.text}>Find out more at{' '}
        <Text 
        style={styles.link}
        onPress={() => Linking.openURL('https://github.com/roundestcircle/OpenSoil')}
        >
        https://github.com/roundestcircle/OpenSoil
        </Text> 
      {' '}or write me an email at{' '}
        <Text 
        style={styles.link}
        onPress={() => Linking.openURL('mailto:jakob.friehmelt@student.uni-halle.de')}
        >
        jakob.friehmelt@student.uni-halle.de
        </Text>
      {' '}Feel free to send me any suggestions, mistakes you found or advice.
      </Text>
    </View>
  );
}
