"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { apiService } from "../../services/api"
import {
  Save,
  Loader2,
  XCircle,
  CheckCircle,
  User,
  Lock,
  Mail,
  Shield,
  SettingsIcon,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react"

interface UserSettings {
  username: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminSettings() {
  const { user } = useAuth()
  // Removed unused loading state and setLoading
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [settings, setSettings] = useState<UserSettings>({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const response = await apiService.updateProfile({
        username: settings.username,
        email: settings.email,
      })

      if (response.success) {
        setSuccess("Perfil actualizado exitosamente!")
      } else {
        setError(response.error || "Error al actualizar el perfil.")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Error al actualizar el perfil. Intente nuevamente.")
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validaciones
    if (!settings.currentPassword) {
      setError("La contraseña actual es requerida.")
      return
    }

    if (!settings.newPassword) {
      setError("La nueva contraseña es requerida.")
      return
    }

    if (settings.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (settings.newPassword !== settings.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setSaving(true)

    try {
      const response = await apiService.updatePassword({
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      })

      if (response.success) {
        setSuccess("Contraseña actualizada exitosamente!")
        setSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        setError(response.error || "Error al actualizar la contraseña.")
      }
    } catch (err) {
      console.error("Error updating password:", err)
      setError("Error al actualizar la contraseña. Intente nuevamente.")
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "security", name: "Seguridad", icon: Shield },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/20 border border-blue-600/40 rounded-xl flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Configuración</h1>
              <p className="text-gray-400 text-lg">Gestiona tu perfil y configuración de seguridad</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-300">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-r from-gray-800/40 via-gray-700/30 to-gray-800/40 backdrop-blur-sm border border-gray-600/40 rounded-xl p-1 mb-8 shadow-lg">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2
                    ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                    }
                  `}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-700/20 to-gray-600/10 backdrop-blur-sm border border-gray-600/40 rounded-xl p-8 shadow-lg">
          {activeTab === "profile" && (
            <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-700/5 border border-blue-600/30 rounded-xl p-6 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Información del Perfil</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre de Usuario
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={settings.username}
                          onChange={handleInputChange}
                          placeholder="Tu nombre de usuario"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={settings.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-700/5 border border-red-600/30 rounded-xl p-6 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-white">Cambiar Contraseña</h2>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-6 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-medium">Importante</h4>
                    <p className="text-yellow-200/70 text-sm">
                      Asegúrate de usar una contraseña segura con al menos 6 caracteres. Una vez cambiada, necesitarás
                      usar la nueva contraseña para iniciar sesión.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Contraseña Actual *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        id="currentPassword"
                        required
                        className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={settings.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Tu contraseña actual"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Nueva Contraseña *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={settings.newPassword}
                          onChange={handleInputChange}
                          placeholder="Nueva contraseña"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirmar Nueva Contraseña *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          required
                          minLength={6}
                          className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={settings.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirma la nueva contraseña"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Cambiar Contraseña
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
