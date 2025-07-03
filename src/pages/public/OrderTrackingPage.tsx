"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Truck, Info, XCircle, ArrowLeft, MessageSquare } from "lucide-react" // Mail is still imported but not used for the button
import { apiService } from "../../services/api"

interface OrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface ShippingInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode?: string
  notes?: string
}

interface Order {
  _id: string
  orderNumber: string
  userId?: string
  items: OrderItem[]
  shippingInfo: ShippingInfo
  paymentMethod: "cash" | "transfer"
  subtotal: number
  shippingCost: number
  total: number
  status: "pending_manual" | "paid" | "cancelled" | "refunded"
  notes?: string
  adminNotes?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [contactPhone, setContactPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContactPhone() {
      try {
        const response = await apiService.getSiteContent();
        if (response.success && response.content?.contact?.contactInfo) {
          const contactInfo = response.content.contact.contactInfo;
          const phoneInfo = contactInfo.find((info: { title: string; details: string[] }) => info.title === "Teléfono");
          if (phoneInfo && Array.isArray(phoneInfo.details) && phoneInfo.details[0]) {
            // Clean up the phone number for WhatsApp (remove spaces, dashes, etc)
            const raw = phoneInfo.details[0];
            const cleaned = raw.replace(/[^\d+]/g, "");
            setContactPhone(cleaned);
          }
        }
      } catch {
        setContactPhone(null);
      }
    }
    fetchContactPhone();
  }, []);

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      setError("Por favor, ingresa un número de pedido.")
      setOrder(null)
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await apiService.getOrderByOrderNumber(orderNumber.trim())
      if (response.success && response.order) {
        setOrder(response.order)
      } else {
        setError(response.error || "Pedido no encontrado. Verifica el número e intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error al buscar pedido:", err)
      setError("Error al buscar el pedido. Intenta nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig: Record<Order["status"], { class: string; text: string }> = {
      pending_manual: { class: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
      paid: { class: "bg-green-100 text-green-800", text: "Pagado" },
      cancelled: { class: "bg-red-100 text-red-800", text: "Cancelado" },
      refunded: { class: "bg-blue-100 text-blue-800", text: "Reembolsado" },
    }
    const config = statusConfig[status] || { class: "bg-gray-100 text-gray-800", text: status }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Determinar si las opciones de contacto deben mostrarse
  const showContactOptions = order && (order.status === "pending_manual" || order.status === "paid")

  // Preparar mensajes pre-rellenados para los botones de contacto
  const orderRef = order?.orderNumber || "(sin número)";
  const clientName = order?.shippingInfo.fullName || "Cliente";
  // Mensaje prellenado para contactar a la tienda (como en el carrito)
  const whatsappText = encodeURIComponent(
    `¡Hola! Quisiera consultar sobre el estado de mi pedido #${orderRef} a nombre de ${clientName}.`
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-12">
          <h1
            className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light mb-2 sm:mb-4"
            style={{ color: "var(--deep-clay)" }}
          >
            Seguimiento de Pedido
          </h1>
          <p className="text-sm sm:text-lg font-light" style={{ color: "var(--oak)" }}>
            Ingresa tu número de pedido para ver su estado actual.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-warm p-4 sm:p-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: JL-20240101-0001"
                className="w-full pl-4 pr-4 py-3 sm:py-3 border rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--bone)",
                  color: "var(--deep-clay)",
                }}
              />
            </div>
            <button
              onClick={handleTrackOrder}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-white text-xs sm:text-sm font-medium uppercase tracking-wider shadow-warm-lg transition-all hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--clay)" }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              )}
              Buscar Pedido
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start sm:items-center">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-warm p-4 sm:p-8">
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b space-y-2 sm:space-y-0"
              style={{ borderColor: "var(--bone)" }}
            >
              <h2 className="font-serif text-lg sm:text-2xl font-light" style={{ color: "var(--deep-clay)" }}>
                Pedido #{order.orderNumber}
              </h2>
              {getStatusBadge(order.status)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Order Info */}
              <div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: "var(--clay)" }} />
                  <h3 className="font-serif text-base sm:text-xl font-light" style={{ color: "var(--deep-clay)" }}>
                    Información General
                  </h3>
                </div>
                <div
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm"
                  style={{ color: "var(--oak)" }}
                >
                  <p>
                    <strong>Fecha del Pedido:</strong> {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <strong>Método de Pago:</strong>{" "}
                    {order.paymentMethod === "cash" ? "Efectivo" : "Transferencia Bancaria"}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.total.toLocaleString()}
                  </p>
                  {order.adminNotes && (
                    <p className="text-xs bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                      <strong>Notas del Administrador:</strong> {order.adminNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <div className="flex items-center mb-3 sm:mb-4">
                  {order.shippingCost > 0 ? (
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: "var(--clay)" }} />
                  ) : (
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: "var(--clay)" }} />
                  )}
                  <h3 className="font-serif text-base sm:text-xl font-light" style={{ color: "var(--deep-clay)" }}>
                    Información de Entrega
                  </h3>
                </div>
                <div
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm"
                  style={{ color: "var(--oak)" }}
                >
                  <p>
                    <strong>Nombre:</strong> {order.shippingInfo.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.shippingInfo.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {order.shippingInfo.phone}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {order.shippingInfo.address}, {order.shippingInfo.city}
                    {order.shippingInfo.postalCode && `, CP: ${order.shippingInfo.postalCode}`}
                  </p>
                  <p>
                    <strong>Costo de Envío:</strong>{" "}
                    {order.shippingCost > 0 ? `$${order.shippingCost.toLocaleString()}` : "Gratis (Retiro en punto)"}
                  </p>
                  {order.shippingInfo.notes && (
                    <p className="text-xs bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      <strong>Notas de Envío:</strong> {order.shippingInfo.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="mb-6 sm:mb-8">
              <h3
                className="font-serif text-base sm:text-xl font-light mb-3 sm:mb-4"
                style={{ color: "var(--deep-clay)" }}
              >
                Productos en el Pedido
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4">
                      <img
                        src={item.image || "/placeholder.svg?height=64&width=64"}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg border"
                        style={{ borderColor: "var(--bone)" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=64&width=64"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1 text-sm sm:text-base truncate" style={{ color: "var(--clay)" }}>
                        {item.title}
                      </h4>
                      <div className="text-xs sm:text-sm space-y-1" style={{ color: "var(--oak)" }}>
                        {item.size && <p>Talla: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm sm:text-base" style={{ color: "var(--clay)" }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: "var(--oak)" }}>
                        ${item.price.toLocaleString()} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Options for "En seguimiento" orders */}
            {showContactOptions && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t" style={{ borderColor: "var(--bone)" }}>
                <h3
                  className="font-serif text-base sm:text-xl font-light mb-3 sm:mb-4 text-center"
                  style={{ color: "var(--deep-clay)" }}
                >
                  ¿Necesitas ayuda con tu pedido?
                </h3>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <a
                    href={contactPhone ? `https://wa.me/${contactPhone}?text=${whatsappText}` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full sm:w-auto px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white transition-all duration-300 hover:shadow-lg flex items-center justify-center ${!contactPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: "var(--clay)" }}
                    aria-disabled={!contactPhone}
                    tabIndex={!contactPhone ? -1 : 0}
                  >
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {contactPhone ? 'Contactar por WhatsApp' : 'WhatsApp no disponible'}
                  </a>
                </div>
              </div>
            )}

            {/* Back to Home */}
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: "var(--deep-clay)" }}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
