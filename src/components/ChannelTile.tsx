import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ROTATE_MS } from '../constants/config';
import { THEME } from '../constants/theme';
import { TileType } from '../game/tiles';

type Props = {
  type: TileType;
  rotation: number;
  locked: boolean;
  size: number;
  litColor: string | null;
  onPress: () => void;
};

/** Channel geometry for each type, drawn upright; rotation is a transform. */
function channelPath(type: TileType, s: number): string {
  const h = s / 2;
  if (type === 'I') return `M ${h} 0 L ${h} ${s}`;
  if (type === 'L') return `M ${h} 0 L ${h} ${h} L ${s} ${h}`;
  if (type === 'T') return `M ${h} 0 L ${h} ${s} M ${h} ${h} L ${s} ${h}`;
  if (type === 'X') return `M ${h} 0 L ${h} ${s} M 0 ${h} L ${s} ${h}`;
  return '';
}

function ChannelTile({ type, rotation, locked, size, litColor, onPress }: Props) {
  const spin = useRef(new Animated.Value(rotation)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(spin, {
      toValue: rotation,
      duration: ROTATE_MS,
      useNativeDriver: true,
    }).start();
  }, [rotation, spin]);

  const deg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const nudge = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const shift = shake.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] });
  const inner = size - 6;
  const stroke = Math.max(4, Math.round(inner * 0.3));
  const color = litColor ?? THEME.colors.channel;

  if (type === 'NONE') {
    return (
      <View style={[styles.cell, { width: size, height: size }]}>
        <View style={[styles.blockPad, { width: inner, height: inner }]}>
          <Svg width={inner} height={inner}>
            <Line x1={0} y1={inner} x2={inner} y2={0} stroke="rgba(36,123,160,0.16)" strokeWidth={2} />
            <Line x1={inner * 0.4} y1={inner} x2={inner} y2={inner * 0.4} stroke="rgba(36,123,160,0.12)" strokeWidth={2} />
            <Line x1={0} y1={inner * 0.6} x2={inner * 0.6} y2={0} stroke="rgba(36,123,160,0.12)" strokeWidth={2} />
          </Svg>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (locked) {
          nudge();
          return;
        }
        onPress();
      }}
      style={[styles.cell, { width: size, height: size }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pad,
          {
            width: inner,
            height: inner,
            transform: [{ translateX: shift }, { rotate: deg }],
          },
        ]}>
        <Svg width={inner} height={inner}>
          <Path
            d={channelPath(type, inner)}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
          />
          {litColor ? (
            <Path
              d={channelPath(type, inner)}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={Math.max(1.5, stroke * 0.28)}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
          {locked ? (
            <Circle cx={inner - 7} cy={7} r={3} fill="rgba(36,123,160,0.45)" />
          ) : null}
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center' },
  pad: {
    borderRadius: 12,
    backgroundColor: '#EAF4FB',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blockPad: {
    borderRadius: 12,
    backgroundColor: '#D3E3EC',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default React.memo(ChannelTile);
