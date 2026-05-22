import type { WatchSession } from '../../types/session.js';
import { SCORING_CONSTANTS } from './types.js';

/**
 * Calculate engagement score (0–100).
 *
 * Measures viewing consistency:
 * - What fraction of segments are >= IDEAL_SEGMENT_LENGTH seconds
 * - Penalises excessive pausing
 */
export function calculateEngagement(session: WatchSession): number {
  const { watchedSegments, pauseCount } = session;

  if (watchedSegments.length === 0) return 0;

  // ── Segment consistency ────────────────────────────────────────────
  const segmentLengths = watchedSegments.map((s) => s.end - s.start);
  const goodSegments = segmentLengths.filter(
    (len) => len >= SCORING_CONSTANTS.IDEAL_SEGMENT_LENGTH,
  ).length;

  // Ratio of "good" continuous segments
  const consistencyRatio = goodSegments / watchedSegments.length;

  // Base engagement is consistency ratio * 100
  let score = consistencyRatio * 100;

  // If there are no "ideal" segments but there ARE watched segments,
  // give partial credit based on average segment length relative to ideal
  if (goodSegments === 0 && segmentLengths.length > 0) {
    const avgLength =
      segmentLengths.reduce((sum, l) => sum + l, 0) / segmentLengths.length;
    score = Math.min((avgLength / SCORING_CONSTANTS.IDEAL_SEGMENT_LENGTH) * 80, 80);
  }

  // ── Pause penalty ──────────────────────────────────────────────────
  if (pauseCount > SCORING_CONSTANTS.MAX_PAUSES_BEFORE_PENALTY) {
    const excessPauses = pauseCount - SCORING_CONSTANTS.MAX_PAUSES_BEFORE_PENALTY;
    // Each excess pause reduces score by 2 points, up to 20
    const pausePenalty = Math.min(excessPauses * 2, 20);
    score = Math.max(score - pausePenalty, 0);
  }

  return Math.round(score * 100) / 100;
}
