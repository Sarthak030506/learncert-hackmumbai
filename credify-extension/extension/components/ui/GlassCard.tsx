import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "",
  noPadding = false 
}) => {
  return (
    <div className={`premium-glass rounded-2xl overflow-hidden ${noPadding ? "" : "p-5"} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
