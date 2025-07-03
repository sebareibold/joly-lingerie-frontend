"use client"

import { NavLink } from "react-router-dom"
import {
  Package,
  Settings,
  LogOut,
  Home,
  ShoppingCart,
  Megaphone,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

export default function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (isCollapsed: boolean) => void
}) {
  const { logout, user } = useAuth()

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home, exact: true },
    { name: "Productos", href: "/admin/products", icon: Package },
    { name: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
    { name: "Publicidad", href: "/admin/advertising", icon: Megaphone },
    { name: "Contenido", href: "/admin/content", icon: FileText },
    { name: "Config", href: "/admin/settings", icon: Settings },
  ]

  // Mobile Navbar Component
  const MobileNavbar = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-emerald-900/10 opacity-50"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          
          <h1 className="text-white text-lg font-light">
            Joly Lingerie <span className="font-thin text-gray-400"> Administración</span>
          </h1>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="relative p-2 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors duration-200" />
            ) : (
              <Menu className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors duration-200" />
            )}
          </div>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isSidebarOpen && (
        <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl animate-slideInDown">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-emerald-900/5 opacity-50"></div>

          <div className="relative z-10 px-4 py-4 space-y-2">
            {/* Navigation Items */}
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.exact}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 text-white border border-blue-500/30 shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10"></div>
                    )}
                    <item.icon className={`h-5 w-5 shrink-0 relative z-10 ${isActive ? "text-blue-300" : ""}`} />
                    <span className="relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* User Info */}
            {user && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30">
                <div className="flex items-center gap-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-lg flex items-center justify-center border border-blue-500/30 shrink-0">
                    <User className="h-4 w-4 text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.username || user.email?.split("@")[0] || "Admin"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">Administrador</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsSidebarOpen(false)
                logout()
              }}
              className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-medium leading-6 text-gray-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20 hover:text-red-300 hover:border-red-600/30 transition-all duration-200 mt-2"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Desktop Sidebar Component (unchanged)
  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex fixed inset-y-0 z-50 flex-col bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 border-r border-slate-700/50 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out
      ${isSidebarCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-emerald-900/5 opacity-50"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-4 relative z-10 min-h-[72px]">
        <div className="flex-1 flex items-center justify-between">
          {/* Logo/Title */}
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? "hidden" : ""}`}>
            <h1 className="text-white text-xl font-light">
              Joly Lenceria<span className="font-thin text-gray-400"> Admin</span>
            </h1>
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-emerald-600/50 mt-2 rounded-full"></div>
          </div>

          {/* Collapse button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 ml-2"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 relative z-10 overflow-y-auto">
        <ul role="list" className="space-y-1 py-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                end={item.exact}
                className={({ isActive }) =>
                  `group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 text-white border border-blue-500/30 shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50"
                  }
                  ${isSidebarCollapsed ? "justify-center px-3" : ""}`
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10"></div>
                    )}
                    <item.icon className={`h-6 w-6 shrink-0 relative z-10 ${isActive ? "text-blue-300" : ""}`} />
                    <span className={`relative z-10 ${isSidebarCollapsed ? "hidden" : ""}`}>{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section with user info and logout */}
      <div className="p-4 border-t border-slate-700/50 relative z-10">
        {/* User Info */}
        {user && (
          <div
            className={`mb-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 transition-all duration-300
            ${isSidebarCollapsed ? "flex justify-center px-3" : ""}`}
            title={isSidebarCollapsed ? user.username || user.email : undefined}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-x-3"}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-lg flex items-center justify-center border border-blue-500/30 shrink-0">
                <User className="h-4 w-4 text-blue-300" />
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "hidden" : ""}`}>
                <p className="text-sm font-medium text-white truncate">
                  {user.username || user.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-xs text-gray-400 truncate">Administrador</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-medium leading-6 text-gray-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20 hover:text-red-300 hover:border-red-600/30 transition-all duration-200
          ${isSidebarCollapsed ? "justify-center px-3" : ""}`}
          title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className={`transition-all duration-300 ${isSidebarCollapsed ? "hidden" : ""}`}>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <MobileNavbar />
      <DesktopSidebar />
    </>
  )
}
