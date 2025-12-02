export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Logic to resize an image (as Data URL) to specific dimensions.
 * The background color logic is handled upstream by the cropper.
 * This function preserves whatever background (transparent or colored) is in the source image.
 */
export async function resizeImage(
  base64Str: string,
  width: number,
  height: number
): Promise<string> {
  const img = await createImage(base64Str);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/webp', 0.9);
}

/**
 * Removes a specific color from an image with a given tolerance.
 * Returns a new Data URL (PNG) with transparency.
 */
export async function removeColorFromImage(
  base64Str: string,
  targetColor: { r: number; g: number; b: number } | null,
  tolerance: number // 1-10
): Promise<string> {
  // If no color selected, return original
  if (!targetColor) return base64Str;

  const img = await createImage(base64Str);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return base64Str;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const { r: tr, g: tg, b: tb } = targetColor;
  
  // Calculate threshold based on level 1-10.
  // Max Euclidean distance for RGB is sqrt(255^2 * 3) ≈ 441.
  // Level 1: very strict (approx distance 15)
  // Level 10: very loose (approx distance 150)
  const threshold = tolerance * 15; 

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // alpha is data[i+3]

    // Calculate color distance
    const dist = Math.sqrt(
      (r - tr) ** 2 +
      (g - tg) ** 2 +
      (b - tb) ** 2
    );

    if (dist <= threshold) {
      data[i + 3] = 0; // Set alpha to 0 (Transparent)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  // Return as PNG to preserve alpha channel before final WebP conversion
  return canvas.toDataURL('image/png');
}