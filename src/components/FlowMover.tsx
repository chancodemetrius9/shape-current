import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { TILE_TRAVEL_MS } from '../constants/config';
import { ShapeKind } from '../constants/theme';
import { Cell } from '../game/levelGen';
import FlowShape from './FlowShape';

type Props = {
  kind: ShapeKind;
  color: string;
  trail: Cell[];
  tile: number;
  size: number;
  docked: boolean;
};

/**
 * Carries one shape along its resolved trail. A single driver value feeds both
 * axes through interpolation, so the whole journey runs on the native driver.
 */
export default function FlowMover({ kind, color, trail, tile, size, docked }: Props) {
  const drive = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(1)).current;

  const steps = Math.max(1, trail.length - 1);
  const marks: number[] = [];
  for (let i = 0; i <= steps; i++) marks.push(i);

  const xs = marks.map(i => {
    const cell = trail[Math.min(i, trail.length - 1)];
    return cell.c * tile + tile / 2 - size / 2;
  });
  const ys = marks.map(i => {
    const cell = trail[Math.min(i, trail.length - 1)];
    return cell.r * tile + tile / 2 - size / 2;
  });

  useEffect(() => {
    const travel = steps * TILE_TRAVEL_MS;
    Animated.timing(drive, {
      toValue: steps,
      duration: travel,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      if (docked) {
        Animated.sequence([
          Animated.spring(pop, { toValue: 1.35, tension: 220, friction: 8, useNativeDriver: true }),
          Animated.spring(pop, { toValue: 1, tension: 220, friction: 8, useNativeDriver: true }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(pop, { toValue: 0.55, duration: 260, useNativeDriver: true }),
          Animated.timing(fade, { toValue: 0.22, duration: 260, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [drive, fade, pop, steps, docked]);

  const tx = drive.interpolate({ inputRange: marks, outputRange: xs });
  const ty = drive.interpolate({ inputRange: marks, outputRange: ys });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.mover,
        {
          opacity: fade,
          transform: [{ translateX: tx }, { translateY: ty }, { scale: pop }],
        },
      ]}>
      <FlowShape kind={kind} color={color} size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mover: { position: 'absolute', left: 0, top: 0 },
});
