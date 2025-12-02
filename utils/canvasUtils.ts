import { PixelCrop } from '../types';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Consolidates the logic to generate the blob from a canvas.
 */
async function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/webp', 0.9);
  });
}

function dataURLToBlob(dataURL: string): Blob {
  const BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    const parts = dataURL.split(',');
    const contentType = parts[0].split(':')[1];
    const raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: contentType });
  }

  const parts = dataURL.split(BASE64_MARKER);
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}


/**
 * Logic to resize an image (as Data URL) to specific dimensions
 */
export async function resizeImage(
  base64Str: string,
  width: number,
  height: number,
  keepTransparency: boolean
): Promise<string> {
  const img = await createImage(base64Str);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  if (!keepTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/webp', 0.9);
}

/**
 * Main cropping function.
 * Returns the cropped image as a Data URL in WebP format.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop | null,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  keepTransparency = true
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx || !pixelCrop) {
    return '';
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw the source image onto the large canvas
  ctx.drawImage(image, 0, 0);

  // Get the data from the cropped area
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Create a new canvas for the final cropped output
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Reset context for the final canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Handle transparency setting for the background
  if (!keepTransparency) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Draw the cropped image data onto the final canvas
  ctx.putImageData(data, 0, 0);
  
  // If we filled white, we need to re-draw the image data on top? 
  // No, putImageData overwrites pixels completely (including alpha).
  // If we want to support "remove transparency" properly:
  // We should draw the image data onto a temp canvas, then draw THAT onto the white-filled canvas.
  
  if (!keepTransparency) {
    // Correct approach for flattening transparency:
    // 1. Create a temp canvas with the cropped data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelCrop.width;
    tempCanvas.height = pixelCrop.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.putImageData(data, 0, 0);
        
        // 2. Fill main canvas with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 3. Draw temp canvas over white
        ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  return canvas.toDataURL('image/webp', 0.9);
}
