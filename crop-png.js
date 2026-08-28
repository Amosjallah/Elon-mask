const fs = require('fs');
const zlib = require('zlib');

// Standard CRC32 table & function for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

const inputPath = 'C:/Users/AMOS/.gemini/antigravity-ide/brain/5eb40adf-2d16-4a1c-8faf-899f1d371c60/crop_canvas_final_1787689880979.png';
const srcBuf = fs.readFileSync(inputPath);

// Parse IHDR
const origWidth = srcBuf.readUInt32BE(16);
const origHeight = srcBuf.readUInt32BE(20);
console.log('Original dimensions:', origWidth, 'x', origHeight);

// Collect IDAT chunks
const idatChunks = [];
let offset = 8;
while (offset < srcBuf.length) {
  const len = srcBuf.readUInt32BE(offset);
  const type = srcBuf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') {
    idatChunks.push(srcBuf.slice(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

const newWidth = 956;
const newHeight = 159;
const origRowLen = 1 + origWidth * 4;
const newRowLen = 1 + newWidth * 4;

const newRawRows = [];
for (let r = 0; r < newHeight; r++) {
  const origRowStart = r * origRowLen;
  const filterByte = decompressed[origRowStart];
  const pixelData = decompressed.slice(origRowStart + 1, origRowStart + 1 + newWidth * 4);
  const newRow = Buffer.alloc(newRowLen);
  newRow[0] = filterByte;
  pixelData.copy(newRow, 1);
  newRawRows.push(newRow);
}

const newDecompressed = Buffer.concat(newRawRows);
const newCompressed = zlib.deflateSync(newDecompressed);

// Build IHDR chunk
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(newWidth, 0);
ihdrData.writeUInt32BE(newHeight, 4);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // RGBA
ihdrData[10] = 0; // compression
ihdrData[11] = 0; // filter
ihdrData[12] = 0; // interlace

const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdrChunk = makeChunk('IHDR', ihdrData);
const idatChunk = makeChunk('IDAT', newCompressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
fs.writeFileSync('c:/Users/AMOS/Desktop/BENSON/header-bg.png', finalPng);
console.log('CROP COMPLETE! header-bg.png saved with dimensions:', newWidth, 'x', newHeight);
