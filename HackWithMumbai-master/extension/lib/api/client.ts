// Credify — API Client
// Typed HTTP client for communicating with the Credify backend

import { API_BASE_URL } from "~lib/constants"
import type { WatchSession } from "~types/session"
import type { ScoreBreakdown, UserAnalytics } from "~types/score"
import type { MintRequest, MintResponse } from "~types/certificate"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class CredifyApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  /**
   * Submit a completed watch session for server-side scoring.
   * Returns the verified score breakdown.
   */
  async submitSession(session: WatchSession): Promise<ScoreBreakdown> {
    const response = await this.post<ScoreBreakdown>(
      "/sessions/submit",
      session
    )
    return response
  }

  /**
   * Get aggregated analytics for a user.
   */
  async getAnalytics(userId: string): Promise<UserAnalytics> {
    const response = await this.get<UserAnalytics>(
      `/analytics/${encodeURIComponent(userId)}`
    )
    return response
  }

  /**
   * Check if a session is eligible for certificate minting.
   */
  async checkEligibility(
    userId: string,
    sessionId: string
  ): Promise<{ eligible: boolean; score: ScoreBreakdown }> {
    const response = await this.get<{
      eligible: boolean
      score: ScoreBreakdown
    }>(
      `/sessions/eligibility?userId=${encodeURIComponent(userId)}&sessionId=${encodeURIComponent(sessionId)}`
    )
    return response
  }

  /**
   * Request minting of a certificate NFT.
   */
  async mintCertificate(request: MintRequest): Promise<MintResponse> {
    const response = await this.post<MintResponse>(
      "/certificates/mint",
      request
    )
    return response
  }

  // ── Private HTTP helpers ──

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })

    return this.handleResponse<T>(response)
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    })

    return this.handleResponse<T>(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`
      try {
        const errorBody = (await response.json()) as ApiResponse<unknown>
        if (errorBody.error) {
          errorMessage = errorBody.error
        }
      } catch {
        // Response body wasn't JSON, use default message
      }
      throw new Error(errorMessage)
    }

    const json = (await response.json()) as ApiResponse<T>

    if (json.success === false) {
      throw new Error(json.error || "Unknown API error")
    }

    // Support both { success, data } envelope and direct response
    return (json.data ?? json) as T
  }
}

/** Singleton API client instance */
export const apiClient = new CredifyApiClient()

/** Create a new client with a custom base URL (for testing) */
export function createApiClient(baseUrl: string): CredifyApiClient {
  return new CredifyApiClient(baseUrl)
}
