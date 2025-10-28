import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { analyticsScreenStyles as styles } from '../../../theme/analyticsScreen';

interface MetricRange {
  range: string;
  level: string;
  color: string;
  meaning: string;
}

interface MetricContent {
  title: string;
  description: string;
  importance: string;
  ranges: MetricRange[];
}

interface MetricModalProps {
  visible: boolean;
  selectedMetric: 'ATL' | 'CTL' | 'TSB' | null;
  onClose: () => void;
}

export const MetricModal: React.FC<MetricModalProps> = ({
  visible,
  selectedMetric,
  onClose,
}) => {
  const getMetricContent = (): MetricContent | null => {
    switch (selectedMetric) {
      case 'ATL':
        return {
          title: 'ATL - Acute Training Load',
          description:
            "Your recent training fatigue over the last 7 days. ATL represents how much stress you've put on your body recently.",
          importance:
            "High ATL means you're under significant recent stress and may need recovery. Low ATL suggests you haven't been training much lately.",
          ranges: [
            {
              range: '< 50',
              level: 'Low',
              color: theme.colors.textSecondary,
              meaning: 'Light recent training',
            },
            {
              range: '50-100',
              level: 'Moderate',
              color: theme.colors.warning,
              meaning: 'Normal training load',
            },
            {
              range: '100-150',
              level: 'High',
              color: theme.colors.error,
              meaning: 'Heavy recent training',
            },
            {
              range: '150+',
              level: 'Very High',
              color: theme.colors.error,
              meaning: 'Extreme load - recovery needed',
            },
          ],
        };
      case 'CTL':
        return {
          title: 'CTL - Chronic Training Load',
          description:
            'Your fitness level built up over the last 42 days. CTL represents your aerobic fitness and endurance capacity.',
          importance:
            'Higher CTL means better fitness base. It takes weeks to build and represents your training consistency.',
          ranges: [
            {
              range: '< 50',
              level: 'Beginner',
              color: theme.colors.textSecondary,
              meaning: 'Starting fitness level',
            },
            {
              range: '50-80',
              level: 'Recreational',
              color: theme.colors.warning,
              meaning: 'Casual athlete fitness',
            },
            {
              range: '80-120',
              level: 'Trained',
              color: theme.colors.success,
              meaning: 'Competitive athlete',
            },
            {
              range: '120+',
              level: 'Elite',
              color: theme.colors.primary,
              meaning: 'Professional level fitness',
            },
          ],
        };
      case 'TSB':
        return {
          title: 'TSB - Training Stress Balance',
          description:
            "Your freshness level (CTL - ATL). TSB shows if you're ready to perform or need more recovery.",
          importance:
            "Positive TSB means you're fresh and ready for hard efforts. Negative TSB means you're building fitness but accumulating fatigue.",
          ranges: [
            {
              range: '+15 to +25',
              level: 'Very Fresh',
              color: theme.colors.success,
              meaning: 'Perfect for racing',
            },
            {
              range: '+5 to +15',
              level: 'Fresh',
              color: theme.colors.success,
              meaning: 'Good for performance',
            },
            {
              range: '-5 to +5',
              level: 'Balanced',
              color: theme.colors.warning,
              meaning: 'Maintaining fitness',
            },
            {
              range: '-15 to -5',
              level: 'Tired',
              color: theme.colors.error,
              meaning: 'Building fitness',
            },
            {
              range: '-25 to -15',
              level: 'Very Tired',
              color: theme.colors.error,
              meaning: 'Recovery needed',
            },
          ],
        };
      default:
        return null;
    }
  };

  if (!selectedMetric) return null;

  const content = getMetricContent();
  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{content.title}</Text>
          <Text style={styles.modalDescription}>{content.description}</Text>

          <Text style={styles.modalSectionTitle}>Why It Matters:</Text>
          <Text style={styles.modalText}>{content.importance}</Text>

          <Text style={styles.modalSectionTitle}>Ranges:</Text>
          {content.ranges.map((item, index) => (
            <View key={index} style={styles.rangeItem}>
              <Text style={styles.rangeValue}>{item.range}</Text>
              <Text style={[styles.rangeLevel, { color: item.color }]}>
                {item.level}
              </Text>
              <Text style={styles.rangeMeaning}>{item.meaning}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MetricModal;
