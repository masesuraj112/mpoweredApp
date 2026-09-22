import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { scaleFont, scaleHeight } from '@/services/scale';

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
const LINE_COLOR = '#6750A4';
const LINE_COLOR_LIGHT = '#B9AAE0';

export function PainTrendChart({ data, height = scaleHeight(101) }: PainTrendChartProps) {
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return null;
  }

  const topPadding = scaleHeight(20);
  const bottomPadding = scaleHeight(16);
  const plotHeight = height - topPadding - bottomPadding;

  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((point, index) => ({
    ...point,
    x: data.length > 1 ? index * stepX : width / 2,
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
              <Stop offset="0" stopColor={LINE_COLOR} stopOpacity={0.25} />
              <Stop offset="1" stopColor={LINE_COLOR} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {areaPath.length > 0 && <Path d={areaPath} fill="url(#painTrendFill)" />}

          <Path d={linePath} stroke={LINE_COLOR} strokeWidth={2} fill="none" />

          {points.map((point, index) => {
            const isEndpoint = index === 0 || index === points.length - 1;
            return (
              <G key={point.label}>
                <SvgText
                  x={point.x}
                  y={point.y - scaleHeight(8)}
                  fontSize={scaleFont(11)}
                  fontWeight="700"
                  fill="#1A1A1A"
                  textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                >
                  {isEndpoint ? point.value : ''}
                </SvgText>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={index === points.length - 1 ? 6 : 4}
                  fill={index === 0 ? LINE_COLOR_LIGHT : LINE_COLOR}
                  stroke={index === points.length - 1 ? 'white' : 'none'}
                  strokeWidth={2}
                />
                <SvgText
                  x={point.x}
                  y={height - scaleHeight(4)}
                  fontSize={scaleFont(10)}
                  fill="rgba(60,60,67,0.6)"
                  textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
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
