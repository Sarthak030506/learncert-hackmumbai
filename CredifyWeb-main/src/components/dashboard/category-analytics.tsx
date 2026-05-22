"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const RadarChart = dynamic(() => import("recharts").then(m => ({ default: m.RadarChart })), { ssr: false });
const Radar = dynamic(() => import("recharts").then(m => ({ default: m.Radar })), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then(m => ({ default: m.PolarGrid })), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then(m => ({ default: m.PolarAngleAxis })), { ssr: false });
const PolarRadiusAxis = dynamic(() => import("recharts").then(m => ({ default: m.PolarRadiusAxis })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })), { ssr: false });

const data = [
  { subject: "ENGINEERING", A: 120, fullMark: 150 },
  { subject: "DESIGN", A: 98, fullMark: 150 },
  { subject: "BUSINESS", A: 86, fullMark: 150 },
  { subject: "AI/ML", A: 99, fullMark: 150 },
  { subject: "SOFT SKILLS", A: 85, fullMark: 150 },
  { subject: "MARKETING", A: 65, fullMark: 150 },
];

export function CategoryAnalytics() {
  return (
    <div className="h-full opacity-0 animate-[fadeIn_1s_0.3s_ease-out_forwards]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>KNOWLEDGE GRAPH</CardTitle>
          <CardDescription>
            Distribution of your verified learning across the protocol network.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-8">
          <div className="h-[350px] w-full max-w-[450px]">
            <Suspense fallback={<div className="h-full w-full bg-white/[0.02] rounded-2xl animate-pulse" />}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#ffffff08" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 900 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Proficiency"
                    dataKey="A"
                    stroke="#ffffff"
                    fill="#ffffff"
                    fillOpacity={0.05}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Network Average"
                    dataKey="fullMark"
                    stroke="rgba(59, 130, 246, 0.2)"
                    fill="transparent"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
