"use client"

import { createContext, useContext, useState } from "react"
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionContextType = { open: string; setOpen: (v: string) => void }
const AccordionContext = createContext<AccordionContextType>({ open: "", setOpen: () => {} })

function Accordion({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState("")
  return (
    <AccordionContext.Provider value={{ open, setOpen }}>
      <div data-slot="accordion" className={cn("flex w-full flex-col", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & { value: string; children?: ReactNode }

function AccordionTrigger({ className, children, value, ...props }: AccordionTriggerProps) {
  const { open, setOpen } = useContext(AccordionContext)
  const isOpen = open === value
  return (
    <div className="flex">
      <button
        data-slot="accordion-trigger"
        aria-expanded={isOpen}
        onClick={() => setOpen(isOpen ? "" : value)}
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        {isOpen
          ? <ChevronUpIcon data-slot="accordion-trigger-icon" className="ml-auto size-4 text-muted-foreground shrink-0" />
          : <ChevronDownIcon data-slot="accordion-trigger-icon" className="ml-auto size-4 text-muted-foreground shrink-0" />
        }
      </button>
    </div>
  )
}

type AccordionContentProps = HTMLAttributes<HTMLDivElement> & { value: string; children?: ReactNode }

function AccordionContent({ className, children, value, ...props }: AccordionContentProps) {
  const { open } = useContext(AccordionContext)
  if (open !== value) return null
  return (
    <div
      data-slot="accordion-content"
      className="overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4", className)}>
        {children}
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
