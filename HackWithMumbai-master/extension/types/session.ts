// Credify — Session & Tracking Types
// Core data structures for YouTube watch session tracking

export interface SeekEvent {
  /** Unix timestamp (ms) when seek occurred */
  timestamp: number
  /** Video time (seconds) before seek */
  fromTime: number
  /** Video time (seconds) after seek */
  toTime: number
  /** Direction of the seek */
  direction: "forward" | "backward"
}

export interface SpeedChange {
  /** Unix timestamp (ms) when speed changed */
  timestamp: number
  /** Playback rate before change */
  fromSpeed: number
  /** Playback rate after change */
  toSpeed: number
}

export interface FocusEvent {
  /** Unix timestamp (ms) when focus event occurred */
  timestamp: number
  /** Whether the tab gained or lost focus */
  type: "focus" | "blur"
}

export interface WatchSegment {
  /** Start time in video (seconds) */
  start: number
  /** End time in video (seconds) */
  end: number
}

export interface VideoMetadata {
  /** YouTube video ID (e.g. "dQw4w9WgXcQ") */
  videoId: string
  /** Video title */
  title: string
  /** Channel name */
  channelName: string
  /** Video duration in seconds */
  duration: number
  /** Full URL of the video page */
  url: string
}

export interface WatchSession {
  /** Unique session identifier (UUID) */
  id: string
  /** User ID (wallet address or internal ID) */
  userId: string
  /** Video metadata snapshot */
  video: VideoMetadata
  /** Unix timestamp (ms) when session started */
  startedAt: number
  /** Unix timestamp (ms) when session ended, null if active */
  endedAt: number | null
  /** Ordered list of watched video segments */
  watchedSegments: WatchSegment[]
  /** Total seconds of unique video content watched */
  totalWatchTime: number
  /** All seek events during this session */
  seekEvents: SeekEvent[]
  /** All playback speed changes */
  speedChanges: SpeedChange[]
  /** All tab focus/blur events */
  focusEvents: FocusEvent[]
  /** Number of times the user paused */
  pauseCount: number
  /** Weighted average playback speed */
  averageSpeed: number
  /** Maximum playback speed used */
  maxSpeed: number
  /** Total time (seconds) the tab was in focus */
  tabActiveTime: number
  /** Total time (seconds) the tab was in background */
  tabInactiveTime: number
  /** Whether the video was watched to completion */
  isCompleted: boolean
}

export type SessionStatus = "active" | "paused" | "completed" | "abandoned"
