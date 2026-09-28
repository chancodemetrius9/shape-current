import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  centered?: boolean;
  tinted?: boolean;
};

/**
 * The single header used by every screen — keeps badge, back-button and
 * counter styling from drifting apart between Menu, Game and Result.
 */
export default function ScreenHeader({
  kicker,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  centered = false,
  tinted = false,
}: Props) {
  return (
    <View style={[styles.header, tinted ? styles.tinted : null]}>
      {leftSlot ? <View style={styles.slot}>{leftSlot}</View> : null}
      <View style={[styles.titles, centered ? styles.titlesCenter : null]}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View style={styles.slot}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tinted: {
    backgroundColor: 'rgba(36,123,160,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  slot: { justifyContent: 'center' },
  titles: { flex: 1, justifyContent: 'center' },
  titlesCenter: { alignItems: 'center' },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: THEME.colors.textMuted,
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textSub,
    marginTop: 3,
  },
});
