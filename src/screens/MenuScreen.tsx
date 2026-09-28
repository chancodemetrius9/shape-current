import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Flame, GraduationCap, Layers3, LayoutGrid, Play, Zap } from 'lucide-react-native';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import StatCard from '../components/StatCard';
import BentoTile from '../components/BentoTile';
import FlowShape from '../components/FlowShape';
import { bgMenu } from '../assets';
import { buildLevel } from '../game/levelGen';
import { SHAPE_COLORS, THEME } from '../constants/theme';

type Props = {
  level: number;
  solvedCount: number;
  challenge: boolean;
  hintOpen: boolean;
  onToggleChallenge: () => void;
  onToggleHint: () => void;
  onBegin: () => void;
};

export default function MenuScreen({
  level,
  solvedCount,
  challenge,
  hintOpen,
  onToggleChallenge,
  onToggleHint,
  onBegin,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(16)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  const budget = useMemo(() => buildLevel(level, challenge).moveLimit, [level, challenge]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(lift, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const press = (to: number) => {
    Animated.spring(ctaScale, {
      toValue: to,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScreenBackground variant="menu" source={bgMenu}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF7FF" />
      <ScreenHeader
        kicker="SHAPE"
        title="CURRENT MAP"
        rightSlot={
          <View style={styles.badge}>
            <LayoutGrid size={18} color={THEME.colors.primary} strokeWidth={2.4} />
            <Text style={styles.badgeText}>{solvedCount}</Text>
          </View>
        }
      />

      <Animated.View pointerEvents="box-none" style={[styles.body, { opacity: fade }]}>
        <View style={styles.statsRow}>
          <View style={styles.statSlot}>
            <StatCard
              Icon={Layers3}
              value={`${level}`}
              label="LEVEL"
              valueColor={THEME.colors.primary}
            />
          </View>
          <View style={styles.statSlot}>
            <StatCard
              Icon={Zap}
              value={`${budget}`}
              label="MOVE BUDGET"
              valueColor={THEME.colors.accent}
            />
          </View>
        </View>

        <BentoTile height={80} onPress={onToggleChallenge} style={styles.shadowTile}>
          <View style={styles.challenge}>
            <View style={[styles.accentBar, challenge ? styles.accentOn : null]} />
            <Flame size={22} color={THEME.colors.warn} strokeWidth={2.4} />
            <View style={styles.challengeText}>
              <Text style={styles.challengeTitle}>CHALLENGE MODE</Text>
              <Text style={styles.challengeSub}>TIGHT BUDGET, NO SPARE TURNS</Text>
            </View>
            <View style={[styles.toggle, challenge ? styles.toggleOn : null]}>
              <Text style={[styles.toggleText, challenge ? styles.toggleTextOn : null]}>
                {challenge ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </BentoTile>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.ctaWrap, { transform: [{ translateY: lift }] }]}>
          <Pressable
            accessibilityRole="button"
            onPress={onBegin}
            onPressIn={() => press(0.965)}
            onPressOut={() => press(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.ctaPress}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles.ctaAnim, { transform: [{ scale: ctaScale }] }]}>
              <LinearGradient
                colors={THEME.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaFill}>
                <View style={styles.ctaIcon}>
                  <Play size={30} color="#EAF6FF" strokeWidth={2.6} />
                </View>
                <Text style={styles.ctaLabel}>PLAY NOW</Text>
                <Text style={styles.ctaSub}>{'LEVEL ' + level + ' · FLOW GRID'}</Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>

        <BentoTile height={hintOpen ? 124 : 96} onPress={onToggleHint} variant="ghost">
          <View style={styles.hint}>
            <View style={styles.hintHead}>
              <GraduationCap size={20} color={THEME.colors.primary} strokeWidth={2.4} />
              <Text style={styles.hintTitle}>HOW TO PLAY</Text>
            </View>
            <Text style={styles.hintLine}>1. TAP A CHANNEL TILE TO TURN IT.</Text>
            <Text style={styles.hintLine}>2. PRESS GO AND SEND EACH SHAPE HOME.</Text>
            {hintOpen ? (
              <Text style={styles.hintLine}>3. EVERY TURN COSTS ONE MOVE.</Text>
            ) : null}
          </View>
        </BentoTile>

        <View style={styles.footer}>
          <View style={styles.legend}>
            <FlowShape kind="circle" color={SHAPE_COLORS.circle} size={14} />
            <FlowShape kind="square" color={SHAPE_COLORS.square} size={14} />
            <FlowShape kind="triangle" color={SHAPE_COLORS.triangle} size={14} />
          </View>
          <Text style={styles.footerText}>ROUTE EACH SHAPE HOME</Text>
        </View>
      </Animated.View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...THEME.shadow.tile,
  },
  badgeText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
    fontVariant: ['tabular-nums' as const],
  },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statSlot: { flex: 1 },
  shadowTile: { ...THEME.shadow.tile },
  challenge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 46,
    borderRadius: 2,
    backgroundColor: 'rgba(255,179,71,0.35)',
  },
  accentOn: { backgroundColor: THEME.colors.warn },
  challengeText: { flex: 1 },
  challengeTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: THEME.colors.text,
  },
  challengeSub: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: THEME.colors.textSub,
  },
  toggle: {
    width: 66,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF7FF',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.18)',
  },
  toggleOn: { backgroundColor: THEME.colors.warn, borderColor: THEME.colors.warn },
  toggleText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textSub,
  },
  toggleTextOn: { color: '#5A3A08' },
  ctaWrap: { width: '100%' },
  ctaPress: { width: '100%', height: 200, borderRadius: THEME.radius.xl, ...THEME.shadow.cta },
  ctaAnim: { width: '100%', height: 200, borderRadius: THEME.radius.xl },
  ctaFill: {
    width: '100%',
    height: 200,
    borderRadius: THEME.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  ctaLabel: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  ctaSub: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: 'rgba(234,246,255,0.78)',
  },
  hint: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  hintHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  hintTitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: THEME.colors.primary,
  },
  hintLine: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: THEME.colors.textSub,
  },
  footer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  footerText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.textMuted,
  },
});
