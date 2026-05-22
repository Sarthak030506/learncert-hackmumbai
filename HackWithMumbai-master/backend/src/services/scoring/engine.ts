import type { WatchSession } from '../../types/session.js';
import type { ScoreBreakdown } from '../../types/score.js';
import { DEFAULT_WEIGHTS, SCORING_CONSTANTS } from './types.js';
import { calculateCompletion } from './completion.js';
import { calculateEngagement } from './engagement.js';
import { calculateFocus } from './focus.js';
import {
  calculateSpeedPenalty,
  calculateSkipPenalty,
  calculateInactivityPenalty,
} from './penalties.js';

/**
 * The main scoring engine.
 *
 * 1. Compute each sub-score (0–100).
 * 2. Weighted sum: completion×0.35 + engagement×0.25 + focus×0.20
 *    (remaining 0.20 weight is the "penalty budget" — a perfect session
 *     can reach 80 from the three pillars; the 20 bonus points come from
 *     having zero penalties, pushing the max to 100).
 * 3. Subtract penalties (capped at MAX_TOTAL_PENALTY).
 * 4. Clamp result to [0, 100].
 */
export function calculateCredibilityScore(session: WatchSession): ScoreBreakdown {
  const completion = calculateCompletion(session);
  const engagement = calculateEngagement(session);
  const focus = calculateFocus(session);

  const speedPenalty = calculateSpeedPenalty(session);
  const skipPenalty = calculateSkipPenalty(session);
  const inactivityPenalty = calculateInactivityPenalty(session);

  const totalPenalty = Math.min(
    speedPenalty + skipPenalty + inactivityPenalty,
    SCORING_CONSTANTS.MAX_TOTAL_PENALTY,
  );

  const weightedBase =
    completion * DEFAULT_WEIGHTS.completion +
    engagement * DEFAULT_WEIGHTS.engagement +
    focus * DEFAULT_WEIGHTS.focus;

  // Add the penalty-free bonus (up to 20 points when penalties are 0)
  const penaltyBudget = 20;
  const bonusFromNoPenalty = penaltyBudget - totalPenalty;

  const rawScore = weightedBase + bonusFromNoPenalty;
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)) * 100) / 100;

  return {
    completion: Math.round(completion * 100) / 100,
    engagement: Math.round(engagement * 100) / 100,
    focus: Math.round(focus * 100) / 100,
    speedPenalty,
    skipPenalty,
    inactivityPenalty,
    finalScore,
  };
}
