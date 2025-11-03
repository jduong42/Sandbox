import React from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { SafeText } from '../../common/SafeText';
import { chartComponentStyles as styles } from '../../../theme/chartComponents';

interface ZoneInfo {
  name: string;
  range: string;
  color: string;
  description: string;
}

interface DonutChartProps {
  data: Array<{
    value: number;
    color: string;
    label: string;
    zoneIndex?: number;
  }>;
  size?: number;
  strokeWidth?: number;
  totalTime: number;
  onZonePress?: (zoneIndex: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = Math.min(screenWidth - 100, 250),
  strokeWidth = 30,
  totalTime,
  onZonePress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercentage = 0;

  return (
    <View style={styles.donutContainer}>
      <View style={styles.donutChartContainer}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Data segments */}
          {data.map((item, index) => {
            const percentage =
              totalTime > 0 ? (item.value / totalTime) * 100 : 0;
            const strokeDasharray = `${
              (percentage / 100) * circumference
            } ${circumference}`;
            const strokeDashoffset = -(
              (cumulativePercentage / 100) *
              circumference
            );

            cumulativePercentage += percentage;

            if (percentage === 0) return null;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}

          {/* Center text */}
          <SvgText
            x={center}
            y={center - 10}
            fontSize="18"
            fill="#FFFFFF"
            textAnchor="middle"
            fontWeight="700"
          >
            Total Time
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            fontSize="16"
            fill="#888888"
            textAnchor="middle"
            fontWeight="500"
          >
            {totalTime >= 60
              ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`
              : `${Math.round(totalTime)}m`}
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.donutLegend}>
        {data.map((item, index) => {
          const percentage =
            totalTime > 0 ? Math.round((item.value / totalTime) * 100) : 0;
          if (item.value === 0) return null;

          return (
            <TouchableOpacity
              key={index}
              style={styles.donutLegendItem}
              onPress={() =>
                onZonePress &&
                item.zoneIndex !== undefined &&
                onZonePress(item.zoneIndex)
              }
            >
              <View
                style={[styles.donutLegendDot, { backgroundColor: item.color }]}
              />
              <SafeText style={styles.donutLegendLabel} numberOfLines={1}>
                {item.label}
              </SafeText>
              <SafeText style={styles.donutLegendValue} numberOfLines={1}>
                {item.value >= 60
                  ? `${Math.floor(item.value / 60)}h ${Math.round(
                      item.value % 60,
                    )}m (${percentage}%)`
                  : item.value === 0
                  ? '0m (0%)'
                  : `${Math.round(item.value)}m (${percentage}%)`}
              </SafeText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DonutChart;
