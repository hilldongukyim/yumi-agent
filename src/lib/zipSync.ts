/**
 * Synchronous ZIP builder (STORE mode — no compression).
 * PNG files are already compressed, so STORE gives the same size with zero CPU cost.
 * Because this is fully synchronous, it runs within the browser's user-gesture
 * activation window, allowing a.click() to trigger a real download.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff];
}
function u32(n: number): number[] {
  return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
}

export function buildZipSync(files: { name: string; data: Uint8Array }[]): Blob {
  const enc = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const offsets: number[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const data = file.data;
    const crc = crc32(data);
    const size = data.length;

    // Local file header
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, // signature
      0x14, 0x00,              // version needed: 2.0
      0x00, 0x00,              // flags
      0x00, 0x00,              // compression: STORE
      0x00, 0x00, 0x00, 0x00, // mod time/date
      ...u32(crc),
      ...u32(size),            // compressed size
      ...u32(size),            // uncompressed size
      ...u16(nameBytes.length),
      0x00, 0x00,              // extra field length
    ]);

    offsets.push(offset);
    offset += localHeader.length + nameBytes.length + size;

    localParts.push(localHeader, nameBytes, data);

    // Central directory entry
    const cdEntry = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02, // signature
      0x14, 0x00,              // version made by
      0x14, 0x00,              // version needed
      0x00, 0x00,              // flags
      0x00, 0x00,              // compression: STORE
      0x00, 0x00, 0x00, 0x00, // mod time/date
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      0x00, 0x00,              // extra length
      0x00, 0x00,              // comment length
      0x00, 0x00,              // disk number start
      0x00, 0x00,              // internal attrs
      0x00, 0x00, 0x00, 0x00, // external attrs
      ...u32(offsets[offsets.length - 1]),
    ]);

    centralParts.push(cdEntry, nameBytes);
  }

  const cdOffset = offset;
  const cdSize = centralParts.reduce((s, p) => s + p.length, 0);

  // End of central directory record
  const eocd = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, // signature
    0x00, 0x00,              // disk number
    0x00, 0x00,              // start disk
    ...u16(files.length),
    ...u16(files.length),
    ...u32(cdSize),
    ...u32(cdOffset),
    0x00, 0x00,              // comment length
  ]);

  const allParts = [...localParts, ...centralParts, eocd];
  const totalSize = allParts.reduce((s, p) => s + p.length, 0);
  const combined = new Uint8Array(totalSize);
  let pos = 0;
  for (const p of allParts) { combined.set(p, pos); pos += p.length; }
  return new Blob([combined.buffer], { type: "application/zip" });
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
