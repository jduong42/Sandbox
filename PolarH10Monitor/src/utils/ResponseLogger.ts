/**
 * ResponseLogger
 *
 * Appends one JSON line per AI response to:
 *   <Documents>/ai_response_log.jsonl
 *
 * How to retrieve the file:
 *   • Simulator : open ~/Library/Developer/CoreSimulator/Devices/<id>/
 *                 data/Containers/Data/Application/<id>/Documents/
 *   • Real device: Xcode → Window → Devices & Simulators →
 *                  select device → Download Container → right-click
 *                  .xcappdata → Show Package Contents →
 *                  AppData/Documents/ai_response_log.jsonl
 *
 * Each line is a JSON object:
 * {
 *   "ts":         ISO timestamp,
 *   "prompt":     the full prompt sent to the model,
 *   "userQuery":  the raw user text,
 *   "rawResponse": exact text returned by model (before trim),
 *   "trimmed":    response.text.trim(),
 *   "tokens":     tokens_predicted,
 *   "ms":         generation time in ms
 * }
 */

import RNFS from 'react-native-fs';

export interface ResponseLogEntry {
  ts: string;
  prompt: string;
  userQuery: string;
  rawResponse: string;
  trimmed: string;
  tokens: number;
  ms: number;
}

const LOG_FILE = `${RNFS.DocumentDirectoryPath}/ai_response_log.jsonl`;

class ResponseLogger {
  private static instance: ResponseLogger;

  static getInstance(): ResponseLogger {
    if (!ResponseLogger.instance) {
      ResponseLogger.instance = new ResponseLogger();
    }
    return ResponseLogger.instance;
  }

  /** Append one log entry. Fire-and-forget — errors are swallowed so they
   *  never affect the user-facing flow. */
  async log(entry: ResponseLogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + '\n';
      await RNFS.appendFile(LOG_FILE, line, 'utf8');
      console.log(`[ResponseLogger] entry saved → ${LOG_FILE}`);
    } catch (err) {
      console.warn('[ResponseLogger] failed to write log entry:', err);
    }
  }

  /** Return the absolute path to the log file (useful for sharing). */
  getLogPath(): string {
    return LOG_FILE;
  }

  /** Clear the log file entirely. */
  async clear(): Promise<void> {
    try {
      await RNFS.writeFile(LOG_FILE, '', 'utf8');
      console.log('[ResponseLogger] log cleared');
    } catch (err) {
      console.warn('[ResponseLogger] failed to clear log:', err);
    }
  }

  /** Read and return all log entries as parsed objects. */
  async readAll(): Promise<ResponseLogEntry[]> {
    try {
      const exists = await RNFS.exists(LOG_FILE);
      if (!exists) return [];
      const contents = await RNFS.readFile(LOG_FILE, 'utf8');
      return contents
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => JSON.parse(line) as ResponseLogEntry);
    } catch (err) {
      console.warn('[ResponseLogger] failed to read log:', err);
      return [];
    }
  }
}

export const responseLogger = ResponseLogger.getInstance();
