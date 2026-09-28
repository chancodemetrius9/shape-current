import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { THEME } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function SecondaryButton({ label, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      tension: THEME.spring.press.tension,
      friction: THEME.spring.press.friction,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => press(0.965)}
      onPressOut={() => press(1)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.press}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, { transform: [{ scale }] }]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 48 },
  fill: {
    width: '100%',
    height: 48,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36,123,160,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.18)',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.primary,
  },
});
