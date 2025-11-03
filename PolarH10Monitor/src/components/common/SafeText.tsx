import React from 'react';
import { Text, TextProps, Platform } from 'react-native';

interface SafeTextProps extends TextProps {
  children: React.ReactNode;
}

/**
 * SafeText component to handle iOS 26 text rendering issues
 * Applies consistent props to prevent text corruption and overlap
 */
export const SafeText: React.FC<SafeTextProps> = ({
  children,
  style,
  numberOfLines,
  allowFontScaling,
  adjustsFontSizeToFit,
  ...rest
}) => {
  // iOS 26 specific props to prevent text rendering issues
  const iosTextProps =
    Platform.OS === 'ios'
      ? {
          allowFontScaling: allowFontScaling ?? false,
          adjustsFontSizeToFit: adjustsFontSizeToFit ?? false,
          numberOfLines: numberOfLines ?? undefined,
          includeFontPadding: false,
        }
      : {};

  return (
    <Text style={style} {...iosTextProps} {...rest}>
      {children}
    </Text>
  );
};

export default SafeText;
