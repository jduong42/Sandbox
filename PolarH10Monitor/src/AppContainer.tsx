import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootStackNavigator from './navigation/RootStackNavigator';
import SplashScreen from './screens/SplashScreen';
import { buildPaperTheme } from './theme/paperTheme';
import { figmaTheme as t } from './theme/figmaTheme';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { databaseService } from './services/DatabaseService';

/**
 * Renders the app's chrome (status bar, nav container, Paper theme) from
 * the live theme context, so light/dark actually covers the whole app
 * rather than just individual screens. Must render inside ThemeProvider.
 */
function ThemedApp() {
  const { c, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={buildPaperTheme(c, isDark)}>
        <StatusBar barStyle={c.statusBar} backgroundColor={c.backgroundSolid} />
        <NavigationContainer
          theme={{
            dark: isDark,
            colors: {
              primary: t.colors.primary,
              background: c.backgroundSolid,
              card: c.surface,
              text: c.foreground,
              border: c.border,
              notification: t.colors.red,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: 'normal' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: 'bold' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <RootStackNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const AppContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Initialise encrypted SQLite database (creates schema + runs migration
        // from EncryptedStorage on first launch after update).
        await databaseService.initialize();
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
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default AppContainer;
