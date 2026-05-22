"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AreaChart = dynamic(() => import("recharts").then(m => ({ default: m.AreaChart })), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => ({ default: m.Area })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => ({ default: m.Tooltip })), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => ({ default: m.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => ({ default: m.CartesianGrid })), { ssr: false });

const data = [
  { day: "MON", score: 65, hours: 2.5 },
  { day: "TUE", score: 68, hours: 3.2 },
  { day: "WED", score: 72, hours: 2.8 },
  { day: "THU", score: 70, hours: 4.1 },
  { day: "FRI", score: 78, hours: 3.5 },
  { day: "SAT", score: 82, hours: 5.2 },
  { day: "SUN", score: 85, hours: 4.8 },
];

export function AnalyticsChart() {
  return (
    <div className="opacity-0 animate-[fadeIn_1s_0.2s_ease-out_forwards]">
      <Card>
        <CardHeader>
          <CardTitle>ENGAGEMENT ANALYTICS</CardTitle>
          <CardDescription>
            Credibility score and learning hours over the past week on the decentralized protocol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full pt-8">
            <Suspense fallback={<div className="h-full w-full bg-white/[0.02] rounded-2xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#ffffff20"
                    fontSize={10}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    fontSize={10}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={1000}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
