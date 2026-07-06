/**
 * PMDFrameParser.ts
 *
 * Pure, BLE-free decoder/encoder for the Polar PMD (Measurement Data)
 * protocol — ACC streaming only (ECG start/decode is out of scope, see
 * the PMD plan doc). Protocol details are taken from polar-h10-guide.md,
 * itself derived from reverse-engineered bring-up against real H10
 * hardware rather than Polar's official SDK docs.
 *
 * No react-native-ble-plx dependency — takes/returns plain typed arrays,
 * so every function here is unit-testable without mocking BLE.
 */

import { Buffer } from 'buffer';
import {
  PMD_OPCODE,
  PMD_MEASUREMENT_TYPE,
  PMD_ACC_SETTINGS,
} from '../constants/ble';

// ─── Base64 helpers (react-native-ble-plx requires base64 in/out) ────────────

export function decodeBase64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export function encodeBytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

// ─── Command builders ─────────────────────────────────────────────────────────

/**
 * ACC start command: start opcode + measurement type, then TLV settings
 * (sample_rate, resolution, range). Each TLV is type(1) length-in-words(1)
 * value(2 bytes LE). Do NOT add a CHANNELS TLV — ACC is implicitly 3-channel
 * and an explicit CHANNELS setting returns PMD error 5 (invalid parameter).
 */
export function buildStartAccCommand(): Uint8Array {
  const rate = PMD_ACC_SETTINGS.SAMPLE_RATE_HZ;
  const resolution = PMD_ACC_SETTINGS.RESOLUTION_BITS;
  const range = PMD_ACC_SETTINGS.RANGE_G;
  return new Uint8Array([
    PMD_OPCODE.REQUEST_MEASUREMENT_START,
    PMD_MEASUREMENT_TYPE.ACC,
    0x00, 0x01, rate & 0xff, (rate >> 8) & 0xff,
    0x01, 0x01, resolution & 0xff, (resolution >> 8) & 0xff,
    0x02, 0x01, range & 0xff, (range >> 8) & 0xff,
  ]);
}

export function buildStopAccCommand(): Uint8Array {
  return new Uint8Array([
    PMD_OPCODE.REQUEST_MEASUREMENT_STOP,
    PMD_MEASUREMENT_TYPE.ACC,
  ]);
}

// ─── Control (indicate) response ──────────────────────────────────────────────

export interface PMDControlAck {
  opCode: number;
  measurementType: number;
  errorCode: number;
}

const CONTROL_RESPONSE_TAG = 0xf0;

/** Decodes the `[0xF0, opCode, measurementType, errorCode, ...]` control envelope. */
export function parseControlAck(bytes: Uint8Array): PMDControlAck | null {
  if (bytes.length < 4 || bytes[0] !== CONTROL_RESPONSE_TAG) return null;
  return {
    opCode: bytes[1] as number,
    measurementType: bytes[2] as number,
    errorCode: bytes[3] as number,
  };
}

// ─── Data (notify) frames ──────────────────────────────────────────────────────

export interface PMDAccFrame {
  /** Nanoseconds since the Polar epoch (2000-01-01T00:00:00Z), strap clock. */
  timestampNs: bigint;
  /** Decoded (x, y, z) triplets in device units (mG at 8G range / 16-bit). */
  samples: [number, number, number][];
}

const COMMON_HEADER_BYTES = 10; // type(1) + timestamp(8) + frameType(1)
const COMPRESSED_HEADER_BYTES = 17; // common(10) + ref x/y/z (6) + delta_bits(1)
const RAW_BYTES_PER_SAMPLE = 6; // 3 x int16 LE

interface FrameHeader {
  measurementType: number;
  timestampNs: bigint;
  isCompressed: boolean;
}

function parseFrameHeader(bytes: Uint8Array): FrameHeader | null {
  if (bytes.length < COMMON_HEADER_BYTES) return null;

  let timestampNs = 0n;
  for (let i = 0; i < 8; i++) {
    timestampNs |= BigInt(bytes[1 + i] as number) << BigInt(8 * i);
  }

  const frameType = bytes[9] as number;
  return {
    measurementType: bytes[0] as number,
    timestampNs,
    isCompressed: (frameType & 0x80) !== 0,
  };
}

