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