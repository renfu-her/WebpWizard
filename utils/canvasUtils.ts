export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

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
