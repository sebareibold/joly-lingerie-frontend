"use client";

import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import formatPriceWithDot from "../../components/utils/formatPriceWithDot";

// Define the type for contact info (copied from HomePage.tsx)
interface ContactDetailContent {
  icon: string;
  title: string;
  details: string[];
  description?: string;
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();
  const navigate = useNavigate();
  const [contactPhone, setContactPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContactPhone() {
      try {
        const response = await apiService.getSiteContent();
        if (response.success && response.content?.contact?.contactInfo) {
          const contactInfo: ContactDetailContent[] = response.content.contact.contactInfo;
          const phoneInfo = contactInfo.find(
            (info) => info.title === "Teléfono"
          );
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

  function handleVirtualOrder() {
    if (items.length === 0) return;
    navigate("/checkout");
  }

  const handleWhatsAppConsult = () => {
    const whatsappNumber = contactPhone;
    if (items.length === 0) {
      // Consulta general sin productos
      const message =
        "Hola! Me gustaría consultar sobre los productos disponibles en Joly Lingerie.";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    // Crear mensaje con productos del carrito
    let message = "Hola! Me gustaría consultar sobre estos productos:\n\n";

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      if (item.size) message += `   Talla: ${item.size}\n`;
      if (item.color) message += `   Color: ${item.color}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${formatPriceWithDot(item.price)}\n\n`;
    });

    message += `Total estimado: $${formatPriceWithDot(getTotalPrice())}\n\n`;
    message += "¿Tienen stock disponible de estos productos?";

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const subtotal = getTotalPrice();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--soft-creme)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1
            className="font-serif text-4xl lg:text-5xl font-light mb-6"
            style={{ color: "var(--deep-clay)" }}
          >
            Tu Carrito
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium"
            style={{ color: "var(--clay)" }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar comprando
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-warm">
            <ShoppingBag
              className="h-16 w-16 mx-auto mb-6"
              style={{ color: "var(--oak)" }}
            />
            <h2
              className="font-serif text-2xl font-light mb-4"
              style={{ color: "var(--deep-clay)" }}
            >
              Tu carrito está vacío
            </h2>
            <p
              className="text-lg font-light mb-8"
              style={{ color: "var(--oak)" }}
            >
              Parece que aún no has agregado productos a tu carrito
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/"
                className="inline-block px-10 py-4 text-white font-medium text-sm uppercase tracking-wider rounded-xl shadow-warm-lg transition-all hover:scale-105"
                style={{ backgroundColor: "var(--clay)" }}
              >
                Explorar productos
              </Link>
              <button
                onClick={handleWhatsAppConsult}
                className="inline-flex items-center px-8 py-4 border-2 font-medium text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-105"
                style={{
                  borderColor: "var(--clay)",
                  color: "var(--clay)",
                  backgroundColor: "transparent",
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-8 mb-12 lg:mb-0">
              <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--bone)" }}
                >
                  <h2
                    className="font-serif text-2xl font-light"
                    style={{ color: "var(--deep-clay)" }}
                  >
                    Productos ({items.length})
                  </h2>
                </div>

                <ul className="divide-y">
                  {items.map((item) => (
                    <li
                      key={`${item.id}-${item.size}-${item.color || ""}`}
                      className="p-6"
                    >
                      <div className="flex items-center">
                        <div
                          className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl border"
                          style={{ borderColor: "var(--bone)" }}
                        >
                          <img
                            src={
                              item.image ||
                              "/placeholder.svg?height=96&width=96"
                            }
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "/placeholder.svg?height=96&width=96";
                            }}
                          />
                        </div>

                        <div className="ml-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3
                                className="font-medium text-lg"
                                style={{ color: "var(--deep-clay)" }}
                              >
                                {item.name}
                              </h3>
                              <p
                                className="mt-1 text-sm"
                                style={{ color: "var(--oak)" }}
                              >
                                {item.color && `Color: ${item.color}`}
                                {item.size && item.color && " | "}
                                {item.size && `Talla: ${item.size}`}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.size, item.color)
                              }
                              className="text-sm hover:opacity-75 transition-opacity"
                              style={{ color: "var(--clay)" }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div
                              className="flex items-center border rounded-xl"
                              style={{ borderColor: "var(--bone)" }}
                            >
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                    item.size,
                                    item.color
                                  )
                                }
                                className="p-2 rounded-l-xl hover:bg-gray-50 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus
                                  className="h-4 w-4"
                                  style={{ color: "var(--clay)" }}
                                />
                              </button>
                              <span
                                className="px-4 py-2 font-medium"
                                style={{ color: "var(--deep-clay)" }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                    item.size,
                                    item.color
                                  )
                                }
                                className="p-2 rounded-r-xl hover:bg-gray-50 transition-colors"
                                disabled={item.quantity >= (item.stock ?? 99)}
                              >
                                <Plus
                                  className="h-4 w-4"
                                  style={{ color: "var(--clay)" }}
                                />
                              </button>
                            </div>
                            <div
                              className="text-lg font-medium"
                              style={{ color: "var(--deep-clay)" }}
                            >
                              ${formatPriceWithDot(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div
                  className="p-6 border-t"
                  style={{ borderColor: "var(--bone)" }}
                >
                  <button
                    onClick={clearCart}
                    className="text-sm font-medium flex items-center hover:opacity-75 transition-opacity"
                    style={{ color: "var(--clay)" }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
                <div
                  className="p-6 border-b"
                  style={{ borderColor: "var(--bone)" }}
                >
                  <h2
                    className="font-serif text-2xl font-light"
                    style={{ color: "var(--deep-clay)" }}
                  >
                    Resumen del pedido
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span style={{ color: "var(--deep-clay)" }}>
                        Subtotal
                      </span>
                      <span style={{ color: "var(--deep-clay)" }}>
                        ${formatPriceWithDot(subtotal)}
                      </span>
                    </div>

                    <div
                      className="text-xs italic"
                      style={{ color: "var(--oak)" }}
                    >
                      Pueden aplicarse costos adicionales de envío, los cuales
                      se calcularán durante el checkout según tu ubicación.{" "}
                    </div>
                  </div>

                  <div className="mt-8">
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleVirtualOrder}
                        disabled={items.length === 0}
                        className="w-full py-4 rounded-xl text-white text-sm font-medium uppercase tracking-wider shadow-warm-lg transition-all hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "var(--clay)" }}
                      >
                        <CreditCard className="h-5 w-5 mr-3" />
                        Hacer orden virtual
                      </button>

                      <button
                        onClick={handleWhatsAppConsult}
                        className="w-full py-4 rounded-xl text-sm font-medium uppercase tracking-wider border-2 transition-all hover:scale-105 flex items-center justify-center"
                        style={{
                          borderColor: "var(--clay)",
                          color: "var(--clay)",
                          backgroundColor: "transparent",
                        }}
                      >
                        <MessageCircle className="h-5 w-5 mr-3" />
                        Consultar por WhatsApp
                      </button>
                    </div>

                    <div
                      className="mt-4 p-4 rounded-xl"
                      style={{ backgroundColor: "var(--bone)" }}
                    >
                      <p
                        className="text-xs text-center"
                        style={{ color: "var(--oak)" }}
                      >
                        <strong>Orden Virtual:</strong> Completa tu compra
                        online con envío a domicilio
                        <br />
                        <strong>WhatsApp:</strong> Consulta stock y coordina
                        retiro en persona
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
