"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo(0, 0)

    // Also force scroll after a brief delay to ensure everything is loaded
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
