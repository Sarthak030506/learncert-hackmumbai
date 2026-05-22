import type { PlasmoCSConfig } from "plasmo"
import { SessionManager } from "../lib/tracker/session-manager"
import { extractVideoMetadata, isAllowedChannel } from "../lib/tracker/video-detector"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*"],
  run_at: "document_idle"
}

console.log("[Credify] Content script loaded on YouTube")

let sessionManager: SessionManager | null = null
let currentVideoElement: HTMLVideoElement | null = null
let currentVideoId: string | null = null

// Initialize tracker on video element — ONLY on allowed channels (freeCodeCamp)
const initTracker = () => {
  const video = document.querySelector("video")
  if (!video) return

  const metadata = extractVideoMetadata()
  if (!metadata) {
    // If metadata is not loaded yet (e.g. YouTube is rendering), retry in a moment
    setTimeout(initTracker, 500)
    return
  }

  // ── Gate: only track videos from allowed channels ──
  if (!isAllowedChannel(metadata.channelName)) {
    // Not a freeCodeCamp video — clean up any existing session and bail
    if (sessionManager) {
      console.log("[Credify] Leaving non-freeCodeCamp video, ending session")
      sessionManager.endSession()
      sessionManager = null
      currentVideoElement = null
      currentVideoId = null
    }
    // Notify overlay that tracking is inactive
    window.dispatchEvent(new CustomEvent("credify-channel-blocked", {
      detail: { channelName: metadata.channelName }
    }))
    return
  }

  // Prevent multiple trackers on same video element AND same videoId
  if (
    currentVideoElement === video &&
    currentVideoId === metadata.videoId &&
    sessionManager
  ) {
    return
  }

  console.log("[Credify] freeCodeCamp video detected, initializing tracker for:", metadata.title)
  
  if (sessionManager) {
    sessionManager.endSession()
  }

  currentVideoElement = video
  currentVideoId = metadata.videoId
  sessionManager = new SessionManager()
  sessionManager.startSession(video, metadata)

  // Dispatch event so the overlay can pick up the new session
  window.dispatchEvent(new CustomEvent("credify-session-started", {
    detail: { videoId: metadata.videoId, duration: metadata.duration, channelName: metadata.channelName }
  }))
}

// Watch for DOM changes — always check even if currentVideoElement is set
// because YouTube may swap the <video> node or navigate to a new video
const observer = new MutationObserver(() => {
  const video = document.querySelector("video")
  if (!video) return

  // Re-init if the DOM element changed, or if a new page loaded (different videoId)
  const metadata = extractVideoMetadata()
  if (
    video !== currentVideoElement ||
    (metadata && metadata.videoId !== currentVideoId)
  ) {
    initTracker()
  }
})

observer.observe(document.body, { childList: true, subtree: true })

// Handle YouTube SPA navigation events
document.addEventListener("yt-navigate-finish", () => {
  console.log("[Credify] YouTube navigation detected, re-initializing")
  // Reset tracking so initTracker treats this as a fresh video context
  currentVideoElement = null
  currentVideoId = null
  // Give DOM a moment to update
  setTimeout(initTracker, 1000)
})

// Initial attempt
initTracker()

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (sessionManager) {
    sessionManager.endSession()
  }
})
