import React from 'react';
import { View, Text } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { SafeText } from '../common/SafeText';
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
        <SafeText style={trainingDataStyles.historyTitle}>
          Recent Sessions ({sessionHistory.length})
        </SafeText>
      </View>

      {sessionHistory.length === 0 ? (
        <SafeText style={trainingDataStyles.historyEmpty} numberOfLines={2}>
          No recording sessions yet. Start your first session above!
        </SafeText>
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
              <SafeText
                style={trainingDataStyles.historyItemName}
                numberOfLines={1}
              >
                {session.name}
              </SafeText>
              <SafeText
                style={trainingDataStyles.historyItemDate}
                numberOfLines={1}
              >
                {`${session.startTime.toLocaleDateString()} at ${session.startTime.toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}`}
              </SafeText>
            </View>
            <SafeText
              style={trainingDataStyles.historyItemDuration}
              numberOfLines={1}
            >
              {session.duration
                ? formatDuration(session.duration)
                : 'In progress'}
            </SafeText>
          </View>
        ))
      )}
    </View>
  );
};
