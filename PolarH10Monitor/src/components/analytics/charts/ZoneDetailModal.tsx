import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { chartComponentStyles as styles } from '../../../theme/chartComponents';

interface ZoneDetail {
  title: string;
  subtitle: string;
  description: string;
  benefits: string;
  examples: string[];
  duration: string;
  feeling: string;
  when: string;
}

interface ZoneDetailModalProps {
  visible: boolean;
  zoneIndex: number | null;
  zoneInfo: {
    name: string;
    range: string;
    color: string;
    description: string;
  };
  zoneDetail: ZoneDetail;
  onClose: () => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  visible,
  zoneIndex,
  zoneInfo,
  zoneDetail,
  onClose,
}) => {
  if (zoneIndex === null) return null;

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
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalColorDot,
                { backgroundColor: zoneInfo.color },
              ]}
            />
            <Text style={styles.modalTitle}>{zoneDetail.title}</Text>
          </View>

          <Text style={styles.modalRange}>{zoneDetail.subtitle}</Text>
          <Text style={styles.modalText}>{zoneDetail.description}</Text>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Key Benefits:</Text>
            <Text style={styles.modalText}>{zoneDetail.benefits}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Examples:</Text>
            {zoneDetail.examples.map((example, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>{example}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Duration:</Text>
            <Text style={styles.modalText}>{zoneDetail.duration}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>How It Feels:</Text>
            <Text style={styles.modalText}>{zoneDetail.feeling}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>When to Use:</Text>
            <Text style={styles.modalText}>{zoneDetail.when}</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableOpacity>
    </Modal>
  );
};

export default ZoneDetailModal;
