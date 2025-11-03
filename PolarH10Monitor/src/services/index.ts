// Export all services from a central location
export { bleService } from './BLEService';
export { heartRateService } from './HeartRateService';
export { deviceHistoryService } from './DeviceHistoryService';
export { sessionRecordingService } from './SessionRecordingService';

// Llama.rn AI Services
export { llamaTextGenerationService } from './LlamaTextGenerationService';

// Sports AI Services (Mock implementation)
export { sportsAIService } from './SportsAIService';
export type { SportsAIResponse, SportsContext } from './SportsAIService';

// Export types and interfaces
export type {
  HeartRateReading,
  HeartRateCallback,
  HeartRateServiceInterface,
} from './HeartRateService';
export { HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT } from './HeartRateService';

export type { StoredDevice } from './DeviceHistoryService';
export type { RecordingSession } from './SessionRecordingService';
