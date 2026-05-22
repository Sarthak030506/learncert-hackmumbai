// Credify — Engagement Monitor
// Tracks video playback behavior: segments watched, seeks, speed changes, pauses

import type {
  SeekEvent,
  SpeedChange,
  WatchSegment
} from "~types/session"
import {
  SEEK_THRESHOLD_SECONDS,
  TRACKING_INTERVAL_MS
} from "~lib/constants"

export class EngagementMonitor {
  private video: HTMLVideoElement
  private isRunning = false

  // Tracking state
  private lastTime = 0
  private lastTimestamp = 0
  private currentSegmentStart: number | null = null

  // Collected data
  private segments: WatchSegment[] = []
  private seeks: SeekEvent[] = []
  private speeds: SpeedChange[] = []
  private pauses = 0
  private currentSpeed: number
  private maxSpeed: number
  private speedWeightedTime = 0
  private totalTimeAtSpeed = 0

  // Interval handle
  private trackingInterval: ReturnType<typeof setInterval> | null = null

  // Bound listeners for proper cleanup
  private boundOnRateChange: () => void
  private boundOnPause: () => void
  private boundOnPlay: () => void
  private boundOnSeeking: () => void
  private boundOnSeeked: () => void
  private boundOnEnded: () => void

  constructor(video: HTMLVideoElement) {
    this.video = video
    this.currentSpeed = video.playbackRate
    this.maxSpeed = video.playbackRate

    // Bind all handlers
    this.boundOnRateChange = this.onRateChange.bind(this)
    this.boundOnPause = this.onPause.bind(this)
    this.boundOnPlay = this.onPlay.bind(this)
    this.boundOnSeeking = this.onSeeking.bind(this)
    this.boundOnSeeked = this.onSeeked.bind(this)
    this.boundOnEnded = this.onEnded.bind(this)
  }

  /** Start monitoring video engagement */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true

    this.lastTime = this.video.currentTime
    this.lastTimestamp = Date.now()

    // Attach event listeners
    this.video.addEventListener("ratechange", this.boundOnRateChange)
    this.video.addEventListener("pause", this.boundOnPause)
    this.video.addEventListener("play", this.boundOnPlay)
    this.video.addEventListener("seeking", this.boundOnSeeking)
    this.video.addEventListener("seeked", this.boundOnSeeked)
    this.video.addEventListener("ended", this.boundOnEnded)

    // Start time-based tracking interval
    this.trackingInterval = setInterval(
      () => this.onTrackingTick(),
      TRACKING_INTERVAL_MS
    )

