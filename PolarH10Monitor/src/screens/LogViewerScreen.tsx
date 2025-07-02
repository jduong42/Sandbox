import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { logStore } from '../utils/logStore';
import { theme } from '../theme';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>App Logs</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.logsContainer}
        showsVerticalScrollIndicator={true}
      >
        {logs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <Text style={styles.timestamp}>{log.timestamp}</Text>
              <Text style={[styles.level, { color: getLevelColor(log.level) }]}>
                {log.level}
              </Text>
            </View>
            <Text style={styles.message}>{log.message}</Text>
            {log.data && (
              <Text style={styles.data}>
                {typeof log.data === 'object'
                  ? JSON.stringify(log.data, null, 2)
                  : String(log.data)}
              </Text>
            )}
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={styles.noLogs}>
            No logs yet. Use the app to generate logs!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
  logsContainer: {
    flex: 1,
    padding: 8,
  },
  logEntry: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 4,
    borderRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Courier New',
  },
  level: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Courier New',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Courier New',
    backgroundColor: '#f8f8f8',
    padding: 4,
    borderRadius: 2,
  },
  noLogs: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
});

export default LogViewerScreen;
