import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { HomeScreen, DataScreen, SMLScreen, SettingsScreen, TrainingDataScreen } from '../screens';
import LogViewerScreen from '../screens/LogViewerScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Training':
              iconName = 'fitness-center';
              break;
            case 'Data':
              iconName = 'bar-chart';
              break;
            case 'SML':
              iconName = 'psychology';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            case 'Logs':
              iconName = 'article';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
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
        options={{ title: 'AI Assistant' }}
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
