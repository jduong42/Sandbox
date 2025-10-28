import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FitnessCard, TransitionCard } from '../fitness';
import { homeScreenStyles } from '../../theme/homeScreenStyles';
import { colors } from '../../theme/colors';

interface FitnessData {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  maxHR: number;
  avgHR: number;
  workoutTime: string;
}

interface HomeStatsGridProps {
  fitnessData: FitnessData;
}

export const HomeStatsGrid: React.FC<HomeStatsGridProps> = ({
  fitnessData,
}) => {
  const navigation = useNavigation();

  return (
    <View style={homeScreenStyles.statsGrid}>
      <View style={homeScreenStyles.statsRow}>
        <TransitionCard
          title="Steps"
          value={fitnessData.steps.toLocaleString()}
          subtitle="Daily goal: 10,000"
          style={homeScreenStyles.statCard}
          icon={<Text style={homeScreenStyles.cardIcon}>👣</Text>}
          onPress={() => navigation.navigate('Detail' as never)}
        />
        <TransitionCard
          title="Calories"
          value={fitnessData.calories}
          unit="kcal"
          subtitle="Burned today"
          style={homeScreenStyles.statCard}
          icon={<Text style={homeScreenStyles.cardIcon}>🔥</Text>}
          onPress={() => navigation.navigate('Detail' as never)}
        />
      </View>

      <View style={homeScreenStyles.statsRow}>
        <FitnessCard
          title="Distance"
          value={fitnessData.distance}
          unit="km"
          subtitle="Total distance"
          style={homeScreenStyles.statCard}
          icon={<Text style={homeScreenStyles.cardIcon}>📍</Text>}
        />
        <FitnessCard
          title="Active"
          value={fitnessData.activeMinutes}
          unit="min"
          subtitle="Active minutes"
          style={homeScreenStyles.statCard}
          icon={<Text style={homeScreenStyles.cardIcon}>⏱️</Text>}
        />
      </View>

      <View style={homeScreenStyles.statsRow}>
        <FitnessCard
          title="Max HR"
          value={fitnessData.maxHR}
          unit="bpm"
          subtitle="Today's max"
          style={homeScreenStyles.statCard}
          backgroundColor={colors.hrZone5 + '20'}
          textColor={colors.hrZone5}
        />
        <FitnessCard
          title="Avg HR"
          value={fitnessData.avgHR}
          unit="bpm"
          subtitle="Session average"
          style={homeScreenStyles.statCard}
          backgroundColor={colors.hrZone3 + '20'}
          textColor={colors.hrZone3}
        />
      </View>
    </View>
  );
};
