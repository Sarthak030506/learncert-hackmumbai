// Credify — Focus Tracker
// Monitors tab visibility and window focus to measure user attention

import type { FocusEvent } from "~types/session"

export class FocusTracker {
  private isRunning = false
  private events: FocusEvent[] = []
  private isTabActive = true
  private activeStartTime: number = 0
  private cumulativeActiveTime = 0
  private cumulativeInactiveTime = 0
  private lastStateChangeTime: number = 0

  // Bound handlers for cleanup
  private boundOnVisibilityChange: () => void
  private boundOnWindowFocus: () => void
  private boundOnWindowBlur: () => void

  constructor() {
    this.boundOnVisibilityChange = this.onVisibilityChange.bind(this)
    this.boundOnWindowFocus = this.onWindowFocus.bind(this)
    this.boundOnWindowBlur = this.onWindowBlur.bind(this)
  }

  /** Start tracking focus state */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true

    const now = Date.now()
    this.activeStartTime = now
    this.lastStateChangeTime = now
    this.isTabActive = !document.hidden

    // Record initial state
    this.events.push({
      timestamp: now,
      type: this.isTabActive ? "focus" : "blur"
    })

    document.addEventListener("visibilitychange", this.boundOnVisibilityChange)
    window.addEventListener("focus", this.boundOnWindowFocus)
    window.addEventListener("blur", this.boundOnWindowBlur)
  }

  /** Stop tracking (preserves accumulated data) */
  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false

    // Finalize time accounting
    this.accountTimeSinceLastChange()

    document.removeEventListener(
      "visibilitychange",
      this.boundOnVisibilityChange
    )
    window.removeEventListener("focus", this.boundOnWindowFocus)
    window.removeEventListener("blur", this.boundOnWindowBlur)
  }

  /** Get total time (seconds) the tab was active */
  getActiveTime(): number {
    // Include time since last state change if currently active
    let extra = 0
    if (this.isRunning && this.isTabActive) {
      extra = (Date.now() - this.lastStateChangeTime) / 1000
    }
    return this.cumulativeActiveTime + extra
  }

  /** Get total time (seconds) the tab was inactive */
  getInactiveTime(): number {
    let extra = 0
    if (this.isRunning && !this.isTabActive) {
      extra = (Date.now() - this.lastStateChangeTime) / 1000
    }
    return this.cumulativeInactiveTime + extra
  }

  /** Get all recorded focus/blur events */
  getEvents(): FocusEvent[] {
    return [...this.events]
  }

  /** Whether the tab is currently in focus */
  isActive(): boolean {
    return this.isTabActive
  }

  // ── Private handlers ──

  private onVisibilityChange(): void {
    if (document.hidden) {
      this.handleBlur()
    } else {
      this.handleFocus()
    }
  }

  private onWindowFocus(): void {
    this.handleFocus()
  }

  private onWindowBlur(): void {
    this.handleBlur()
  }

  private handleFocus(): void {
    if (this.isTabActive) return // Already focused, ignore duplicate

    this.accountTimeSinceLastChange()
    this.isTabActive = true
    this.lastStateChangeTime = Date.now()

    this.events.push({
      timestamp: Date.now(),
      type: "focus"
    })
  }

  private handleBlur(): void {
    if (!this.isTabActive) return // Already blurred, ignore duplicate

    this.accountTimeSinceLastChange()
    this.isTabActive = false
    this.lastStateChangeTime = Date.now()

    this.events.push({
      timestamp: Date.now(),
      type: "blur"
    })
  }

  private accountTimeSinceLastChange(): void {
    const now = Date.now()
    const elapsed = (now - this.lastStateChangeTime) / 1000

    if (this.isTabActive) {
      this.cumulativeActiveTime += elapsed
    } else {
      this.cumulativeInactiveTime += elapsed
    }
  }
}
