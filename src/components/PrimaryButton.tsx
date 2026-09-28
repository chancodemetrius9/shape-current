import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/theme';

type Props = {
  label: string;
  Icon?: React.ComponentType<any>;
  onPress: () => void;
  disabled?: boolean;
  height?: number;
  colors?: string[];
};

const ICON = 24;

export default function PrimaryButton({
  label,
  Icon,
  onPress,
  disabled = false,
  height = 58,
  colors,
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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      onPressIn={() => press(0.965)}
      onPressOut={() => press(1)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.press, { height }, disabled ? styles.off : null]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.anim, { height, transform: [{ scale }] }]}>
        <LinearGradient
          colors={colors ?? THEME.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { height }]}>
          <View style={styles.row}>
            {Icon ? <Icon size={ICON} color="#FFFFFF" strokeWidth={2.4} /> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    ...THEME.shadow.cta,
  },
  off: { opacity: 0.55 },
  anim: { width: '100%', borderRadius: THEME.radius.lg },
  fill: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 18,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: '#FFFFFF',
  },
});
