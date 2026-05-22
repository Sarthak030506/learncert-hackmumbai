import type { WatchSession } from '../../types/session.js';

/**
 * Calculate focus score (0–100).
 *
 * Based on the proportion of time the tab was active (in focus)
 * versus total session time (active + inactive).
 */
export function calculateFocus(session: WatchSession): number {
  const { tabActiveTime, tabInactiveTime } = session;
  const totalTime = tabActiveTime + tabInactiveTime;

  if (totalTime <= 0) return 100; // No data ⇒ assume focused

  const ratio = tabActiveTime / totalTime;
  return Math.min(Math.round(ratio * 100 * 100) / 100, 100);
}
