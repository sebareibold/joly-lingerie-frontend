"use client"

import { User, ShoppingBag, Menu, X } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../contexts/CartContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const navigate = useNavigate()

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== "/") {
      navigate("/")
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    setIsMenuOpen(false)
  }

  const navItems = [
    { name: "Inicio", action: () => scrollToSection("inicio") },
    { name: "Productos", action: () => scrollToSection("products") },
    { name: "Contacto", action: () => scrollToSection("contact") },
    { name: "Seguimiento de Pedido", action: () => navigate("/track-order") }, // Nuevo elemento
  ]

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/50 sticky top-0 z-50 shadow-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          {" "}
          {/* Ajustado h-14 para móvil */}
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="font-serif text-lg sm:text-xl lg:text-2xl font-medium tracking-wide" /* Ajustado text-lg para móvil */
              style={{ color: "var(--deep-clay)" }}
            >
              Joly{" "}
              <span className="font-light italic" style={{ color: "var(--clay)" }}>
                Lingerie
              </span>
              <sup className="text-xs font-normal" style={{ color: "var(--oak)" }}>
                ™
              </sup>
            </Link>
          </div>
          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex space-x-12">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className="font-light text-sm uppercase tracking-[0.15em] transition-all duration-300 relative group"
                style={{ color: "var(--dark-clay)" }}
              >
                {item.name}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ background: "linear-gradient(to right, var(--clay), var(--oak))" }}
                ></span>
              </button>
            ))}
          </nav>
          {/* Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {" "}
            {/* Ajustado space-x para móvil */}
            {/* Admin Login Icon */}
            <Link to="/admin/login">
              <User
                className="h-5 w-5 cursor-pointer transition-colors"
                style={{ color: "var(--clay)" }}
                title="Admin Login"
              />
            </Link>
            {/* Cart Icon */}
            <Link to="/cart" className="relative">
              <ShoppingBag className="h-5 w-5 cursor-pointer transition-colors" style={{ color: "var(--clay)" }} />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg"
                  style={{ background: "var(--clay)" }}
                >
                  {getTotalItems()}
                </span>
              )}
            </Link>
            {/* Mobile Menu Toggle */}
            <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X className="h-6 w-6" style={{ color: "var(--clay)" }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: "var(--clay)" }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/50 py-4 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="font-light text-sm uppercase tracking-[0.15em] py-2 text-left transition-colors"
                  style={{ color: "var(--dark-clay)" }}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
