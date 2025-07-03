"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  Edit3,
  Save,
  AlertTriangle,
  DollarSign,
  ImageIcon,
} from "lucide-react"
import { apiService } from "../../services/api"

interface Order {
  _id: string
  orderNumber: string
  shippingInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode?: string
    notes?: string
  }
  paymentMethod: "cash" | "transfer"
  status:
    | "pending_manual"
    | "pending_transfer_proof"
    | "pending_transfer_confirmation"
    | "paid"
    | "cancelled"
    | "refunded"
    | "confirmado"
  subtotal: number
  shippingCost: number
  total: number
  notes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  transferProofUrl?: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }>
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  // Removed unused editingNotes state

  useEffect(() => {
    if (id) {
      loadOrder(id)
    }
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getOrder(orderId)

      if (response.success) {
        setOrder(response.order)
        setNewStatus(response.order.status)
        setAdminNotes(response.order.adminNotes || "")
      } else {
        throw new Error(response.error || "Error cargando la orden")
      }
    } catch (err: unknown) {
      // Type 'err' as unknown
      console.error("Error loading order:", err)
      setError(err instanceof Error ? err.message : "Error cargando la orden") // Narrow type
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !id) return

    try {
      setUpdating(true)

      const response = await apiService.updateOrderStatus(id, newStatus, adminNotes)

      if (response.success) {
        setOrder(response.order)
        // Removed setEditingNotes(false)
        // Show success message
        const successDiv = document.createElement("div")
        successDiv.className = "fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        successDiv.textContent = "Orden actualizada exitosamente!"
        document.body.appendChild(successDiv)
        setTimeout(() => document.body.removeChild(successDiv), 3000)
      } else {
        throw new Error(response.error || "Error actualizando la orden")
      }
    } catch (err: unknown) {
      // Type 'err' as unknown
      console.error("Error updating order:", err)
      alert(`Error actualizando la orden: ${err instanceof Error ? err.message : "Error desconocido"}`) // Narrow type
    } finally {
      setUpdating(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: {
      [key: string]: {
        label: string
        className: string
        icon: React.ElementType
        bgClass: string
      }
    } = {
      // Add index signature
      pending_manual: {
        label: "Pendiente (Efectivo)",
        className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
        icon: Clock,
        bgClass: "bg-amber-500/10",
      },
      pending_transfer_proof: {
        label: "Pendiente (Falta Comprobante)",
        className: "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30",
        icon: ImageIcon, // Nuevo icono
        bgClass: "bg-orange-500/10",
      },
      pending_transfer_confirmation: {
        label: "Pendiente (Verificar Comprobante)",
        className: "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30",
        icon: CreditCard, // O un icono más específico de revisión
        bgClass: "bg-purple-500/10",
      },
      paid: {
        label: "Pagado",
        className: "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30",
        icon: CheckCircle,
        bgClass: "bg-emerald-500/10",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30",
        icon: XCircle,
        bgClass: "bg-red-500/10",
      },
      refunded: {
        label: "Reembolsado",
        className: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
        icon: RefreshCw,
        bgClass: "bg-blue-500/10",
      },
      confirmado: {
        label: "Confirmado",
        className: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
        icon: CheckCircle,
        bgClass: "bg-blue-500/10",
      },
    }

    return configs[status] || configs.pending_manual
  }

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status)
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.className}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {config.label}
      </span>
    )
  }

  const getPaymentMethodText = (method: string) => {
    return method === "cash" ? "Pago en Efectivo" : "Transferencia Bancaria"
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Cargando orden...</h1>
          </div>
        </div>

        <div className="admin-card p-8 text-center">
          {" "}
          {/* Usando admin-card */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando detalles de la orden...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          </div>
        </div>

        <div className="admin-card p-8 text-center">
          {" "}
          {/* Usando admin-card */}
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error cargando la orden</h3>
          <p className="text-gray-400 mb-4">{error || "Orden no encontrada"}</p>
          <button
            onClick={() => id && loadOrder(id)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 mx-auto"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Orden #{order.orderNumber}</h1>
            <p className="text-gray-400">
              Creada el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              a las{" "}
              {new Date(order.createdAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${statusConfig.bgClass} border border-gray-700/50`}>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Products Section */}
          <div className="admin-card overflow-hidden">
            {" "}
            {/* Usando admin-card */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Package className="h-5 w-5 mr-3 text-blue-400" />
                Productos ({order.items.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gray-900/30 rounded-xl border border-gray-700/30"
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-600/50">
                      <img
                        src={item.image || "/placeholder.svg?height=80&width=80"}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-white mb-1">{item.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        {item.size && <span className="px-2 py-1 bg-gray-700/50 rounded-md">Talla: {item.size}</span>}
                        {item.color && <span className="px-2 py-1 bg-gray-700/50 rounded-md">Color: {item.color}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">
                          Cantidad: <span className="font-medium text-white">{item.quantity}</span>
                        </span>
                        <span className="text-gray-300">
                          Precio unitario:{" "}
                          <span className="font-medium text-white">${item.price.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        ${(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="bg-gray-900/30 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-medium">${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Costo de envío</span>
                    <span className="font-medium">
                      {order.shippingCost === 0 ? "Gratis" : `$${order.shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-white pt-3 border-t border-gray-700/50">
                    <span>Total</span>
                    <span>${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="admin-card overflow-hidden">
            {" "}
            {/* Usando admin-card */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <User className="h-5 w-5 mr-3 text-emerald-400" />
                Información del Cliente
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    Datos de Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-900/30 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <span className="text-gray-400 text-sm">Nombre completo</span>
                        <div className="font-medium text-white">{order.shippingInfo.fullName}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-900/30 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <span className="text-gray-400 text-sm">Email</span>
                        <div className="font-medium text-white">{order.shippingInfo.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <span className="text-gray-400 text-sm">Teléfono</span>
                        <div className="font-medium text-white">{order.shippingInfo.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-red-400" />
                    Dirección de Envío
                  </h3>
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <div className="space-y-2 text-gray-300">
                      <div className="font-medium text-white">{order.shippingInfo.address}</div>
                      <div>{order.shippingInfo.city}</div>
                      {order.shippingInfo.postalCode && <div>CP: {order.shippingInfo.postalCode}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {order.shippingInfo.notes && (
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-yellow-400" />
                    Notas del Cliente
                  </h3>
                  <div className="p-4 bg-gray-900/30 rounded-lg border-l-4 border-yellow-500/50">
                    <p className="text-gray-300 italic">"{order.shippingInfo.notes}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Payment Information */}
          <div className="admin-card overflow-hidden">
            {" "}
            {/* Usando admin-card */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-purple-400" />
                Información de Pago
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-gray-900/30 rounded-lg">
                <span className="text-gray-400 text-sm">Método de Pago</span>
                <div className="font-semibold text-white mt-1 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                  {getPaymentMethodText(order.paymentMethod)}
                </div>
              </div>

              <div className="p-4 bg-gray-900/30 rounded-lg">
                <span className="text-gray-400 text-sm">Estado Actual</span>
                <div className="mt-2">{getStatusBadge(order.status)}</div>
              </div>

              {/* NUEVO: Sección para el comprobante de transferencia */}
              {order.paymentMethod === "transfer" && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="text-blue-400 text-sm">Comprobante de Transferencia</span>
                  <div className="font-semibold text-white mt-1">
                    {order.transferProofUrl ? (
                      <div className="mt-2">
                        <img
                          src={order.transferProofUrl || "/placeholder.svg"}
                          alt="Comprobante de Transferencia"
                          className="max-w-full h-auto rounded-lg shadow-md border border-gray-700/50"
                        />
                        <a
                          href={order.transferProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200 mt-2 text-sm"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Ver en tamaño completo
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm mt-2">No se adjuntó comprobante de transferencia.</p>
                    )}
                  </div>
                </div>
              )}

              {order.paidAt && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-emerald-400 text-sm">Fecha de Pago</span>
                  <div className="font-semibold text-white mt-1">
                    {new Date(order.paidAt).toLocaleDateString("es-ES")} a las{" "}
                    {new Date(order.paidAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="admin-card overflow-hidden">
            {" "}
            {/* Usando admin-card */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                Cronología
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-white">Orden Creada</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("es-ES")} a las{" "}
                      {new Date(order.createdAt).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {order.updatedAt !== order.createdAt && (
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">Última Actualización</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(order.updatedAt).toLocaleDateString("es-ES")} a las{" "}
                        {new Date(order.updatedAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {order.paidAt && (
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-white">Pago Confirmado</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(order.paidAt).toLocaleDateString("es-ES")} a las{" "}
                        {new Date(order.paidAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="admin-card overflow-hidden">
            {" "}
            {/* Usando admin-card */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Edit3 className="h-5 w-5 mr-3 text-orange-400" />
                Actualizar Estado
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Nuevo Estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-input" /* Usando admin-input */
                >
                  <option value="pending_manual">Pendiente (Efectivo)</option>
                  <option value="pending_transfer_proof">Pendiente (Falta Comprobante)</option>
                  <option value="pending_transfer_confirmation">Pendiente (Verificar Comprobante)</option>
                  <option value="paid">Pagado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refunded">Reembolsado</option>
                  <option value="confirmado">Confirmado</option>
                </select>
              </div>

              <div></div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating || (newStatus === order.status && adminNotes === (order.adminNotes || ""))}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Orden
                  </>
                )}
              </button>

              {newStatus !== order.status && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                    <span className="text-amber-400 text-sm">
                      Cambiarás el estado de "{getStatusConfig(order.status).label}" a "
                      {getStatusConfig(newStatus).label}"
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Order Button */}
          {order && order.status === 'pending_manual' && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
              onClick={async () => {
                setUpdating(true);
                try {
                  const response = await fetch(`/api/orders/${order._id}/confirm`, { method: 'PATCH' });
                  const data = await response.json();
                  if (data.success) {
                    setOrder(data.order);
                  } else {
                    alert('Error confirmando la orden: ' + (data.error || '')); 
                  }
                } catch {
                  alert('Error confirmando la orden');
                } finally {
                  setUpdating(false);
                }
              }}
              disabled={updating}
            >
              Confirmar Orden
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
