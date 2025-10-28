import React from 'react';
import { View, Text } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { trainingDataStyles } from '../../theme/trainingDataStyles';
import { colors } from '../../theme/colors';

interface SessionHistoryItem {
  id: string;
  name: string;
  startTime: Date;
  duration?: number;
}

interface SessionHistoryCardProps {
  sessionHistory: SessionHistoryItem[];
  formatDuration: (duration: number) => string;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  sessionHistory,
  formatDuration,
}) => {
  return (
    <View style={trainingDataStyles.historyCard}>
      <View style={trainingDataStyles.historyHeader}>
        <NativeIcon
          name="history"
          size={24}
          color={colors.primary}
          style={trainingDataStyles.recordingIcon}
        />
        <Text style={trainingDataStyles.historyTitle}>
          Recent Sessions ({sessionHistory.length})
        </Text>
      </View>

      {sessionHistory.length === 0 ? (
        <Text style={trainingDataStyles.historyEmpty}>
          No recording sessions yet. Start your first session above!
        </Text>
      ) : (
        sessionHistory.slice(0, 5).map((session, index) => (
          <View
            key={session.id}
            style={[
              trainingDataStyles.historyItem,
              index === Math.min(4, sessionHistory.length - 1) &&
                trainingDataStyles.historyItemLast,
            ]}
          >
            <View style={trainingDataStyles.historyItemLeft}>
              <Text style={trainingDataStyles.historyItemName}>
                {session.name}
              </Text>
              <Text style={trainingDataStyles.historyItemDate}>
                {session.startTime.toLocaleDateString()} at{' '}
                {session.startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={trainingDataStyles.historyItemDuration}>
              {session.duration
                ? formatDuration(session.duration)
                : 'In progress'}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};
