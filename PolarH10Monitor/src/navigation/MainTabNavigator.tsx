import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Easing, Platform, Dimensions } from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';
import {
  HomeScreen,
  DataScreen,
  AnalyticsScreen,
  LlamaTestScreen,
  SettingsScreen,
  TrainingDataScreen,
} from '../screens';
import LogViewerScreen from '../screens/LogViewerScreen';

const Tab = createBottomTabNavigator();

// Icon mapping for better maintainability
const TAB_ICONS = {
  Home: 'home',
  Training: 'fitness-center',
  Data: 'bar-chart',
  AI: 'smart-toy', // Llama.rn AI assistant
  Settings: 'settings',
  Logs: 'article',
} as const;

export default function MainTabNavigator() {
  console.log('🚀 MainTabNavigator rendered on', Platform.OS);

  useEffect(() => {
    console.log('📱 MainTabNavigator mounted, navigation should be working');
    console.log('🔧 Platform:', Platform.OS, Platform.Version);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Ensure proper touch handling for physical device
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          const iconName =
            TAB_ICONS[route.name as keyof typeof TAB_ICONS] || 'help';

          return (
            <NativeIcon
              name={iconName}
              size={Math.max(size + 4, 26)} // Larger touch targets for physical device
              color={focused ? theme.colors.primary : color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: theme.spacing.lg, // More padding for easier touch
          paddingTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          height: 90, // Taller for better touch targets
          elevation: 8, // Android shadow
          shadowOffset: { width: 0, height: -2 }, // iOS shadow
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.sm, // Larger text
          fontWeight: theme.typography.weights.medium,
          marginTop: 4,
          marginBottom: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 8, // More touch area
        },
        // Ensure headers are visible for navigation feedback
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.lg,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'PolarH10Monitor',
        }}
        listeners={{
          tabPress: () => {
            console.log('🏠 Home tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingDataScreen}
        options={{
          title: 'Training Data',
        }}
        listeners={{
          tabPress: () => {
            console.log('🏃‍♂️ Training tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Data"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
        }}
        listeners={{
          tabPress: () => {
            console.log('📊 Data tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="AI"
        component={LlamaTestScreen}
        options={{
          title: 'AI Assistant',
        }}
        listeners={{
          tabPress: () => {
            console.log('🤖 AI tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
        listeners={{
          tabPress: () => {
            console.log('⚙️ Settings tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogViewerScreen}
        options={{
          title: 'Logs',
        }}
        listeners={{
          tabPress: () => {
            console.log('📄 Logs tab pressed');
          },
        }}
      />
    </Tab.Navigator>
  );
}
