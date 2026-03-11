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

import 'react-native-get-random-values';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

/**
 * Per-device AES encryption key.
 * Generated once using crypto.getRandomValues, then persisted in the OS
 * secure enclave (iOS Keychain / Android Keystore). Each device therefore
 * has a unique key that is never embedded in the app binary.
 */
const APP_SECRET_STORAGE_KEY = 'polar_app_secret_v1';

let _cachedSecret: string | null = null;

async function getAppSecret(): Promise<string> {
  if (_cachedSecret) return _cachedSecret;
  try {
    const stored = await EncryptedStorage.getItem(APP_SECRET_STORAGE_KEY);
    if (stored) {
      _cachedSecret = stored;
      return stored;
    }
  } catch {}

  // Generate a 256-bit random key via the react-native-get-random-values polyfill
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const secret = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  _cachedSecret = secret;
  try {
    await EncryptedStorage.setItem(APP_SECRET_STORAGE_KEY, secret);
  } catch {}
  return secret;
}

function encrypt(plaintext: string, secret: string): string {
  return CryptoJS.AES.encrypt(plaintext, secret).toString();
}

function decrypt(ciphertext: string, secret: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
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
  const secret = await getAppSecret();
  const encrypted = encrypt(json, secret);
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
  const secret = await getAppSecret();
  const json = decrypt(ciphertext, secret);
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
