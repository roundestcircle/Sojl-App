import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  footnote: {
    fontSize: 9,
    position: 'absolute',
    bottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  maintext: {
    fontSize: 25,
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    padding: 18,
    borderRadius: 25,
    borderWidth: 5,
    backgroundColor: '#fff',
    borderColor: colors.primary,
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
