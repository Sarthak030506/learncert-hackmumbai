// Credify — Constants
// Central configuration for the extension

/** Backend API base URL */
export const API_BASE_URL =
  process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3001/api"

/** Storage keys used by @plasmohq/storage */
export const STORAGE_KEYS = {
  SESSIONS: "credify:sessions",
  ACTIVE_SESSION: "credify:active-session",
  USER_ID: "credify:user-id",
  WALLET_ADDRESS: "credify:wallet-address",
  ANALYTICS_CACHE: "credify:analytics-cache",
  CERTIFICATES: "credify:certificates",
  SETTINGS: "credify:settings",
  OVERLAY_ENABLED: "credify:overlay-enabled"
} as const

/** Sync interval for pushing session data to background (ms) */
export const SYNC_INTERVAL_MS = 30_000

/** Tracking interval for video currentTime sampling (ms) */
export const TRACKING_INTERVAL_MS = 1_000

/** Seek detection threshold — if |currentTime - expectedTime| > this, it's a seek (seconds) */
export const SEEK_THRESHOLD_SECONDS = 2

/** Maximum sessions to persist in storage */
export const MAX_STORED_SESSIONS = 100

// ── Scoring thresholds ──

/** Minimum completion percentage (0-1) to be eligible for a certificate */
export const MIN_COMPLETION_FOR_CERT = 0.5

/** Minimum credibility score (0-100) to be eligible for a certificate */
export const MIN_SCORE_FOR_CERT = 30

/** Speed above which a penalty is applied */
export const SPEED_PENALTY_THRESHOLD = 1.5

/** Maximum penalty multiplier for speed (at 3x speed) */
export const MAX_SPEED_PENALTY = 40

/** Maximum penalty for excessive seeking */
export const MAX_SEEK_PENALTY = 30

/** Maximum penalty for tab inactivity */
export const MAX_INACTIVITY_PENALTY = 25

// ── Scoring weights ──
export const SCORE_WEIGHTS = {
  COMPLETION: 0.35,
  ENGAGEMENT: 0.25,
  FOCUS: 0.20,
  SPEED_PENALTY: 0.10,
  SKIP_PENALTY: 0.05,
  INACTIVITY_PENALTY: 0.05
} as const

/** Keywords that suggest educational content */
export const EDUCATIONAL_KEYWORDS = [
  "tutorial",
  "course",
  "lecture",
  "lesson",
  "learn",
  "how to",
  "guide",
  "explained",
  "introduction",
  "fundamentals",
  "basics",
  "advanced",
  "masterclass",
  "workshop",
  "training",
  "bootcamp",
  "certification",
  "exam prep",
  "study",
  "class",
  "chapter",
  "module",
  "programming",
  "coding",
  "development",
  "engineering",
  "science",
  "math",
  "physics",
  "chemistry",
  "biology",
  "history",
  "economics",
  "finance",
  "machine learning",
  "deep learning",
  "data science",
  "web development",
  "blockchain",
  "solidity",
  "ethereum",
  "crypto"
] as const
