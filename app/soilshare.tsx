import { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/styles';
import SoilShareScroll from '../components/SoilShareScroll';

export default function SoilShareScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Anteil',
    });
  }, [navigation]);

  return (
    <View style={styles.containerfull}>
      <SoilShareScroll />
    </View>
  );
}