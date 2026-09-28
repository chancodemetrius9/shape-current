import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Flame, Layers3, XCircle, Zap } from 'lucide-react-native';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import StatCard from '../components/StatCard';
import FlowShape from '../components/FlowShape';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { bgResult } from '../assets';
import { SCREEN_W } from '../constants/config';
import { SHAPE_COLORS, ShapeKind, THEME } from '../constants/theme';
import { makeRng } from '../utils/rng';

type Props = {
  won: boolean;
  docked: number;
  total: number;
  used: number;
  level: number;
  streak: number;
  onPlayAgain: () => void;
  onMenu: () => void;
};

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle'];

function Confetti() {
  const drive = useRef(new Animated.Value(0)).current;

  const bits = useMemo(() => {
    const rng = makeRng(0xc0ffee);
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      kind: KINDS[i % 3],
      x: 20 + rng.next() * (SCREEN_W - 60),
      rise: 130 + rng.next() * 150,
      size: 8 + Math.round(rng.next() * 8),
    }));
  }, []);

  useEffect(() => {
    Animated.timing(drive, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [drive]);

  const opacity = drive.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.7, 0] });

  return (
    <View style={styles.confetti} pointerEvents="none">
      {bits.map(b => (
        <Animated.View
          key={`b${b.id}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: b.x,
            top: 0,
            opacity,
            transform: [
              {
                translateY: drive.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -b.rise],
                }),
              },
            ],
          }}>
          <FlowShape kind={b.kind} color={SHAPE_COLORS[b.kind]} size={b.size} />
        </Animated.View>
      ))}
    </View>
  );
}

export default function GameOverScreen({
  won,
  docked,
  total,
  used,
  level,
  streak,
  onPlayAgain,
  onMenu,
}: Props) {
  const pop = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [pop, fade]);

  const pills = [
    docked > 0
      ? { key: 'd', Icon: CheckCircle2, value: `${docked}/${total}`, label: 'DOCKED', color: THEME.colors.accent }
      : null,
    used > 0
      ? { key: 'u', Icon: Zap, value: `${used}`, label: 'STEPS', color: THEME.colors.primary }
      : null,
    streak > 0
      ? { key: 's', Icon: Flame, value: `${streak}`, label: 'STREAK', color: THEME.colors.warn }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    Icon: React.ComponentType<any>;
    value: string;
    label: string;
    color: string;
  }>;

  return (
    <ScreenBackground variant={won ? 'win' : 'lose'} source={bgResult}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF7FF" />
      {won ? <Confetti /> : null}
      <ScreenHeader centered kicker="SHAPE CURRENT" title="RESULTS" />

      <View style={styles.content}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.card, { opacity: fade, transform: [{ scale: pop }] }]}>
          <View
            style={[
              styles.badge,
              { backgroundColor: won ? 'rgba(112,193,179,0.16)' : 'rgba(228,105,91,0.14)' },
            ]}>
            {won ? (
              <CheckCircle2 size={38} color={THEME.colors.accent} strokeWidth={2.3} />
            ) : (
              <XCircle size={38} color={THEME.colors.danger} strokeWidth={2.3} />
            )}
          </View>

          <Text style={[styles.title, { color: won ? THEME.colors.primary : THEME.colors.danger }]}>
            {won ? 'YOU WON!' : 'NO LUCK!'}
          </Text>
          <Text style={styles.sub}>
            {'LEVEL ' + level + ' · ' + docked + '/' + total + ' SHAPES ROUTED'}
          </Text>

          <View style={styles.shapesRow}>
            <Layers3 size={16} color={THEME.colors.textMuted} strokeWidth={2.2} />
            {KINDS.map(k => (
              <FlowShape key={k} kind={k} color={SHAPE_COLORS[k]} size={14} />
            ))}
          </View>

          {pills.length >= 2 ? (
            <View style={styles.statsRow}>
              {pills.map(p => (
                <View key={p.key} style={styles.statSlot}>
                  <StatCard Icon={p.Icon} value={p.value} label={p.label} valueColor={p.color} />
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.ctas}>
          <PrimaryButton label="PLAY AGAIN" onPress={onPlayAgain} height={58} />
          <SecondaryButton label="CURRENT MAP" onPress={onMenu} />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 300,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
    justifyContent: 'center',
    gap: 18,
  },
  card: {
    width: '100%',
    paddingVertical: 26,
    paddingHorizontal: 18,
    borderRadius: THEME.radius.xxl,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.14)',
    alignItems: 'center',
    ...THEME.shadow.card,
  },
  badge: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: THEME.colors.textSub,
    textAlign: 'center',
  },
  shapesRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsRow: { marginTop: 18, flexDirection: 'row', gap: 10, width: '100%' },
  statSlot: { flex: 1 },
  ctas: { width: '100%', gap: 12 },
});
