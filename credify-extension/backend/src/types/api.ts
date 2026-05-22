import type { ScoreBreakdown } from './score.js';

// ─── API Request Bodies ──────────────────────────────────────────────

export interface IngestSessionRequest {
  session: import('./session.js').WatchSession;
}

export interface CalculateScoreRequest {
  userId: string;
  sessionId: string;
}

export interface MintCertificateRequest {
  userId: string;
  sessionId: string;
  userAddress: string;
}

// ─── API Response Bodies ─────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: number;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Certificate Types ───────────────────────────────────────────────

export interface CertificateRecord {
  id: string;
  userId: string;
  sessionId: string;
  videoId: string;
  score: ScoreBreakdown;
  txHash: string;
  sessionHash: string;
  mintedAt: number;
  contractAddress: string;
  chainId: number;
}

export interface MintResult {
  certificate: CertificateRecord;
  transactionHash: string;
}

// ─── API Error Class ─────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
