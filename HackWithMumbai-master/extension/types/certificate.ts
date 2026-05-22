// Credify — Certificate Types
// Data structures for NFT certificate minting and tracking

export interface Certificate {
  /** Internal certificate ID (UUID) */
  id: string
  /** On-chain NFT token ID */
  tokenId: number
  /** Title of the video this certificate is for */
  videoTitle: string
  /** YouTube video ID */
  videoId: string
  /** Credibility score at time of minting */
  credibilityScore: number
  /** Completion percentage at time of minting */
  completionPercentage: number
  /** Unix timestamp (ms) when certificate was issued */
  issuedAt: number
  /** Blockchain transaction hash */
  transactionHash: string
  /** Current status of the certificate mint */
  status: "pending" | "minted" | "failed"
}

export interface MintRequest {
  /** User's internal ID */
  userId: string
  /** Session ID to mint certificate for */
  sessionId: string
  /** User's blockchain wallet address */
  walletAddress: string
}

export interface MintResponse {
  /** Whether the mint was successful */
  success: boolean
  /** Transaction hash if successful */
  transactionHash?: string
  /** Token ID if successful */
  tokenId?: number
  /** Error message if failed */
  error?: string
}
