import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Colors, Typography } from '@/constants/theme';

export interface PainTrendPoint {
  /** Short label shown under the point, e.g. "25/05" */
  label: string;
  /** Pain level on the standard 0-10 scale */
  value: number;
}

type PainTrendChartProps = {
  data: PainTrendPoint[];
  height?: number;
};

const PAIN_SCALE_MAX = 10;
// Keeps the edge dots and their centred date labels inside the SVG.
const HORIZONTAL_INSET = 20;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 16;
const VALUE_LABEL_OFFSET = 8;
const DATE_LABEL_OFFSET = 4;

/** A small line chart of recent pain scores, oldest on the left. The first and last scores are labelled. */
export function PainTrendChart({ data, height = 100 }: PainTrendChartProps) {
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return null;
  }

  const plotHeight = height - TOP_PADDING - BOTTOM_PADDING;

  const plotWidth = Math.max(width - HORIZONTAL_INSET * 2, 0);
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    ...point,
    x: HORIZONTAL_INSET + (data.length > 1 ? index * stepX : plotWidth / 2),
    y: TOP_PADDING + plotHeight - (point.value / PAIN_SCALE_MAX) * plotHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  const lineColor = Colors.light.primary;

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="painTrendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity={0.25} />
              <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {areaPath.length > 0 && <Path d={areaPath} fill="url(#painTrendFill)" />}

          <Path d={linePath} stroke={lineColor} strokeWidth={2} fill="none" />

          {points.map((point, index) => {
            const isFirst = index === 0;
            const isLast = index === points.length - 1;
            return (
              <G key={point.label}>
                <SvgText
                  x={point.x}
                  y={point.y - VALUE_LABEL_OFFSET}
                  fontSize={Typography.labelSmall.fontSize}
                  fontWeight="700"
                  fill={Colors.light.onSurface}
                  textAnchor="middle"
                >
                  {isFirst || isLast ? point.value : ''}
                </SvgText>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isLast ? 6 : 4}
                  fill={lineColor}
                  fillOpacity={isFirst ? 0.5 : 1}
                  stroke={isLast ? Colors.light.background : 'none'}
                  strokeWidth={2}
                />
                <SvgText
                  x={point.x}
                  y={height - DATE_LABEL_OFFSET}
                  fontSize={Typography.labelMedium.fontSize}
                  fontWeight="500"
                  letterSpacing={Typography.labelMedium.letterSpacing}
                  fill={Colors.light.textSecondary}
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
