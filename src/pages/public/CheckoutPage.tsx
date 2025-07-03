"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, Banknote, Building2, Check, Upload, Truck, MapPin } from "lucide-react"
import { useCart } from "../../contexts/CartContext"
import { apiService } from "../../services/api"

interface ShippingInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  notes: string
}

// Agregar interfaces para la información de checkout después de las interfaces existentes
interface CheckoutContent {
  deliveryInfo: {
    title: string
    meetingPoint: {
      enabled: boolean
      title: string
      description: string
      address: string
      schedule: string
      notes: string
    }
  }
  paymentInfo: {
    title: string
    bankTransfer: {
      enabled: boolean
      title: string
      bankName: string
      accountType: string
      accountNumber: string
      accountHolder: string
      cbu: string
      alias: string
      instructions: string
    }
    cashOnDelivery: {
      enabled: boolean
      title: string
      description: string
      additionalFee: number
      notes: string
    }
  }
  shipping: {
    enabled: boolean
    title: string
    homeDelivery: {
      enabled: boolean
      title: string
      description: string
      baseCost: number
      freeShippingThreshold: number
      estimatedDays: string
      coverage: string
      notes: string
    }
  }
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [wantsShipping, setWantsShipping] = useState(false)
  const [transferProof, setTransferProof] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({})

  // Agregar estado para el contenido de checkout después de los estados existentes
  const [checkoutContent, setCheckoutContent] = useState<CheckoutContent | null>(null)

  const subtotal = getTotalPrice()

  const shouldHaveFreeShipping =
    checkoutContent?.shipping?.homeDelivery?.freeShippingThreshold &&
    subtotal >= (checkoutContent.shipping.homeDelivery.freeShippingThreshold ?? 0)

  const shippingCost =
    wantsShipping && !shouldHaveFreeShipping ? (checkoutContent?.shipping?.homeDelivery?.baseCost ?? 2500) : 0

  const total =
    subtotal +
    shippingCost +
    (paymentMethod === "cash" && checkoutContent?.paymentInfo?.cashOnDelivery?.additionalFee
      ? checkoutContent.paymentInfo.cashOnDelivery.additionalFee
      : 0)


  // Agregar función para cargar el contenido de checkout después de useEffect existentes
  const loadCheckoutContent = async (forceRefresh = false) => {
    try {
      // Si forzamos refresh, limpiar caché específico de contenido
      if (forceRefresh) {
        // Limpiar caché del API service
        apiService.clearSiteContentCache()
      }

      const response = await apiService.getSiteContent()

      if (response.success && response.content?.checkout) {
        setCheckoutContent(response.content.checkout)
      } else {
        console.warn("⚠️ No se encontró contenido de checkout, usando valores por defecto")
        throw new Error("No checkout content found")
      }
    } catch (err) {
      console.error("❌ Error loading checkout content:", err)
    }
  }

