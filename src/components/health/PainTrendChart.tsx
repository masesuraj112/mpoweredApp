import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Typography, useThemeColors } from '@/constants/theme';
export interface PainTrendPoint {
  /** Short label shown under the point, e.g. "25/05" */
  label: string;
  /** Pain level on the standard 0-10 scale */
  value: number;
}

interface PainTrendChartProps {
  data: PainTrendPoint[];
  height?: number;
}

const PAIN_SCALE_MAX = 10;
// Keeps the edge dots and their centred date labels inside the SVG
const HORIZONTAL_INSET = 20;

export function PainTrendChart({ data, height = 101 }: PainTrendChartProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return null;
  }

  const topPadding = 20;
  const bottomPadding = 16;
  const plotHeight = height - topPadding - bottomPadding;

  const plotWidth = Math.max(width - HORIZONTAL_INSET * 2, 0);
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    ...point,
    x: HORIZONTAL_INSET + (data.length > 1 ? index * stepX : plotWidth / 2),
    y: topPadding + plotHeight - (point.value / PAIN_SCALE_MAX) * plotHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="painTrendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.25} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {areaPath.length > 0 && <Path d={areaPath} fill="url(#painTrendFill)" />}

          <Path d={linePath} stroke={colors.primary} strokeWidth={2} fill="none" />

          {points.map((point, index) => {
            const isEndpoint = index === 0 || index === points.length - 1;
            return (
              <G key={point.label}>
                <SvgText
                  x={point.x}
                  y={point.y - 8}
                  fontSize={Typography.caption.fontSize}
                  fontWeight="700"
                  fill={colors.text}
                  textAnchor="middle"
                >
                  {isEndpoint ? point.value : ''}
                </SvgText>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={index === points.length - 1 ? 6 : 4}
                  fill={index === 0 ? colors.onBrandMuted : colors.primary}
                  stroke={index === points.length - 1 ? 'white' : 'none'}
                  strokeWidth={2}
                />
                <SvgText
                  x={point.x}
                  y={height - 4}
                  fontSize={Typography.caption.fontSize}
                  fontWeight="500"
                  letterSpacing={0.5}
                  fill={colors.textSubtle}
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
