import React from 'react';
import { View, Text } from 'react-native';
import { QuickActionButton } from '../fitness';
import { homeScreenStyles } from '../../theme/homeScreenStyles';

interface QuickActionsSectionProps {
  isConnected: boolean;
  onConnectDevice: () => void;
  onStartWorkout: () => void;
  onViewData: () => void;
  onSettings: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  isConnected,
  onConnectDevice,
  onStartWorkout,
  onViewData,
  onSettings,
}) => {
  return (
    <View style={homeScreenStyles.quickActions}>
      <Text style={homeScreenStyles.sectionTitle}>Quick Actions</Text>

      <QuickActionButton
        title="Connect Device"
        subtitle={isConnected ? 'Disconnect Polar H10' : 'Connect to Polar H10'}
        icon={<Text style={homeScreenStyles.actionIcon}>🔗</Text>}
        onPress={onConnectDevice}
        variant={isConnected ? 'success' : 'primary'}
      />

      <QuickActionButton
        title="Start Workout"
        subtitle="Begin new training session"
        icon={<Text style={homeScreenStyles.actionIcon}>💪</Text>}
        onPress={onStartWorkout}
        variant="secondary"
        disabled={!isConnected}
      />

      <QuickActionButton
        title="View Analytics"
        subtitle="Detailed performance data"
        icon={<Text style={homeScreenStyles.actionIcon}>📊</Text>}
        onPress={onViewData}
        variant="warning"
      />

      <QuickActionButton
        title="Settings"
        subtitle="Configure app preferences"
        icon={<Text style={homeScreenStyles.actionIcon}>⚙️</Text>}
        onPress={onSettings}
        variant="primary"
      />
    </View>
  );
};
