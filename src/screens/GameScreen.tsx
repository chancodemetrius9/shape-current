import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Play, RotateCcw, Zap } from 'lucide-react-native';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import Board from '../components/Board';
import PortRow from '../components/PortRow';
import PrimaryButton from '../components/PrimaryButton';
import { bgGame } from '../assets';
import { THEME } from '../constants/theme';
import { RoundSummary, useFlowEngine } from '../hooks/useFlowEngine';

type Props = {
  level: number;
  challenge: boolean;
  onExit: () => void;
  onGameOver: (summary: RoundSummary) => void;
};

export default function GameScreen({ level, challenge, onExit, onGameOver }: Props) {
  const {
    level: built,
    grid,
    used,
    phase,
    runs,
    runKey,
    litMap,
    dockedLanes,
    rotateTile,
    runFlow,
    resetBoard,
  } = useFlowEngine(level, challenge, onGameOver);

  const rise = useRef(new Animated.Value(12)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const left = Math.max(0, built.moveLimit - used);
  const danger = left <= 3;

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 0,
      tension: 70,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [rise]);

  useEffect(() => {
    if (!danger) return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.12, duration: 130, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [left, danger, pulse]);

  const handleTap = useCallback(
    (r: number, c: number) => {
      rotateTile(r, c);
    },
    [rotateTile],
  );

  return (
    <ScreenBackground variant="game" source={bgGame}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9F4FC" />
      <ScreenHeader
        tinted
        title={`LEVEL ${built.index}`}
        subtitle={`${dockedLanes.length}/${built.lanes.length} DOCKED`}
        leftSlot={
          <Pressable
            accessibilityRole="button"
            onPress={onExit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.iconBtn}>
            <ArrowLeft size={20} color={THEME.colors.primary} strokeWidth={2.6} />
          </Pressable>
        }
        rightSlot={
          <Animated.View
            pointerEvents="none"
            style={[styles.movesPill, { transform: [{ scale: pulse }] }]}>
            <Zap
              size={16}
              color={danger ? THEME.colors.danger : THEME.colors.primary}
              strokeWidth={2.6}
            />
            <Text style={[styles.movesNum, danger ? styles.movesDanger : null]}>{left}</Text>
          </Animated.View>
        }
      />

      <View style={styles.area}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.stack, { transform: [{ translateY: rise }] }]}>
          <PortRow lanes={built.lanes} side="source" dockedLanes={[]} />
          <Board
            grid={grid}
            lanes={built.lanes}
            litMap={litMap}
            runs={runs}
            runKey={runKey}
            onTapTile={handleTap}
          />
          <PortRow lanes={built.lanes} side="dock" dockedLanes={dockedLanes} />
        </Animated.View>
      </View>

      <View style={styles.bar}>
        <View style={styles.barStat}>
          <Text style={styles.barLabel}>MOVES LEFT</Text>
          <Text style={styles.barValue}>{`${left}/${built.moveLimit}`}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={resetBoard}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconBtn}>
          <RotateCcw size={20} color={THEME.colors.primary} strokeWidth={2.6} />
        </Pressable>

        <View style={styles.goSlot}>
          <PrimaryButton
            label={phase === 'flowing' ? 'FLOWING' : 'GO'}
            Icon={Play}
            onPress={runFlow}
            disabled={phase === 'flowing'}
            height={56}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  movesPill: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  movesNum: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: THEME.colors.primary,
    fontVariant: ['tabular-nums' as const],
  },
  movesDanger: { color: THEME.colors.danger },
  area: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: { alignItems: 'center', gap: 8 },
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    height: 96,
    borderRadius: THEME.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(36,123,160,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#1B4B63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  barStat: { justifyContent: 'center' },
  barLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.textMuted,
  },
  barValue: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: THEME.colors.text,
    fontVariant: ['tabular-nums' as const],
  },
  goSlot: { flex: 1 },
});
