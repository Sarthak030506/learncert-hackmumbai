import type { WatchSession } from '../../types/session.js';
import type { MergedSegment } from './types.js';

/**
 * Merge overlapping / adjacent segments so we only count unique watch time.
 * Sorts by start time, then sweeps through merging overlaps.
 */
export function mergeSegments(segments: { start: number; end: number }[]): MergedSegment[] {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const merged: MergedSegment[] = [{ start: sorted[0].start, end: sorted[0].end }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      // Overlapping or adjacent — extend
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }

  return merged;
}

/**
 * Calculate completion score (0–100).
 *
 * Deduplicates watched segments, computes unique watched time
 * as a fraction of total video duration.
 */
export function calculateCompletion(session: WatchSession): number {
  const { video, watchedSegments } = session;

  if (video.duration <= 0) return 0;
  if (watchedSegments.length === 0) return 0;

  const merged = mergeSegments(watchedSegments);
  const uniqueWatchedTime = merged.reduce((sum, seg) => sum + (seg.end - seg.start), 0);

  const ratio = uniqueWatchedTime / video.duration;
  return Math.min(Math.round(ratio * 100 * 100) / 100, 100);
}
