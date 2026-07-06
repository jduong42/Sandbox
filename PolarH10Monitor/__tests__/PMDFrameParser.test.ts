import {
  buildStartAccCommand,
  buildStopAccCommand,
  parseControlAck,
  parseAccFrame,
  readSignedBits,
} from '../src/utils/PMDFrameParser';

describe('PMDFrameParser', () => {
  describe('buildStartAccCommand', () => {
    it('encodes start + ACC + sample_rate/resolution/range TLVs', () => {
      // 02 02 / 00 01 32 00 (50Hz) / 01 01 10 00 (16-bit) / 02 01 08 00 (8G)
      expect(Array.from(buildStartAccCommand())).toEqual([
        0x02, 0x02, 0x00, 0x01, 0x32, 0x00, 0x01, 0x01, 0x10, 0x00, 0x02, 0x01,
        0x08, 0x00,
      ]);
    });
  });

  describe('buildStopAccCommand', () => {
    it('encodes stop + ACC measurement type', () => {
      expect(Array.from(buildStopAccCommand())).toEqual([0x03, 0x02]);
    });
  });

  describe('parseControlAck', () => {
    it('decodes a success ack', () => {
      const bytes = new Uint8Array([0xf0, 0x02, 0x02, 0x00]);
      expect(parseControlAck(bytes)).toEqual({
        opCode: 0x02,
        measurementType: 0x02,
        errorCode: 0,
      });
    });

    it('decodes an error ack (e.g. already-in-state)', () => {
      const bytes = new Uint8Array([0xf0, 0x02, 0x02, 0x06]);
      expect(parseControlAck(bytes)?.errorCode).toBe(6);
    });

    it('returns null for a frame missing the 0xF0 response tag', () => {
      const bytes = new Uint8Array([0x00, 0x02, 0x02, 0x00]);
      expect(parseControlAck(bytes)).toBeNull();
    });

    it('returns null for a too-short frame', () => {
      expect(parseControlAck(new Uint8Array([0xf0, 0x02]))).toBeNull();
    });
  });

  describe('readSignedBits', () => {
    it('reads unsigned small values (top bit clear)', () => {
      // byte 0b00010000 -> reading 4 bits from bit offset 0 = 0001 = 1
      const bytes = new Uint8Array([0b00010000]);
      expect(readSignedBits(bytes, 0, 4)).toBe(1);
    });

    it('sign-extends negative values (top bit set)', () => {
      // byte 0b11110000 -> reading 4 bits from bit offset 0 = 1111 = -1 (4-bit two's complement)
      const bytes = new Uint8Array([0b11110000]);
      expect(readSignedBits(bytes, 0, 4)).toBe(-1);
    });

    it('reads MSB-first across a byte boundary', () => {
      // bits 4..11 span byte0's low nibble and byte1's high nibble
      const bytes = new Uint8Array([0b00000001, 0b00100000]);
      // bits: ...0001 0010... -> reading bits[4..11] = 00010010 = 18
      expect(readSignedBits(bytes, 4, 8)).toBe(18);
    });
  });

  describe('parseAccFrame — compressed frames', () => {
    // Hand-built frame per the guide's documented byte layout:
    //   byte 0        : measurement type = 0x02 (ACC)
    //   bytes 1..8    : timestamp = 12345 ns, LE
    //   byte 9        : frameType = 0x80 (compressed)
    //   bytes 10..15  : ref (x=1000, y=0, z=0), int16 LE
    //   byte 16       : delta_bits = 4
    //   bytes 17..19  : packed 4-bit deltas for 2 triplets:
    //                   (dx=1,dy=0,dz=-1), (dx=-1,dy=2,dz=1)
    //                   -> ref(1000,0,0) -> (1001,0,-1) -> (1000,2,0)
    const compressedFrame = new Uint8Array([
      0x02, // ACC
      0x39, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // timestamp = 12345
      0x80, // compressed
      0xe8, 0x03, // ref_x = 1000
      0x00, 0x00, // ref_y = 0
      0x00, 0x00, // ref_z = 0
      0x04, // delta_bits = 4
      0x10, 0xff, 0x21, // packed deltas (hand-verified against the algorithm)
    ]);

    it('decodes the reference sample plus each delta-derived sample', () => {
      const frame = parseAccFrame(compressedFrame);
      expect(frame).not.toBeNull();
      expect(frame!.timestampNs).toBe(12345n);
      expect(frame!.samples).toEqual([
        [1000, 0, 0],
        [1001, 0, -1],
        [1000, 2, 0],
      ]);
    });

    it('drops frames shorter than the 17-byte compressed header', () => {
      expect(parseAccFrame(compressedFrame.slice(0, 16))).toBeNull();
    });

    it('drops frames with an out-of-range delta_bits value', () => {
      const badBits = new Uint8Array(compressedFrame);
      badBits[16] = 0; // delta_bits = 0, outside 1..24
      expect(parseAccFrame(badBits)).toBeNull();

      const badBits2 = new Uint8Array(compressedFrame);
      badBits2[16] = 25; // outside 1..24
      expect(parseAccFrame(badBits2)).toBeNull();
    });

    it('ignores non-ACC measurement types', () => {
      const ecgFrame = new Uint8Array(compressedFrame);
      ecgFrame[0] = 0x00; // ECG
      expect(parseAccFrame(ecgFrame)).toBeNull();
    });
  });

  describe('parseAccFrame — raw (uncompressed) frames', () => {
    it('decodes plain int16 triplets with no delta packing', () => {
      const rawFrame = new Uint8Array([
        0x02, // ACC
        0x39, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // timestamp = 12345
        0x00, // raw (bit 7 clear)
        0xd0, 0x07, // 2000
        0x0c, 0xfe, // -500
        0x64, 0x00, // 100
        0x64, 0x00, // 100
        0xc8, 0x00, // 200
        0x2c, 0x01, // 300
      ]);

      const frame = parseAccFrame(rawFrame);
      expect(frame).not.toBeNull();
      expect(frame!.samples).toEqual([
        [2000, -500, 100],
        [100, 200, 300],
      ]);
    });
  });
});
