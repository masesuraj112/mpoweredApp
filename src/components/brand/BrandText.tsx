import { Image } from 'expo-image';
import { Fragment } from 'react';
import { StyleSheet, Text, useWindowDimensions, type StyleProp, type TextProps, type TextStyle } from 'react-native';

const wordmark = require('@/assets/images/splash/wordmark.svg');

// The wordmark SVG's own size (Figma 2003:378).
const WORDMARK_ASPECT = 1530.38 / 231;
const BRAND = 'MPowered';

type BrandTextProps = Omit<TextProps, 'children'> & {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Text in which every "MPowered" is drawn as the wordmark, tinted the text's own colour and sized to the
 * text, following the phone's text size. Screen readers still hear the whole sentence, "MPowered" included.
 */
export function BrandText({ children, style, ...props }: BrandTextProps) {
  const { fontScale } = useWindowDimensions();
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = flat.fontSize ?? 14;
  // The wordmark's cap height sits close to the letters' height at about the font size.
  const height = fontSize * 0.95 * (props.allowFontScaling === false ? 1 : fontScale);
  const parts = children.split(BRAND);

  return (
    <Text style={style} accessibilityLabel={children} {...props}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <Image
              source={wordmark}
              style={{ width: height * WORDMARK_ASPECT, height }}
              contentFit="contain"
              tintColor={typeof flat.color === 'string' ? flat.color : undefined}
              accessible={false}
            />
          ) : null}
        </Fragment>
      ))}
    </Text>
  );
}
