import { Image } from 'expo-image';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

const wordmark = require('@/assets/images/splash/wordmark.svg');

// The wordmark SVG's own size (Figma 2003:378). Its letters have no descenders, so the bottom edge of the
// image is the wordmark's baseline.
const WORDMARK_ASPECT = 1530.38 / 231;
const BRAND = 'MPowered';

// Style keys that place the block; everything else styles the words.
const LAYOUT_KEYS = new Set<string>([
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
  'marginStart', 'marginEnd', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'paddingHorizontal', 'paddingVertical', 'paddingStart', 'paddingEnd', 'width', 'maxWidth', 'minWidth',
  'alignSelf', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
] satisfies (keyof ViewStyle)[]);

const JUSTIFY: Record<string, ViewStyle['justifyContent']> = {
  center: 'center',
  right: 'flex-end',
};

type BrandTextProps = Omit<TextProps, 'children'> & {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Text in which every "MPowered" is drawn as the wordmark, tinted the text's own colour and sized to the
 * text, following the phone's text size. The words wrap like a sentence and every word, wordmark included,
 * sits on the same baseline. Screen readers hear the whole sentence as one, "MPowered" included.
 */
export function BrandText({ children, style, accessibilityRole, ...props }: BrandTextProps) {
  const { fontScale } = useWindowDimensions();
  const flat = StyleSheet.flatten(style) ?? {};
  if (!children.includes(BRAND)) {
    return (
      <Text style={style} accessibilityRole={accessibilityRole} {...props}>
        {children}
      </Text>
    );
  }

  const layout: Record<string, unknown> = {};
  const text: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) (LAYOUT_KEYS.has(key) ? layout : text)[key] = value;
  const fontSize = flat.fontSize ?? 14;
  // The wordmark's cap height sits close to the letters' height at about the font size.
  const height = fontSize * 0.95 * (props.allowFontScaling === false ? 1 : fontScale);

  // Each word is its own piece so the row can wrap between words; a word keeps its trailing space.
  const pieces = children
    .split(BRAND)
    .flatMap((part, index, parts) => [
      ...(part.match(/\S*\s+|\S+$/g) ?? []).map((word) => ({ word })),
      ...(index < parts.length - 1 ? [{ word: null }] : []),
    ]);

  return (
    <View
      accessible
      accessibilityRole={accessibilityRole ?? 'text'}
      accessibilityLabel={children}
      style={[styles.row, { justifyContent: JUSTIFY[flat.textAlign ?? ''] ?? 'flex-start' }, layout]}>
      {pieces.map((piece, index) =>
        piece.word === null ? (
          <Image
            key={index}
            source={wordmark}
            style={{ width: height * WORDMARK_ASPECT, height }}
            contentFit="contain"
            tintColor={typeof flat.color === 'string' ? flat.color : undefined}
            accessible={false}
          />
        ) : (
          <Text key={index} style={text as TextStyle} {...props}>
            {piece.word}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Baseline alignment puts each word on its font baseline and the wordmark's bottom edge on the same line.
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
});
