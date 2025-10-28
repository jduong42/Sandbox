import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Surface } from 'react-native-paper';
import NativeIcon from '../common/NativeIcon';
import { dataScreenStyles } from '../../theme/dataScreenStyles';
import { colors } from '../../theme/colors';

interface MonitorControlsCardProps {
  isMonitoring: boolean;
  isConnected: boolean;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onClearData: () => void;
}

export const MonitorControlsCard: React.FC<MonitorControlsCardProps> = ({
  isMonitoring,
  isConnected,
  onStartMonitoring,
  onStopMonitoring,
  onClearData,
}) => {
  return (
    <Surface style={dataScreenStyles.card} elevation={3}>
      <View style={dataScreenStyles.controlsCard}>
        <Text style={dataScreenStyles.cardTitle}>Monitor Controls</Text>
        <View style={dataScreenStyles.controlsContainer}>
          <TouchableOpacity
            style={[
              dataScreenStyles.controlButton,
              dataScreenStyles.primaryButton,
              !isConnected && dataScreenStyles.disabledButton,
            ]}
            onPress={isMonitoring ? onStopMonitoring : onStartMonitoring}
            disabled={!isConnected}
          >
            <NativeIcon
              name={isMonitoring ? 'pause' : 'play'}
              size={20}
              color={!isConnected ? colors.textSecondary : 'white'}
            />
            <Text
              style={[
                dataScreenStyles.controlButtonText,
                !isConnected && dataScreenStyles.disabledText,
              ]}
            >
              {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dataScreenStyles.controlButton,
              dataScreenStyles.secondaryButton,
            ]}
            onPress={onClearData}
          >
            <NativeIcon name="trash" size={20} color="white" />
            <Text style={dataScreenStyles.controlButtonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );
};
