// Credify — Client-Side Scorer
// Lightweight local scoring for instant feedback before server verification
//
// This runs in the extension to give users a preview score.
// The authoritative score is always computed server-side.

import type { WatchSession } from "~types/session"
import type { ScoreBreakdown } from "~types/score"
import {
  SPEED_PENALTY_THRESHOLD,
  MAX_SPEED_PENALTY,
  MAX_SEEK_PENALTY,
  MAX_INACTIVITY_PENALTY,
  SCORE_WEIGHTS
} from "~lib/constants"

/**
 * Compute a preview credibility score from a watch session.
 * Returns a full ScoreBreakdown for UI display.
 */
export function computePreviewScore(session: WatchSession): ScoreBreakdown {
  const completion = computeCompletion(session)
  const engagement = computeEngagement(session)
  const focus = computeFocus(session)
  const speedPenalty = computeSpeedPenalty(session)
  const skipPenalty = computeSkipPenalty(session)
  const inactivityPenalty = computeInactivityPenalty(session)

  // Weighted composite: positive factors minus penalties
  const positiveScore =
    completion * SCORE_WEIGHTS.COMPLETION +
    engagement * SCORE_WEIGHTS.ENGAGEMENT +
    focus * SCORE_WEIGHTS.FOCUS

  const totalPenalty =
    speedPenalty * SCORE_WEIGHTS.SPEED_PENALTY +
    skipPenalty * SCORE_WEIGHTS.SKIP_PENALTY +
    inactivityPenalty * SCORE_WEIGHTS.INACTIVITY_PENALTY

  // Final score: scale positive to 100, then subtract penalties
  const rawScore = positiveScore * 100 - totalPenalty * 100
  const finalScore = clamp(Math.round(rawScore), 0, 100)

  return {
    completion: Math.round(completion * 100),
    engagement: Math.round(engagement * 100),
    focus: Math.round(focus * 100),
    speedPenalty: Math.round(speedPenalty * 100),
    skipPenalty: Math.round(skipPenalty * 100),
    inactivityPenalty: Math.round(inactivityPenalty * 100),
    finalScore
  }
}

// ── Sub-score computations (all return 0-1) ──

/** Completion: ratio of unique video time watched vs total duration */
function computeCompletion(session: WatchSession): number {
  if (session.video.duration === 0) return 0
  const ratio = session.totalWatchTime / session.video.duration
  return clamp(ratio, 0, 1)
}

/**
 * Engagement: penalizes excessive seeking.
 * Fewer seeks relative to video length = higher engagement.
 */
function computeEngagement(session: WatchSession): number {
  if (session.video.duration === 0) return 1

  const seekCount = session.seekEvents.length
  // Allow ~1 seek per 2 minutes of video as "normal"
  const expectedSeeks = Math.max(1, session.video.duration / 120)
  const seekRatio = seekCount / expectedSeeks

  if (seekRatio <= 1) return 1 // Normal seeking
  if (seekRatio >= 5) return 0 // Excessive seeking

  // Linear interpolation between 1 and 5x expected seeks
  return clamp(1 - (seekRatio - 1) / 4, 0, 1)
}

/**
 * Focus: ratio of active tab time to total session time.
 * Watching in background significantly reduces score.
 */
function computeFocus(session: WatchSession): number {
  const totalTime = session.tabActiveTime + session.tabInactiveTime
  if (totalTime === 0) return 1
  return clamp(session.tabActiveTime / totalTime, 0, 1)
}

/**
 * Speed penalty: penalizes watching at speeds above threshold.
 * No penalty at 1x, max penalty at 3x+.
 */
function computeSpeedPenalty(session: WatchSession): number {
  if (session.averageSpeed <= SPEED_PENALTY_THRESHOLD) return 0

  // Linear ramp from threshold to 3x
  const excess = session.averageSpeed - SPEED_PENALTY_THRESHOLD
  const maxExcess = 3 - SPEED_PENALTY_THRESHOLD
  const ratio = clamp(excess / maxExcess, 0, 1)

  return (ratio * MAX_SPEED_PENALTY) / 100
}

/**
 * Skip penalty: penalizes large forward seeks that skip content.
 * Only counts forward seeks that skip > 30 seconds.
 */
function computeSkipPenalty(session: WatchSession): number {
  if (session.video.duration === 0) return 0

  const significantSkips = session.seekEvents.filter(
    (e) => e.direction === "forward" && e.toTime - e.fromTime > 30
  )

  // Total seconds skipped as fraction of video
  const totalSkipped = significantSkips.reduce(
    (sum, e) => sum + (e.toTime - e.fromTime),
    0
  )
  const skipRatio = totalSkipped / session.video.duration

  return clamp((skipRatio * MAX_SEEK_PENALTY) / 100, 0, MAX_SEEK_PENALTY / 100)
}

/**
 * Inactivity penalty: penalizes long periods of tab inactivity.
 */
function computeInactivityPenalty(session: WatchSession): number {
  const totalTime = session.tabActiveTime + session.tabInactiveTime
  if (totalTime === 0) return 0

  const inactiveRatio = session.tabInactiveTime / totalTime

  // No penalty below 20% inactive time
  if (inactiveRatio <= 0.2) return 0

  // Linear ramp from 20% to 80% inactive
  const excess = inactiveRatio - 0.2
  const ratio = clamp(excess / 0.6, 0, 1)

  return (ratio * MAX_INACTIVITY_PENALTY) / 100
}

// ── Utility ──

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
