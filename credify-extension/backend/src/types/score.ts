export interface ScoreBreakdown {
  completion: number;
  engagement: number;
  focus: number;
  speedPenalty: number;
  skipPenalty: number;
  inactivityPenalty: number;
  finalScore: number;
}

export interface EligibilityResult {
  eligible: boolean;
  score: ScoreBreakdown;
  reasons: string[];
}
