"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "lg",
  padding = "md",
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  }

  const paddingClasses = {
    none: "",
    sm: "px-2 py-2 sm:px-4 sm:py-4",
    md: "px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
    lg: "px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12",
  }

  return (
    <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
      {children}
    </div>
  )
}
