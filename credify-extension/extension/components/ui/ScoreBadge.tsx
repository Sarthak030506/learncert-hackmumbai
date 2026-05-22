import React from "react";

interface ScoreBadgeProps {
  label: string;
  variant?: "emerald" | "amber" | "purple" | "blue" | "rose";
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ 
  label, 
  variant = "blue" 
}) => {
  const variants = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-[0.1em] ${variants[variant]}`}>
      {label}
    </div>
  );
};

export default ScoreBadge;
