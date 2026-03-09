/**
 * secureStorage.ts
 *
 * Two-layer security model:
 *   1. react-native-encrypted-storage  →  iOS Keychain / Android EncryptedSharedPreferences
 *      (hardware-backed secure enclave on supported devices)
 *   2. AES-256-CBC via crypto-js  →  additional ciphertext layer so raw storage bytes
 *      are never plaintext, even in forensic extraction scenarios.
 *
 * ⚠️  APP_SECRET should be moved to a build-time environment variable or a
 *     dedicated secrets manager (e.g. react-native-config + CI secrets) before
 *     shipping to production.
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

/**
 * App-level AES encryption key.
 * In production: inject via react-native-config / env vars at build time.
 */
const APP_SECRET = 'polar-h10-aes-key-v1-change-in-prod';

function encrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, APP_SECRET).toString();
}

function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, APP_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Fallback key prefix used when EncryptedStorage is unavailable (e.g. on some
 * simulators). Data is still AES-256 encrypted before being written to
 * AsyncStorage, so it is never stored as plaintext.
 */
const FALLBACK_PREFIX = 'secure_fallback_';

/**
 * Serialise + AES-encrypt, then store in the OS secure enclave.
 * Falls back to AsyncStorage (payload still AES-encrypted) if EncryptedStorage
 * is unavailable.
 */
export async function secureWrite<T>(key: string, value: T): Promise<void> {
  const json = JSON.stringify(value);
  const encrypted = encrypt(json);
  try {
    await EncryptedStorage.setItem(key, encrypted);
  } catch (e) {
    console.warn(
      '[secureStorage] EncryptedStorage unavailable, using AsyncStorage fallback:',
      e,
    );
    try {
      await AsyncStorage.setItem(FALLBACK_PREFIX + key, encrypted);
    } catch (e2) {
      // Both backends failed — auth state is still valid in memory.
      console.error('[secureStorage] AsyncStorage fallback also failed:', e2);
    }
  }
}

/**
 * Read from the OS secure enclave, AES-decrypt, and deserialise.
 * Falls back to AsyncStorage if EncryptedStorage is unavailable or empty.
 */
export async function secureRead<T>(key: string): Promise<T | null> {
  let ciphertext: string | null = null;
  try {
    ciphertext = await EncryptedStorage.getItem(key);
  } catch {
    // EncryptedStorage unavailable — try AsyncStorage fallback
  }
  if (!ciphertext) {
    ciphertext = await AsyncStorage.getItem(FALLBACK_PREFIX + key).catch(
      () => null,
    );
  }
  if (!ciphertext) return null;
  const json = decrypt(ciphertext);
  if (!json) return null;
  return JSON.parse(json) as T;
}

/** Remove an item from both storage backends. */
export async function secureRemove(key: string): Promise<void> {
  await Promise.allSettled([
    EncryptedStorage.removeItem(key),
    AsyncStorage.removeItem(FALLBACK_PREFIX + key),
  ]);
}

/**
 * All keys managed by SecureStorage.
 * Used by DevScreen to wipe encrypted data alongside AsyncStorage.
 */
// NOTE: 'sessions_history' and 'seeded_training_sessions' have been migrated
// to SQLite (DatabaseService) and are no longer stored in EncryptedStorage.
export const SECURE_STORAGE_KEYS = [
  'active_recording_session',
  '@device_history',
] as const;
