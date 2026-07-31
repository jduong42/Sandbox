import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import { figmaTheme as t } from '../theme/figmaTheme';
import { useTheme } from '../theme/ThemeContext';
import { FigmaHomeScreen } from '../screens/FigmaHomeScreen';
import { FigmaStartWorkoutScreen } from '../screens/FigmaStartWorkoutScreen';
import { FigmaAIChatScreen } from '../screens/FigmaAIChatScreen';
import { FigmaSettingsScreen } from '../screens/FigmaSettingsScreen';
import { DevScreen } from '../screens/DevScreen';

const Tab = createBottomTabNavigator();

const FIGMA_TABS = [
  { name: 'FigmaHome', label: 'Home', emoji: '🏠', component: FigmaHomeScreen },
  {
    name: 'FigmaWorkout',
    label: 'Workout',
    emoji: '💪',
    component: FigmaStartWorkoutScreen,
  },
  {
    name: 'FigmaAIChat',
    label: 'Chat',
    emoji: '🤖',
    component: FigmaAIChatScreen,
  },
  {
    name: 'FigmaSettings',
    label: 'More',
    emoji: '⚙️',
    component: FigmaSettingsScreen,
  },
] as const;

const DEV_TAB = __DEV__
  ? [{ name: 'Dev', label: 'Dev', emoji: '🛠', component: DevScreen } as const]
  : [];

export default function MainTabNavigator() {
  const { c } = useTheme();

  useEffect(() => {
    console.log(
      '📱 MainTabNavigator mounted on',
      Platform.OS,
      Platform.Version,
    );
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Every tab screen already builds its own themed header (greeting,
        // title, avatar) — the native tab-level header was redundant chrome
        // stacked on top of it, and never followed the light/dark toggle.
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused }) => {
          const tab = [...FIGMA_TABS, ...DEV_TAB].find(
            t => t.name === route.name,
          );
          return (
            <Text
              style={{
                fontSize: 22,
                opacity: focused ? 1 : 0.5,
              }}
            >
              {tab?.emoji ?? '●'}
            </Text>
          );
        },
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingBottom: 16,
          paddingTop: 8,
          height: 84,
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      {FIGMA_TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.label }}
        />
      ))}
      {DEV_TAB.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.label,
            tabBarBadge: undefined,
            tabBarItemStyle: {
              borderTopWidth: 1,
              borderTopColor: 'rgba(245,158,11,0.4)',
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
