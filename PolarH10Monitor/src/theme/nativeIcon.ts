import { StyleSheet, Platform } from 'react-native';

export const nativeIconStyles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
    fontWeight: Platform.OS === 'ios' ? '300' : 'normal',
  },
});
