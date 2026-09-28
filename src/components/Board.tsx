import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import {
  BOARD_BORDER,
  BOARD_H,
  BOARD_PAD,
  BOARD_W,
  COLS,
  ROWS,
  TILE,
} from '../constants/config';
import { THEME } from '../constants/theme';
import { LaneSpec, TileState } from '../game/levelGen';
import { LaneRun } from '../game/flowSim';
import ChannelTile from './ChannelTile';
import FlowMover from './FlowMover';

type Props = {
  grid: TileState[][];
  lanes: LaneSpec[];
  litMap: Record<string, string>;
  runs: LaneRun[] | null;
  runKey: number;
  onTapTile: (r: number, c: number) => void;
};

const INNER_W = TILE * COLS;
const INNER_H = TILE * ROWS;
const SHAPE = Math.round(TILE * 0.46);

export default function Board({ grid, lanes, litMap, runs, runKey, onTapTile }: Props) {
  const gridLines = [];
  for (let c = 1; c < COLS; c++) {
    gridLines.push(
      <Line
        key={`v${c}`}
        x1={c * TILE}
        y1={0}
        x2={c * TILE}
        y2={INNER_H}
        stroke="rgba(36,123,160,0.07)"
        strokeWidth={1}
      />,
    );
  }
  for (let r = 1; r < ROWS; r++) {
    gridLines.push(
      <Line
        key={`h${r}`}
        x1={0}
        y1={r * TILE}
        x2={INNER_W}
        y2={r * TILE}
        stroke="rgba(36,123,160,0.07)"
        strokeWidth={1}
      />,
    );
  }

  return (
    <View style={styles.frame}>
      <View style={styles.water} pointerEvents="none">
        <Svg width={INNER_W} height={INNER_H}>{gridLines}</Svg>
      </View>

      {grid.map((row, r) => (
        <View key={`r${r}`} style={styles.row}>
          {row.map((tile, c) => (
            <ChannelTile
              key={`t${r}-${c}`}
              type={tile.type}
              rotation={tile.rotation}
              locked={tile.locked}
              size={TILE}
              litColor={litMap[`${r}-${c}`] ?? null}
              onPress={() => onTapTile(r, c)}
            />
          ))}
        </View>
      ))}

      {runs ? (
        <View style={styles.overlay} pointerEvents="none">
          {runs.map(run => (
            <FlowMover
              key={`m${runKey}-${run.lane}`}
              kind={lanes[run.lane].kind}
              color={lanes[run.lane].color}
              trail={run.trail}
              tile={TILE}
              size={SHAPE}
              docked={run.outcome === 'docked'}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: BOARD_W,
    height: BOARD_H,
    padding: BOARD_PAD,
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(36,123,160,0.18)',
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.sunken,
    shadowColor: '#247BA0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  water: {
    position: 'absolute',
    left: BOARD_PAD,
    top: BOARD_PAD,
    width: INNER_W,
    height: INNER_H,
  },
  row: { flexDirection: 'row' },
  overlay: {
    position: 'absolute',
    left: BOARD_PAD,
    top: BOARD_PAD,
    width: INNER_W,
    height: INNER_H,
  },
});
