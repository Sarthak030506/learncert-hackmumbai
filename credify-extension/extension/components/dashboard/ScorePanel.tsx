import React from "react";
import { ProgressRing } from "../ui/ProgressRing";
import { ScoreBadge } from "../ui/ScoreBadge";

interface ScorePanelProps {
  score: number;
  breakdown?: {
    completion: number;
    engagement: number;
    focus: number;
    speedPenalty: number;
    skipPenalty: number;
    inactivityPenalty: number;
  };
}

const BreakdownRow: React.FC<{
  label: string;
  value: number;
  maxValue: number;
  colorClass: string;
  isPenalty?: boolean;
}> = ({ label, value, maxValue, colorClass, isPenalty = false }) => {
  const pct = Math.min((Math.abs(value) / maxValue) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="meta-label !text-[8px] w-20 text-right opacity-40">
        {label}
      </span>
      <div className="flex-1 progress-container !h-1">
        <div
          className={`progress-fill ${isPenalty ? 'bg-rose-500' : 'bg-white'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-black heading-heavy w-8 tabular-nums ${isPenalty ? 'text-rose-500' : 'text-white'}`}>
        {isPenalty ? `-${value}` : value}
      </span>
    </div>
  );
};

export const ScorePanel: React.FC<ScorePanelProps> = ({ score, breakdown }) => {
  const getVariant = (s: number) => {
    if (s >= 90) return "emerald";
    if (s >= 70) return "blue";
    if (s >= 40) return "amber";
    return "rose";
  };

  const getLabel = (s: number) => {
    if (s >= 90) return "Legendary";
    if (s >= 70) return "Verified";
    if (s >= 40) return "Progressing";
    return "Low Score";
  };

  return (
    <div className="px-5 py-4 animate-fade-in-up">
      <div className="premium-glass p-6 flex flex-col items-center gap-4 relative overflow-hidden">
        {/* Subtle background glow based on score */}
        <div 
          className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000 ${
            score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
          }`} 
        />

        <div className="relative">
          <ProgressRing progress={score} size={150} strokeWidth={8} />
        </div>

        <ScoreBadge 
          label={getLabel(score)} 
          variant={getVariant(score)} 
        />
      </div>

      {breakdown && (
        <div className="mt-4 space-y-3 px-1">
          <p className="meta-label opacity-40 mb-3">Metrics Breakdown</p>
          <div className="space-y-4">
            <BreakdownRow
              label="Completion"
              value={breakdown.completion}
              maxValue={100}
              colorClass="bg-white"
            />
            <BreakdownRow
              label="Engagement"
              value={breakdown.engagement}
              maxValue={100}
              colorClass="bg-white"
            />
            <BreakdownRow
              label="Focus"
              value={breakdown.focus}
              maxValue={100}
              colorClass="bg-white"
            />
            {breakdown.speedPenalty > 0 && (
              <BreakdownRow
                label="Speed"
                value={breakdown.speedPenalty}
                maxValue={20}
                colorClass="bg-rose-500"
                isPenalty
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorePanel;
