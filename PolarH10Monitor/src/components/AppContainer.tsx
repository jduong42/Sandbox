import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootStackNavigator from '../navigation/RootStackNavigator';
import SplashScreen from '../screens/SplashScreen';
import { theme } from '../theme';
import { ThemeProvider } from '../theme/ThemeContext';

const AppContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        // e.g., loading user preferences, checking auth state, etc.
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)); // Simulate loading
        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsAppReady(true); // Still proceed even if there's an error
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    // Add a small delay for smooth transition
    setTimeout(() => {
      setIsLoading(false);
      setShowSplash(false);
    }, 100);
  };

  if ((isLoading || !isAppReady) && showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <PaperProvider theme={theme.paper}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.background}
            />
            <NavigationContainer
              theme={{
                dark: true,
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.background,
                  card: theme.colors.surface,
                  text: theme.colors.text,
                  border: theme.colors.border,
                  notification: theme.colors.error,
                },
                fonts: {
                  regular: {
                    fontFamily: 'System',
                    fontWeight: 'normal',
                  },
                  medium: {
                    fontFamily: 'System',
                    fontWeight: '500',
                  },
                  bold: {
                    fontFamily: 'System',
                    fontWeight: 'bold',
                  },
                  heavy: {
                    fontFamily: 'System',
                    fontWeight: '900',
                  },
                },
              }}
            >
              <RootStackNavigator />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default AppContainer;
