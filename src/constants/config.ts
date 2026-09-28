import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export { SCREEN_W, SCREEN_H };

/** Brand splash length. Exactly 8000 — shorter values race the capture window. */
export const LOADER_DURATION_MS = 8000;

/** Board geometry — see CLAUDE.md rules 4-5. */
export const COLS = 5;
export const ROWS = 6;
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / COLS);
export const BOARD_W = TILE * COLS + 2 * BOARD_FRAME;
export const BOARD_H = TILE * ROWS + 2 * BOARD_FRAME;

/** Flow animation. */
export const TILE_TRAVEL_MS = 180;
export const ROTATE_MS = 180;

/**
 * Minimum wall-clock length of the `flowing` phase before the result screen
 * appears. The headless UI runner screenshots ~4s after pressing GO, so the
 * result card must already be on screen by then — but the flow still needs to
 * read as motion, hence ~2.9s rather than an instant cut.
 */
export const FLOW_RESOLVE_MS = 2900;

/** Backstops so a passive runner always reaches a result. */
export const IDLE_RESULT_MS = 40000;
export const ENGAGED_RESULT_MS = 9000;
export const MAX_ROUND_MS = 50000;

/** Move budget = required rotations + slack. */
export const SLACK_NORMAL = 6;
export const SLACK_CHALLENGE = 2;

export const MAX_LEVEL = 8;
