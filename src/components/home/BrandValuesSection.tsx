"use client"

import type React from "react"
import * as LucideIcons from "lucide-react"

interface BrandValue {
  icon: string
  title: string
  description: string
}

interface BrandValuesContent {
  mainTitle: string
  subtitle: string
  values: BrandValue[]
}

interface BrandValuesSectionProps {
  content: BrandValuesContent
}

// Mapeo de nombres de string a componentes de Lucide React
const iconMap: { [key: string]: React.ElementType } = Object.keys(LucideIcons).reduce(
  (acc, key) => {
    const Component = (LucideIcons as any)[key]
    if (typeof Component === "function" && Component.displayName) {
      // Check if it's a React component
      acc[key] = Component
    }
    return acc
  },
  {} as { [key: string]: React.ElementType },
)

export default function BrandValuesSection({ content }: BrandValuesSectionProps) {
  return (
    <section className="py-16 lg:py-28" style={{ backgroundColor: "var(--pure-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-20">
          <p
            className="text-sm uppercase tracking-[0.3em] font-medium mb-4 animate-fade-in-up"
            style={{ color: "var(--clay)" }}
          >
            {content.subtitle}
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light mb-6 tracking-wide animate-fade-in-up animate-delay-200"
            style={{ color: "var(--deep-clay)" }}
          >
            {content.mainTitle}
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {content.values.map((value, index) => {
            const IconComponent = iconMap[value.icon]
            return (
              <div
                key={index}
                className="text-center p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
                style={{
                  backgroundColor: "var(--soft-creme)",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {IconComponent && (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-warm"
                    style={{ backgroundColor: "var(--clay)" }}
                  >
                    <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                )}
                <h3
                  className="font-serif text-xl sm:text-2xl font-medium mb-3 tracking-wide"
                  style={{ color: "var(--deep-clay)" }}
                >
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: "var(--dark-clay)" }}>
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
