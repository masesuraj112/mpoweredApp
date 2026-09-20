// utils/scale.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Matches the Figma artboard ("Worst pain-9" frame): 412 x 823
const BASE_WIDTH = 412;
const BASE_HEIGHT = 823;

export function scaleWidth(size: number): number {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function scaleHeight(size: number): number {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
}

export function scaleFont(size: number, factor: number = 0.5): number {
  const scaled = size + (scaleWidth(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}