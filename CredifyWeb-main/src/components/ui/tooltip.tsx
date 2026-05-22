"use client"

import { useState } from "react"
import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

function TooltipProvider({ children }: { children: ReactNode; delay?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: ReactNode }) {
  return <div data-slot="tooltip" className="relative inline-flex">{children}</div>
}

function TooltipTrigger({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span data-slot="tooltip-trigger" className={cn("inline-flex", className)} {...props}>
      {children}
    </span>
  )
}

type TooltipContentProps = HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  children?: ReactNode
}

function TooltipContent({ className, children, ...props }: TooltipContentProps) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
