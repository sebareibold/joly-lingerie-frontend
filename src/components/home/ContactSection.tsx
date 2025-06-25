"use client"

import type React from "react"

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  X,
  Youtube,
  Linkedin,
  Github,
  Globe,
} from "lucide-react"
import { useState } from "react"
import { apiService } from "../../services/api"

// NUEVO: Interfaz para el contenido de contacto
interface ContactContent {
  mainTitle: string
  subtitle: string
  description: string
  formTitle: string
  formDescription: string
  responseMessage: string
  responseDisclaimer: string
  contactInfo: {
    icon: string
    title: string
    details: string[]
    description?: string
  }[]
  socialMedia: {
    icon: string
    name: string
    handle: string
    link: string
  }[]
}

interface ContactSectionProps {
  content: ContactContent
}

// Mapeo de nombres de iconos a componentes Lucide React para la previsualización
const iconMap: { [key: string]: React.ElementType } = {
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
  Clock: Clock,
  Instagram: Instagram,
  Facebook: Facebook,
  X: X, // Twitter
  Youtube: Youtube,
  Linkedin: Linkedin,
  Github: Github,
  Globe: Globe,
  // Añade más iconos de redes sociales si es necesario
}

export default function ContactSection({ content }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("") // Nuevo estado para el mensaje de éxito

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Todos los campos marcados con * son obligatorios")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccessMessage("") // Limpiar mensaje de éxito anterior

    try {
      const response = await apiService.sendContactForm(formData)

      if (response.success) {
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
        setSuccessMessage(content.responseMessage) // Usar mensaje dinámico
      } else {
        throw new Error(response.error || "Error enviando el mensaje")
      }
    } catch (error) {
      console.error("Error sending contact form:", error)
      setError("Error enviando el mensaje. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSuccessMessage(""), 5000) // Limpiar mensaje de éxito después de 5 segundos
    }
  }

  return (
    <section id="contact" className="py-24 lg:py-32" style={{ backgroundColor: "var(--soft-creme)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <p
            className="text-sm uppercase tracking-[0.3em] font-medium mb-6 animate-fade-in-up"
            style={{ color: "var(--clay)" }}
          >
            {content.subtitle}
          </p>
          <h2
            className="font-serif text-4xl lg:text-5xl font-light mb-8 tracking-wide animate-fade-in-up"
            style={{ color: "var(--deep-clay)", animationDelay: "0.1s" }}
          >
            {content.mainTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="mb-12">
              <h3 className="font-serif text-3xl font-light mb-6 tracking-wide" style={{ color: "var(--deep-clay)" }}>
                Información de Contacto
              </h3>
              <p className="text-lg font-light leading-relaxed" style={{ color: "var(--dark-clay)" }}>
                {content.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {content.contactInfo.map((info, index) => {
                const IconComponent = iconMap[info.icon] || Mail // Fallback a Mail
                return (
                  <div
                    key={info.title}
                    className="p-6 rounded-2xl shadow-warm hover:shadow-warm-lg transition-all duration-500 animate-fade-in-up"
                    style={{
                      backgroundColor: "var(--pure-white)",
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-warm"
                      style={{ backgroundColor: "var(--clay)" }}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h4
                      className="font-serif text-lg font-medium mb-3 tracking-wide"
                      style={{ color: "var(--deep-clay)" }}
                    >
                      {info.title}
                    </h4>
                    <div className="space-y-1 mb-3">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="font-medium" style={{ color: "var(--dark-clay)" }}>
                          {detail}
                        </p>
                      ))}
                    </div>
                    {info.description && (
                      <p className="text-sm font-light" style={{ color: "var(--oak)" }}>
                        {info.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Social Media */}
            <div className="p-8 rounded-2xl shadow-warm" style={{ backgroundColor: "var(--pure-white)" }}>
              <h4 className="font-serif text-xl font-medium mb-6 tracking-wide" style={{ color: "var(--deep-clay)" }}>
                Síguenos en Redes Sociales
              </h4>
              <div className="flex space-x-4">
                {content.socialMedia.map((social) => {
                  const SocialIconComponent = iconMap[social.icon] || Globe // Fallback a Globe
                  return (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 p-4 rounded-xl border-2 hover:shadow-warm transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
                      style={{
                        borderColor: "var(--bone)",
                        backgroundColor: "var(--creme)",
                      }}
                    >
                      <SocialIconComponent className="h-6 w-6 mb-2" style={{ color: "var(--clay)" }} />
                      <p className="font-medium text-sm" style={{ color: "var(--deep-clay)" }}>
                        {social.name}
                      </p>
                      <p className="text-xs font-light" style={{ color: "var(--oak)" }}>
                        {social.handle}
                      </p>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 lg:p-12 rounded-2xl shadow-warm-lg" style={{ backgroundColor: "var(--pure-white)" }}>
            <h3 className="font-serif text-3xl font-light mb-8 tracking-wide" style={{ color: "var(--deep-clay)" }}>
              {content.formTitle}
            </h3>

            {error && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-clay)" }}
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--bone)",
                      backgroundColor: "var(--creme)",
                      color: "var(--deep-clay)",
                    }}
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Moved Phone field here */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-clay)" }}
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--bone)",
                      backgroundColor: "var(--creme)",
                      color: "var(--deep-clay)",
                    }}
                    placeholder="Tu número de teléfono"
                  />
                </div>
              </div>

              {/* Moved Email field here, as a standalone full-width field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "var(--dark-clay)" }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--bone)",
                    backgroundColor: "var(--creme)",
                    color: "var(--deep-clay)",
                  }}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--dark-clay)" }}
                >
                  Asunto *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--bone)",
                    backgroundColor: "var(--creme)",
                    color: "var(--deep-clay)",
                  }}
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--dark-clay)" }}
                >
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: "var(--bone)",
                    backgroundColor: "var(--creme)",
                    color: "var(--deep-clay)",
                  }}
                  placeholder={content.formDescription} // Usar descripción dinámica
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-white font-medium text-sm uppercase tracking-wider shadow-warm-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--clay)" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: "var(--creme)" }}>
              <p className="text-sm font-light text-center" style={{ color: "var(--dark-clay)" }}>
                {content.responseDisclaimer} {/* Usar descargo de responsabilidad dinámico */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
