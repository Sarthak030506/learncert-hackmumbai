export { calculateCredibilityScore } from './engine.js';
export { calculateCompletion, mergeSegments } from './completion.js';
export { calculateEngagement } from './engagement.js';
export { calculateFocus } from './focus.js';
export {
  calculateSpeedPenalty,
  calculateSkipPenalty,
  calculateInactivityPenalty,
} from './penalties.js';
export { DEFAULT_WEIGHTS, SCORING_CONSTANTS } from './types.js';
export type { ScoringWeights, MergedSegment } from './types.js';
