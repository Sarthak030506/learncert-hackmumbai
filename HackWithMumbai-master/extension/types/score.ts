// Credify — Scoring Types
// Data structures for credibility score computation and analytics

export interface ScoreBreakdown {
  /** 0-100: how much of the video was watched */
  completion: number
  /** 0-100: engagement quality (low seeking, steady watching) */
  engagement: number
  /** 0-100: tab focus / attention score */
  focus: number
  /** 0-100: penalty for watching at high speed */
  speedPenalty: number
  /** 0-100: penalty for excessive skipping/seeking */
  skipPenalty: number
  /** 0-100: penalty for tab inactivity during video */
  inactivityPenalty: number
  /** 0-100: final composite credibility score */
  finalScore: number
}

export interface UserAnalytics {
  /** Total watch time across all sessions (seconds) */
  totalWatchTime: number
  /** Number of videos watched to >= 90% */
  videosCompleted: number
  /** Average credibility score across all sessions */
  averageScore: number
  /** Current daily streak */
  currentStreak: number
  /** Summary of recent sessions */
  sessions: SessionSummary[]
}

export interface SessionSummary {
  /** YouTube video ID */
  videoId: string
  /** Video title */
  videoTitle: string
  /** Credibility score for this session */
  score: number
  /** Percentage of video completed (0-100) */
  completionPct: number
  /** Unix timestamp (ms) when this session occurred */
  watchedAt: number
}
