/** Internal types for the scoring engine. */

export interface MergedSegment {
  start: number;
  end: number;
}

export interface ScoringWeights {
  completion: number;
  engagement: number;
  focus: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  completion: 0.35,
  engagement: 0.25,
  focus: 0.20,
};

/** Thresholds & caps */
export const SCORING_CONSTANTS = {
  /** Minimum segment length (seconds) considered "good" continuous watching */
  IDEAL_SEGMENT_LENGTH: 60,
  /** Max pause count before engagement score starts degrading */
  MAX_PAUSES_BEFORE_PENALTY: 10,
  /** Speed threshold above which a penalty kicks in */
  SPEED_PENALTY_THRESHOLD: 1.5,
  /** Maximum speed penalty points */
  MAX_SPEED_PENALTY: 10,
  /** Minimum forward seek distance (seconds) to count as a skip */
  SKIP_SEEK_THRESHOLD: 30,
  /** Maximum skip penalty points */
  MAX_SKIP_PENALTY: 5,
  /** Maximum inactivity penalty points */
  MAX_INACTIVITY_PENALTY: 5,
  /** Maximum total penalty that can be subtracted */
  MAX_TOTAL_PENALTY: 20,
} as const;
