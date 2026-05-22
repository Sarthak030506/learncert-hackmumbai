// Credify — Video Detector
// Utilities for detecting and extracting YouTube video information

import type { VideoMetadata } from "~types/session"
import { EDUCATIONAL_KEYWORDS } from "~lib/constants"

/**
 * Extract the YouTube video ID from a URL string.
 * Handles standard watch URLs (?v=), shortened youtu.be, and embed URLs.
 */
export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Standard: youtube.com/watch?v=VIDEO_ID
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v")
    }

    // Shortened: youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null
    }

    // Embed: youtube.com/embed/VIDEO_ID
    const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) {
      return embedMatch[1]
    }

    // Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = parsed.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
    if (shortsMatch) {
      return shortsMatch[1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract video metadata from the current YouTube page DOM.
 * Returns null if required elements are not found.
 */
export function extractVideoMetadata(): VideoMetadata | null {
  const videoId = extractVideoId(window.location.href)
  if (!videoId) return null

  const videoEl = document.querySelector("video") as HTMLVideoElement | null
  if (!videoEl) return null

  // Title extraction — try multiple selectors for YouTube's varying DOM
  const title =
    getTextContent("h1.ytd-watch-metadata yt-formatted-string") ||
    getTextContent("h1.title yt-formatted-string") ||
    getTextContent("#title h1 yt-formatted-string") ||
    getTextContent("h1.ytd-video-primary-info-renderer") ||
    extractTitleFromDocument() ||
    "Unknown Title"

  // Channel name extraction
  const channelName =
    getTextContent("#channel-name yt-formatted-string a") ||
    getTextContent("#channel-name a") ||
    getTextContent("ytd-channel-name yt-formatted-string a") ||
    getTextContent("#owner-name a") ||
    getTextContent("#upload-info ytd-channel-name yt-formatted-string") ||
    "Unknown Channel"

  const duration = isFinite(videoEl.duration) ? videoEl.duration : 0

  return {
    videoId,
    title: title.trim(),
    channelName: channelName.trim(),
    duration,
    url: window.location.href
  }
}

/**
 * Channels that Credify will activate on.
 * Matching is case-insensitive and trimmed.
 */
export const ALLOWED_CHANNELS: string[] = [
  "freecodecamp.org",
  "freecodecamp",
  "freeCodeCamp.org",
  "freeCodeCamp",
]

/**
 * Check if the current video is from an allowed channel.
 * Reads the channel name from the DOM and compares against ALLOWED_CHANNELS.
 */
export function isAllowedChannel(channelName?: string): boolean {
  const name = channelName?.trim()
  if (!name) return false
  return ALLOWED_CHANNELS.some(
    (allowed) => allowed.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Check if a video title suggests educational content.
 * Uses keyword matching against known educational terms.
 */
export function isEducationalContent(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  return EDUCATIONAL_KEYWORDS.some((keyword) => lowerTitle.includes(keyword))
}

/**
 * Wait for the video element to appear in the DOM.
 * YouTube is an SPA, so the <video> may not exist immediately.
 */
export function waitForVideoElement(
  timeoutMs: number = 15000
): Promise<HTMLVideoElement | null> {
  return new Promise((resolve) => {
    // Check if already present
    const existing = document.querySelector("video") as HTMLVideoElement | null
    if (existing) {
      resolve(existing)
      return
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const el = document.querySelector("video") as HTMLVideoElement | null
      if (el) {
        obs.disconnect()
        resolve(el)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect()
      resolve(
        document.querySelector("video") as HTMLVideoElement | null
      )
    }, timeoutMs)
  })
}

// ── Internal helpers ──

function getTextContent(selector: string): string | null {
  const el = document.querySelector(selector)
  return el?.textContent?.trim() || null
}

function extractTitleFromDocument(): string | null {
  const docTitle = document.title
  // YouTube titles end with " - YouTube"
  if (docTitle.endsWith(" - YouTube")) {
    return docTitle.slice(0, -10).trim()
  }
  return null
}
