import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { scaleFont, scaleWidth } from '@/services/scale';

export interface PainIntensityPoint {
  /** Short label shown under the point, e.g. "24/05" */
  label: string;
  /** Pain level on the standard 0-10 scale */
  value: number;
}

interface PainIntensityChartProps {
  data: PainIntensityPoint[];
  height?: number;
}

const PAIN_SCALE_MAX = 10;
const LINE_COLOR = '#6750A4';
const GRID_COLOR = '#E0E0E0';
const AXIS_TEXT_COLOR = '#525252';
const Y_AXIS_WIDTH = 18;

export function PainIntensityChart({ data, height = 270 }: PainIntensityChartProps) {
  const [width, setWidth] = useState(0);

  const plotWidth = Math.max(width - Y_AXIS_WIDTH, 0);
  const topPadding = 10;
  const bottomPadding = 24;
  const plotHeight = height - topPadding - bottomPadding;

  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    ...point,
    x: Y_AXIS_WIDTH + (data.length > 1 ? index * stepX : plotWidth / 2),
    y: topPadding + plotHeight - (point.value / PAIN_SCALE_MAX) * plotHeight,
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Close the line down to the x axis (pain level 0) so the area under it can be filled
  const xAxisY = topPadding + plotHeight;
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${xAxisY} L ${points[0].x} ${xAxisY} Z`
      : '';

  const yTicks = Array.from({ length: PAIN_SCALE_MAX }, (_, i) => PAIN_SCALE_MAX - i);

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="painIntensityFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={LINE_COLOR} stopOpacity={0.35} />
              <Stop offset="1" stopColor={LINE_COLOR} stopOpacity={0.05} />
            </LinearGradient>
          </Defs>

          {yTicks.map((tick) => {
            const y = topPadding + plotHeight - (tick / PAIN_SCALE_MAX) * plotHeight;
            return (
              <Line
                key={`grid-${tick}`}
                x1={Y_AXIS_WIDTH}
                y1={y}
                x2={width}
                y2={y}
                stroke={GRID_COLOR}
                strokeWidth={1}
              />
            );
          })}

          {yTicks.map((tick) => {
            const y = topPadding + plotHeight - (tick / PAIN_SCALE_MAX) * plotHeight;
            return (
              <SvgText
                key={`ytick-${tick}`}
                x={Y_AXIS_WIDTH - 6}
                y={y + 3}
                fontSize={scaleFont(10)}
                fill={AXIS_TEXT_COLOR}
                textAnchor="end"
              >
                {tick}
              </SvgText>
            );
          })}

          {areaPath.length > 0 && <Path d={areaPath} fill="url(#painIntensityFill)" />}

          {points.length > 1 && <Path d={linePath} stroke={LINE_COLOR} strokeWidth={2} fill="none" />}

          {points.map((point) => (
            <Circle key={point.label} cx={point.x} cy={point.y} r={4} fill={LINE_COLOR} />
          ))}

          {points.map((point, index) => (
            <SvgText
              key={`xlabel-${point.label}`}
              x={point.x}
              y={height - 4}
              fontSize={scaleFont(10)}
              fill={AXIS_TEXT_COLOR}
              textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
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
    marginTop: scaleWidth(4),
  },
});
