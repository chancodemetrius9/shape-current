import React from 'react';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
import { ShapeKind } from '../constants/theme';

type Props = {
  kind: ShapeKind;
  color: string;
  size: number;
  filled?: boolean;
};

/** The three cargo silhouettes. Inline SVG so every instance is pixel-equal. */
function FlowShape({ kind, color, size, filled = true }: Props) {
  const fill = filled ? color : 'none';
  const strokeW = filled ? 0 : Math.max(1.5, size * 0.12);
  const pad = strokeW / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {kind === 'circle' ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - pad - 0.5}
          fill={fill}
          stroke={color}
          strokeWidth={strokeW}
        />
      ) : null}
      {kind === 'square' ? (
        <Rect
          x={pad + 0.5}
          y={pad + 0.5}
          width={size - strokeW - 1}
          height={size - strokeW - 1}
          rx={size * 0.22}
          fill={fill}
          stroke={color}
          strokeWidth={strokeW}
        />
      ) : null}
      {kind === 'triangle' ? (
        <Polygon
          points={`${size / 2},${pad + 1} ${size - pad - 1},${size - pad - 1} ${pad + 1},${size - pad - 1}`}
          fill={fill}
          stroke={color}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

export default React.memo(FlowShape);
