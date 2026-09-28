import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_PAD, BOARD_W, COLS, TILE } from '../constants/config';
import { THEME } from '../constants/theme';
import { LaneSpec } from '../game/levelGen';
import FlowShape from './FlowShape';

type Props = {
  lanes: LaneSpec[];
  side: 'source' | 'dock';
  dockedLanes: number[];
};

/** Column-aligned inlets above the board and docks below it. */
export default function PortRow({ lanes, side, dockedLanes }: Props) {
  const slots = [];
  for (let c = 0; c < COLS; c++) {
    const laneIdx = lanes.findIndex(l => (side === 'source' ? l.srcCol : l.dstCol) === c);
    const lane = laneIdx >= 0 ? lanes[laneIdx] : null;
    const filled = lane !== null && dockedLanes.indexOf(laneIdx) >= 0;

    slots.push(
      <View key={`p${c}`} style={styles.slot}>
        {lane ? (
          <View
            style={[
              styles.port,
              side === 'dock' ? styles.dock : styles.source,
              {
                borderColor: lane.color,
                backgroundColor: filled ? lane.color : lane.color + '1F',
              },
            ]}>
            <FlowShape
              kind={lane.kind}
              color={filled ? '#FFFFFF' : lane.color}
              size={Math.round(TILE * 0.38)}
              filled={side === 'source' || filled}
            />
          </View>
        ) : (
          <View style={styles.blank} />
        )}
      </View>,
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.rowInner}>{slots}</View>
      <Text style={styles.caption}>
        {side === 'source' ? 'INLETS' : 'DOCKS'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: BOARD_W, alignItems: 'center' },
  rowInner: {
    width: BOARD_W,
    flexDirection: 'row',
    paddingHorizontal: BOARD_PAD,
  },
  slot: { width: TILE, alignItems: 'center', justifyContent: 'center' },
  port: {
    width: Math.round(TILE * 0.78),
    height: Math.round(TILE * 0.66),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  source: { borderRadius: 11 },
  dock: { borderRadius: 9 },
  blank: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(36,123,160,0.14)',
  },
  caption: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: THEME.colors.textMuted,
  },
});
