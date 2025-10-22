import { StyleSheet } from 'react-native';
import { theme } from './index';

export const logViewerScreenStyles = StyleSheet.create({
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
