// Generates The Little Circle face icons (peach circle with two eyes)
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xedb88320;
      else crc >>>= 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

// Draw a filled circle into a pixel buffer
function fillCircle(pixels, width, cx, cy, r, R, G, B, A) {
  for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(width - 1, Math.ceil(cy + r)); y++) {
    for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(width - 1, Math.ceil(cx + r)); x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) {
        const idx = (y * width + x) * 4;
        // Alpha blend over existing pixel
        const a = A / 255;
        pixels[idx]     = Math.round(R * a + pixels[idx]     * (1 - a));
        pixels[idx + 1] = Math.round(G * a + pixels[idx + 1] * (1 - a));
        pixels[idx + 2] = Math.round(B * a + pixels[idx + 2] * (1 - a));
        pixels[idx + 3] = Math.min(255, pixels[idx + 3] + Math.round(A * (1 - pixels[idx + 3] / 255)));
      }
    }
  }
}

function makeFacePNG(size) {
  const pixels = new Uint8Array(size * size * 4); // RGBA, all transparent

  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const bodyR = size / 2 - 0.5;

  // Body: peach gradient approximated as flat #ffd4c4
  fillCircle(pixels, size, cx, cy, bodyR, 255, 212, 196, 255);

  // Eyes: white circles
  const eyeR = size * 0.13;
  const eyeOffX = size * 0.175;
  const eyeOffY = size * 0.04;
  const eyeLX = cx - eyeOffX;
  const eyeRX = cx + eyeOffX;
  const eyeY  = cy - eyeOffY;
  fillCircle(pixels, size, eyeLX, eyeY, eyeR, 255, 255, 255, 255);
  fillCircle(pixels, size, eyeRX, eyeY, eyeR, 255, 255, 255, 255);

  // Pupils: dark circles
  const pupilR = eyeR * 0.55;
  const pupilOffY = eyeR * 0.1;
  fillCircle(pixels, size, eyeLX, eyeY + pupilOffY, pupilR, 44, 44, 44, 255);
  fillCircle(pixels, size, eyeRX, eyeY + pupilOffY, pupilR, 44, 44, 44, 255);

  // Shine in pupils
  const shineR = pupilR * 0.35;
  fillCircle(pixels, size, eyeLX - pupilR * 0.2, eyeY + pupilOffY - pupilR * 0.2, shineR, 255, 255, 255, 200);
  fillCircle(pixels, size, eyeRX - pupilR * 0.2, eyeY + pupilOffY - pupilR * 0.2, shineR, 255, 255, 255, 200);

  // Build scanlines
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = 1 + x * 4;
      row[dst]     = pixels[src];
      row[dst + 1] = pixels[src + 1];
      row[dst + 2] = pixels[src + 2];
      row[dst + 3] = pixels[src + 3];
    }
    rows.push(row);
  }

  const compressed = zlib.deflateSync(Buffer.concat(rows));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const dir of ["icons", path.join("dist", "icons")]) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const size of [16, 48, 128]) {
  const png = makeFacePNG(size);
  fs.writeFileSync(`icons/icon${size}.png`, png);
  fs.writeFileSync(path.join("dist", "icons", `icon${size}.png`), png);
  console.log(`icons/icon${size}.png (${size}x${size}) ✓`);
}
console.log("Done.");
