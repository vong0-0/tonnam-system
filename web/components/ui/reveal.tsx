"use client"

import { type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useInView } from "@/hooks/use-in-view"

export type RevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "up-scale"

export interface RevealProps {
  children: ReactNode
  /** Animation direction. Default: "up" */
  direction?: RevealDirection
  /** Delay in ms before animation starts. Useful for staggering siblings. */
  delay?: number
  /** Animation duration in ms. Default: 500 */
  duration?: number
  /** Intersection threshold 0–1. Default: 0.15 */
  threshold?: number
  className?: string
  /** Render as a different HTML element. Default: "div" */
  as?: ElementType
}

const INITIAL: Record<RevealDirection, string> = {
  up:         "translateY(28px)",
  down:       "translateY(-28px)",
  left:       "translateX(32px)",
  right:      "translateX(-32px)",
  fade:       "none",
  scale:      "scale(0.93)",
  "up-scale": "translateY(20px) scale(0.96)",
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  threshold = 0.15,
  className,
  as: Tag = "div",
}: RevealProps) {
  const { ref, inView } = useInView(threshold)

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : INITIAL[direction],
        transition: [
          `opacity ${duration}ms cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
          `transform ${duration}ms cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
        ].join(", "),
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  )
}
