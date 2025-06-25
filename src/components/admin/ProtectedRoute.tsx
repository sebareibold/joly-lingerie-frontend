"use client"

import type React from "react"

import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log("ProtectedRoute: user", user, "loading", loading)
    if (!loading && (!user || user.role !== "admin")) {
      console.warn("ProtectedRoute: Usuario no autenticado o no es admin. Redirigiendo a /admin/login.")
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-300 text-lg ml-4">Cargando autenticación...</p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
