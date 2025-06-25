"use client"
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  ChevronDown,
  Truck,
  RotateCcw,
  Shield,
  Award,
  Users,
  Star,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react"
import { useCart } from "../../contexts/CartContext"
import { apiService } from "../../services/api"

// Definición de interfaces
interface Product {
  _id: string
  title: string
  description: string
  price: number // This will be the calculated discounted price
  category: string
  stock: number
  status: boolean
  thumbnails: string[]
  size: string | string[]
  sizes?: string[] // Additional property for UI compatibility
  discount?: number // The discount percentage from the backend (0-100)
  // Fields added for UI display
  originalPrice?: number // The original price before discount
  new?: boolean
}

interface InfoCard {
  icon: string
  title: string
  description: string
  enabled: boolean
}

interface ExpandableSection {
  id: string
  title: string
  content: string
  enabled: boolean
}

interface ProductDetailContent {
  infoCards: InfoCard[]
  expandableSections: ExpandableSection[]
  showSizeGuideButton: boolean
  sizeGuideButtonText: string
}

// Actualizar la interface SizeGuideData para manejar múltiples guías
interface SizeGuideData {
  category: string
  enabled: boolean
  title: string
  subtitle: string
  tableHeaders: string[]
  tableRows: {
    size: string
    measurements: string[]
  }[]
  notes: string
}

