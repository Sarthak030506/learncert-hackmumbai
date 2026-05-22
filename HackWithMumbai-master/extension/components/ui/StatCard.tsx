import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, trend }) => {
  return (
    <div className="premium-glass p-4 rounded-xl border border-white/5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="meta-label !text-[8px] opacity-40">{label}</span>
        {icon && <div className="text-white/20">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-black heading-heavy text-white">{value}</span>
        {trend && (
          <span className={`text-[9px] font-black ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subValue && <span className="text-[10px] font-medium text-white/30">{subValue}</span>}
    </div>
  );
};

export default StatCard;
