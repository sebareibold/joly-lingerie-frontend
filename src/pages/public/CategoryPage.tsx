"use client"
import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { ShoppingBag, Eye, Loader2, RefreshCw } from "lucide-react" // Added Loader2, RefreshCw
import { useCart } from "../../contexts/CartContext"
import { apiService } from "../../services/api"

// Definición de interfaces
interface ProductColor {
  name: string
  value: string
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  category: string
  stock: number
  status: boolean
  thumbnails: string[]
  size: string | string[]
  // Campos adicionales para UI
  originalPrice?: number
  discount?: string // This is a string like "20% OFF"
  discountPercentage?: number // Added to store the actual percentage from backend
  new?: boolean
  colors?: ProductColor[]
  sizes?: string[]
}

const PRODUCTS_PER_PAGE_CATEGORY = 12 // Define how many products to load per page for category page

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  const [sortBy, setSortBy] = useState("name")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true) // For initial full page load
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false) // State for "Load More" button
  const [retrying, setRetrying] = useState(false) // State for retry button
  const [isCategoryChanging, setIsCategoryChanging] = useState(false) // NEW: State for category/sort change loading

  useEffect(() => {
    if (category) {
      // Reset pagination when category or sort order changes
      setCurrentPage(1)
      // setProducts([]) // REMOVED: Do not clear products immediately
      setTotalPages(1)
      setIsCategoryChanging(true) // Indicate category/sort is loading
      loadProductsByCategory(1, category, sortBy) // Load first page for the new category
    }
  }, [category, sortBy]) // Depend on category and sortBy

  const loadProductsByCategory = async (pageToLoad: number, categoryName: string, currentSortBy: string) => {
    try {
      if (pageToLoad === 1) {
        // Only show full-page loading spinner if it's the very first load and no products are present
        if (products.length === 0) {
          setLoading(true)
        }
        setRetrying(false)
      } else {
        setLoadingMore(true)
      }

      const params: { limit: number; page: number; category?: string; sortBy?: string; sortOrder?: string } = {
        limit: PRODUCTS_PER_PAGE_CATEGORY,
        page: pageToLoad,
        category: categoryName,
      }

      // Add sorting parameters based on currentSortBy
      if (currentSortBy === "price-low") {
        params.sortBy = "price"
        params.sortOrder = "asc"
      } else if (currentSortBy === "price-high") {
        params.sortBy = "price"
        params.sortOrder = "desc"
      } else {
        // Default to name
        params.sortBy = "title"
        params.sortOrder = "asc"
      }

      const response = await apiService.getProducts(params)

      // Transformar los datos de la API al formato que espera la UI
      const transformedProducts = (response.payload || []).map((product: any) => {
        const originalPrice = product.price
        const discountPercentage = product.discount || 0
        const discountedPrice = discountPercentage > 0 ? originalPrice * (1 - discountPercentage / 100) : originalPrice

        // Convertir la string de tallas a array si es necesario
        const sizesArray = Array.isArray(product.size)
          ? product.size
          : typeof product.size === "string"
            ? product.size.split(",").map((s) => s.trim())
            : []

        return {
          ...product,
          id: product._id, // Mantener compatibilidad con la UI
          name: product.title, // Mantener compatibilidad con la UI
          images: product.thumbnails?.[0] ? [product.thumbnails[0]] : ["/placeholder.svg"], // Ensure images is an array and has a fallback
          price: discountedPrice, // Use the calculated discounted price
          originalPrice: discountPercentage > 0 ? originalPrice : undefined, // Show original price if discount > 0, otherwise undefined
          discountPercentage: discountPercentage, // Store the actual percentage
          // Values by default for fields that might not come from the API
          sizes: sizesArray,
          colors: product.colors || [
            { name: "Negro", value: "#000000" },
            { name: "Blanco", value: "#FFFFFF" },
          ],
          new: product.stock > 10, // Mark as new if stock is sufficient
          discount: discountPercentage > 0 ? `${discountPercentage}% OFF` : undefined, // Format discount for display
        }
      })

      setProducts((prevProducts) =>
        pageToLoad === 1 ? transformedProducts : [...prevProducts, ...transformedProducts],
      )
      setTotalPages(response.totalPages)
      setCurrentPage(pageToLoad)
      setError(null)
    } catch (err) {
      console.error("Error loading products by category:", err)
      if (err instanceof Error && err.message.includes("429")) {
        setError("Estamos experimentando alta demanda. Por favor, espera unos minutos e intenta de nuevo.")
      } else {
        setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
      }
      if (pageToLoad === 1 && products.length === 0) {
        setProducts([]) // Clear products only if it's the initial load and nothing loaded
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsCategoryChanging(false) // Reset category/sort loading state
    }
  }

  const handleQuickAdd = (product: any) => {
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      image: product.thumbnails[0] || "/placeholder.svg",
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0]?.name || "Negro",
    })
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      loadProductsByCategory(currentPage + 1, category!, sortBy)
    }
  }

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      loadProductsByCategory(1, category!, sortBy) // Retry loading the first page
    }, 2000)
  }

  const hasMore = currentPage < totalPages

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto"></div>
        <p className="mt-4" style={{ color: "var(--clay)" }}>
          Cargando productos...
        </p>
      </div>
    )
  }

  if (retrying) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto"></div>
        <p className="mt-4" style={{ color: "var(--clay)" }}>
          Reintentando cargar productos...
        </p>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-clay text-white rounded-md flex items-center justify-center mx-auto"
          disabled={retrying}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900 capitalize lg:text-4xl">{category}</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`border border-gray-300 rounded-md px-3 py-2 ${isCategoryChanging ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isCategoryChanging} // Disable select while loading
        >
          <option value="name">Ordenar por nombre</option>
          <option value="price-low">Precio: menor a mayor</option>
          <option value="price-high">Precio: mayor a menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative">
        {isCategoryChanging && (
          <div className="absolute inset-0flex items-center justify-center z-20 rounded-lg"  >
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--clay)" }} />
          </div>
        )}
        {products.map(
          (
            product, // Use 'products' directly as it's already paginated and sorted by API
          ) => (
            <div
              key={product._id}
              className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--pure-white)",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <div
                  className="aspect-[4/5] md:aspect-square overflow-hidden"
                  style={{ backgroundColor: "var(--bone)" }}
                >
                  <img
                    src={product.thumbnails?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-1 md:top-4 left-1 md:left-4 flex flex-col gap-1 md:gap-2">
                  {product.discount && (
                    <span
                      className="text-white px-1 py-0.5 md:px-2 md:py-1 text-[8px] md:text-xs font-semibold rounded-sm uppercase tracking-wide"
                      style={{ backgroundColor: "var(--clay)" }}
                    >
                      {product.discount}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-1 md:top-4 right-1 md:right-4 flex flex-col gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Link
                    to={`/product/${product._id}`}
                    className="p-1 md:p-3 rounded-full backdrop-blur-sm hover:scale-110 transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <Eye className="h-3 w-3 md:h-5 md:w-5" style={{ color: "var(--clay)" }} />
                  </Link>

                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="p-1 md:p-3 rounded-full backdrop-blur-sm hover:scale-110 transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <ShoppingBag className="h-3 w-3 md:h-5 md:w-5" style={{ color: "var(--clay)" }} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-2 md:p-6">
                {/* Category */}
                <div className="flex items-center justify-between mb-1 md:mb-3">
                  <span
                    className="text-[8px] md:text-xs uppercase tracking-[0.15em] font-medium"
                    style={{ color: "var(--oak)" }}
                  >
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <Link to={`/product/${product._id}`}>
                  <h3
                    className="font-serif text-xs md:text-lg font-medium mb-1 md:mb-4 tracking-wide line-clamp-2 hover:opacity-75 transition-opacity leading-tight"
                    style={{ color: "var(--deep-clay)" }}
                  >
                    {product.title}
                  </h3>
                </Link>

                {/* Price Section */}
                <div className="mb-1 md:mb-4">
                  <div className="flex items-baseline space-x-1 md:space-x-2 mb-0 md:mb-1">
                    <span className="text-sm md:text-xl font-semibold" style={{ color: "var(--deep-clay)" }}>
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] md:text-sm line-through opacity-50" style={{ color: "var(--oak)" }}>
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ver más */}
                <div className="flex items-center justify-end">
                  <Link
                    to={`/product/${product._id}`}
                    className="text-[8px] md:text-xs uppercase tracking-wider font-medium hover:opacity-75 transition-opacity border-b pb-0 md:pb-1"
                    style={{
                      color: "var(--clay)",
                      borderColor: "var(--clay)",
                    }}
                  >
                    Ver más
                  </Link>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {products.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos en esta categoría.</p>
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 rounded-full text-white font-semibold text-base uppercase tracking-[0.1em] transition-all duration-300 hover:brightness-110 shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
            style={{
              background: "linear-gradient(to right, var(--clay), var(--dark-clay))",
            }}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando más...
              </>
            ) : (
              "Ver más productos"
            )}
          </button>
          {error && !loadingMore && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
