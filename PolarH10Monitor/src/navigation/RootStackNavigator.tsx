import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { Easing } from 'react-native';
import { theme } from '../theme';
import MainTabNavigator from './MainTabNavigator';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator();

// Custom transition configuration for smooth animations
const transitionConfig: StackNavigationOptions = {
  // Use iOS-style transitions for smooth feel
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 350,
        easing: Easing.bezier(0.2, 0, 0, 1), // Smooth easing curve
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.bezier(0.2, 0, 0, 1),
      },
    },
  },
  headerShown: false, // We'll handle headers in tab navigator
};

// Alternative fade transition (like Web View Transition API)
const fadeTransitionConfig: StackNavigationOptions = {
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.ease,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.ease,
      },
    },
  },
  headerShown: false,
};

const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
