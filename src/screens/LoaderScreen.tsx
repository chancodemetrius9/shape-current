import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import ScreenBackground from '../components/ScreenBackground';
import { bgLoader } from '../assets';
import { LOADER_DURATION_MS } from '../constants/config';
import { THEME } from '../constants/theme';

type Props = { onDone: () => void };

const MARK = 132;
const BAR_W = 190;

export default function LoaderScreen({ onDone }: Props) {
  const rise = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rise, {
        toValue: 1,
        tension: 55,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fill, {
        toValue: 1,
        duration: 7600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Bounded series, never a perpetual loop: the window has to go idle or the
    // automated capture harness never gets a stable frame.
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      { iterations: 4 },
    ).start();

    const t = setTimeout(onDone, LOADER_DURATION_MS);
    return () => clearTimeout(t);
  }, [rise, pulse, fill, onDone]);

  const markScale = rise.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const shift = fill.interpolate({ inputRange: [0, 1], outputRange: [-BAR_W, 0] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <ScreenBackground variant="loader" source={bgLoader}>
      <StatusBar barStyle="light-content" backgroundColor="#012A45" />
      <View style={styles.center}>
        <Animated.View
          pointerEvents="none"
          style={{ opacity: rise, transform: [{ scale: markScale }] }}>
          <LinearGradient
            colors={['#247BA0', '#70C1B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mark}>
            <Svg width={84} height={84} viewBox="0 0 84 84">
              <Path
                d="M 10 20 C 34 20, 34 42, 58 42 L 74 42"
                stroke="#EEF7FF"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M 10 42 C 34 42, 34 64, 58 64 L 74 64"
                stroke="#EEF7FF"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
                opacity={0.72}
              />
              <Circle cx={58} cy={42} r={9} fill="#FFB347" />
            </Svg>
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.brand, { opacity: glow }]}>
          SHAPE CURRENT
        </Animated.Text>
        <View style={styles.rule} />
        <Text style={styles.tag}>ROUTE THE FLOW</Text>

        <View style={styles.track}>
          <Animated.View
            pointerEvents="none"
            style={[styles.barClip, { transform: [{ translateX: shift }] }]}>
            <LinearGradient
              colors={THEME.gradients.bar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bar}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>LOADING...</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 44 },
  mark: {
    width: MARK,
    height: MARK,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#70C1B3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 10,
  },
  brand: {
    marginTop: 28,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: 4,
    color: THEME.colors.onDark,
    textAlign: 'center',
  },
  rule: {
    marginTop: 12,
    width: 64,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(112,193,179,0.6)',
  },
  tag: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 3,
    color: 'rgba(234,246,255,0.62)',
  },
  track: {
    marginTop: 46,
    width: BAR_W,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  barClip: { width: BAR_W, height: 5 },
  bar: { width: BAR_W, height: 5, borderRadius: 3 },
  loading: {
    marginTop: 16,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(234,246,255,0.45)',
  },
});
