"use client";

import React, { ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Card className={cn("overflow-hidden premium-glass border-white/[0.03] group-hover:bg-white/[0.05] transition-all duration-500", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {title}
          </CardTitle>
          <div className="rounded-xl bg-white/[0.03] p-2.5 group-hover:bg-white group-hover:text-black transition-all duration-500">
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black tracking-tighter text-white mb-2">{value}</div>
          {(description || trend) && (
            <div className="flex items-center gap-3">
              {trend && (
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  trend.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </div>
              )}
              {description && (
                <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                  {description}
                </span>
              )}
            </div>
          )}
        </CardContent>
        {/* Decorative background glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.02] blur-3xl group-hover:bg-white/[0.05] transition-colors" />
      </Card>
    </motion.div>
  );
}