// Mapeo de iconos
const iconMap: { [key: string]: React.ElementType } = {
  Truck,
  RotateCcw,
  Shield,
  Award,
  Users,
  Heart,
  Star,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle,
  Info,
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [expandedSections, setExpandedSections] = useState(new Set<string>())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productDetailContent, setProductDetailContent] = useState<ProductDetailContent | null>(null)
  const [currentSizeGuides, setCurrentSizeGuides] = useState<SizeGuideData[]>([])

  // Cambiar el estado para manejar múltiples guías
  const [sizeGuidesData, setSizeGuidesData] = useState<SizeGuideData[]>([])

  useEffect(() => {
    if (id) {
      loadProduct(id)
      loadProductDetailContent()
    }
  }, [id])

  // En la función loadProductDetailContent, actualizar para cargar las guías múltiples:
  const loadProductDetailContent = async () => {
    try {
      const response = await apiService.getSiteContent()
      if (response.success && response.content.productDetail) {
        setProductDetailContent(response.content.productDetail)
      }
      // ACTUALIZADO: Cargar múltiples guías de tallas
      if (response.success && response.content.sizeGuides) {
        setSizeGuidesData(response.content.sizeGuides)
      }
    } catch (err) {
      console.error("Error loading product detail content:", err)
      // Usar valores por defecto si falla
      setProductDetailContent({
        infoCards: [
          { icon: "Truck", title: "Envío Gratis", description: "En compras superiores a $30.000", enabled: true },
          { icon: "RotateCcw", title: "30 Días", description: "Para cambios y devoluciones", enabled: true },
          { icon: "Shield", title: "Garantía", description: "Calidad garantizada", enabled: true },
        ],
        expandableSections: [
          {
            id: "description",
            title: "Descripción Detallada",
            content: "Confeccionado con los mejores materiales, este producto combina comodidad y elegancia.",
            enabled: true,
          },
          {
            id: "care",
            title: "Cuidado y Lavado",
            content: "Lavar a mano con agua fría. No usar blanqueador. Secar al aire libre.",
            enabled: true,
          },
        ],
        showSizeGuideButton: true,
        sizeGuideButtonText: "Guía de tallas",
      })

      /*
      // Valores por defecto para múltiples guías de tallas
      setSizeGuidesData([
        {
          category: "Corpiño",
          enabled: true,
          title: "Guía de Tallas - Corpiños",
          subtitle: "Encuentra tu talla perfecta de corpiño",
          tableHeaders: ["Talla", "Contorno (cm)", "Copa"],
          tableRows: [
            { size: "85A", measurements: ["85", "A"] },
            { size: "90A", measurements: ["90", "A"] },
            { size: "95A", measurements: ["95", "A"] },
          ],
          notes: "Medidas específicas para corpiños. Consulta si tienes dudas.",
        },
        {
          category: "Bombacha",
          enabled: true,
          title: "Guía de Tallas - Bombachas",
          subtitle: "Encuentra tu talla perfecta de bombacha",
          tableHeaders: ["Talla", "Cintura (cm)", "Cadera (cm)"],
          tableRows: [
            { size: "XS", measurements: ["60-64", "86-90"] },
            { size: "S", measurements: ["64-68", "90-94"] },
            { size: "M", measurements: ["68-72", "94-98"] },
            { size: "L", measurements: ["72-76", "98-102"] },
          ],
          notes: "Medidas de cintura y cadera para bombachas.",
        },
      ])
        */
    }
  }

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true)
      const response = await apiService.getProduct(productId)

      if (response.success && response.product) {
        // Transform the product to be compatible with the UI
        // Convert comma-separated size string to an array
        const sizesArray = Array.isArray(response.product.size)
          ? response.product.size
          : typeof response.product.size === "string"
            ? response.product.size.split(",").map((s) => s.trim())
            : []

        const originalPrice = response.product.price // Original price from backend
        const discountPercentage = response.product.discount || 0 // Discount from backend, default to 0

        // Calculate discounted price
        const discountedPrice = discountPercentage > 0 ? originalPrice * (1 - discountPercentage / 100) : originalPrice

        const productData = {
          ...response.product,
          size: sizesArray, // Ensure size is an array
          sizes: sizesArray, // For UI compatibility
          images: response.product.thumbnails, // For UI compatibility
          name: response.product.title, // For UI compatibility
          id: response.product._id, // For UI compatibility
          price: discountedPrice, // Use the calculated discounted price
          originalPrice: discountPercentage > 0 ? originalPrice : undefined, // Show original price if discount > 0, otherwise undefined
          discount: discountPercentage, // Keep the actual discount percentage
        } as Product // Cast to Product interface

        setProduct(productData)
        setSelectedSize(sizesArray.length > 0 ? sizesArray[0] : "")

        // Track product view interaction
        await apiService.createInteraction("product_view", {
          productId: response.product._id,
          productTitle: response.product.title,
          productPrice: response.product.price,
          productCategory: response.product.category, // Add category
        })

        // Load related products
        loadRelatedProducts(productData.category)
      } else {
        setError("No se pudo encontrar el producto")
      }
    } catch (err) {
      console.error("Error loading product:", err)
      setError("Error al cargar el producto. Intente nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async (category: string) => {
    try {
      const response = await apiService.getProducts({
        category: category,
        limit: 4, // Mantener el límite para obtener suficientes productos
      })

      // Filter to not include the current product and limit to 3
      const related = (response.payload || [])
        .filter((p: any) => p._id !== id) // Use 'any' for initial product from API
        .slice(0, 4) // Mostrar 4 productos relacionados en la cuadrícula de 4 columnas
        .map((p: any) => ({
          // Use 'any' for initial product from API
          ...p,
          images: p.thumbnails,
          name: p.title,
          id: p._id,
        })) as Product[] // Cast to Product array

      setRelatedProducts(related)
    } catch (err) {
      console.error("Error loading related products:", err)
      // If it fails, show empty array
      setRelatedProducts([])
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      alert("Por favor selecciona una talla")
      return
    }

    addToCart(
      {
        id: product._id,
        name: product.title,
        price: product.price,
        image: product.thumbnails[selectedImage],
        size: selectedSize,
        color: "Negro", // You can add color selection if needed
      },
      quantity,
    )

    alert(`${product.title} agregado al carrito`)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const renderIcon = (iconName: string, className = "h-6 w-6") => {
    const IconComponent = iconMap[iconName]
    if (IconComponent) {
      return <IconComponent className={className} style={{ color: "var(--clay)" }} />
    }
    // Fallback icon
    const InfoIcon = iconMap["Info"]
    return <InfoIcon className={className} style={{ color: "var(--clay)" }} />
  }

  useEffect(() => {
    if (product && sizeGuidesData.length > 0) {
      if (product.category.toLowerCase() === "conjuntos") {
        // Buscar ambas guías: corpiño y bombacha
        const corpinio = sizeGuidesData.find(
          (g) => g.enabled && g.category.toLowerCase() === "corpiño"
        )
        const bombacha = sizeGuidesData.find(
          (g) => g.enabled && g.category.toLowerCase() === "bombacha"
        )
        setCurrentSizeGuides([corpinio, bombacha].filter(Boolean) as SizeGuideData[])
      } else {
        const guide =
          sizeGuidesData.find(
            (g) => g.enabled && g.category.toLowerCase() === product.category.toLowerCase()
          ) || sizeGuidesData.find((g) => g.enabled)
        setCurrentSizeGuides(guide ? [guide] : [])
      }
    }
  }, [product, sizeGuidesData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--soft-creme)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto"></div>
          <p className="mt-4" style={{ color: "var(--clay)" }}>
            Cargando producto...
          </p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--soft-creme)" }}>
        <div className="text-center">
          <h2 className="font-serif text-2xl font-light mb-4" style={{ color: "var(--deep-clay)" }}>
            {error || "Producto no encontrado"}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="hover:opacity-75 underline font-medium"
            style={{ color: "var(--clay)" }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: "var(--pure-white)",
          borderBottom: `1px solid var(--bone)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm" style={{ color: "var(--oak)" }}>
            <button
              onClick={() => navigate("/")}
              className="hover:opacity-75 transition-colors"
              style={{ color: "var(--clay)" }}
            >
              Inicio
            </button>
            <span>/</span>
            <span className="font-medium" style={{ color: "var(--deep-clay)" }}>
              {product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
          {/* Image Gallery */}
          <div className="mb-6 lg:mb-0">
            <div className="flex flex-col-reverse lg:flex-row">
              {/* Thumbnails */}
              <div className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 mt-6 lg:mt-0 lg:mr-6">
                {product.thumbnails.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-xl overflow-hidden border-3 transition-all ${
                      selectedImage === index ? "shadow-warm" : "hover:opacity-75"
                    }`}
                    style={{
                      borderColor: selectedImage === index ? "var(--clay)" : "var(--bone)",
                    }}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <div
                  className="aspect-[3/4] rounded-2xl overflow-hidden shadow-warm-lg"
                  style={{ backgroundColor: "var(--pure-white)" }}
                >
                  <img
                    src={product.thumbnails[selectedImage] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:pl-8">
            <div className="mb-4 lg:mb-8">
              <span
                className="text-sm uppercase tracking-[0.15em] font-medium mb-2 lg:mb-3 block"
                style={{ color: "var(--clay)" }}
              >
                {product.category}
              </span>

              <h1
                className="font-serif text-2xl lg:text-4xl font-medium mb-3 lg:mb-6 tracking-wide"
                style={{ color: "var(--deep-clay)" }}
              >
                {product.title}
              </h1>

              <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {product.originalPrice && (
                    <span className="text-lg lg:text-xl line-through font-light" style={{ color: "var(--oak)" }}>
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl lg:text-3xl font-medium" style={{ color: "var(--deep-clay)" }}>
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                {product.discount && product.discount > 0 && (
                  <span
                    className="text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium shadow-lg"
                    style={{
                      background: "linear-gradient(to right, #10b981, #059669)",
                    }}
                  >
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <p
                className="font-light leading-relaxed text-base lg:text-lg mb-6 lg:mb-10"
                style={{ color: "var(--dark-clay)" }}
              >
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-6 lg:mb-10">
              <h3
                className="text-sm font-medium mb-3 lg:mb-4 uppercase tracking-[0.1em]"
                style={{ color: "var(--deep-clay)" }}
              >
                Talla: <span style={{ color: "var(--clay)" }}>{selectedSize}</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-3">
                {(product.sizes || []).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 lg:py-4 px-1 border-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSize === size ? "shadow-warm" : "hover:shadow-warm"
                    }`}
                    style={{
                      borderColor: selectedSize === size ? "var(--clay)" : "var(--oak)",
                      backgroundColor: selectedSize === size ? "var(--bone)" : "var(--pure-white)",
                      color: selectedSize === size ? "var(--deep-clay)" : "var(--dark-clay)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
             
            </div>

            {/* Quantity Selection */}
            <div className="mb-4 lg:mb-6">
              <h3
                className="text-sm font-medium mb-3 lg:mb-4 uppercase tracking-[0.1em]"
                style={{ color: "var(--deep-clay)" }}
              >
                Cantidad
              </h3>
              <div
                className="flex items-center border-2 rounded-xl w-fit"
                style={{
                  borderColor: "var(--oak)",
                  backgroundColor: "var(--pure-white)",
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 lg:p-4 hover:opacity-75 transition-colors rounded-l-xl"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" style={{ color: "var(--clay)" }} />
                </button>
                <span
                  className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-center min-w-[60px]"
                  style={{ color: "var(--deep-clay)" }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 lg:p-4 hover:opacity-75 transition-colors rounded-r-xl"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" style={{ color: "var(--clay)" }} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6 lg:mb-10">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 lg:py-5 rounded-xl text-white font-medium text-sm uppercase tracking-[0.1em] transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 lg:space-x-3 shadow-warm-lg"
                style={{
                  background: "linear-gradient(to right, var(--clay), var(--dark-clay))",
                }}
              >
                <ShoppingBag className="h-4 lg:h-5 w-4 lg:w-5" />
                <span>Agregar al Carrito</span>
              </button>
            </div>

            {/* Features - Dinámicas desde el backoffice */}
            {productDetailContent && productDetailContent.infoCards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-10">
                {productDetailContent.infoCards
                  .filter((card) => card.enabled)
                  .map((card, index) => (
                    <div
                      key={index}
                      className="text-center p-3 lg:p-4 rounded-xl border"
                      style={{
                        backgroundColor: "var(--pure-white)",
                        borderColor: "var(--bone)",
                      }}
                    >
                      {renderIcon(card.icon, "h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2")}
                      <div className="text-xs font-medium mb-1" style={{ color: "var(--dark-clay)" }}>
                        {card.title}
                      </div>
                      <div className="text-xs" style={{ color: "var(--oak)" }}>
                        {card.description}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Expandable Sections - Dinámicas desde el backoffice */}
            {productDetailContent && productDetailContent.expandableSections.length > 0 && (
              <div className="space-y-1 mb-6 lg:mb-10">
                {productDetailContent.expandableSections
                  .filter((section) => section.enabled)
                  .map((section) => (
                    <div
                      key={section.id}
                      className="border-b rounded-xl mb-2"
                      style={{
                        borderColor: "var(--bone)",
                        backgroundColor: "var(--pure-white)",
                      }}
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full py-4 lg:py-5 px-4 lg:px-6 flex items-center justify-between text-left hover:opacity-75 transition-colors rounded-xl"
                      >
                        <span className="font-medium text-sm lg:text-base" style={{ color: "var(--deep-clay)" }}>
                          {section.title}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 lg:h-5 lg:w-5 transition-transform ${
                            expandedSections.has(section.id) ? "rotate-180" : ""
                          }`}
                          style={{ color: "var(--oak)" }}
                        />
                      </button>
                      {expandedSections.has(section.id) && (
                        <div className="px-4 lg:px-6 pb-4 lg:pb-5">
                          <p
                            className="font-light leading-relaxed text-sm lg:text-base"
                            style={{ color: "var(--dark-clay)" }}
                          >
                            {section.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Size Guide Table - Mostrar todas las guías para esta categoría */}
            {currentSizeGuides.length > 0 && (
              <>
                {currentSizeGuides.map((guide) => (
                  <div
                    key={guide.category}
                    className="mb-6 lg:mb-10 p-6 rounded-2xl shadow-warm border"
                    style={{
                      backgroundColor: "var(--pure-white)",
                      borderColor: "var(--bone)",
                    }}
                  >
                    <div className="text-center mb-4">
                      <h3 className="font-serif text-lg lg:text-xl font-medium mb-2" style={{ color: "var(--deep-clay)" }}>
                        {guide.title}
                      </h3>
                      <p className="text-sm lg:text-base font-light" style={{ color: "var(--dark-clay)" }}>
                        {guide.subtitle}
                      </p>
                    </div>
                    {/* Tabla de Tallas */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `2px solid var(--bone)` }}>
                            {guide.tableHeaders.map((header, index) => (
                              <th
                                key={index}
                                className="px-3 py-3 text-center text-xs lg:text-sm font-medium uppercase tracking-wider"
                                style={{ color: "var(--clay)" }}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {guide.tableRows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="hover:bg-opacity-50 transition-colors duration-200"
                              style={{
                                backgroundColor: rowIndex % 2 === 0 ? "transparent" : "var(--bone)",
                                borderBottom: `1px solid var(--bone)`,
                              }}
                            >
                              <td
                                className="px-3 py-3 text-center text-sm lg:text-base font-medium"
                                style={{ color: "var(--deep-clay)" }}
                              >
                                {row.size}
                              </td>
                              {row.measurements.map((measurement, measurementIndex) => (
                                <td
                                  key={measurementIndex}
                                  className="px-3 py-3 text-center text-sm lg:text-base"
                                  style={{ color: "var(--dark-clay)" }}
                                >
                                  {measurement}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Notas */}
                    {guide.notes && (
                      <div className="mt-4 pt-4" style={{ borderTop: `1px solid var(--bone)` }}>
                        <p
                          className="text-xs lg:text-sm font-light text-center leading-relaxed"
                          style={{ color: "var(--oak)" }}
                        >
                          {guide.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="col-span-full mt-16 lg:mt-24">
              <h2
                className="font-serif text-2xl lg:text-3xl font-light mb-8 lg:mb-12 text-center"
                style={{ color: "var(--deep-clay)" }}
              >
                También te puede{" "}
                <span className="italic" style={{ color: "var(--clay)" }}>
                  interesar
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="group relative overflow-hidden transition-all duration-500 ease-in-out
          shadow-lg hover:shadow-xl rounded-lg cursor-pointer flex flex-col hover:scale-[1.03]
          border-[3px] border-transparent hover:border-clay"
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                  >
                    {/* Image Container */}
                    <div
                      className="aspect-[3/4] rounded-t-lg overflow-hidden relative"
                      style={{ backgroundColor: "var(--bone)" }}
                    >
                      <img
                        src={relatedProduct.thumbnails?.[0] || "/placeholder.svg"}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Image Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-3 lg:p-4 flex flex-col flex-grow">
                      <h3
                        className="font-serif font-medium mb-3 text-sm lg:text-base line-clamp-2"
                        style={{ color: "var(--deep-clay)" }}
                      >
                        {relatedProduct.title}
                      </h3>
                      <p className="font-semibold text-lg lg:text-xl mb-4" style={{ color: "var(--dark-clay)" }}>
                        ${Math.round(relatedProduct.price).toLocaleString()}
                      </p>

                      {/* "Ver más" button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/product/${relatedProduct._id}`)
                        }}
                        className="w-full py-2.5 lg:py-3 rounded-xl text-white font-semibold text-xs lg:text-sm uppercase tracking-[0.1em] transition-all duration-300 hover:brightness-110 shadow-md hover:shadow-lg mt-auto"
                        style={{
                          background: "linear-gradient(to right, var(--clay), var(--dark-clay))",
                        }}
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
