const MAX_PHOTO_DIMENSION = 1280;
const TARGET_PHOTO_BYTES = 600 * 1024;
const MAX_OPTIMIZED_PHOTO_BYTES = 1024 * 1024;
const JPEG_QUALITIES = [0.82, 0.72, 0.62];
const DIMENSION_STEPS = [1280, 1120, 960, 800];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("사진을 읽을 수 없습니다."));
    };
    image.src = sourceUrl;
  });
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("사진을 변환할 수 없습니다."));
      },
      "image/jpeg",
      quality
    );
  });
}

function jpegFileName(name) {
  const baseName = name.replace(/\.[^.]+$/, "") || "photo";
  return `${baseName}.jpg`;
}

/**
 * 모바일 원본 사진을 AI 판정에 충분한 크기의 JPEG로 정규화합니다.
 * EXIF를 제거하고 긴 변을 1,280px 이하로 줄여 업로드와 모델 입력량을 제한합니다.
 */
export async function optimizePhotoUpload(file) {
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("사진 크기를 확인할 수 없습니다.");
  }

  let bestBlob = null;
  for (const dimension of DIMENSION_STEPS) {
    const maxDimension = Math.min(dimension, MAX_PHOTO_DIMENSION);
    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("사진 변환 기능을 사용할 수 없습니다.");
    }
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of JPEG_QUALITIES) {
      const blob = await canvasToJpeg(canvas, quality);
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= TARGET_PHOTO_BYTES) {
        return new File([blob], jpegFileName(file.name), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      }
    }
  }

  if (!bestBlob || bestBlob.size > MAX_OPTIMIZED_PHOTO_BYTES) {
    throw new Error("사진을 1MB 이하로 최적화할 수 없습니다.");
  }

  return new File([bestBlob], jpegFileName(file.name), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
