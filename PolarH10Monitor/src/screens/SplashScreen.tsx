import React, { useEffect, useRef } from 'react';
import { View, Text, StatusBar, Dimensions, Animated } from 'react-native';
import { Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { theme, splashScreenStyles } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const mountTime = useRef(Date.now());

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.4)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.7)).current;
  const dotOpacity3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    const logoAnimation = Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    const titleAnimation = Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    const dotAnimation = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dotOpacity1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity1, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotOpacity2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity2, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotOpacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Start logo animation first
    logoAnimation.start(() => {
      // Then title animation
      titleAnimation.start(() => {
        // Then start looping animations
        pulseAnimation.start();
        dotAnimation.start();
      });
    });

    const minDisplayTime = 2800; // Show splash for at least 2.8 seconds
    const elapsedTime = Date.now() - mountTime.current;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    const timer = setTimeout(() => {
      // Fade out animation before transitioning
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, remainingTime);

    return () => {
      clearTimeout(timer);
      logoAnimation.stop();
      titleAnimation.stop();
      pulseAnimation.stop();
      dotAnimation.stop();
    };
  }, [
    onFinish,
    logoScale,
    logoOpacity,
    titleOpacity,
    titleTranslateY,
    pulseScale,
    dotOpacity1,
    dotOpacity2,
    dotOpacity3,
  ]);

  return (
    <View style={splashScreenStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        hidden={true}
      />

      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.backgroundSecondary,
          theme.colors.primary + '20',
        ]}
        style={splashScreenStyles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={splashScreenStyles.content}>
          {/* Logo/Icon Section */}
          <Animated.View
            style={[
              { transform: [{ scale: logoScale }], opacity: logoOpacity },
            ]}
          >
            <Surface style={splashScreenStyles.logoContainer} elevation={5}>
              <Animated.View
                style={[
                  splashScreenStyles.logoBackground,
                  { transform: [{ scale: pulseScale }] },
                ]}
              >
                <Text style={splashScreenStyles.logoIcon}>❤️</Text>
                <View style={splashScreenStyles.pulseRing} />
              </Animated.View>
            </Surface>
          </Animated.View>

          {/* App Name */}
          <Animated.View
            style={[
              splashScreenStyles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={splashScreenStyles.appTitle}>PolarH10Monitor</Text>
            <Text style={splashScreenStyles.tagline}>
              Professional Fitness Tracking
            </Text>
          </Animated.View>

          {/* Loading Indicator */}
          <View style={splashScreenStyles.loadingContainer}>
            <View style={splashScreenStyles.loadingDots}>
              <Animated.View
                style={[splashScreenStyles.dot, { opacity: dotOpacity1 }]}
              />
              <Animated.View
                style={[splashScreenStyles.dot, { opacity: dotOpacity2 }]}
              />
              <Animated.View
                style={[splashScreenStyles.dot, { opacity: dotOpacity3 }]}
              />
            </View>
            <Text style={splashScreenStyles.loadingText}>Initializing...</Text>
          </View>

          {/* Footer */}
          <View style={splashScreenStyles.footer}>
            <Text style={splashScreenStyles.footerText}>
              Powered by React Native
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default SplashScreen;
