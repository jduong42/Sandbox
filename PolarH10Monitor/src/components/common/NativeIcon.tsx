import React from 'react';
import { Text, Platform, TextStyle } from 'react-native';
import { nativeIconStyles } from '../../theme';

// Native icon component using system symbols and Unicode
const NativeIcon: React.FC<{
  name: string;
  size: number;
  color: string;
  style?: TextStyle;
}> = ({ name, size, color, style }) => {
  const getNativeIcon = (iconName: string) => {
    if (Platform.OS === 'ios') {
      // Use clean Unicode symbols that work well on iOS
      switch (iconName) {
        case 'home':
          return '⌂';
        case 'fitness-center':
          return '🏃‍♂️';
        case 'show-chart':
          return '📊';
        case 'bar-chart':
          return '📊';
        case 'smart-toy':
          return '🤖';
        case 'settings':
          return '⚙︎';
        case 'description':
          return '📄';
        case 'article':
          return '�';
        case 'psychology':
          return '🧠';
        case 'psychology-alt':
          return '💭';
        case 'analytics':
          return '📊';
        case 'help':
          return '❓';
        case 'send':
          return '📤';
        case 'tips-and-updates':
          return '💡';
        case 'circle':
          return '•';
        case 'download':
          return '⬇︎';
        case 'bluetooth':
          return '📶';
        case 'bluetooth-connected':
          return '🔗';
        case 'bluetooth-disabled':
          return '📵';
        case 'devices':
          return '📱';
        case 'refresh':
          return '↻';
        case 'clear':
          return '✕';
        case 'close':
          return '✕';
        case 'check':
          return '✓';
        case 'add':
          return '+';
        case 'remove':
          return '−';
        case 'play-arrow':
          return '▶︎';
        case 'stop':
          return '◼︎';
        case 'pause':
          return '⏸';
        case 'delete':
          return '🗑︎';
        case 'chevron-right':
          return '›';
        default:
          return '●';
      }
    } else {
      // Android fallbacks
      switch (iconName) {
        case 'home':
          return '🏠';
        case 'fitness-center':
          return '�‍♂️';
        case 'show-chart':
          return '📈';
        case 'bar-chart':
          return '📊';
        case 'smart-toy':
          return '🤖';
        case 'settings':
          return '⚙️';
        case 'description':
          return '📝';
        case 'article':
          return '�';
        case 'psychology':
          return '🧠';
        case 'psychology-alt':
          return '💭';
        case 'analytics':
          return '📊';
        case 'help':
          return '❓';
        case 'send':
          return '📤';
        case 'tips-and-updates':
          return '💡';
        case 'circle':
          return '•';
        case 'download':
          return '⬇️';
        case 'bluetooth':
          return '📶';
        case 'bluetooth-connected':
          return '🔗';
        case 'bluetooth-disabled':
          return '📵';
        case 'devices':
          return '📱';
        case 'refresh':
          return '🔄';
        case 'clear':
          return '✖️';
        case 'close':
          return '✖️';
        case 'check':
          return '✅';
        case 'add':
          return '➕';
        case 'remove':
          return '➖';
        case 'play-arrow':
          return '▶️';
        case 'stop':
          return '⏹️';
        case 'pause':
          return '⏸️';
        case 'delete':
          return '🗑️';
        case 'chevron-right':
          return '▶️';
        default:
          return '◉';
      }
    }
  };

  return (
    <Text
      style={[nativeIconStyles.icon, { fontSize: size * 0.8, color }, style]}
    >
      {getNativeIcon(name)}
    </Text>
  );
};

export default NativeIcon;
