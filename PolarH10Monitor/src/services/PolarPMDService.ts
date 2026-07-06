import { Device, Subscription, Characteristic, BleError } from 'react-native-ble-plx';
import { logger } from '../utils/logger';
import { sensorCaptureLogger } from '../utils/SensorCaptureLogger';
import {
  PMD_SERVICE,
  PMD_CHARACTERISTICS,
  PMD_ERROR_CODE,
  PMD_CONTROL_SETTINGS,
} from '../constants/ble';
import {
  buildStartAccCommand,
  buildStopAccCommand,
  parseControlAck,
  parseAccFrame,
  decodeBase64ToBytes,
  encodeBytesToBase64,
  PMDAccFrame,
  PMDControlAck,
} from '../utils/PMDFrameParser';

export type AccFrameCallback = (frame: PMDAccFrame) => void;

interface PendingAck {
  resolve: (ack: PMDControlAck) => void;
  reject: (error: Error) => void;
}

/**
 * Streams accelerometer data from the Polar H10's PMD (Measurement Data)
 * service. ECG start/decode is intentionally not implemented here — this
 * service exists solely to feed motion data into SignalQualityCalculator.
 *
 * PMD service visibility is state-dependent: it only appears in GATT
 * discovery once the strap detects skin contact (wet electrodes, worn
 * snug). Every public method here treats that as a normal, non-error
 * condition — callers should fall back to HR-only recording, not fail.
 */
class PolarPMDService {
  private controlSubscription: Subscription | null = null;
  private dataSubscription: Subscription | null = null;
  private pendingAck: PendingAck | null = null;
  private onAccFrameCallback: AccFrameCallback | null = null;
  private streaming = false;

  /**
   * Starts ACC streaming on the given device.
   * Returns `false` (never throws) if the PMD service isn't present —
   * dry electrodes / loose strap hides it from discovery.
   */
  async startAccStreaming(
    device: Device,
    onAccFrame: AccFrameCallback,
  ): Promise<boolean> {
    try {
      await device.discoverAllServicesAndCharacteristics();
      const services = await device.services();
      const hasPMD = services.some(
        s => s.uuid.toLowerCase() === PMD_SERVICE.toLowerCase(),
      );

      if (!hasPMD) {
        logger.info(
          'PMD service not present — electrodes dry or strap loose, skipping ACC streaming',
          { deviceId: device.id },
        );
        return false;
      }

      this.onAccFrameCallback = onAccFrame;

      // Subscribe control (indicate) and data (notify) BEFORE writing any
      // start command — the strap only commits to streaming once it sees
      // the indication subscription.
      this.controlSubscription = device.monitorCharacteristicForService(
        PMD_SERVICE,
        PMD_CHARACTERISTICS.CONTROL,
        (error, characteristic) =>
          this.handleControlNotification(error, characteristic),
      );
      this.dataSubscription = device.monitorCharacteristicForService(
        PMD_SERVICE,
        PMD_CHARACTERISTICS.DATA,
        (error, characteristic) =>
          this.handleDataNotification(error, characteristic),
      );

      await this.startWithRetry(device);
      this.streaming = true;
      logger.info('PMD ACC streaming started', { deviceId: device.id });
      return true;
    } catch (error) {
      logger.warn('Failed to start PMD ACC streaming — continuing HR-only', {
        deviceId: device.id,
        error,
      });
      this.teardownSubscriptions();
      return false;
    }
  }

  /** Stops ACC streaming. Safe to call even if streaming was never started. */
  async stopAccStreaming(device: Device | null): Promise<void> {
    if (!this.streaming || !device) {
      this.teardownSubscriptions();
      return;
    }

    try {
      const ack = await this.sendCommandAndAwaitAck(device, buildStopAccCommand());
      // Stopping a stream that was never started (or already stopped) also
      // returns error 6 — treat as benign/idempotent, per protocol notes.
      if (
        ack.errorCode !== PMD_ERROR_CODE.SUCCESS &&
        ack.errorCode !== PMD_ERROR_CODE.ALREADY_IN_STATE
      ) {
        logger.warn('PMD ACC stop returned unexpected error code', {
          errorCode: ack.errorCode,
        });
      }
    } catch (error) {
      logger.warn('Failed to cleanly stop PMD ACC streaming', { error });
    } finally {
      this.teardownSubscriptions();
    }
  }

