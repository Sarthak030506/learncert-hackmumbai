// Credify — Messaging Types
// Type-safe message request/response pairs for @plasmohq/messaging

import type { WatchSession } from "./session"
import type { ScoreBreakdown, UserAnalytics } from "./score"
import type { MintRequest, MintResponse } from "./certificate"

// ── session-update ──
export interface SessionUpdateRequest {
  session: WatchSession
}

export interface SessionUpdateResponse {
  success: boolean
  error?: string
}

// ── get-analytics ──
export interface GetAnalyticsRequest {
  userId: string
}

export interface GetAnalyticsResponse {
  success: boolean
  analytics?: UserAnalytics
  error?: string
}

// ── mint-certificate ──
export interface MintCertificateRequest extends MintRequest {}

export interface MintCertificateResponse extends MintResponse {}

// ── get-score ──
export interface GetScoreRequest {
  sessionId: string
}

export interface GetScoreResponse {
  success: boolean
  score?: ScoreBreakdown
  error?: string
}
