"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import { CheckCircle, AlertTriangle, RefreshCw, Server } from "lucide-react"

interface BackendStatusProps {
  className?: string
}

const BackendStatus: React.FC<BackendStatusProps> = ({ className = "" }) => {
  const CHECK_INTERVAL = 30000 // 30 segundos
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [checking, setChecking] = useState(false)

  const checkConnection = async () => {
    setChecking(true)
    try {
      const connected = await apiService.healthCheck()
      setIsConnected(connected)
      setLastChecked(new Date())
    } catch (error) {
      console.error("Error checking backend connection:", error)
      setIsConnected(false)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    // Check connection on mount
    checkConnection()

    // Set up interval to check connection periodically
    const interval = setInterval(() => {
      checkConnection()
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Gradient styles consistent with admin orders section
  const getCardStyles = () => {
    if (isConnected === null) {
      return {
        container:
          "bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-700/10 border border-gray-600/30 text-gray-100",
        accent: "border-l-4 border-gray-500/50",
        icon: "text-gray-400",
        status: "text-gray-300",
      }
    } else if (isConnected) {
      return {
        container:
          "bg-gradient-to-br from-emerald-900/30 via-emerald-800/20 to-emerald-700/10 border border-emerald-600/30 text-emerald-50",
        accent: "border-l-4 border-emerald-500/60",
        icon: "text-emerald-400",
        status: "text-emerald-200",
      }
    } else {
      return {
        container:
          "bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-700/10 border border-red-600/30 text-red-50",
        accent: "border-l-4 border-red-500/60",
        icon: "text-red-400",
        status: "text-red-200",
      }
    }
  }

  const styles = getCardStyles()

  const getStatusInfo = () => {
    if (isConnected === null) {
      return {
        icon: RefreshCw,
        text: "Verificando...",
        iconClass: "animate-spin",
      }
    } else if (isConnected) {
      return {
        icon: CheckCircle,
        text: "Conectado",
        iconClass: "",
      }
    } else {
      return {
        icon: AlertTriangle,
        text: "Desconectado",
        iconClass: "animate-pulse",
      }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div
      className={`
      relative overflow-hidden rounded-xl transition-all duration-500 ease-in-out
      hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20
      backdrop-blur-sm
      ${styles.container}
      ${styles.accent}
      ${className}
    `}
    >
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Server icon with gradient background */}
            <div
              className={`
              p-2 rounded-lg transition-all duration-300
              ${
                isConnected === null
                  ? "bg-gray-800/40 border border-gray-600/30"
                  : isConnected
                    ? "bg-emerald-800/40 border border-emerald-600/30"
                    : "bg-red-800/40 border border-red-600/30"
              }
            `}
            >
              <Server className={`h-5 w-5 ${styles.icon}`} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">Estado del Backend</span>
                <StatusIcon className={`h-4 w-4 ${styles.status} ${statusInfo.iconClass}`} />
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-sm font-medium ${styles.status}`}>{statusInfo.text}</span>
                {isConnected !== null && (
                  <div
                    className={`
                    w-2 h-2 rounded-full transition-all duration-500
                    ${
                      isConnected
                        ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"
                        : "bg-red-400 shadow-lg shadow-red-400/50 animate-pulse"
                    }
                  `}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Refresh button with enhanced styling */}
          <button
            onClick={checkConnection}
            disabled={checking}
            className={`
              group relative mt-1.5 ml-4 p-1.5 rounded-lg transition-all duration-300
              hover:scale-110 active:scale-95
              ${
                isConnected === null
                  ? "bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/40"
                  : isConnected
                    ? "bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-600/40"
                    : "bg-red-800/60 hover:bg-red-700/60 border border-red-600/40"
              }
            `}
            title="Verificar conexión"
          >
            <RefreshCw
              className={`
              h-4 w-4 transition-all duration-300
              ${checking ? "animate-spin" : "group-hover:rotate-180"}
              ${styles.icon}
            `}
            />
          </button>
        </div>

        {/* Connection details with enhanced styling */}
        <div className="mt-3 pt-3 border-t border-current/10">
          <div className="grid grid-cols-1 gap-2 text-xs">
            

            {lastChecked && (
              <div className="flex justify-between items-center">
                <span className="text-current/70 font-medium">Última verificación:</span>
                <span className="text-current/90 font-medium">{lastChecked.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
          <div
            className={`
            h-full transition-all duration-1000 ease-out
            ${
              isConnected === null
                ? "w-1/2 bg-gradient-to-r from-gray-500 to-gray-400 animate-pulse"
                : isConnected
                  ? "w-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "w-full bg-gradient-to-r from-red-500 to-red-400"
            }
          `}
          />
        </div>
      </div>
    </div>
  )
}

export default BackendStatus
