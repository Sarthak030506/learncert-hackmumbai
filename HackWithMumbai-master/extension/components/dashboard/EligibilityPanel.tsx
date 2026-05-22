import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { MIN_SCORE_FOR_CERT, MIN_COMPLETION_FOR_CERT } from "~lib/constants";

interface EligibilityPanelProps {
  score: number;
  completion: number;
  isEligible: boolean;
}

const SCORE_THRESHOLD = MIN_SCORE_FOR_CERT;
const COMPLETION_THRESHOLD = MIN_COMPLETION_FOR_CERT * 100;

export const EligibilityPanel: React.FC<EligibilityPanelProps> = ({
  score,
  completion,
  isEligible,
}) => {
  const scoreProgress = Math.min((score / SCORE_THRESHOLD) * 100, 100);
  const completionProgress = Math.min((completion / COMPLETION_THRESHOLD) * 100, 100);
  const scoreMet = score >= SCORE_THRESHOLD;
  const completionMet = completion >= COMPLETION_THRESHOLD;

  return (
    <div className="px-5 py-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <p className="meta-label opacity-40 mb-3">Verification Progress</p>

      <GlassCard className="!p-4 border-white/5 relative overflow-hidden">
        {isEligible && (
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
        )}

        {/* Status header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${
            isEligible 
              ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
              : "bg-white/5 border-white/10"
          }`}>
            {isEligible ? (
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5L2 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            )}
          </div>
          <div>
            <span className={`text-[12px] font-black uppercase tracking-wider block leading-none ${
              isEligible ? "text-emerald-500" : "text-white/60"
            }`}>
              {isEligible ? "Eligibility Confirmed" : "Criteria Pending"}
            </span>
            <span className="text-[9px] font-medium text-white/30 mt-1 block">
              {isEligible ? "Proof of Learning ready to mint" : "Continue watching to qualify"}
            </span>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          {/* Score requirement */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="meta-label !text-[8px] opacity-40">Min Score: {SCORE_THRESHOLD}</span>
              <span className={`text-[10px] font-black heading-heavy ${scoreMet ? "text-emerald-500" : "text-white"}`}>
                {score.toFixed(0)} / {SCORE_THRESHOLD}
              </span>
            </div>
            <div className="progress-container !h-1">
              <div
                className={`progress-fill ${scoreMet ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"}`}
                style={{ width: `${scoreProgress}%` }}
              />
            </div>
          </div>

          {/* Completion requirement */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="meta-label !text-[8px] opacity-40">Min Completion: {COMPLETION_THRESHOLD}%</span>
              <span className={`text-[10px] font-black heading-heavy ${completionMet ? "text-emerald-500" : "text-white"}`}>
                {completion.toFixed(0)}% / {COMPLETION_THRESHOLD}%
              </span>
            </div>
            <div className="progress-container !h-1">
              <div
                className={`progress-fill ${completionMet ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"}`}
                style={{ width: `${completionProgress}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default EligibilityPanel;
