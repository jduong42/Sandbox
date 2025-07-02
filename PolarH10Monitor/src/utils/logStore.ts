interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: any;
}

class LogStore {
  private logs: LogEntry[] = [];
  private maxLogs = 50; // Keep only last 50 logs
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  addLog(level: LogEntry['level'], message: string, data?: any) {
    const now = new Date();
    const timeString =
      now.toISOString().split('T')[1]?.split('.')[0] ||
      now.toTimeString().split(' ')[0] ||
      'unknown';

    const logEntry: LogEntry = {
      timestamp: timeString, // Just time HH:MM:SS
      level,
      message,
      data,
    };

    this.logs.unshift(logEntry); // Add to beginning

    // Keep only maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const logStore = new LogStore();
