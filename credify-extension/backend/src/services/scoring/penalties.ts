import type { WatchSession } from '../../types/session.js';
import { SCORING_CONSTANTS } from './types.js';

/**
 * Speed penalty (0 – MAX_SPEED_PENALTY).
 *
 * - averageSpeed <= 1.5 → no penalty
 * - averageSpeed 1.5–2.0 → scales 0–5
 * - averageSpeed 2.0–3.0 → scales 5–10
 * - averageSpeed >= 3.0  → MAX_SPEED_PENALTY
 */
export function calculateSpeedPenalty(session: WatchSession): number {
  const { averageSpeed } = session;

  if (averageSpeed <= SCORING_CONSTANTS.SPEED_PENALTY_THRESHOLD) return 0;

  if (averageSpeed <= 2.0) {
    // Linear interpolation: 1.5→0, 2.0→5
    const t = (averageSpeed - 1.5) / 0.5;
    return Math.round(t * 5 * 100) / 100;
  }

  if (averageSpeed <= 3.0) {
    // Linear interpolation: 2.0→5, 3.0→10
    const t = (averageSpeed - 2.0) / 1.0;
    return Math.round((5 + t * 5) * 100) / 100;
  }

  return SCORING_CONSTANTS.MAX_SPEED_PENALTY;
}

/**
 * Skip penalty (0 – MAX_SKIP_PENALTY).
 *
 * Each forward seek that jumps > SKIP_SEEK_THRESHOLD seconds adds 1 point.
 */
export function calculateSkipPenalty(session: WatchSession): number {
  const forwardSkips = session.seekEvents.filter(
    (e) =>
      e.direction === 'forward' &&
      (e.toTime - e.fromTime) > SCORING_CONSTANTS.SKIP_SEEK_THRESHOLD,
  );

  return Math.min(forwardSkips.length, SCORING_CONSTANTS.MAX_SKIP_PENALTY);
}

/**
 * Inactivity penalty (0 – MAX_INACTIVITY_PENALTY).
 *
 * Ratio of tab-inactive time to total session time, scaled to max points.
 */
export function calculateInactivityPenalty(session: WatchSession): number {
  const totalSessionTime = session.tabActiveTime + session.tabInactiveTime;

  if (totalSessionTime <= 0) return 0;

  const inactivityRatio = session.tabInactiveTime / totalSessionTime;
  const penalty = inactivityRatio * SCORING_CONSTANTS.MAX_INACTIVITY_PENALTY;

  return Math.round(Math.min(penalty, SCORING_CONSTANTS.MAX_INACTIVITY_PENALTY) * 100) / 100;
}
