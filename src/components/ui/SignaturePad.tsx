import { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  strokeToPathData,
  type Point,
  type SignatureData,
} from '@/features/care-planner/signature';

type SignaturePadProps = {
  /** The strokes drawn so far. Null when empty. */
  value: SignatureData | null;
  onChange: (value: SignatureData | null) => void;
  /** Called when a finger goes down / comes up, so the parent can lock and unlock scrolling. */
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  disabled?: boolean;
  /** Height of the drawing surface in dp. Generous by default for people with limited dexterity. */
  height?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  clearLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const STROKE_WIDTH = 2.5;

/**
 * A box for drawing a signature with a finger or stylus.
 *
 * Touches use React Native's responder system directly. Returning `true` from the grant handler
 * blocks the native parent (an Android/iOS scroll view) from taking the touch, and the termination
 * request is refused, so a stroke is never turned into a scroll. Parents should also set
 * `scrollEnabled={false}` between `onDrawStart` and `onDrawEnd`.
 */
export function SignaturePad({
  value,
  onChange,
  onDrawStart,
  onDrawEnd,
  disabled = false,
  height = 200,
  accessibilityLabel = 'Signature box',
  accessibilityHint = 'Draw your signature with a finger or stylus',
  clearLabel = 'Clear',
  style,
}: SignaturePadProps) {
  const [size, setSize] = useState({ width: 0, height });
  const [currentPath, setCurrentPath] = useState('');
  const points = useRef<Point[]>([]);
  const drawing = useRef(false);

  const finishStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const path = strokeToPathData(points.current);
    // Before the first layout the width is unknown; fall back to the stroke's own extent.
    const width = size.width > 0 ? size.width : Math.ceil(Math.max(1, ...points.current.map((p) => p.x)));
    points.current = [];
    setCurrentPath('');
    if (path) {
      onChange({
        w: width,
        h: size.height,
        paths: [...(value?.paths ?? []), path],
      });
    }
    onDrawEnd?.();
  };

  const addPoint = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    points.current.push({ x: locationX, y: locationY });
    setCurrentPath(strokeToPathData(points.current));
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height: measured } = event.nativeEvent.layout;
    setSize({ width, height: measured });
  };

  const hasStrokes = (value?.paths.length ?? 0) > 0;

  return (
    <View style={style}>
      <View
        testID="signature-pad"
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(event) => {
          drawing.current = true;
          points.current = [];
          onDrawStart?.();
          addPoint(event);
          // true: block the native parent from taking over the touch
          return true;
        }}
        onResponderMove={(event) => {
          if (drawing.current) addPoint(event);
        }}
        onResponderRelease={finishStroke}
        onResponderTerminate={finishStroke}
        style={[styles.surface, { height }, disabled && styles.surfaceDisabled]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            {value?.paths.map((path, index) => (
              <Path key={index} d={path} {...strokeProps} />
            ))}
            {currentPath ? <Path d={currentPath} {...strokeProps} /> : null}
          </Svg>
        </View>
      </View>

      <Button
        label={clearLabel}
        accessibilityLabel="Clear signature"
        variant="tonal"
        disabled={disabled || !hasStrokes}
        onPress={() => onChange(null)}
        style={styles.clear}
      />
    </View>
  );
}

const strokeProps = {
  stroke: Colors.light.onSurface,
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.control / 2,
    backgroundColor: Colors.light.backgroundElement,
    overflow: 'hidden',
  },
  surfaceDisabled: {
    opacity: 0.6,
  },
  clear: {
    alignSelf: 'flex-end',
    marginTop: Spacing.two,
  },
});
