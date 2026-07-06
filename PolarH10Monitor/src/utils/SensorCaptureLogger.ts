/**
 * SensorCaptureLogger
 *
 * Captures RAW BLE notification bytes — base64, exactly as received from
 * react-native-ble-plx, BEFORE any parsing — to:
 *   <Documents>/sensor_capture.jsonl
 *
 * Purpose: this answers a different question than the parser unit tests do.
 * The parser tests ask "does our decoder correctly invert the format we
 * *think* the H10 uses?". This logger exists to verify the much more basic
 * thing first: does the recording/saving pipeline itself actually capture
 * every notification, in order, without drops — independent of whether our
 * interpretation of the bytes is correct. Because capture happens before any
 * parse attempt, a parser bug can never cause a gap in the captured file.
 *
 * The saved file doubles as ground-truth fixture data: real captured lines
 * can be dropped into __tests__/fixtures and decoded in a test to check the
 * parser's output against the real device (e.g. resting ACC magnitude ≈
 * 1000 mG on one axis, per the PMD guide's own bring-up sanity check).
 *
 * Dev-only. Off by default — must be explicitly started (see DevScreen).
 *
 * How to retrieve the file:
 *   • Simulator : open ~/Library/Developer/CoreSimulator/Devices/<id>/
 *                 data/Containers/Data/Application/<id>/Documents/
 *   • Real device: use the "Share Capture File" button in DevScreen, or
 *     Xcode → Window → Devices & Simulators → select device →
 *     Download Container → AppData/Documents/sensor_capture.jsonl
 *
 * Each line is a JSON object:
 * {
 *   "ts":       ISO timestamp (phone wall clock at capture time),
 *   "source":   "hr" | "pmd_control" | "pmd_data",
 *   "deviceId": BLE device id the notification came from,
 *   "base64":   raw characteristic.value, unmodified
 * }
 */

import RNFS from 'react-native-fs';

export type SensorCaptureSource = 'hr' | 'pmd_control' | 'pmd_data';

export interface SensorCaptureEntry {
  ts: string;
  source: SensorCaptureSource;
  deviceId: string;
  base64: string;
}

const CAPTURE_FILE = `${RNFS.DocumentDirectoryPath}/sensor_capture.jsonl`;

class SensorCaptureLogger {
  private static instance: SensorCaptureLogger;
  private _enabled = false;

  static getInstance(): SensorCaptureLogger {
    if (!SensorCaptureLogger.instance) {
      SensorCaptureLogger.instance = new SensorCaptureLogger();
    }
    return SensorCaptureLogger.instance;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  start(): void {
    this._enabled = true;
  }

  stop(): void {
    this._enabled = false;
  }

  /**
   * Append one raw notification. Fire-and-forget — errors are swallowed so
   * they never affect the live BLE callback, and a no-op when disabled.
   */
  capture(entry: Omit<SensorCaptureEntry, 'ts'>): void {
    if (!this._enabled) return;
    const line =
      JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
    RNFS.appendFile(CAPTURE_FILE, line, 'utf8').catch(err => {
      console.warn('[SensorCaptureLogger] failed to write entry:', err);
    });
  }

  getFilePath(): string {
    return CAPTURE_FILE;
  }

  async clear(): Promise<void> {
    try {
      await RNFS.writeFile(CAPTURE_FILE, '', 'utf8');
    } catch (err) {
      console.warn('[SensorCaptureLogger] failed to clear capture:', err);
    }
  }

  /** Number of captured lines currently on disk (0 if the file doesn't exist yet). */
  async count(): Promise<number> {
    try {
      const exists = await RNFS.exists(CAPTURE_FILE);
      if (!exists) return 0;
      const contents = await RNFS.readFile(CAPTURE_FILE, 'utf8');
      return contents.split('\n').filter(line => line.trim().length > 0)
        .length;
    } catch {
      return 0;
    }
  }
}

export const sensorCaptureLogger = SensorCaptureLogger.getInstance();
