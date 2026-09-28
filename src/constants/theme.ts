/**
 * ShapeCurrent — visual system.
 * Preset: OCEAN_FRESH (accent hexes tuned to the brief).
 * Style:  BENTO_GRID — equal-rhythm tiles, flat thin shadow, radius 16-20.
 */
export const THEME = {
  name: 'ocean-fresh',
  preset: 'OCEAN_FRESH',

  colors: {
    bg: '#EEF7FF',
    bgAlt: '#DCEDF7',
    bgDeep: '#CFE4F0',
    sunken: '#F4FAFE',
    surface: '#FFFFFF',

    deep1: '#012A45',
    deep2: '#0F3A52',
    deep3: '#14506B',

    primary: '#247BA0',
    primaryLite: '#2E97BF',
    accent: '#70C1B3',
    warn: '#FFB347',
    danger: '#E4695B',
    channel: '#B8D6E6',

    text: '#2D3142',
    textSub: '#5B6275',
    textMuted: '#8A93A8',
    onDark: '#EAF6FF',

    border: 'rgba(36,123,160,0.14)',
    borderSoft: 'rgba(36,123,160,0.10)',
  },

  gradients: {
    primary: ['#247BA0', '#2E97BF'] as string[],
    deep: ['#012A45', '#0F3A52', '#14506B'] as string[],
    menu: ['#EEF7FF', '#DCEDF7', '#CFE4F0'] as string[],
    win: ['#EEF7FF', '#D6EAF5'] as string[],
    lose: ['#EEF7FF', '#E6E3EE'] as string[],
    bar: ['#70C1B3', '#FFB347'] as string[],
  },

  radius: { sm: 10, md: 14, lg: 16, xl: 20, xxl: 24, pill: 100 },

  shadow: {
    tile: {
      shadowColor: '#1B4B63',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    card: {
      shadowColor: '#1B4B63',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 7,
    },
    cta: {
      shadowColor: '#247BA0',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
      elevation: 9,
    },
  },

  spring: {
    press: { tension: 300, friction: 12 },
    enter: { tension: 70, friction: 9 },
    pop: { tension: 220, friction: 8 },
  },
} as const;

export const SHAPE_COLORS = {
  circle: '#247BA0',
  square: '#70C1B3',
  triangle: '#FFB347',
} as const;

export type ShapeKind = keyof typeof SHAPE_COLORS;
