/**
 * ShapeCurrent — flow routing puzzle.
 * App.tsx is the state machine only; gameplay lives in src/screens/GameScreen.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import { MAX_LEVEL } from './src/constants/config';
import { THEME } from './src/constants/theme';
import { RoundSummary } from './src/hooks/useFlowEngine';

type Screen = 'loader' | 'menu' | 'game' | 'gameover';

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [level, setLevel] = useState(1);
  const [solvedCount, setSolvedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [challenge, setChallenge] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [last, setLast] = useState<RoundSummary | null>(null);
  const [round, setRound] = useState(0);

  const begin = useCallback(() => {
    setRound(r => r + 1);
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((summary: RoundSummary) => {
    setLast(summary);
    if (summary.won) {
      setSolvedCount(n => n + 1);
      setStreak(s => s + 1);
      setLevel(n => (n >= MAX_LEVEL ? 1 : n + 1));
    } else {
      setStreak(0);
    }
    setScreen('gameover');
  }, []);

  const playAgain = useCallback(() => {
    setRound(r => r + 1);
    setScreen('game');
  }, []);

  const toMenu = useCallback(() => setScreen('menu'), []);

  return (
    <View style={styles.root}>
      {screen === 'loader' ? <LoaderScreen onDone={() => setScreen('menu')} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          level={level}
          solvedCount={solvedCount}
          challenge={challenge}
          hintOpen={hintOpen}
          onToggleChallenge={() => setChallenge(v => !v)}
          onToggleHint={() => setHintOpen(v => !v)}
          onBegin={begin}
        />
      ) : null}

      {screen === 'game' ? (
        <GameScreen
          key={`round-${round}-${level}`}
          level={level}
          challenge={challenge}
          onExit={toMenu}
          onGameOver={handleGameOver}
        />
      ) : null}

      {screen === 'gameover' ? (
        <GameOverScreen
          won={last ? last.won : false}
          docked={last ? last.docked : 0}
          total={3}
          used={last ? last.used : 0}
          level={last ? last.level : level}
          streak={streak}
          onPlayAgain={playAgain}
          onMenu={toMenu}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.bg },
});
