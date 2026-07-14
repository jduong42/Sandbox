/**
 * notifications.ts
 *
 * Thin wrapper around @notifee/react-native for the BLE disconnect/reconnect
 * OS-level notifications — the real scenario is being away from the phone
 * entirely (e.g. a floorball match), where an in-app Toast alone would never
 * be seen. Deliberately plain functions, not a hook: SessionRecordingService
 * is a plain singleton class and calls these directly, no React needed.
 *
 * Notification failures are always non-fatal here — the in-app Toast/live
 * status line (LiveRecordingPanel) already covers the same information, so a
 * failed OS notification should never affect the recording itself.
 */

import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';
import { logger } from './logger';

const ANDROID_CHANNEL_ID = 'ble-connection';
let androidChannelReady = false;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelReady) return;
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Heart rate monitor connection',
    importance: AndroidImportance.HIGH,
  });
  androidChannelReady = true;
}

/**
 * Requests OS notification permission. Safe to call repeatedly — notifee
 * only prompts the user once; subsequent calls just return the current
 * settings.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (error) {
    logger.warn('Failed to request notification permission', { error });
    return false;
  }
}

async function display(title: string, body: string): Promise<void> {
  try {
    await ensureAndroidChannel();
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: ANDROID_CHANNEL_ID,
        pressAction: { id: 'default' },
      },
      ios: { sound: 'default' },
    });
  } catch (error) {
    logger.warn('Failed to display OS notification', { error, title });
  }
}

export function notifyDisconnected(deviceName: string): Promise<void> {
  return display(
    'Heart rate monitor disconnected',
    `Lost connection to ${deviceName}. Trying to reconnect…`,
  );
}

export function notifyReconnected(deviceName: string): Promise<void> {
  return display('Reconnected', `${deviceName} is connected again.`);
}
