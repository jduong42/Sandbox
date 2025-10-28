import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { PieChart } from 'react-native-chart-kit';
import {
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { ChartData } from '../../types/training';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - theme.spacing.lg * 4;

interface TrainingSessionsPieChartProps {
  data: ChartData;
  style?: any;
}

export const TrainingSessionsPieChart: React.FC<
  TrainingSessionsPieChartProps
> = ({ data, style }) => {
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const containerRef = useRef<View>(null);

  const getSessionColors = () => [
    '#4CAF50', // Green for Jog
    '#2196F3', // Blue for Run
    '#FF9800', // Orange for Intervals
    '#9C27B0', // Purple for Tempo
    '#F44336', // Red for Long Run
    '#607D8B', // Blue Grey for Recovery
  ];

  const pieData = data.data.map((point, index) => ({
    name: point.x.toString(),
    population: Number(point.y),
    color: getSessionColors()[index % getSessionColors().length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  // Calculate which slice the touch point is in
  const getSliceFromPosition = (x: number, y: number) => {
    // Calculate the actual center based on chart positioning
    const piePadding = (chartWidth - 160) / 2; // Same padding calculation
    const pieRadius = 80; // Approximate radius of the pie
    const centerX = piePadding + 80; // Left padding + half of pie width
    const centerY = 100; // Center Y position within chart height

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if touch is within pie radius
    if (distance > pieRadius) return null;

    // Calculate angle from center (starting from 12 o'clock)
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    // Calculate cumulative angles for each slice
    const total = pieData.reduce((sum, item) => sum + item.population, 0);
    let currentAngle = 0;

    for (let i = 0; i < pieData.length; i++) {
      const sliceAngle = (pieData[i].population / total) * 2 * Math.PI;
      if (angle >= currentAngle && angle < currentAngle + sliceAngle) {
        return i;
      }
      currentAngle += sliceAngle;
    }

    return null;
  };

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const { x, y } = event.nativeEvent;
    const sliceIndex = getSliceFromPosition(x, y);
    setSelectedSlice(sliceIndex);
  };

  const handleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsGestureActive(true);
    } else if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      setIsGestureActive(false);
      setSelectedSlice(null);
    }
  };

  const renderSelectedInfo = () => {
    if (!isGestureActive || selectedSlice === null) {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Touch and move finger over pie to explore
          </Text>
        </View>
      );
    }

    const selectedData = pieData[selectedSlice];
    return (
      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: selectedData.color },
            ]}
          />
          <Text style={styles.sessionName}>{selectedData.name}</Text>
        </View>
        <Text style={styles.sessionCount}>
          {selectedData.population} sessions
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={handleStateChange}
      >
        <View style={styles.chartContainer} ref={containerRef}>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft={String((chartWidth - 160) / 2)} // Center the 160px pie in chartWidth
            hasLegend={false}
            center={[0, 0]}
            absolute
          />
        </View>
      </PanGestureHandler>

      {/* Selected Slice Info */}
      {renderSelectedInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    width: '100%',
    height: 200,
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    minHeight: 60,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  sessionName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  sessionCount: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semiBold,
  },
});
