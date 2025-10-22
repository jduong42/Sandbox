import React, { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedTabViewProps {
  children: React.ReactNode;
}

export const AnimatedTabView: React.FC<AnimatedTabViewProps> = ({
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current; // Start from 30% opacity instead of 0
  const scaleAnim = useRef(new Animated.Value(0.98)).current; // Much more subtle scale start

  useFocusEffect(
    React.useCallback(() => {
      // Reset animations when screen comes into focus - start from a more subtle state
      fadeAnim.setValue(0.3);
      scaleAnim.setValue(0.98);

      // Much more gentle and slower transitions
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600, // Slower, more comfortable
          easing: Easing.out(Easing.cubic), // Gentler easing
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700, // Even slower for scale
          easing: Easing.out(Easing.quad), // Very gentle scale
          useNativeDriver: true,
        }),
      ]).start();

      // Cleanup function for when screen loses focus - also gentler
      return () => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.3, // Don't fade completely to black
            duration: 400, // Slower fade out
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.98, // Much more subtle scale difference
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      };
    }, [fadeAnim, scaleAnim]),
  );

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedTabView;
