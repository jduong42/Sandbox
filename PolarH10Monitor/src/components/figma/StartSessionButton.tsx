import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import NativeIcon from '../common/NativeIcon';

interface StartSessionButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export function StartSessionButton({
  isRecording,
  onClick,
}: StartSessionButtonProps) {
  if (isRecording) {
    return (
      <TouchableOpacity
        style={styles.stopButton}
        onPress={onClick}
        activeOpacity={0.8}
      >
        <NativeIcon name="stop" size={24} color="#ffffff" />
        <Text style={styles.buttonText}>Stop Recording</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      style={styles.touchable}
    >
      <LinearGradient
        colors={['#a855f7', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.buttonContent}>
          <NativeIcon name="add" size={24} color="#ffffff" />
          <Text style={styles.buttonText}>Start New Session</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});
