"use client"

import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import {
  CheckCircle,
  Copy,
  Printer,
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Building2,
  MessageCircle,
} from "lucide-react"

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const orderData = location.state?.order
  const paymentMethod = location.state?.paymentMethod
  const wantsShipping = location.state?.wantsShipping
  const transferProof = location.state?.transferProof

  useEffect(() => {
    if (!orderData) {
      navigate("/")
    }
  }, [orderData, navigate])

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrintInvoice = () => {
    // Crear ventana de factura
    const invoiceWindow = window.open("", "_blank", "width=800,height=600")
    if (!invoiceWindow) return

    const invoiceHTML = generateInvoiceHTML()
    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()

    // Esperar a que cargue y luego imprimir
    invoiceWindow.onload = () => {
      invoiceWindow.print()
      invoiceWindow.close()
    }
  }

  const generateInvoiceHTML = () => {
    const currentDate = new Date().toLocaleDateString("es-AR")
    const orderDate = new Date(orderData.createdAt || Date.now()).toLocaleDateString("es-AR")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura - Orden #${orderNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
          :root {
            --soft-creme: #F8F5ED;
            --light-beige: #D4C7B8; /* Nuevo beige más claro */
            --medium-beige: #B8A799; /* Nuevo beige medio */
            --dark-beige: #8C7B6F; /* Nuevo beige más oscuro */
            --text-color: #5C4033; /* Color de texto general, un marrón suave */
            --bone: #E0DCD4;
            --green-success: #4CAF50;
            --blue-info: #2196F3;
            --amber-warning: #FFC107;
          }

          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Open Sans', sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            background-color: #ffffff; /* Fondo blanco para la factura */
            box-shadow: 0 0 15px rgba(0,0,0,0.05);
            font-size: 14px; /* Fuente base más pequeña */
          }
          .header {
            text-align: center;
            padding-bottom: 20px; /* Reducido */
            margin-bottom: 30px; /* Reducido */
            border-bottom: 1px solid var(--bone);
          }
          .company-name {
            font-family: 'Playfair Display', serif;
            font-size: 30px; /* Reducido */
            font-weight: 700;
            color: var(--dark-beige); /* Usando el nuevo color */
            margin-bottom: 5px; /* Reducido */
          }
          .company-info {
            font-size: 13px; /* Reducido */
            color: var(--text-color);
          }
          .invoice-title {
            font-family: 'Playfair Display', serif;
            font-size: 24px; /* Reducido */
            font-weight: 700;
            color: var(--dark-beige); /* Usando el nuevo color */
            text-align: center;
            margin: 25px 0; /* Reducido */
            text-transform: uppercase;
          }
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 18px; /* Reducido */
            font-weight: 700;
            color: var(--dark-beige); /* Usando el nuevo color */
            margin-bottom: 10px; /* Reducido */
            border-bottom: 1px solid var(--bone);
            padding-bottom: 5px;
          }
          .invoice-details, .customer-info, .payment-info, .order-notes {
            background: var(--soft-creme);
            padding: 18px; /* Reducido */
            border-radius: 8px;
            margin-bottom: 20px; /* Reducido */
            border: 1px solid var(--bone);
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            font-size: 14px; /* Reducido */
          }
          .invoice-details strong {
            color: var(--medium-beige); /* Usando el nuevo color */
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px; /* Reducido */
          }
          .items-table th, .items-table td {
            border: 1px solid var(--bone);
            padding: 10px; /* Reducido */
            text-align: left;
            font-size: 14px; /* Reducido */
          }
          .items-table th {
            background: var(--medium-beige); /* Usando el nuevo color */
            color: white;
            font-weight: 600;
            text-transform: uppercase;
          }
          .items-table tr:nth-child(even) {
            background: #fcfafa;
          }
          .totals {
            text-align: right;
            margin-top: 25px; /* Reducido */
          }
          .totals table {
            margin-left: auto;
            border-collapse: collapse;
            width: 50%;
          }
          .totals td {
            padding: 6px 15px; /* Reducido */
            border-bottom: 1px solid var(--bone);
            font-size: 15px; /* Reducido */
          }
          .total-final {
            font-weight: 700;
            font-size: 18px; /* Reducido */
            color: var(--dark-beige); /* Usando el nuevo color */
            border-top: 2px solid var(--medium-beige) !important; /* Usando el nuevo color */
            padding-top: 8px !important; /* Reducido */
          }
          .footer {
            margin-top: 40px; /* Reducido */
            text-align: center;
            font-size: 12px; /* Reducido */
            color: var(--text-color);
            border-top: 1px solid var(--bone);
            padding-top: 20px; /* Reducido */
          }
          .info-box {
            padding: 10px; /* Reducido */
            border-radius: 6px;
            margin-top: 8px; /* Reducido */
            font-size: 12px; /* Reducido */
            line-height: 1.5;
          }
          .info-box.blue {
            background-color: rgba(33, 150, 243, 0.1);
            border-left: 4px solid var(--blue-info);
            color: #0D47A1;
          }
          .info-box.green {
            background-color: rgba(76, 175, 80, 0.1);
            border-left: 4px solid var(--green-success);
            color: #1B5E20;
          }
          .info-box.amber {
            background-color: rgba(255, 193, 7, 0.1);
            border-left: 4px solid var(--amber-warning);
            color: #FF6F00;
          }
          .text-bold { font-weight: 600; color: var(--medium-beige); } /* Usando el nuevo color */
          .text-muted { color: var(--text-color); }

          @media print {
            body {
              margin: 0;
              padding: 0;
              box-shadow: none;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">JOLY LENCERÍA</div>
          <div class="company-info">
            Av. Argentina 123, Neuquén Capital<br>
            Tel: (0299) 512-3456 | Email: info@jolylenceria.com<br>
            CUIT: 30-12345678-9
          </div>
        </div>

        <div class="invoice-title">Factura de Venta</div>

        <div class="invoice-details">
          <div>
            <span class="text-bold">Número de Orden:</span> #${orderNumber}<br>
            <span class="text-bold">Fecha de Emisión:</span> ${currentDate}<br>
            <span class="text-bold">Fecha de Pedido:</span> ${orderDate}
          </div>
          <div style="text-align: right;">
            <span class="text-bold">Estado:</span> ${orderData.status === "paid" ? "PAGADO" : "PENDIENTE"}<br>
            <span class="text-bold">Método de Pago:</span> ${paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
          </div>
        </div>

        <div class="customer-info">
          <div class="section-title">Datos del Cliente</div>
          <p><span class="text-bold">Nombre:</span> ${orderData.shippingInfo?.fullName || "N/A"}</p>
          <p><span class="text-bold">Email:</span> ${orderData.shippingInfo?.email || "N/A"}</p>
          <p><span class="text-bold">Teléfono:</span> ${orderData.shippingInfo?.phone || "N/A"}</p>
          <p><span class="text-bold">Dirección:</span> ${orderData.shippingInfo?.address || "N/A"}</p>
          <p><span class="text-bold">Ciudad:</span> ${orderData.shippingInfo?.city || "N/A"}</p>
        </div>

        ${
          paymentMethod === "transfer"
            ? `
        <div class="payment-info">
          <div class="section-title">Información de Transferencia</div>
          <div class="info-box blue">
            <p><span class="text-bold">CBU:</span> 0110599520000012345678</p>
            <p><span class="text-bold">Alias:</span> JOLY.LINGERIE</p>
            <p><span class="text-bold">Titular:</span> Joly Lingerie S.A.S.</p>
            <p><span class="text-bold">Monto a transferir:</span> $${orderData.total?.toLocaleString("es-AR")}</p>
          </div>
        </div>
        `
            : ""
        }

        <table class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Talla/Color</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${
              orderData.items
                ?.map(
                  (item: any) => `
              <tr>
                <td>${item.title}</td>
                <td>${item.size || ""} ${item.color ? `/ ${item.color}` : ""}</td>
                <td>${item.quantity}</td>
                <td>$${item.price?.toLocaleString("es-AR")}</td>
                <td>$${(item.price * item.quantity)?.toLocaleString("es-AR")}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>$${orderData.subtotal?.toLocaleString("es-AR")}</td>
            </tr>
            <tr>
              <td>${wantsShipping ? "Envío:" : "Punto de encuentro:"}</td>
              <td>${wantsShipping ? `$${orderData.shippingCost?.toLocaleString("es-AR")}` : "Gratis"}</td>
            </tr>
            <tr class="total-final">
              <td><strong>TOTAL:</strong></td>
              <td><strong>$${orderData.total?.toLocaleString("es-AR")}</strong></td>
            </tr>
          </table>
        </div>

        ${
          orderData.notes
            ? `
        <div class="order-notes">
          <div class="section-title">Notas Adicionales</div>
          <p>${orderData.notes}</p>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p><span class="text-bold">¡Gracias por tu compra!</span></p>
          <p>Esta factura fue generada automáticamente el ${currentDate}</p>
          <p>Para consultas sobre tu pedido, contactanos por WhatsApp: +54 299 512 3456</p>
          ${
            paymentMethod === "cash"
              ? '<p class="info-box amber"><strong>IMPORTANTE:</strong> El pago se realizará en efectivo en el punto de encuentro.</p>'
              : '<p class="info-box amber"><strong>IMPORTANTE:</strong> Envía el comprobante de transferencia para confirmar tu pago.</p>'
          }
        </div>
      </body>
      </html>
    `
  }

  const handleWhatsAppContact = () => {
    const message = `Hola! Acabo de realizar la orden #${orderNumber}. Me gustaría confirmar los detalles y coordinar ${wantsShipping ? "el envío" : "el punto de encuentro"}.`
    const whatsappUrl = `https://wa.me/5492995123456?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--soft-creme)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto mb-4"></div>
          <p style={{ color: "var(--clay)" }}>Cargando información de la orden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-light mb-4" style={{ color: "var(--deep-clay)" }}>
            ¡Orden Confirmada!
          </h1>
          <p className="text-lg font-light" style={{ color: "var(--oak)" }}>
            Tu pedido ha sido recibido y está siendo procesado
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-warm overflow-hidden mb-8">
          <div className="p-8">
            {/* Order Number */}
            <div
              className="flex items-center justify-between mb-8 pb-6 border-b"
              style={{ borderColor: "var(--bone)" }}
            >
              <div>
                <h2 className="font-serif text-2xl font-light mb-2" style={{ color: "var(--deep-clay)" }}>
                  Número de Orden
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-mono font-bold" style={{ color: "var(--clay)" }}>
                    #{orderNumber}
                  </span>
                  <button
                    onClick={copyOrderNumber}
                    className="flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "var(--bone)", color: "var(--clay)" }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: "var(--oak)" }}>
                  Fecha del pedido
                </p>
                <p className="text-lg" style={{ color: "var(--clay)" }}>
                  {new Date().toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2" style={{ color: "var(--clay)" }} />
                  <h3 className="font-serif text-xl font-light" style={{ color: "var(--deep-clay)" }}>
                    Método de Pago
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium mb-2" style={{ color: "var(--clay)" }}>
                    {paymentMethod === "cash" ? "Pago en Efectivo" : "Transferencia Bancaria"}
                  </p>
                  {paymentMethod === "cash" ? (
                    <div className="space-y-2 text-sm" style={{ color: "var(--oak)" }}>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Punto de encuentro:</p>
                          <p>Av. Argentina 123, Neuquén Capital</p>
                        </div>
                      </div>
                      <p className="text-xs bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        <strong>Importante:</strong> Te contactaremos para coordinar el encuentro y confirmar la
                        disponibilidad de los productos.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm" style={{ color: "var(--oak)" }}>
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="font-medium mb-2">Datos para transferencia:</p>
                        <div className="space-y-1 font-mono text-xs">
                          <p>
                            <strong>CBU:</strong> 0110599520000012345678
                          </p>
                          <p>
                            <strong>Alias:</strong> JOLY.LINGERIE
                          </p>
                          <p>
                            <strong>Titular:</strong> Joly Lingerie S.A.S.
                          </p>
                          <p>
                            <strong>CUIT:</strong> 30-12345678-9
                          </p>
                        </div>
                      </div>
                      {transferProof && (
                        <p className="text-green-600 text-xs bg-green-50 p-2 rounded">
                          ✓ Comprobante de transferencia recibido
                        </p>
                      )}
                      <p className="text-xs bg-amber-50 p-2 rounded border-l-4 border-amber-400">
                        <strong>Importante:</strong> Una vez confirmada la transferencia, el envío puede tardar entre 2
                        a 3 días hábiles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  {wantsShipping ? (
                    <Truck className="h-5 w-5 mr-2" style={{ color: "var(--clay)" }} />
                  ) : (
                    <Building2 className="h-5 w-5 mr-2" style={{ color: "var(--clay)" }} />
                  )}
                  <h3 className="font-serif text-xl font-light" style={{ color: "var(--deep-clay)" }}>
                    {wantsShipping ? "Información de Envío" : "Retiro en Punto de Encuentro"}
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm" style={{ color: "var(--oak)" }}>
                    <p>
                      <strong>Nombre:</strong> {orderData.shippingInfo?.fullName}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {orderData.shippingInfo?.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {orderData.shippingInfo?.email}
                    </p>
                    {wantsShipping ? (
                      <>
                        <p>
                          <strong>Dirección:</strong> {orderData.shippingInfo?.address}
                        </p>
                        <p>
                          <strong>Ciudad:</strong> {orderData.shippingInfo?.city}
                        </p>
                        <p className="text-xs bg-blue-50 p-2 rounded border-l-4 border-blue-400 mt-2">
                          Los envíos tienen un costo adicional según tu ubicación y solo se realizan dentro de Neuquén.
                        </p>
                      </>
                    ) : (
                      <p className="text-xs bg-green-50 p-2 rounded border-l-4 border-green-400 mt-2">
                        Retiro gratuito en nuestro punto de encuentro. Te contactaremos para coordinar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="font-serif text-xl font-light mb-4" style={{ color: "var(--deep-clay)" }}>
                Productos Ordenados
              </h3>
              <div className="space-y-4">
                {orderData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-lg p-4">
                    <div className="flex-shrink-0 w-16 h-16 mr-4">
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
                    <div className="flex-1">
                      <h4 className="font-medium mb-1" style={{ color: "var(--clay)" }}>
                        {item.title}
                      </h4>
                      <div className="text-sm space-y-1" style={{ color: "var(--oak)" }}>
                        {item.size && <p>Talla: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: "var(--clay)" }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: "var(--oak)" }}>
                        ${item.price.toLocaleString()} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6" style={{ borderColor: "var(--bone)" }}>
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm" style={{ color: "var(--oak)" }}>
                    <span>Subtotal:</span>
                    <span>${orderData.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: "var(--oak)" }}>
                    <span>{wantsShipping ? "Envío:" : "Punto de encuentro:"}</span>
                    <span>{wantsShipping ? `$${orderData.shippingCost?.toLocaleString()}` : "Gratis"}</span>
                  </div>
                  <div
                    className="flex justify-between text-xl font-semibold pt-2 border-t"
                    style={{ color: "var(--deep-clay)", borderColor: "var(--bone)" }}
                  >
                    <span>Total:</span>
                    <span>${orderData.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handlePrintInvoice}
            className="flex items-center justify-center px-6 py-3 border-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: "var(--clay)",
              color: "var(--clay)",
              backgroundColor: "white",
            }}
          >
            <Printer className="h-5 w-5 mr-2" />
            Imprimir Factura
          </button>

          <button
            onClick={handleWhatsAppContact}
            className="flex items-center justify-center px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--clay)" }}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Contactar por WhatsApp
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--deep-clay)" }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Inicio
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-warm">
            <h3 className="font-serif text-xl font-light mb-4" style={{ color: "var(--deep-clay)" }}>
              ¿Qué sigue ahora?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm" style={{ color: "var(--oak)" }}>
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--soft-creme)" }}
                >
                  <span className="text-xl font-bold" style={{ color: "var(--clay)" }}>
                    1
                  </span>
                </div>
                <p className="font-medium mb-1">Confirmación</p>
                <p>Recibirás un email con los detalles de tu pedido</p>
              </div>
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--soft-creme)" }}
                >
                  <span className="text-xl font-bold" style={{ color: "var(--clay)" }}>
                    2
                  </span>
                </div>
                <p className="font-medium mb-1">Coordinación</p>
                <p>Te contactaremos para coordinar {wantsShipping ? "el envío" : "el punto de encuentro"}</p>
              </div>
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--soft-creme)" }}
                >
                  <span className="text-xl font-bold" style={{ color: "var(--clay)" }}>
                    3
                  </span>
                </div>
                <p className="font-medium mb-1">Entrega</p>
                <p>{wantsShipping ? "Recibirás tu pedido en 2-3 días hábiles" : "Retira en el punto acordado"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
