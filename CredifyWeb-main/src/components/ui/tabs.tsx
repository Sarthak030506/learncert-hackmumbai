"use client"

import { createContext, useContext, useState } from "react"
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TabsContextType = { active: string; setActive: (v: string) => void }
const TabsContext = createContext<TabsContextType>({ active: "", setActive: () => {} })

type TabsProps = HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string
  value?: string
  onValueChange?: (v: string) => void
  orientation?: "horizontal" | "vertical"
}

function Tabs({ className, orientation = "horizontal", defaultValue = "", value, onValueChange, children, ...props }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue)
  const active = value ?? internal
  const setActive = (v: string) => { setInternal(v); onValueChange?.(v) }
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
  {
    variants: {
      variant: { default: "bg-muted", line: "gap-1 bg-transparent" },
    },
    defaultVariants: { variant: "default" },
  }
)

type TabsListProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof tabsListVariants>

function TabsList({ className, variant = "default", ...props }: TabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { value: string }

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  const { active, setActive } = useContext(TabsContext)
  return (
    <button
      data-slot="tabs-trigger"
      data-active={active === value ? "" : undefined}
      onClick={() => setActive(value)}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

type TabsContentProps = HTMLAttributes<HTMLDivElement> & { value: string }

function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { active } = useContext(TabsContext)
  if (active !== value) return null
  return (
    <div
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
