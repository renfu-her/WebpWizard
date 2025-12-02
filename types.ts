export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface GeneratedImages {
  original: string;
  small: string;
  large: string;
  originalSize: { width: number; height: number };
  smallSize: { width: number; height: number };
  largeSize: { width: number; height: number };
}

export type AspectRatioValue = number | 'free';

export interface AspectRatioOption {
  label: string;
  value: AspectRatioValue;
}
