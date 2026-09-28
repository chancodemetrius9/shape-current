import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

type Props = {
  Icon: React.ComponentType<any>;
  value: string;
  label: string;
  valueColor: string;
};

/**
 * One component for every stat pill in the app (Menu and Result). Icons are
 * vector (fixed 22x22 canvas) so a row of them stays optically identical —
 * the colour and the number carry the difference, never the artwork.
 */
export default function StatCard({ Icon, value, label, valueColor }: Props) {
  return (
    <View style={[styles.card, { borderColor: valueColor + '44' }]}>
      <View style={[styles.iconWrap, { backgroundColor: valueColor + '1A' }]}>
        <Icon size={22} color={valueColor} strokeWidth={2.4} />
      </View>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    ...THEME.shadow.tile,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums' as const],
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.textMuted,
  },
});
