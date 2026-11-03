import { Image, type ImageSource } from 'expo-image';
import { View } from 'react-native';

/** The collage is laid out once on this size, then scaled to fit the room the phone has. */
export const ARTWORK_WIDTH = 412;
export const ARTWORK_HEIGHT = 454;

export type ArtworkImage = { source: ImageSource; x: number; y: number; width: number; height: number };

type OnboardingArtworkProps = {
  images: readonly ArtworkImage[];
  /** How much to shrink or grow the 412 x 454 artwork. */
  scale: number;
};

/**
 * A small collage of overlapping app screenshots for an onboarding slide. The positions are part of the
 * picture, not of the page layout, so they are placed on the artwork's own size. Decorative, so hidden from
 * screen readers.
 */
export function OnboardingArtwork({ images, scale }: OnboardingArtworkProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: ARTWORK_WIDTH * scale, height: ARTWORK_HEIGHT * scale }}
    >
      {images.map((image, index) => (
        <Image
          key={index}
          source={image.source}
          contentFit="contain"
          style={{
            position: 'absolute',
            left: image.x * scale,
            top: image.y * scale,
            width: image.width * scale,
            height: image.height * scale,
          }}
        />
      ))}
    </View>
  );
}