  useEffect(() => {
    loadCheckoutContent()

    // Recargar contenido cada 5 minutos para asegurar datos actualizados
    const interval = setInterval(
      () => {
        loadCheckoutContent(true)
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  // Nuevo useEffect para recargar cuando la ventana vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 Ventana enfocada, recargando contenido de checkout...")
      loadCheckoutContent(true)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {}

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = "Formato de email inválido"
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    if (wantsShipping) {
      if (!shippingInfo.address.trim()) {
        newErrors.address = "La dirección es requerida para el envío"
      }

      if (!shippingInfo.city.trim()) {
        newErrors.city = "La ciudad es requerida para el envío"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        alert("Por favor, sube una imagen válida (JPG, PNG, WEBP)")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede superar los 5MB")
        return
      }

      setTransferProof(file)
    }
  }

  const handleCheckout = async () => {
    if (!validateForm()) {
      return
    }

    if (items.length === 0) {
      alert("Tu carrito está vacío")
      navigate("/cart")
      return
    }

    setIsProcessing(true)

    let transferProofUrl: string | undefined = undefined

    try {
      if (paymentMethod === "transfer" && transferProof) {
        const uploadResult = await apiService.uploadTransferProof(transferProof)
        if (uploadResult.success) {
          transferProofUrl = uploadResult.url
        } else {
          throw new Error(uploadResult.error || "Error al subir el comprobante de transferencia")
        }
      }

      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || "",
          color: item.color || "",
          image: item.image || "",
        })),
        shippingInfo: {
          fullName: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: wantsShipping ? shippingInfo.address : "Punto de encuentro - Av. Argentina 123, Neuquén Capital",
          city: wantsShipping ? shippingInfo.city : "Neuquén",
          postalCode: shippingInfo.postalCode || "",
          notes: shippingInfo.notes || "",
        },
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        notes:
          `${wantsShipping ? "Envío a domicilio" : "Retiro en punto de encuentro"}. ${shippingInfo.notes || ""}`.trim(),
        transferProofUrl,
      }

      console.log("Enviando orden:", orderData)

      const response = await apiService.createOrder(orderData)

      if (response.success) {
        clearCart()
        navigate(`/order-confirmation/${response.order.orderNumber}`, {
          state: {
            order: response.order,
            paymentMethod,
            wantsShipping,
          },
        })
      } else {
        throw new Error(response.error || "Error procesando la orden")
      }
    } catch (error) {
      console.error("Error en checkout:", error)

      let errorMessage = "Error procesando tu orden. Por favor intenta nuevamente."

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Hay un problema con los datos del pedido. Verifica la información e intenta nuevamente."
        } else if (error.message.includes("500")) {
          errorMessage = "Error interno del servidor. Por favor intenta más tarde o contacta soporte."
        } else if (error.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        } else if (error.message.includes("comprobante de transferencia")) {
          errorMessage = error.message
        }
      }

      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl shadow-warm">
            <h2 className="font-serif text-xl sm:text-2xl font-light mb-4" style={{ color: "var(--deep-clay)" }}>
              Tu carrito está vacío
            </h2>
            <p className="text-base sm:text-lg font-light mb-6 sm:mb-8" style={{ color: "var(--oak)" }}>
              Agrega productos antes de proceder al checkout
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-block px-6 sm:px-10 py-3 sm:py-4 text-white font-medium text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-warm-lg transition-all hover:scale-105"
              style={{ backgroundColor: "var(--clay)" }}
            >
              Explorar productos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Header - Optimizado para móvil */}
        <div className="mb-8 sm:mb-12">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            style={{ color: "var(--clay)" }}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Volver al carrito
          </button>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light" style={{ color: "var(--deep-clay)" }}>
            Finalizar Compra
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 space-y-8 lg:space-y-0">
          {/* Formulario de Checkout - Optimizado para móvil */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-warm p-4 sm:p-6 lg:p-8">
              {/* Opción de Envío - Mejorado para móvil */}
              <div className="mb-8 sm:mb-10">
                <h2
                  className="font-serif text-lg sm:text-2xl font-light mb-4 sm:mb-6"
                  style={{ color: "var(--deep-clay)" }}
                >
                  Opciones de Entrega
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div
                    className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                      !wantsShipping ? "shadow-warm" : "hover:shadow-warm"
                    }`}
                    style={{
                      borderColor: !wantsShipping ? "var(--clay)" : "var(--bone)",
                      backgroundColor: !wantsShipping ? "var(--bone)" : "var(--pure-white)",
                    }}
                    onClick={() => setWantsShipping(false)}
                  >
                    <div className="flex items-start sm:items-center">
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1 sm:mt-0"
                        style={{
                          borderColor: !wantsShipping ? "var(--clay)" : "var(--oak)",
                          backgroundColor: !wantsShipping ? "var(--clay)" : "transparent",
                        }}
                      >
                        {!wantsShipping && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                      </div>
                      <div className="flex items-start sm:items-center">
                        <MapPin
                          className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0 mt-1 sm:mt-0"
                          style={{ color: "var(--clay)" }}
                        />
                        <div>
                          <h3 className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                            {checkoutContent?.deliveryInfo.meetingPoint.title || "Retiro en Punto de Encuentro"}
                          </h3>
                          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                            {checkoutContent?.deliveryInfo.meetingPoint.description ||
                              "Coordinaremos el punto de encuentro para la entrega"}
                          </p>
                          {checkoutContent?.deliveryInfo.meetingPoint.address && (
                            <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: "var(--clay)" }}>
                              {checkoutContent.deliveryInfo.meetingPoint.address}
                            </p>
                          )}
                          {checkoutContent?.deliveryInfo.meetingPoint.schedule && (
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              {checkoutContent.deliveryInfo.meetingPoint.schedule}
                            </p>
                          )}
                          {checkoutContent?.deliveryInfo.meetingPoint.notes && (
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              {checkoutContent.deliveryInfo.meetingPoint.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                      wantsShipping ? "shadow-warm" : "hover:shadow-warm"
                    }`}
                    style={{
                      borderColor: wantsShipping ? "var(--clay)" : "var(--bone)",
                      backgroundColor: wantsShipping ? "var(--bone)" : "var(--pure-white)",
                    }}
                    onClick={() => setWantsShipping(true)}
                  >
                    <div className="flex items-start sm:items-center">
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1 sm:mt-0"
                        style={{
                          borderColor: wantsShipping ? "var(--clay)" : "var(--oak)",
                          backgroundColor: wantsShipping ? "var(--clay)" : "transparent",
                        }}
                      >
                        {wantsShipping && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                      </div>
                      <div className="flex items-start sm:items-center">
                        <Truck
                          className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0 mt-1 sm:mt-0"
                          style={{ color: "var(--clay)" }}
                        />
                        <div>
                          <h3 className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                            {checkoutContent?.shipping.homeDelivery.title || "Envío a Domicilio"}
                          </h3>
                          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                            {checkoutContent?.shipping.homeDelivery.description ||
                              "Los envíos tienen un costo adicional según tu ubicación"}
                          </p>
                          {checkoutContent?.shipping.homeDelivery.coverage && (
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              Cobertura: {checkoutContent.shipping.homeDelivery.coverage}
                            </p>
                          )}
                          {checkoutContent?.shipping.homeDelivery.estimatedDays && (
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              Tiempo estimado: {checkoutContent.shipping.homeDelivery.estimatedDays}
                            </p>
                          )}
                          {checkoutContent?.shipping.homeDelivery.freeShippingThreshold &&
                            subtotal >= checkoutContent.shipping.homeDelivery.freeShippingThreshold && (
                              <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: "var(--clay)" }}>
                                ¡Envío gratis! Tu compra supera los $
                                {checkoutContent.shipping.homeDelivery.freeShippingThreshold.toLocaleString()}
                              </p>
                            )}
                          {checkoutContent?.shipping.homeDelivery.notes && (
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              {checkoutContent.shipping.homeDelivery.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Personal - Optimizado para móvil */}
              <div className="mb-8 sm:mb-10">
                <h2
                  className="font-serif text-lg sm:text-2xl font-light mb-4 sm:mb-6"
                  style={{ color: "var(--deep-clay)" }}
                >
                  Información Personal
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Nombre y Email en una fila en desktop, separados en móvil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                          errors.fullName ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.fullName ? "#ef4444" : "var(--bone)",
                          color: "var(--deep-clay)",
                        }}
                        placeholder="Tu nombre completo"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.email ? "#ef4444" : "var(--bone)",
                          color: "var(--deep-clay)",
                        }}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.phone ? "#ef4444" : "var(--bone)",
                          color: "var(--deep-clay)",
                        }}
                        placeholder="+54 299 123 4567"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {wantsShipping && (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={`w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                            errors.city ? "border-red-500" : ""
                          }`}
                          style={{
                            borderColor: errors.city ? "#ef4444" : "var(--bone)",
                            color: "var(--deep-clay)",
                          }}
                          placeholder="Neuquén"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                    )}
                  </div>

                  {wantsShipping && (
                    <>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                          Dirección Completa *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className={`w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                            errors.address ? "border-red-500" : ""
                          }`}
                          style={{
                            borderColor: errors.address ? "#ef4444" : "var(--bone)",
                            color: "var(--deep-clay)",
                          }}
                          placeholder="Calle, número, barrio, referencias"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                            Código Postal
                          </label>
                          <input
                            type="text"
                            value={shippingInfo.postalCode}
                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                            className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2"
                            style={{
                              borderColor: "var(--bone)",
                              color: "var(--deep-clay)",
                            }}
                            placeholder="8300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                      Notas Adicionales
                    </label>
                    <textarea
                      value={shippingInfo.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                      className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--bone)",
                        color: "var(--deep-clay)",
                      }}
                      placeholder={
                        wantsShipping
                          ? "Instrucciones especiales de entrega, referencias adicionales..."
                          : "Preferencias de horario para el punto de encuentro..."
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago - Optimizado para móvil */}
              <div>
                <h2
                  className="font-serif text-lg sm:text-2xl font-light mb-4 sm:mb-6"
                  style={{ color: "var(--deep-clay)" }}
                >
                  Método de Pago
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {/* Pago en Efectivo */}
                  {checkoutContent?.paymentInfo.cashOnDelivery.enabled && (
                    <div
                      className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                        paymentMethod === "cash" ? "shadow-warm" : "hover:shadow-warm"
                      }`}
                      style={{
                        borderColor: paymentMethod === "cash" ? "var(--clay)" : "var(--bone)",
                        backgroundColor: paymentMethod === "cash" ? "var(--bone)" : "var(--pure-white)",
                      }}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <div className="flex items-start sm:items-center">
                        <div
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1 sm:mt-0"
                          style={{
                            borderColor: paymentMethod === "cash" ? "var(--clay)" : "var(--oak)",
                            backgroundColor: paymentMethod === "cash" ? "var(--clay)" : "transparent",
                          }}
                        >
                          {paymentMethod === "cash" && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                        </div>
                        <div className="flex items-start sm:items-center">
                          <Banknote
                            className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0 mt-1 sm:mt-0"
                            style={{ color: "var(--clay)" }}
                          />
                          <div>
                            <h3 className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                              {checkoutContent?.paymentInfo.cashOnDelivery.title || "Pago en Efectivo"}
                            </h3>
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              {checkoutContent?.paymentInfo.cashOnDelivery.description ||
                                "Paga en efectivo al momento de recibir tu pedido"}
                            </p>
                            {checkoutContent?.paymentInfo.cashOnDelivery.additionalFee > 0 && (
                              <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: "var(--clay)" }}>
                                Cargo adicional: $
                                {checkoutContent.paymentInfo.cashOnDelivery.additionalFee.toLocaleString()}
                              </p>
                            )}
                            {checkoutContent?.deliveryInfo.meetingPoint.address && (
                              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                                <strong>Punto de encuentro:</strong> {checkoutContent.deliveryInfo.meetingPoint.address}
                              </p>
                            )}
                            {checkoutContent?.paymentInfo.cashOnDelivery.notes && (
                              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                                {checkoutContent.paymentInfo.cashOnDelivery.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transferencia Bancaria */}
                  {checkoutContent?.paymentInfo.bankTransfer.enabled && (
                    <div
                      className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                        paymentMethod === "transfer" ? "shadow-warm" : "hover:shadow-warm"
                      }`}
                      style={{
                        borderColor: paymentMethod === "transfer" ? "var(--clay)" : "var(--bone)",
                        backgroundColor: paymentMethod === "transfer" ? "var(--bone)" : "var(--pure-white)",
                      }}
                      onClick={() => setPaymentMethod("transfer")}
                    >
                      <div className="flex items-start sm:items-center">
                        <div
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1 sm:mt-0"
                          style={{
                            borderColor: paymentMethod === "transfer" ? "var(--clay)" : "var(--oak)",
                            backgroundColor: paymentMethod === "transfer" ? "var(--clay)" : "transparent",
                          }}
                        >
                          {paymentMethod === "transfer" && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                        </div>
                        <div className="flex items-start sm:items-center">
                          <Building2
                            className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0 mt-1 sm:mt-0"
                            style={{ color: "var(--clay)" }}
                          />
                          <div>
                            <h3 className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                              {checkoutContent?.paymentInfo.bankTransfer.title || "Transferencia Bancaria"}
                            </h3>
                            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                              {checkoutContent?.paymentInfo.bankTransfer.instructions ||
                                "Una vez confirmada la transferencia, el envío puede tardar entre 2 a 3 días hábiles"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información de transferencia - Optimizada para móvil */}
                  {paymentMethod === "transfer" && checkoutContent?.paymentInfo.bankTransfer && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl" style={{ backgroundColor: "var(--bone)" }}>
                      <h4
                        className="font-medium mb-3 sm:mb-4 text-sm sm:text-base"
                        style={{ color: "var(--deep-clay)" }}
                      >
                        {checkoutContent.paymentInfo.bankTransfer.title || "Datos para la Transferencia"}
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm" style={{ color: "var(--oak)" }}>
                        <p>
                          <strong>Banco:</strong> {checkoutContent.paymentInfo.bankTransfer.bankName}
                        </p>
                        <p>
                          <strong>CBU:</strong> {checkoutContent.paymentInfo.bankTransfer.cbu}
                        </p>
                        <p>
                          <strong>Alias:</strong> {checkoutContent.paymentInfo.bankTransfer.alias}
                        </p>
                        <p>
                          <strong>Titular:</strong> {checkoutContent.paymentInfo.bankTransfer.accountHolder}
                        </p>
                        {checkoutContent.paymentInfo.bankTransfer.accountType && (
                          <p>
                            <strong>Tipo de Cuenta:</strong> {checkoutContent.paymentInfo.bankTransfer.accountType}
                          </p>
                        )}
                        {checkoutContent.paymentInfo.bankTransfer.accountNumber && (
                          <p>
                            <strong>Número de Cuenta:</strong> {checkoutContent.paymentInfo.bankTransfer.accountNumber}
                          </p>
                        )}
                      </div>

                      {checkoutContent.paymentInfo.bankTransfer.instructions && (
                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--soft-creme)" }}>
                          <p className="text-xs sm:text-sm" style={{ color: "var(--deep-clay)" }}>
                            <strong>Instrucciones:</strong>
                          </p>
                          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--oak)" }}>
                            {checkoutContent.paymentInfo.bankTransfer.instructions}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 sm:mt-6">
                        <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--oak)" }}>
                          Subir Comprobante de Transferencia (Opcional)
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <label
                            className="flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto"
                            style={{ borderColor: "var(--clay)" }}
                          >
                            <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: "var(--clay)" }} />
                            <span className="text-xs sm:text-sm truncate" style={{ color: "var(--clay)" }}>
                              {transferProof ? transferProof.name : "Seleccionar archivo"}
                            </span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                          {transferProof && (
                            <button
                              onClick={() => setTransferProof(null)}
                              className="text-xs text-red-500 hover:text-red-700 self-start sm:self-center"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <p className="text-xs mt-2" style={{ color: "var(--oak)" }}>
                          Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Orden - Optimizado para móvil */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-warm overflow-hidden lg:sticky lg:top-8">
              <div className="p-4 sm:p-6 border-b" style={{ borderColor: "var(--bone)" }}>
                <h2 className="font-serif text-lg sm:text-2xl font-light" style={{ color: "var(--deep-clay)" }}>
                  Resumen de Orden
                </h2>
              </div>

              <div className="p-4 sm:p-6">
                {/* Productos - Compacto para móvil */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center">
                      <div
                        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 flex-shrink-0 overflow-hidden rounded-xl border"
                        style={{ borderColor: "var(--bone)" }}
                      >
                        <img
                          src={item.image || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-sm truncate" style={{ color: "var(--deep-clay)" }}>
                          {item.name}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--oak)" }}>
                          {item.size && `Talla: ${item.size}`}
                          {item.color && item.size && " | "}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-xs" style={{ color: "var(--oak)" }}>
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm font-medium" style={{ color: "var(--deep-clay)" }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales - Compacto para móvil */}
                <div className="space-y-3 sm:space-y-4 border-t pt-4 sm:pt-6" style={{ borderColor: "var(--bone)" }}>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base" style={{ color: "var(--oak)" }}>
                      {wantsShipping ? "Envío" : "Punto de encuentro"}
                    </span>
                    <span className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                      {wantsShipping
                        ? shouldHaveFreeShipping
                          ? "Gratis"
                          : `$${shippingCost.toLocaleString()}`
                        : "Gratis"}
                    </span>
                  </div>

                  {/* Mostrar información adicional sobre envío gratis */}
                  {wantsShipping &&
                    checkoutContent?.shipping?.homeDelivery?.freeShippingThreshold &&
                    !shouldHaveFreeShipping && (
                      <div className="text-xs" style={{ color: "var(--oak)" }}>
                        Envío gratis en compras superiores a $
                        {checkoutContent.shipping.homeDelivery.freeShippingThreshold.toLocaleString()}
                      </div>
                    )}

                  {/* Mostrar cargo adicional por pago en efectivo si aplica */}
                  {paymentMethod === "cash" &&
                    checkoutContent?.paymentInfo?.cashOnDelivery?.additionalFee &&
                    checkoutContent.paymentInfo.cashOnDelivery.additionalFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm sm:text-base" style={{ color: "var(--oak)" }}>
                          Cargo pago en efectivo
                        </span>
                        <span className="font-medium text-sm sm:text-base" style={{ color: "var(--deep-clay)" }}>
                          ${checkoutContent.paymentInfo.cashOnDelivery.additionalFee.toLocaleString()}
                        </span>
                      </div>
                    )}
                </div>

                {/* Botón de Checkout - Optimizado para móvil */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-xl text-white text-xs sm:text-sm font-medium uppercase tracking-wider shadow-warm-lg transition-all hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--clay)" }}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      Confirmar Pedido
                    </>
                  )}
                </button>

                <p className="text-xs text-center mt-3 sm:mt-4" style={{ color: "var(--oak)" }}>
                  Al confirmar tu pedido, aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
