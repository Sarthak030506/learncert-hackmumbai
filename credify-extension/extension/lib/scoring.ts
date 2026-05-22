// Credify — Client-Side Scoring Engine
// Computes a real credibility score from session data

import type { WatchSession, WatchSegment } from "~types/session"
import type { ScoreBreakdown } from "~types/score"
import {
  SCORE_WEIGHTS,
  SPEED_PENALTY_THRESHOLD,
  MAX_SPEED_PENALTY,
  MAX_SEEK_PENALTY,
  MAX_INACTIVITY_PENALTY
} from "~lib/constants"

/**
 * Calculate a full ScoreBreakdown from a WatchSession.
 * Returns values in the 0-100 range.
 */
export function calculateScoreBreakdown(session: WatchSession): ScoreBreakdown {
  const duration = session.video?.duration || 1

  // ── 1. Completion (0-100) ──
  const rawCompletion = (session.totalWatchTime / duration) * 100
  const completion = Math.min(rawCompletion, 100)

  // ── 2. Engagement (0-100) ──
  // Measures how linearly the user watched without excessive seeking
  const seekCount = session.seekEvents?.length || 0
  const seekPenaltyRaw = seekCount * 5 // each seek costs 5 points
  const engagement = Math.max(0, 100 - seekPenaltyRaw)

  // ── 3. Focus (0-100) ──
  // Ratio of tab-active time vs total session wall-clock time
  const totalTime = session.tabActiveTime + session.tabInactiveTime
  const focusRatio = totalTime > 0 ? session.tabActiveTime / totalTime : 1
  const focus = Math.round(focusRatio * 100)

  // ── 4. Speed Penalty (0-MAX_SPEED_PENALTY) ──
  // Penalty scales linearly from SPEED_PENALTY_THRESHOLD to 3x
  let speedPenalty = 0
  if (session.averageSpeed > SPEED_PENALTY_THRESHOLD) {
    const excessSpeed = session.averageSpeed - 1
    speedPenalty = Math.min(
      Math.round(excessSpeed * (MAX_SPEED_PENALTY / 2)),
      MAX_SPEED_PENALTY
    )
  }

  // ── 5. Skip Penalty (0-MAX_SEEK_PENALTY) ──
  // Forward seeks that skip content
  const forwardSeeks = (session.seekEvents || []).filter(e => e.direction === "forward")
  const skipPenalty = Math.min(forwardSeeks.length * 6, MAX_SEEK_PENALTY)

  // ── 6. Inactivity Penalty (0-MAX_INACTIVITY_PENALTY) ──
  const inactiveRatio = totalTime > 0 ? session.tabInactiveTime / totalTime : 0
  const inactivityPenalty = Math.min(
    Math.round(inactiveRatio * MAX_INACTIVITY_PENALTY * 2),
    MAX_INACTIVITY_PENALTY
  )

  // ── Composite Score ──
  const positiveScore =
    completion * SCORE_WEIGHTS.COMPLETION +
    engagement * SCORE_WEIGHTS.ENGAGEMENT +
    focus * SCORE_WEIGHTS.FOCUS

  const totalPenalty =
    speedPenalty * SCORE_WEIGHTS.SPEED_PENALTY +
    skipPenalty * SCORE_WEIGHTS.SKIP_PENALTY +
    inactivityPenalty * SCORE_WEIGHTS.INACTIVITY_PENALTY

  const finalScore = Math.max(0, Math.min(100, Math.round(positiveScore - totalPenalty)))

  return {
    completion: Math.round(completion),
    engagement: Math.round(engagement),
    focus,
    speedPenalty,
    skipPenalty,
    inactivityPenalty,
    finalScore
  }
}

/**
 * Compute the unique video-time coverage percentage from watched segments.
 * This is more accurate than totalWatchTime / duration when there are overlaps.
 */
export function computeUniqueCompletionPct(session: WatchSession): number {
  const duration = session.video?.duration
  if (!duration || duration === 0) return 0

  const segments: WatchSegment[] = session.watchedSegments || []
  if (segments.length === 0) {
    // Fallback to totalWatchTime if no segments tracked yet
    return Math.min((session.totalWatchTime / duration) * 100, 100)
  }

  // Merge overlapping segments
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: WatchSegment[] = [{ ...sorted[0] }]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }

  const uniqueWatched = merged.reduce((t, s) => t + (s.end - s.start), 0)
  return Math.min((uniqueWatched / duration) * 100, 100)
}
