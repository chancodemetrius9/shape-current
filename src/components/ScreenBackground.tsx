import React, { useMemo } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import { THEME } from '../constants/theme';
import { makeRng } from '../utils/rng';

type Variant = 'loader' | 'menu' | 'game' | 'win' | 'lose';

type Props = {
  variant: Variant;
  source?: ImageSourcePropType;
  children: React.ReactNode;
};

const GRADIENTS: Record<Variant, string[]> = {
  loader: THEME.gradients.deep,
  menu: THEME.gradients.menu,
  game: ['#F3FAFF', '#E4F1FA', '#D8EAF5'],
  win: THEME.gradients.win,
  lose: THEME.gradients.lose,
};

const OPACITY: Record<Variant, number> = {
  loader: 0.9,
  menu: 0.9,
  game: 0.94,
  win: 0.9,
  lose: 0.92,
};

/**
 * Builds a field of tiny dashes as ONE svg path. A path costs a single native
 * node where thousands of <Circle> elements would cost thousands, and the fine
 * speckle it leaves is what gives the dark loader its own visual weight.
 */
function speckle(seed: number, count: number): string {
  const rng = makeRng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round(rng.next() * SCREEN_W * 10) / 10;
    const y = Math.round(rng.next() * SCREEN_H * 10) / 10;
    d += `M${x} ${y}h0.8`;
  }
  return d;
}

export default function ScreenBackground({ variant, source, children }: Props) {
  const isLoader = variant === 'loader';

  const grain = useMemo(() => {
    if (isLoader) {
      return [
        { d: speckle(0x1f2a3b, 620), color: 'rgba(255,255,255,0.34)', w: 1.5 },
        { d: speckle(0x77c3b1, 560), color: 'rgba(112,193,179,0.40)', w: 1.7 },
        { d: speckle(0x2e97bf, 540), color: 'rgba(120,196,232,0.34)', w: 1.4 },
        { d: speckle(0xffb347, 380), color: 'rgba(255,179,71,0.30)', w: 1.6 },
      ];
    }
    return [{ d: speckle(0x51a2c4, 220), color: 'rgba(36,123,160,0.10)', w: 1.4 }];
  }, [isLoader]);

  const decor = (
    <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
      {isLoader ? (
        <>
          <Circle cx={SCREEN_W * 0.18} cy={SCREEN_H * 0.16} r={180} fill="#70C1B3" opacity={0.1} />
          <Circle cx={SCREEN_W * 0.9} cy={SCREEN_H * 0.46} r={150} fill="#247BA0" opacity={0.12} />
          <Circle cx={SCREEN_W * 0.5} cy={SCREEN_H * 0.92} r={120} fill="#FFB347" opacity={0.08} />
        </>
      ) : (
        <>
          <Path
            d={`M -40 ${SCREEN_H * 0.22} C ${SCREEN_W * 0.4} ${SCREEN_H * 0.3}, ${SCREEN_W * 0.55} ${SCREEN_H * 0.58}, ${SCREEN_W + 40} ${SCREEN_H * 0.68}`}
            stroke="rgba(36,123,160,0.10)"
            strokeWidth={26}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M -40 ${SCREEN_H * 0.4} C ${SCREEN_W * 0.35} ${SCREEN_H * 0.5}, ${SCREEN_W * 0.6} ${SCREEN_H * 0.78}, ${SCREEN_W + 40} ${SCREEN_H * 0.88}`}
            stroke="rgba(112,193,179,0.12)"
            strokeWidth={20}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={SCREEN_W * 0.86} cy={SCREEN_H * 0.14} r={130} fill="#70C1B3" opacity={0.1} />
        </>
      )}
      {grain.map((g, i) => (
        <Path
          key={`g${i}`}
          d={g.d}
          stroke={g.color}
          strokeWidth={g.w}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </Svg>
  );

  const body = (
    <>
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: isLoader ? 0.5 : 0, y: 0 }}
        end={{ x: isLoader ? 0.5 : 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: OPACITY[variant] }]}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {decor}
      </View>
      {children}
    </>
  );

  if (source) {
    return (
      <ImageBackground source={source} resizeMode="cover" style={styles.root}>
        {body}
      </ImageBackground>
    );
  }
  return <View style={[styles.root, { backgroundColor: GRADIENTS[variant][0] }]}>{body}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', height: '100%' },
});
