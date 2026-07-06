/**
 * PMDFrameParser.fuzz.test.ts
 *
 * Round-trip test: encode random valid compressed-ACC frames with an
 * independent encoder (the inverse of parseAccFrame's decode algorithm),
 * then assert the real decoder reproduces the exact samples.
 *
 * Important limitation (read before trusting this too much): this only
 * proves the decoder is the correct inverse of *our own* encoder — i.e.
 * internal consistency of our shared understanding of the format. It
 * cannot detect a case where that shared understanding is itself wrong
 * versus the real Polar H10 firmware, since the encoder and decoder here
 * are built from the same spec (polar-h10-guide.md). Closing that gap
 * requires real captured bytes from the device (see SensorCaptureLogger).
 *
 * Uses a seeded PRNG so failures are reproducible, not flaky.
 *
 * delta_bits is restricted to the guide's documented realistic range
 * (typ. 4-12 bits) rather than the full 1-24 the decoder accepts. Below
 * ~3 bits, the wire format itself is genuinely ambiguous: with delta_bits
 * this small, trailing zero-padding (up to 7 bits, from rounding up to a
 * byte) can exactly match a full all-zero delta triplet (3 * delta_bits
 * bits), and no decoder logic can tell "one more real sample" apart from
 * "padding" using the bytes alone — see the comment on
 * parseCompressedAccFrame in PMDFrameParser.ts. That's a property of the
 * protocol, not a bug this test should chase; it's exactly the kind of
 * thing that can only be settled by real captured hardware bytes.
 */

import { parseAccFrame } from '../src/utils/PMDFrameParser';

// mulberry32 — tiny deterministic PRNG, fixed seed for reproducible fuzzing.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xc0ffee);
const randInt = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

function writeSignedBits(bits: number[], value: number, width: number): void {
  const twosComplement = value < 0 ? value + (1 << width) : value;
  for (let i = width - 1; i >= 0; i--) {
    bits.push((twosComplement >> i) & 1);
  }
}

function packBits(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((bit, i) => {
    if (bit) bytes[i >> 3] |= 1 << (7 - (i & 7));
  });
  return bytes;
}

/** Inverse of parseAccFrame's compressed-frame decode algorithm. */
function encodeCompressedAccFrame(
  timestampNs: bigint,
  refSample: [number, number, number],
  deltaTriplets: [number, number, number][],
  deltaBits: number,
): Uint8Array {
  const header = new Uint8Array(17);
  header[0] = 0x02; // ACC
  for (let i = 0; i < 8; i++) {
    header[1 + i] = Number((timestampNs >> BigInt(8 * i)) & 0xffn);
  }
  header[9] = 0x80; // compressed
  const view = new DataView(header.buffer);
  view.setInt16(10, refSample[0], true);
  view.setInt16(12, refSample[1], true);
  view.setInt16(14, refSample[2], true);
  header[16] = deltaBits;

  const bits: number[] = [];
  for (const [dx, dy, dz] of deltaTriplets) {
    writeSignedBits(bits, dx, deltaBits);
    writeSignedBits(bits, dy, deltaBits);
    writeSignedBits(bits, dz, deltaBits);
  }
  const packed = packBits(bits);

  const result = new Uint8Array(header.length + packed.length);
  result.set(header, 0);
  result.set(packed, header.length);
  return result;
}

describe('PMDFrameParser — compressed ACC round-trip fuzzing', () => {
  const TRIALS = 300;

  it(`decodes ${TRIALS} randomly generated valid frames back to their exact input samples`, () => {
    for (let trial = 0; trial < TRIALS; trial++) {
      const deltaBits = randInt(4, 12); // guide's documented realistic range
      const deltaRange = 1 << (deltaBits - 1); // max magnitude for this width
      const tripletCount = randInt(0, 8);
      const timestampNs = BigInt(randInt(0, 1_000_000)) * 1_000_000n;

      const refSample: [number, number, number] = [
        randInt(-2000, 2000),
        randInt(-2000, 2000),
        randInt(-2000, 2000),
      ];

      const deltaTriplets: [number, number, number][] = Array.from(
        { length: tripletCount },
        () => [
          randInt(-deltaRange, deltaRange - 1),
          randInt(-deltaRange, deltaRange - 1),
          randInt(-deltaRange, deltaRange - 1),
        ],
      );

      const expectedSamples: [number, number, number][] = [refSample];
      let [x, y, z] = refSample;
      for (const [dx, dy, dz] of deltaTriplets) {
        x += dx;
        y += dy;
        z += dz;
        expectedSamples.push([x, y, z]);
      }

      const encoded = encodeCompressedAccFrame(
        timestampNs,
        refSample,
        deltaTriplets,
        deltaBits,
      );

      const decoded = parseAccFrame(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded!.timestampNs).toBe(timestampNs);
      expect(decoded!.samples).toEqual(expectedSamples);
    }
  });
});
