import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AnimatedTabView } from '../components';
import { logStore } from '../utils/logStore';
import { logViewerScreenStyles } from '../theme';

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: any;
}

const LogViewerScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logStore.subscribe(setLogs);
    // Get initial logs
    setLogs(logStore.getLogs());

    return unsubscribe;
  }, []);

  const clearLogs = () => {
    logStore.clear();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return '#FF4444';
      case 'WARN':
        return '#FFA500';
      case 'INFO':
        return '#4CAF50';
      case 'DEBUG':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <AnimatedTabView>
      <SafeAreaView style={logViewerScreenStyles.container}>
        <View style={logViewerScreenStyles.header}>
          <Text style={logViewerScreenStyles.title}>App Logs</Text>
          <TouchableOpacity
            style={logViewerScreenStyles.clearButton}
            onPress={clearLogs}
          >
            <Text style={logViewerScreenStyles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={logViewerScreenStyles.logsContainer}
          showsVerticalScrollIndicator={true}
        >
          {logs.map((log, index) => (
            <View key={index} style={logViewerScreenStyles.logEntry}>
              <View style={logViewerScreenStyles.logHeader}>
                <Text style={logViewerScreenStyles.timestamp}>
                  {log.timestamp}
                </Text>
                <Text
                  style={[
                    logViewerScreenStyles.level,
                    { color: getLevelColor(log.level) },
                  ]}
                >
                  {log.level}
                </Text>
              </View>
              <Text style={logViewerScreenStyles.message}>{log.message}</Text>
              {log.data && (
                <Text style={logViewerScreenStyles.data}>
                  {typeof log.data === 'object'
                    ? JSON.stringify(log.data, null, 2)
                    : String(log.data)}
                </Text>
              )}
            </View>
          ))}
          {logs.length === 0 && (
            <Text style={logViewerScreenStyles.noLogs}>
              No logs yet. Use the app to generate logs!
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </AnimatedTabView>
  );
};

export default LogViewerScreen;
