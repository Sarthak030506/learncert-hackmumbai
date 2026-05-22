import React from "react";
import { StatCard } from "../ui/StatCard";
import type { WatchSession } from "~types/session";
import { calculateScoreBreakdown } from "~lib/scoring";

interface AnalyticsPanelProps {
  totalWatchTime: number; // in seconds
  videosCompleted: number;
  averageScore: number;
  currentStreak: number;
  dailyActivity: { date: string; seconds: number }[];
  sessionHistory: WatchSession[];
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

const formatShortDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Inline SVG icons for clean rendering
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 6.5L14 4.5V11.5L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 2L9.5 5.5L13.5 6L10.5 8.5L11.5 12.5L8 10.5L4.5 12.5L5.5 8.5L2.5 6L6.5 5.5L8 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FireIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5C8 1.5 3 5.5 3 9.5C3 12.26 5.24 14.5 8 14.5C10.76 14.5 13 12.26 13 9.5C13 5.5 8 1.5 8 1.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  totalWatchTime,
  videosCompleted,
  averageScore,
  currentStreak,
  dailyActivity,
  sessionHistory,
}) => {
  // Compute bar heights for the activity graph (normalized to max)
  const maxSeconds = Math.max(...dailyActivity.map(d => d.seconds), 1);
  const hasAnyActivity = dailyActivity.some(d => d.seconds > 0);

  // Get the last 5 sessions for the history list
  const recentSessions = [...sessionHistory]
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
    .slice(0, 5);

  return (
    <div className="px-5 py-4 animate-fade-in-up">
      <p className="meta-label opacity-40 mb-3">Performance Analytics</p>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Effort"
          value={totalWatchTime > 0 ? formatTime(totalWatchTime) : "—"}
          icon={<ClockIcon />}
        />
        <StatCard
          label="Certificates"
          value={videosCompleted}
          icon={<VideoIcon />}
        />
        <StatCard
          label="Avg Quality"
          value={averageScore > 0 ? `${averageScore}%` : "—"}
          icon={<StarIcon />}
        />
        <StatCard
          label="Active Pulse"
          value={currentStreak > 0 ? `${currentStreak}D` : "—"}
          icon={<FireIcon />}
        />
      </div>

      {/* Daily Activity Graph — REAL DATA */}
      <div className="mt-4 premium-glass !p-4 border-white/5">
        <p className="meta-label !text-[8px] opacity-40 mb-3">
          Activity History · Last 14 Days
        </p>

        {!hasAnyActivity ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-[9px] text-white/15 font-medium">
              No activity recorded yet
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between h-16 gap-1">
              {dailyActivity.map((day, i) => {
                const heightPct = (day.seconds / maxSeconds) * 100;
                const isToday = i === dailyActivity.length - 1;
                return (
                  <div
                    key={day.date}
                    className={`flex-1 rounded-t-sm transition-all duration-500 cursor-pointer group relative ${
                      isToday
                        ? "bg-emerald-500/40 hover:bg-emerald-500/70"
                        : day.seconds > 0
                          ? "bg-white/10 hover:bg-emerald-500/50"
                          : "bg-white/[0.03]"
                    }`}
                    style={{ height: `${Math.max(heightPct, day.seconds > 0 ? 8 : 2)}%` }}
                    title={`${formatShortDate(day.date)}: ${formatTime(day.seconds)}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                      <div className="bg-black/90 border border-white/10 rounded-md px-2 py-1 whitespace-nowrap">
                        <span className="text-[8px] font-bold text-white/70">
                          {formatTime(day.seconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="meta-label !text-[6px] opacity-20">
                {dailyActivity.length > 0 ? formatShortDate(dailyActivity[0].date).toUpperCase() : ""}
              </span>
              <span className="meta-label !text-[6px] opacity-20">
                TODAY
              </span>
            </div>
          </>
        )}
      </div>

      {/* Recent Session History — REAL DATA */}
      {recentSessions.length > 0 && (
        <div className="mt-4 premium-glass !p-4 border-white/5">
          <p className="meta-label !text-[8px] opacity-40 mb-3">
            Recent Sessions
          </p>
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const score = calculateScoreBreakdown(session).finalScore;
              const dur = session.video?.duration || 1;
              const pct = Math.min((session.totalWatchTime / dur) * 100, 100);
              const sessionDate = new Date(session.startedAt);
              const timeAgo = getTimeAgo(session.startedAt);

              return (
                <div key={session.id} className="flex items-center gap-3 group">
                  {/* Score badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                    score >= 70
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : score >= 40
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : "bg-white/5 border-white/10 text-white/40"
                  }`}>
                    {score}
                  </div>

                  {/* Video info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white/70 truncate leading-tight">
                      {session.video?.title || "Unknown Video"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-white/25 font-medium">
                        {Math.round(pct)}% watched
                      </span>
                      <span className="text-[8px] text-white/15">•</span>
                      <span className="text-[8px] text-white/25 font-medium">
                        {formatTime(session.totalWatchTime)}
                      </span>
                      <span className="text-[8px] text-white/15">•</span>
                      <span className="text-[8px] text-white/20 font-medium">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/** Simple time-ago formatter */
function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default AnalyticsPanel;
