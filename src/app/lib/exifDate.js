// JPEG 파일의 EXIF 메타데이터에서 촬영 시각(DateTimeOriginal)을 읽어옵니다.
// 표준 EXIF(JPEG APP1) 세그먼트만 지원하는 최소 구현입니다. HEIC 등 다른 포맷이거나
// EXIF 정보가 없는 이미지는 null을 반환하며, 이 경우 호출부에서 "확인 불가"로 안전하게 처리해야 합니다.

const APP1_MARKER = 0xffe1;
const EXIF_IFD_POINTER_TAG = 0x8769;
const DATE_TIME_ORIGINAL_TAG = 0x9003;
const DATE_TIME_TAG = 0x0132;
const ASCII_TYPE = 2;

function findTiffStart(view) {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return null; // JPEG(SOI)로 시작하지 않으면 이 파서로는 처리할 수 없는 포맷입니다.
  }

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) break;
    if (marker === 0xffda) break; // SOS(스캔 시작) 이후에는 메타데이터 세그먼트가 없습니다.

    const segmentLength = view.getUint16(offset + 2);
    if (marker === APP1_MARKER) {
      const payloadStart = offset + 4;
      const header = String.fromCharCode(
        view.getUint8(payloadStart),
        view.getUint8(payloadStart + 1),
        view.getUint8(payloadStart + 2),
        view.getUint8(payloadStart + 3)
      );
      if (header === "Exif") {
        return payloadStart + 6; // "Exif\0\0" 뒤에서 TIFF 헤더가 시작됩니다.
      }
    }
    offset += 2 + segmentLength;
  }
  return null;
}

function readIfdEntries(view, tiffStart, ifdOffset, littleEndian) {
  const entryCount = view.getUint16(tiffStart + ifdOffset, littleEndian);
  const entries = [];
  for (let i = 0; i < entryCount; i += 1) {
    const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
    entries.push({
      tag: view.getUint16(entryOffset, littleEndian),
      type: view.getUint16(entryOffset + 2, littleEndian),
      count: view.getUint32(entryOffset + 4, littleEndian),
      valueFieldOffset: entryOffset + 8,
    });
  }
  return entries;
}

function readAsciiEntry(view, tiffStart, littleEndian, entry) {
  if (!entry || entry.type !== ASCII_TYPE) return null;

  const byteLength = entry.count;
  const isInline = byteLength <= 4;
  const start = isInline
    ? entry.valueFieldOffset
    : tiffStart + view.getUint32(entry.valueFieldOffset, littleEndian);

  let text = "";
  for (let i = 0; i < byteLength; i += 1) {
    const code = view.getUint8(start + i);
    if (code === 0) break;
    text += String.fromCharCode(code);
  }
  return text;
}

function parseExifDateText(text) {
  const matched = text?.trim().match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!matched) return null;

  const [, year, month, day, hour, minute, second] = matched.map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * JPEG 파일의 EXIF DateTimeOriginal(없으면 DateTime)을 읽어 Date로 반환합니다.
 * EXIF가 없거나 파싱에 실패하면 null을 반환합니다.
 * @param {File} file
 * @returns {Promise<Date|null>}
 */
export async function readJpegCapturedAt(file) {
  if (!file || !file.type?.includes("jpeg")) {
    return null;
  }

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const tiffStart = findTiffStart(view);
    if (tiffStart === null) return null;

    const byteOrderMark = view.getUint16(tiffStart);
    const littleEndian = byteOrderMark === 0x4949;
    if (!littleEndian && byteOrderMark !== 0x4d4d) return null;

    const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
    const ifd0Entries = readIfdEntries(view, tiffStart, firstIfdOffset, littleEndian);

    const exifIfdEntry = ifd0Entries.find((entry) => entry.tag === EXIF_IFD_POINTER_TAG);
    if (exifIfdEntry) {
      const exifIfdOffset = view.getUint32(exifIfdEntry.valueFieldOffset, littleEndian);
      const exifEntries = readIfdEntries(view, tiffStart, exifIfdOffset, littleEndian);
      const dateTimeOriginal = exifEntries.find((entry) => entry.tag === DATE_TIME_ORIGINAL_TAG);
      const parsed = parseExifDateText(readAsciiEntry(view, tiffStart, littleEndian, dateTimeOriginal));
      if (parsed) return parsed;
    }

    const dateTimeEntry = ifd0Entries.find((entry) => entry.tag === DATE_TIME_TAG);
    return parseExifDateText(readAsciiEntry(view, tiffStart, littleEndian, dateTimeEntry));
  } catch {
    return null; // 손상되었거나 예상치 못한 형식의 파일은 안전하게 "확인 불가"로 처리합니다.
  }
}

/** 두 Date가 로컬 기준으로 같은 날짜인지 비교합니다. */
export function isSameLocalDate(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}