    // If the video is already playing, begin a segment
    if (!this.video.paused) {
      this.currentSegmentStart = this.video.currentTime
    }
  }

  /** Stop monitoring (preserves data) */
  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false

    this.finalizeCurrentSegment()
    this.removeListeners()

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }
  }

  /** Permanently destroy the monitor — cleans up everything */
  destroy(): void {
    this.stop()
    this.segments = []
    this.seeks = []
    this.speeds = []
    this.pauses = 0
    this.speedWeightedTime = 0
    this.totalTimeAtSpeed = 0
  }

  /** Get current session engagement data */
  getSessionData() {
    // Finalize in-progress segment for snapshot
    const currentSegments = [...this.segments]
    if (
      this.currentSegmentStart !== null &&
      !this.video.paused &&
      this.isRunning
    ) {
      currentSegments.push({
        start: this.currentSegmentStart,
        end: this.video.currentTime
      })
    }

    return {
      watchedSegments: mergeOverlappingSegments(currentSegments),
      seekEvents: [...this.seeks],
      speedChanges: [...this.speeds],
      pauseCount: this.pauses,
      averageSpeed: this.getAverageSpeed(),
      maxSpeed: this.maxSpeed,
      totalWatchTime: this.calculateTotalWatchTime(currentSegments)
    }
  }

  // ── Private: Event Handlers ──

  private onTrackingTick(): void {
    if (this.video.paused || !this.isRunning) return

    const currentTime = this.video.currentTime
    const now = Date.now()
    const elapsedReal = (now - this.lastTimestamp) / 1000
    const expectedTime = this.lastTime + elapsedReal * this.currentSpeed

    // Detect seek: large jump between expected and actual position
    const drift = Math.abs(currentTime - expectedTime)
    if (drift > SEEK_THRESHOLD_SECONDS && elapsedReal < 3) {
      // This is a seek that wasn't caught by the seeking event
      this.recordSeek(this.lastTime, currentTime)
    }

    // Track speed-weighted time
    this.speedWeightedTime += elapsedReal * this.currentSpeed
    this.totalTimeAtSpeed += elapsedReal

    this.lastTime = currentTime
    this.lastTimestamp = now
  }

  private onRateChange(): void {
    const newSpeed = this.video.playbackRate
    if (newSpeed === this.currentSpeed) return

    this.speeds.push({
      timestamp: Date.now(),
      fromSpeed: this.currentSpeed,
      toSpeed: newSpeed
    })

    this.currentSpeed = newSpeed
    if (newSpeed > this.maxSpeed) {
      this.maxSpeed = newSpeed
    }
  }

  private onPause(): void {
    this.pauses++
    this.finalizeCurrentSegment()
  }

  private onPlay(): void {
    this.currentSegmentStart = this.video.currentTime
    this.lastTime = this.video.currentTime
    this.lastTimestamp = Date.now()
  }

  private onSeeking(): void {
    // Finalize the segment before the seek
    this.finalizeCurrentSegment()
  }

  private onSeeked(): void {
    const seekedTo = this.video.currentTime

    // Record the seek event
    if (this.lastTime !== seekedTo) {
      this.recordSeek(this.lastTime, seekedTo)
    }

    // Start a new segment from the seek destination
    if (!this.video.paused) {
      this.currentSegmentStart = seekedTo
    }

    this.lastTime = seekedTo
    this.lastTimestamp = Date.now()
  }

  private onEnded(): void {
    this.finalizeCurrentSegment()
  }

  // ── Private: Helpers ──

  private recordSeek(from: number, to: number): void {
    this.seeks.push({
      timestamp: Date.now(),
      fromTime: from,
      toTime: to,
      direction: to > from ? "forward" : "backward"
    })
  }

  private finalizeCurrentSegment(): void {
    if (this.currentSegmentStart === null) return

    const end = this.video.currentTime
    if (end > this.currentSegmentStart + 0.5) {
      // Only record segments longer than 0.5s
      this.segments.push({
        start: this.currentSegmentStart,
        end
      })
    }
    this.currentSegmentStart = null
  }

  private getAverageSpeed(): number {
    if (this.totalTimeAtSpeed === 0) return this.currentSpeed
    return this.speedWeightedTime / this.totalTimeAtSpeed
  }

  private calculateTotalWatchTime(segments: WatchSegment[]): number {
    const merged = mergeOverlappingSegments(segments)
    return merged.reduce((total, seg) => total + (seg.end - seg.start), 0)
  }

  private removeListeners(): void {
    this.video.removeEventListener("ratechange", this.boundOnRateChange)
    this.video.removeEventListener("pause", this.boundOnPause)
    this.video.removeEventListener("play", this.boundOnPlay)
    this.video.removeEventListener("seeking", this.boundOnSeeking)
    this.video.removeEventListener("seeked", this.boundOnSeeked)
    this.video.removeEventListener("ended", this.boundOnEnded)
  }
}

/**
 * Merge overlapping or adjacent watch segments into non-overlapping ranges.
 * This gives us the true unique video time watched.
 */
function mergeOverlappingSegments(segments: WatchSegment[]): WatchSegment[] {
  if (segments.length === 0) return []

  const sorted = [...segments].sort((a, b) => a.start - b.start)
  const merged: WatchSegment[] = [{ ...sorted[0] }]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      // Overlapping — extend
      last.end = Math.max(last.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}
