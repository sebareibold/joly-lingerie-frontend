"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Lock, Mail, Eye, EyeOff, Shield, BarChart3, MonitorPlayIcon as TvMinimalPlay, ArrowLeft } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

// Componente del logo octagonal de Obbware
const ObbwareLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <div className="relative">
      <img
        src="/logo.png"
        alt="Obbware Logo"
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </div>
  )
}

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [redirected, setRedirected] = useState(false)

  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  // Manejar la redirección cuando el usuario ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated && !redirected) {
      setRedirected(true)
      navigate("/admin/dashboard", { replace: true })
    }
  }, [isAuthenticated, loading, navigate, redirected])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)

      if (success) {
        console.log("Login exitoso, navegando a /admin/dashboard")
        navigate("/admin/dashboard", { replace: true })
      } else {
        console.log("Login falló, mostrando error")
        setError("Credenciales inválidas")
      }
    } catch (error) {
      console.error("Error en envío de login:", error)
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  // Si todavía está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-cyan-400/30"></div>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no renderizar nada (la redirección se maneja en el useEffect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Elementos de fondo futuristas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid pattern más sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Textura de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_50%)]"></div>
      </div>

      {/* Panel izquierdo - Información de Obbware */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="flex flex-col justify-center px-16 py-12 w-full">
          <div className="max-w-lg">
            {/* Logo y marca de Obbware */}
            <div className="mb-12">
              <div className="flex items-center mb-8">
                <ObbwareLogo size={80} />
                <div className="ml-6">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent tracking-wide">
                    OBBWARE
                  </h1>
                  <p className="text-cyan-400 text-sm font-bold tracking-[0.2em] mt-1">NEXT-GEN TECHNOLOGY</p>
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <h2 className="text-2xl font-bold text-white">Panel de Administración</h2>
                <p className="text-gray-300 text-1xl ">Sistema de gestión empresarial</p>               
              </div>
            </div>

            {/* Características futuristas */}
            <div className="space-y-6">
              <div className="group flex items-start space-x-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-3 border border-cyan-400/30 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Seguridad Avanzada</h3>
                  <p className="text-gray-400 text-sm">
                    Protección de datos con encriptación y autenticación
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-400/30 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Inteligencia de Negocios</h3>
                  <p className="text-gray-400 text-sm">
                    Análisis predictivo y dashboards para decisiones estratégicas
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl p-3 border border-emerald-400/30 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                  <TvMinimalPlay className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Contenido Inteligente</h3>
                  <p className="text-gray-400 text-sm">
                    Automatización en creación de contenido multimedia personalizado y dinámico
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores de estado */}
            <div className="mt-12 flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-emerald-400 text-xs font-bold tracking-wide">SISTEMA ACTIVO</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-30 delay-300"></div>
                </div>
                <span className="text-cyan-400 text-xs font-bold tracking-wide">CONEXIÓN SEGURA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Login futurista */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Botón "Volver al sitio público" */}
          <div className="mb-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-700/50 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Sitio Público
            </Link>
          </div>

          {/* Contenedor del formulario con efectos */}
          <div className="relative">
            {/* Glow effect principal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl "></div>

            <div className="relative bg-gray-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 py-16">
              {/* Header del formulario */}
              <div className="text-center mb-8">

                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-6">
                  Acceso Administrativo
                </h2>
                <p className="mt-3 text-gray-400">Ingresa tus credenciales para continuar</p>

                {/* Línea decorativa */}
                <div className="mt-6 flex items-center justify-center">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                  <div className="mx-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Administrativo
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 items-center pointer-events-none hidden sm:flex">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-200" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none relative block w-full pl-12 pr-4 py-4 bg-gray-800/40 border border-gray-600/40 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 focus:bg-gray-800/60 transition-all duration-200"
                        placeholder="admin@obbware.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-focus-within:from-cyan-500/10 group-focus-within:via-transparent group-focus-within:to-blue-500/10 pointer-events-none transition-all duration-300"></div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Contraseña
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 items-center pointer-events-none hidden sm:flex">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-200" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className="appearance-none relative block w-full pl-12 pr-12 py-4 bg-gray-800/40 border border-gray-600/40 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 focus:bg-gray-800/60 transition-all duration-200"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-focus-within:from-cyan-500/10 group-focus-within:via-transparent group-focus-within:to-blue-500/10 pointer-events-none transition-all duration-300"></div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur"></div>
                    <div className="relative bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <div className="text-sm text-red-400 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Lock className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      )}
                    </span>
                    {isLoading ? "Verificando acceso..." : "Iniciar Sesión"}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>Soporte técnico:</span>
                    <span className="font-medium text-cyan-400">Obbware Technology</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