/** MSB-first bit reader with two's-complement sign-extension. */
export function readSignedBits(
  bytes: Uint8Array,
  bitOffset: number,
  width: number,
): number {
  let value = 0;
  for (let i = 0; i < width; i++) {
    const bitIndex = bitOffset + i;
    const byteIndex = bitIndex >> 3;
    const bitInByte = 7 - (bitIndex & 7);
    const bit = ((bytes[byteIndex] as number) >> bitInByte) & 1;
    value = (value << 1) | bit;
  }
  if (value & (1 << (width - 1))) {
    value -= 1 << width;
  }
  return value;
}

/**
 * Known wire-format ambiguity (not a decoder bug): trailing padding from
 * rounding the packed deltas up to a whole byte is at most 7 bits. If
 * `delta_bits < 3`, an all-zero padding tail can be exactly `3 * delta_bits`
 * bits wide — indistinguishable, from the bytes alone, from one more real
 * all-zero delta triplet. No local decoding rule can resolve this; it would
 * require an externally-known expected sample count (e.g. from the
 * configured sample rate) to bound decoding instead of reading until bits
 * run out. Per the guide, real delta_bits values are typically 4-12, where
 * 3 * delta_bits (>= 12) always exceeds the max 7 bits of padding, so this
 * is believed not to bite in practice — but that's an assumption pending
 * real hardware confirmation (see SensorCaptureLogger), not a guarantee.
 */
function parseCompressedAccFrame(
  bytes: Uint8Array,
  header: FrameHeader,
): PMDAccFrame | null {
  if (bytes.length < COMPRESSED_HEADER_BYTES) return null; // malformed — drop

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let x = view.getInt16(10, true);
  let y = view.getInt16(12, true);
  let z = view.getInt16(14, true);
  const deltaBits = bytes[16] as number;

  if (deltaBits < 1 || deltaBits > 24) return null; // bad frame — drop

  const samples: [number, number, number][] = [[x, y, z]];
  const totalBits = bytes.length * 8;
  let bitCursor = COMPRESSED_HEADER_BYTES * 8;
  let channel = 0; // 0 = x, 1 = y, 2 = z — rotates strictly in this order

  while (bitCursor + deltaBits <= totalBits) {
    const delta = readSignedBits(bytes, bitCursor, deltaBits);
    bitCursor += deltaBits;

    if (channel === 0) {
      x += delta;
    } else if (channel === 1) {
      y += delta;
    } else {
      z += delta;
      samples.push([x, y, z]); // emit only after the Z delta lands
    }
    channel = (channel + 1) % 3;
  }
  // Trailing bits that don't fill a full delta are padding — intentionally
  // not parsed as a partial sample (loop condition already excludes them).

  return { timestampNs: header.timestampNs, samples };
}

function parseRawAccFrame(
  bytes: Uint8Array,
  header: FrameHeader,
): PMDAccFrame | null {
  if (bytes.length < COMMON_HEADER_BYTES + RAW_BYTES_PER_SAMPLE) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples: [number, number, number][] = [];
  let offset = COMMON_HEADER_BYTES;
  while (offset + RAW_BYTES_PER_SAMPLE <= bytes.length) {
    samples.push([
      view.getInt16(offset, true),
      view.getInt16(offset + 2, true),
      view.getInt16(offset + 4, true),
    ]);
    offset += RAW_BYTES_PER_SAMPLE;
  }
  return { timestampNs: header.timestampNs, samples };
}

/**
 * Decodes one PMD data notification into an ACC frame. Returns null for
 * malformed frames (too short, bad delta width) or frames that aren't ACC —
 * callers should treat null as "drop this notification", not an error.
 */
export function parseAccFrame(bytes: Uint8Array): PMDAccFrame | null {
  const header = parseFrameHeader(bytes);
  if (!header || header.measurementType !== PMD_MEASUREMENT_TYPE.ACC) {
    return null;
  }
  return header.isCompressed
    ? parseCompressedAccFrame(bytes, header)
    : parseRawAccFrame(bytes, header);
}
