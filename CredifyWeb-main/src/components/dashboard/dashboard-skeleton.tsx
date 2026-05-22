"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-white/5 rounded-full" />
          <Skeleton className="h-16 w-64 bg-white/5 rounded-2xl" />
          <Skeleton className="h-6 w-96 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-40 bg-white/5 rounded-full" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-white/[0.03] bg-white/[0.01] rounded-[32px]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Skeleton className="h-10 w-16 mb-4 bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="rounded-[32px] h-[450px]">
            <CardHeader className="px-8">
              <Skeleton className="h-8 w-48 bg-white/5 mb-4" />
              <Skeleton className="h-4 w-64 bg-white/5" />
            </CardHeader>
            <CardContent className="px-8">
              <Skeleton className="h-[280px] w-full bg-white/5 rounded-2xl" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[32px] h-[220px]">
            <CardHeader className="px-8">
              <Skeleton className="h-10 w-10 bg-white/5 rounded-xl mb-4" />
              <Skeleton className="h-8 w-40 bg-white/5" />
            </CardHeader>
            <CardContent className="px-8">
              <Skeleton className="h-4 w-full bg-white/5 mb-6" />
              <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            </CardContent>
          </Card>
          <Card className="rounded-[32px] h-[200px]">
            <CardHeader className="px-8">
              <Skeleton className="h-6 w-32 bg-white/5" />
            </CardHeader>
            <CardContent className="px-8">
              <Skeleton className="h-4 w-full bg-white/5 mb-4" />
              <Skeleton className="h-2 w-full bg-white/5 mb-6" />
              <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
