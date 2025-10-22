import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import NativeIcon from '../components/common/NativeIcon';
import { theme } from '../theme';

import {
  HomeScreen,
  DataScreen,
  LlamaTestScreen,
  SettingsScreen,
  TrainingDataScreen,
} from '../screens';
import LogViewerScreen from '../screens/LogViewerScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const TAB_ICONS = {
  Home: 'home',
  Training: 'dumbbell',
  Data: 'chart',
  AI: 'brain',
  Settings: 'settings',
  Logs: 'document',
} as const;

const TABS = [
  { name: 'Home', component: HomeScreen, title: 'PolarH10Monitor' },
  { name: 'Training', component: TrainingDataScreen, title: 'Training Data' },
  { name: 'Data', component: DataScreen, title: 'Analytics' },
  { name: 'AI', component: LlamaTestScreen, title: 'AI Assistant' },
  { name: 'Settings', component: SettingsScreen, title: 'Settings' },
  { name: 'Logs', component: LogViewerScreen, title: 'Logs' },
];

interface CustomTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        paddingBottom: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        height: 90,
        elevation: 8,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.name;
        const iconName = TAB_ICONS[tab.name as keyof typeof TAB_ICONS];

        return (
          <TouchableOpacity
            key={tab.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            }}
            onPress={() => {
              console.log(
                `🎯 ${tab.name} tab pressed - navigating with transition`,
              );
              onTabPress(tab.name);
            }}
            activeOpacity={0.7}
          >
            <NativeIcon
              name={iconName}
              size={26}
              color={
                isActive ? theme.colors.primary : theme.colors.textSecondary
              }
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.medium,
                marginTop: 4,
                color: isActive
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function SmoothTabNavigator() {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tabName: string) => {
    if (tabName !== activeTab) {
      setActiveTab(tabName);
    }
  };

  const activeTabData = TABS.find(tab => tab.name === activeTab) || TABS[0];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
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
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen
          name={activeTab}
          component={activeTabData.component}
          options={{
            title: activeTabData.title,
          }}
        />
      </Stack.Navigator>

      <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
