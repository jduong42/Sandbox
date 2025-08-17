import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';
import {
  HomeScreen,
  DataScreen,
  SMLScreen,
  ONNXTestScreen,
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
  SML: 'psychology',
  ONNX: 'memory', // Different icon for ONNX testing
  Settings: 'settings',
  Logs: 'article',
} as const;

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
              size={Math.max(size + 2, 24)}
              color={focused ? theme.colors.primary : color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: theme.spacing.md,
          paddingTop: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.medium,
          marginTop: 2,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
          fontSize: theme.typography.sizes.lg,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'PolarH10Monitor' }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingDataScreen}
        options={{ title: 'Training Data' }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{ title: 'Data' }}
      />
      <Tab.Screen
        name="SML"
        component={SMLScreen}
        options={{ title: 'AI Assistant (GGUF)' }}
      />
      <Tab.Screen
        name="ONNX"
        component={ONNXTestScreen}
        options={{ title: 'ONNX Testing' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Tab.Screen
        name="Logs"
        component={LogViewerScreen}
        options={{ title: 'Logs' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
