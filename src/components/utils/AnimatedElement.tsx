"use client"

import { type ReactNode, useEffect, useState } from "react"

interface AnimatedElementProps {
  children: ReactNode
  animation: "fade-in" | "slide-up" | "slide-left" | "zoom-in" | "bounce"
  delay?: number
  duration?: number
  className?: string
}

export default function AnimatedElement({
  children,
  animation,
  delay = 0,
  duration = 500,
  className = "",
}: AnimatedElementProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getAnimationClass = () => {
    switch (animation) {
      case "fade-in":
        return "opacity-0 transition-opacity"
      case "slide-up":
        return "opacity-0 translate-y-8 transition-all"
      case "slide-left":
        return "opacity-0 -translate-x-8 transition-all"
      case "zoom-in":
        return "opacity-0 scale-95 transition-all"
      case "bounce":
        return "opacity-0 transition-all"
      default:
        return "opacity-0 transition-opacity"
    }
  }

  const getVisibleClass = () => {
    switch (animation) {
      case "fade-in":
        return "opacity-100"
      case "slide-up":
        return "opacity-100 translate-y-0"
      case "slide-left":
        return "opacity-100 translate-x-0"
      case "zoom-in":
        return "opacity-100 scale-100"
      case "bounce":
        return "opacity-100 animate-bounce"
      default:
        return "opacity-100"
    }
  }

  return (
    <div
      className={`${className} ${getAnimationClass()} ${isVisible ? getVisibleClass() : ""}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}
