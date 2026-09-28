import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  height: number;
  style?: ViewStyle | ViewStyle[];
  variant?: 'surface' | 'ghost' | 'bare';
};

/**
 * The BENTO_GRID surface primitive: equal rhythm, 1px border, flat thin
 * shadow. Press feedback is driven from the Pressable, which stays the
 * outermost node so taps can never be swallowed by the animated layer.
 */
export default function BentoTile({
  children,
  onPress,
  height,
  style,
  variant = 'surface',
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      tension: THEME.spring.press.tension,
      friction: THEME.spring.press.friction,
      useNativeDriver: true,
    }).start();
  };

  const skin =
    variant === 'surface'
      ? styles.surface
      : variant === 'ghost'
      ? styles.ghost
      : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      onPressIn={onPress ? () => press(0.97) : undefined}
      onPressOut={onPress ? () => press(1) : undefined}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={[styles.press, { height }, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.inner, skin, { height, transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  inner: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
  },
  surface: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.12)',
  },
  ghost: {
    backgroundColor: 'rgba(36,123,160,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.14)',
  },
});
