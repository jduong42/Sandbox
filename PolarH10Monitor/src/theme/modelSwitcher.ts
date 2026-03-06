import { StyleSheet } from 'react-native';

export const modelSwitcherStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  modelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeModel: {
    backgroundColor: '#e6f3ff',
    borderColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  modelDescription: {
    fontSize: 12,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
});
