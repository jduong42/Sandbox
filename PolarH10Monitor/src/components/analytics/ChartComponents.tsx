import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  LineChart as RNLineChart,
  BarChart as RNBarChart,
  PieChart as RNPieChart,
  ProgressChart,
} from 'react-native-chart-kit';
import { ChartData, ChartDataPoint } from '../../types/training';
import { theme } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - theme.spacing.xl * 2;
const chartHeight = 200;

// Chart configuration
const chartConfig = {
  backgroundColor: theme.colors.surface,
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, // Primary color
  labelColor: (opacity = 1) => theme.colors.textSecondary,
  style: {
    borderRadius: theme.borderRadius.lg,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: theme.colors.primary,
  },
};

interface ChartComponentProps {
  data: ChartData;
  style?: any;
}

// Helper function to convert ChartData to react-native-chart-kit format
const convertToLineChartData = (data: ChartData) => {
  const labels = data.data.map(point =>
    typeof point.x === 'string'
      ? point.x
      : typeof point.x === 'number'
      ? point.x.toString()
      : point.x.toLocaleDateString(),
  );
  const datasets = [
    {
      data: data.data.map(point => point.y),
      color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
      strokeWidth: 3,
    },
  ];

  return { labels, datasets };
};

const convertToBarChartData = (data: ChartData) => {
  const labels = data.data.map(point => {
    if (typeof point.x === 'string') {
      // Handle multi-line labels by taking only the first line for chart labels
      return point.x.split('\n')[0];
    }
    return typeof point.x === 'number'
      ? point.x.toString()
      : point.x.toLocaleDateString();
  });

  const datasets = [
    {
      data: data.data.map(point => point.y),
      // Use colors from data if available
      colors: data.data.map(point =>
        point.color
          ? (opacity = 1) => point.color!
          : (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
      ),
    },
  ];

  return { labels, datasets };
};

const convertToPieChartData = (data: ChartData) => {
  return data.data.map((point, index) => ({
    name: point.label || `Item ${index + 1}`,
    population: point.y,
    color:
      point.color ||
      ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'][index % 5],
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12,
  }));
};

/**
 * Line Chart Component for trends and time series data
 */
export const LineChart: React.FC<ChartComponentProps> = ({ data, style }) => {
  const chartData = convertToLineChartData(data);

  return (
    <View style={[styles.chartContainer, style]}>
      <RNLineChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={chartConfig}
        style={styles.chart}
        bezier
        fromZero
      />
    </View>
  );
};

/**
 * Bar Chart Component for categorical data
 */
export const BarChart: React.FC<ChartComponentProps> = ({ data, style }) => {
  const chartData = convertToBarChartData(data);

  // Create a custom chart config for this specific chart if it has colors
  const customChartConfig = {
    ...chartConfig,
    // Override color function if we have custom colors
    ...(data.data[0]?.color && {
      color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, // Default fallback
    }),
  };

  return (
    <View style={[styles.chartContainer, style]}>
      <RNBarChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={customChartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=" min"
        showValuesOnTopOfBars
        fromZero
        segments={4}
      />

      {/* Custom labels with HR ranges */}
      <View style={styles.customLabelsContainer}>
        {data.data.map((point, index) => (
          <View key={index} style={styles.customLabel}>
            <Text style={styles.customLabelText}>
              {typeof point.x === 'string' && point.x.includes('\n')
                ? point.x
                : `Zone ${index + 1}\n${getZoneRange(index + 1)}`}
            </Text>
            <Text style={styles.customLabelValue}>{point.y} min</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Helper function to get zone ranges
const getZoneRange = (zone: number): string => {
  const ranges = ['50-60%', '60-70%', '70-80%', '80-90%', '90-100%'];
  return ranges[zone - 1] || '';
};

/**
 * Pie Chart Component for distributions
 */
export const PieChart: React.FC<ChartComponentProps> = ({ data, style }) => {
  const chartData = convertToPieChartData(data);

  return (
    <View style={[styles.chartContainer, style]}>
      <RNPieChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        style={styles.chart}
      />
    </View>
  );
};

/**
 * Area Chart Component - Using Line Chart with fill
 */
export const AreaChart: React.FC<ChartComponentProps> = ({ data, style }) => {
  const chartData = convertToLineChartData(data);

  return (
    <View style={[styles.chartContainer, style]}>
      <RNLineChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={{
          ...chartConfig,
          fillShadowGradient: theme.colors.primary,
          fillShadowGradientOpacity: 0.3,
        }}
        style={styles.chart}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={true}
      />
    </View>
  );
};

/**
 * Dynamic Chart Component that renders based on chartType
 */
export const DynamicChart: React.FC<ChartComponentProps> = ({
  data,
  style,
}) => {
  switch (data.chartType) {
    case 'line':
      return <LineChart data={data} style={style} />;
    case 'bar':
      return <BarChart data={data} style={style} />;
    case 'pie':
      return <PieChart data={data} style={style} />;
    case 'area':
      return <AreaChart data={data} style={style} />;
    default:
      return <LineChart data={data} style={style} />;
  }
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: theme.borderRadius.lg,
  },
  customLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: chartWidth,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  customLabel: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  customLabelText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  customLabelValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
    marginTop: 2,
  },
});
