import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ENGAGED_RESULT_MS,
  FLOW_RESOLVE_MS,
  IDLE_RESULT_MS,
  MAX_ROUND_MS,
  TILE_TRAVEL_MS,
} from '../constants/config';
import { FlowResult, simulateFlow } from '../game/flowSim';
import { Level, TileState, buildLevel } from '../game/levelGen';

export type RoundSummary = {
  won: boolean;
  docked: number;
  used: number;
  limit: number;
  level: number;
};

type Phase = 'idle' | 'flowing';

function cloneGrid(grid: TileState[][]): TileState[][] {
  return grid.map(row => row.map(t => ({ ...t })));
}

export function useFlowEngine(
  levelIndex: number,
  challenge: boolean,
  onFinish: (summary: RoundSummary) => void,
) {
  const level: Level = useMemo(
    () => buildLevel(levelIndex, challenge),
    [levelIndex, challenge],
  );

  const [grid, setGrid] = useState<TileState[][]>(() => cloneGrid(level.grid));
  const [used, setUsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<FlowResult | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [litStep, setLitStep] = useState(-1);
  const [settled, setSettled] = useState(false);

  // Callback-facing mirrors — never read state directly from a timer.
  const gridRef = useRef(grid);
  const usedRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const finishRef = useRef(onFinish);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const backstop = useRef<ReturnType<typeof setTimeout> | null>(null);

  finishRef.current = onFinish;
  gridRef.current = grid;

  const clearBackstop = () => {
    if (backstop.current) {
      clearTimeout(backstop.current);
      backstop.current = null;
    }
  };

  const runFlow = useCallback(() => {
    if (phaseRef.current !== 'idle') return;
    phaseRef.current = 'flowing';
    clearBackstop();
    setPhase('flowing');

    const outcome = simulateFlow(gridRef.current, level.lanes);
    setResult(outcome);
    setRunKey(k => k + 1);
    setLitStep(0);

    const longest = Math.max(...outcome.runs.map(r => r.trail.length), 1);
    let step = 0;
    ticker.current = setInterval(() => {
      step += 1;
      setLitStep(step);
      if (step >= longest && ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }
    }, TILE_TRAVEL_MS);

    const holdT = setTimeout(() => setSettled(true), longest * TILE_TRAVEL_MS + 120);
    const endT = setTimeout(() => {
      finishRef.current({
        won: outcome.won,
        docked: outcome.docked,
        used: usedRef.current,
        limit: level.moveLimit,
        level: levelIndex,
      });
    }, FLOW_RESOLVE_MS);
    timers.current.push(holdT, endT);
  }, [level, levelIndex]);

  const armBackstop = useCallback(
    (ms: number) => {
      clearBackstop();
      backstop.current = setTimeout(() => {
        if (phaseRef.current === 'idle') runFlow();
      }, ms);
    },
    [runFlow],
  );

  const rotateTile = useCallback(
    (r: number, c: number) => {
      if (phaseRef.current !== 'idle') return;
      const tile = gridRef.current[r][c];
      if (tile.locked || tile.type === 'NONE') return;

      const next = cloneGrid(gridRef.current);
      next[r][c] = { ...tile, rotation: tile.rotation + 1 };
      gridRef.current = next;
      setGrid(next);

      const spent = usedRef.current + 1;
      usedRef.current = spent;
      setUsed(spent);

      if (spent >= level.moveLimit) {
        const t = setTimeout(() => runFlow(), 460);
        timers.current.push(t);
      } else {
        armBackstop(ENGAGED_RESULT_MS);
      }
    },
    [armBackstop, level.moveLimit, runFlow],
  );

  /** Puts every rotation back to the scrambled start. Spent moves stay spent. */
  const resetBoard = useCallback(() => {
    if (phaseRef.current !== 'idle') return;
    const fresh = cloneGrid(level.grid);
    gridRef.current = fresh;
    setGrid(fresh);
    armBackstop(ENGAGED_RESULT_MS);
  }, [armBackstop, level.grid]);

  // Round bootstrap: fresh board, fresh timers.
  useEffect(() => {
    const fresh = cloneGrid(level.grid);
    gridRef.current = fresh;
    usedRef.current = 0;
    phaseRef.current = 'idle';
    setGrid(fresh);
    setUsed(0);
    setPhase('idle');
    setResult(null);
    setLitStep(-1);
    setSettled(false);

    armBackstop(IDLE_RESULT_MS);
    const cap = setTimeout(() => {
      if (phaseRef.current === 'idle') runFlow();
    }, MAX_ROUND_MS);
    timers.current.push(cap);

    return () => {
      clearBackstop();
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }
    };
  }, [level, armBackstop, runFlow]);

  const litMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!result || litStep < 0) return map;
    result.runs.forEach(run => {
      const upto = Math.min(run.trail.length, litStep + 1);
      for (let i = 0; i < upto; i++) {
        const cell = run.trail[i];
        map[`${cell.r}-${cell.c}`] = level.lanes[run.lane].color;
      }
    });
    return map;
  }, [result, litStep, level.lanes]);

  const dockedLanes = useMemo(() => {
    if (!result || !settled) return [];
    return result.runs.filter(r => r.outcome === 'docked').map(r => r.lane);
  }, [result, settled]);

  return {
    level,
    grid,
    used,
    phase,
    runs: result ? result.runs : null,
    runKey,
    litMap,
    dockedLanes,
    rotateTile,
    runFlow,
    resetBoard,
  };
}
