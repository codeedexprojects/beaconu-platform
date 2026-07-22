export interface CropPixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getCroppedImageFile(
  imageSrc: string,
  cropArea: CropPixelArea,
  fileName: string,
  mimeType: string,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, 0.92),
  );
  if (!blob) throw new Error("Failed to crop image");

  // Use the blob's actual encoded type, not the requested one — canvas
  // silently falls back to image/png if the browser can't encode the
  // requested mimeType (e.g. incomplete WebP support in some browsers).
  return new File([blob], fileName, { type: blob.type || mimeType });
}