  // ── Start/stop handshake ──────────────────────────────────────────────────

  private async startWithRetry(device: Device): Promise<void> {
    const ack = await this.sendCommandAndAwaitAck(device, buildStartAccCommand());

    if (ack.errorCode === PMD_ERROR_CODE.SUCCESS) return;

    if (ack.errorCode === PMD_ERROR_CODE.ALREADY_IN_STATE) {
      // Reconnect race: the strap may still consider a previous stream
      // active for ~1-2s. Stop, await the ack, then retry once.
      logger.warn('PMD ACC already active — stopping and retrying start', {
        deviceId: device.id,
      });
      await this.sendCommandAndAwaitAck(device, buildStopAccCommand());
      const retryAck = await this.sendCommandAndAwaitAck(
        device,
        buildStartAccCommand(),
      );
      if (retryAck.errorCode !== PMD_ERROR_CODE.SUCCESS) {
        throw new Error(
          `PMD ACC start failed after retry, error code ${retryAck.errorCode}`,
        );
      }
      return;
    }

    throw new Error(`PMD ACC start failed, error code ${ack.errorCode}`);
  }

  private sendCommandAndAwaitAck(
    device: Device,
    command: Uint8Array,
  ): Promise<PMDControlAck> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAck = null;
        reject(new Error('PMD control ack timed out'));
      }, PMD_CONTROL_SETTINGS.ACK_TIMEOUT_MS);

      this.pendingAck = {
        resolve: ack => {
          clearTimeout(timeout);
          resolve(ack);
        },
        reject: error => {
          clearTimeout(timeout);
          reject(error);
        },
      };

      // Must be write-with-response — write-without-response silently
      // no-ops on some BLE stacks and no indication ever arrives.
      device
        .writeCharacteristicWithResponseForService(
          PMD_SERVICE,
          PMD_CHARACTERISTICS.CONTROL,
          encodeBytesToBase64(command),
        )
        .catch((error: unknown) => {
          if (this.pendingAck) {
            this.pendingAck.reject(
              error instanceof Error ? error : new Error(String(error)),
            );
            this.pendingAck = null;
          }
        });
    });
  }

  // ── Notification handlers ─────────────────────────────────────────────────

  private handleControlNotification(
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void {
    if (error) {
      logger.warn('PMD control notification error', { error: error.message });
      return;
    }
    if (!characteristic?.value) return;

    sensorCaptureLogger.capture({
      source: 'pmd_control',
      deviceId: characteristic.deviceID,
      base64: characteristic.value,
    });

    const ack = parseControlAck(decodeBase64ToBytes(characteristic.value));
    if (!ack || !this.pendingAck) return;

    const pending = this.pendingAck;
    this.pendingAck = null;
    pending.resolve(ack);
  }

  private handleDataNotification(
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void {
    if (error) {
      logger.warn('PMD data notification error', { error: error.message });
      return;
    }
    if (!characteristic?.value) return;

    // Captured regardless of whether onAccFrameCallback is set or the
    // decode below succeeds — this is the raw ground truth off the wire.
    sensorCaptureLogger.capture({
      source: 'pmd_data',
      deviceId: characteristic.deviceID,
      base64: characteristic.value,
    });

    if (!this.onAccFrameCallback) return;

    try {
      const frame = parseAccFrame(decodeBase64ToBytes(characteristic.value));
      if (frame) {
        this.onAccFrameCallback(frame);
      }
    } catch (parseError) {
      logger.warn('Failed to parse PMD ACC frame', { parseError });
    }
  }

  private teardownSubscriptions(): void {
    this.controlSubscription?.remove();
    this.dataSubscription?.remove();
    this.controlSubscription = null;
    this.dataSubscription = null;
    this.onAccFrameCallback = null;
    this.streaming = false;
    this.pendingAck = null;
  }
}

export const polarPMDService = new PolarPMDService();
export type { PMDAccFrame };
