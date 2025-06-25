"use client"

import { useNavigate } from "react-router-dom"

interface HeroContent {
  mainDescription: string
  slogan: string
  buttonText: string
  buttonLink: string
  heroImage?: {
    url: string
    alt: string
    filename: string
  }
}

interface HeroSectionProps {
  content: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
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
  }

  // Dividir el eslogan para aplicar el estilo itálico al segundo segmento
  const sloganParts = content.slogan.split(" ")
  const firstSloganPart = sloganParts.slice(0, -1).join(" ")
  const lastSloganPart = sloganParts[sloganParts.length - 1]

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--soft-creme)" }}
    >
      <div className="absolute inset-0">
        <img
          src={content.heroImage?.url || "/presentacion_1.jpeg"}
          alt={content.heroImage?.alt || "Mujer elegante con lencería"}
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 115, 85, 0.4) 0%, rgba(196, 181, 160, 0.2) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(139, 115, 85, 0.3) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 h-full min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <p
              className="text-white/90 text-sm sm:text-base font-light uppercase tracking-[0.4em] mb-8 animate-fade-in-up"
              style={{ color: "var(--bone)" }}
            >
              Joly Lingerie 2025
            </p>
            <h1 className="font-serif text-5xl sm:text-5xl lg:text-8xl font-light text-white mb-10 leading-[0.9] animate-fade-in-up animate-delay-200">
              {firstSloganPart}
              <br />
              <span className="font-light italic " style={{ color: "var(--bone)" }}>
                {lastSloganPart}
              </span>
            </h1>
            <p
              className="text-white/100 text-xl sm:text-2xl font-light mb-12 max-w-2xl leading-relaxed animate-fade-in-up animate-delay-400"
            >
              {content.mainDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up animate-delay-500">
              <button
                className="btn-primary text-lg px-12 py-5 hover-glow"
                onClick={() => scrollToSection(content.buttonLink)}
              >
                {content.buttonText}
              </button>
              {/*<button className="btn-secondary text-lg px-12 py-5">Guía de Tallas</button>*/}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
