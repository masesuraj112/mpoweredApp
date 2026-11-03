import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Colors, Spacing, Typography } from '@/constants/theme';

export interface PainIntensityPoint {
  /** Short label shown under the point, e.g. "24/05" */
  label: string;
  /** Pain level on the standard 0-10 scale */
  value: number;
}

type PainIntensityChartProps = {
  data: PainIntensityPoint[];
  height?: number;
};

const PAIN_SCALE_MAX = 10;
const Y_AXIS_WIDTH = 18;
// Keeps the edge dots and their centred date labels inside the plot area.
const HORIZONTAL_INSET = 16;
const TOP_PADDING = 10;
const BOTTOM_PADDING = 24;

/** A 0 to 10 line chart of weekly pain scores with a grid, oldest week on the left. */
export function PainIntensityChart({ data, height = 270 }: PainIntensityChartProps) {
  const [width, setWidth] = useState(0);

  const plotWidth = Math.max(width - Y_AXIS_WIDTH - HORIZONTAL_INSET * 2, 0);
  const plotHeight = height - TOP_PADDING - BOTTOM_PADDING;

  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    ...point,
    x: Y_AXIS_WIDTH + HORIZONTAL_INSET + (data.length > 1 ? index * stepX : plotWidth / 2),
    y: TOP_PADDING + plotHeight - (point.value / PAIN_SCALE_MAX) * plotHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Close the line down to the x axis (pain level 0) so the area under it can be filled
  const xAxisY = TOP_PADDING + plotHeight;
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${xAxisY} L ${points[0].x} ${xAxisY} Z`
      : '';

  const yTicks = Array.from({ length: PAIN_SCALE_MAX }, (_, i) => PAIN_SCALE_MAX - i);
  const lineColor = Colors.light.primary;
  const axisTextSize = Typography.labelSmall.fontSize;

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="painIntensityFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity={0.35} />
              <Stop offset="1" stopColor={lineColor} stopOpacity={0.05} />
            </LinearGradient>
          </Defs>

          {yTicks.map((tick) => {
            const y = TOP_PADDING + plotHeight - (tick / PAIN_SCALE_MAX) * plotHeight;
            return (
              <Line
                key={`grid-${tick}`}
                x1={Y_AXIS_WIDTH}
                y1={y}
                x2={width}
                y2={y}
                stroke={Colors.light.divider}
                strokeWidth={1}
              />
            );
          })}

          {yTicks.map((tick) => {
            const y = TOP_PADDING + plotHeight - (tick / PAIN_SCALE_MAX) * plotHeight;
            return (
              <SvgText
                key={`ytick-${tick}`}
                x={Y_AXIS_WIDTH - 6}
                y={y + 3}
                fontSize={axisTextSize}
                fill={Colors.light.textSecondary}
                textAnchor="end"
              >
                {tick}
              </SvgText>
            );
          })}

          {areaPath.length > 0 && <Path d={areaPath} fill="url(#painIntensityFill)" />}

          {points.length > 1 && <Path d={linePath} stroke={lineColor} strokeWidth={2} fill="none" />}

          {points.map((point) => (
            <Circle key={point.label} cx={point.x} cy={point.y} r={4} fill={lineColor} />
          ))}

          {points.map((point) => (
            <SvgText
              key={`xlabel-${point.label}`}
              x={point.x}
              y={height - 4}
              fontSize={axisTextSize}
              fill={Colors.light.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: Spacing.one,
  },
});
