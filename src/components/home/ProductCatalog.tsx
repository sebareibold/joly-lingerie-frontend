"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingBag, Eye, RefreshCw, Loader2 } from "lucide-react"; // Added Loader2 for button loading
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";

// Definición de interfaces
interface ProductColor {
  name: string;
  value: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number; // This will be the calculated discounted price
  category: string;
  stock: number;
  status: boolean;
  thumbnails: string[];
  discount?: number; // The discount percentage from the backend (0-100)
  // Fields added for UI display
  originalPrice?: number; // The original price before discount
  new?: boolean;
  colors?: ProductColor[];
  sizes?: string[];
  // Compatibilidad para UI
  id?: string;
  name?: string;
  images?: string[];
}

// NUEVO: Interfaz para el contenido del catálogo
interface ProductCatalogContent {
  mainTitle: string;
  subtitle: string;
  categories: { name: string; display_name: string }[];
}

interface ProductCatalogProps {
  content: ProductCatalogContent;
}

const PRODUCTS_PER_PAGE = 12; // Define how many products to load per page

export default function ProductCatalogAlt({ content }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // For initial full page load
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false); // State for "Load More" button
  const [isCategoryChanging, setIsCategoryChanging] = useState(false); // NEW: State for category change loading

  // Categorías dinámicas del contenido, más "Todos"
  const categories = [
    { name: "Todos", display_name: "Todos" },
    ...content.categories,
  ];

  // Effect for category change
  useEffect(() => {
    setCurrentPage(1);
    // setProducts([]) // REMOVED: Do not clear products immediately
    setTotalPages(1);
    setIsCategoryChanging(true); // Indicate category is loading
    loadProducts(1, selectedCategory); // Load first page for the new category
  }, [selectedCategory]); // Depend on selectedCategory

  // Initial load (only once on component mount)
  useEffect(() => {
    if (products.length === 0 && !loadingMore && !isCategoryChanging) {
      setLoading(true); // Only set full loading if no products are present initially
    }
    loadProducts(1, selectedCategory);
  }, []); // Empty dependency array means it runs once on mount

  const loadProducts = async (pageToLoad: number, categoryToLoad: string) => {
    try {
      if (pageToLoad === 1) {
        // Only show full-page loading spinner if it's the very first load and no products are present
        if (products.length === 0) {
          setLoading(true);
        }
        setRetrying(false);
      } else {
        setLoadingMore(true);
      }

      const params: { limit: number; page: number; category?: string } = {
        limit: PRODUCTS_PER_PAGE,
        page: pageToLoad,
      };
      if (categoryToLoad !== "Todos") {
        params.category = categoryToLoad;
      }

      const response = await apiService.getProducts(params);
      console.log("Resultado de apiService.getProducts:", response);
      // Transformar los datos de la API al formato que espera la UI
      const transformedProducts = (response.payload || []).map(
        (product: any) => {
          const originalPrice = product.price;
          const discountPercentage = product.discount || 0;
          const discountedPrice =
            discountPercentage > 0
              ? originalPrice * (1 - discountPercentage / 100)
              : originalPrice;

          return {
            ...product,
            id: product._id,
            name: product.title,
            images: product.thumbnails?.[0]
              ? [product.thumbnails[0]]
              : ["/placeholder.svg"],
            price: discountedPrice,
            originalPrice: discountPercentage > 0 ? originalPrice : undefined,
            discount: discountPercentage,
            colors: product.colors || [
              { name: "Negro", value: "#000000" },
              { name: "Blanco", value: "#FFFFFF" },
            ],
            sizes: product.size || ["S", "M", "L"], // Use product.size directly if it's an array, or default
            new: product.stock > 10,
          } as Product;
        }
      );

      setProducts((prevProducts) =>
        pageToLoad === 1
          ? transformedProducts
          : [...prevProducts, ...transformedProducts]
      );
      setTotalPages(response.totalPages);
      setCurrentPage(pageToLoad);
      setError(null);
    } catch (err) {
      console.error("Error loading products:", err);
      if (err instanceof Error && err.message.includes("429")) {
        setError(
          "Estamos experimentando alta demanda. Por favor, espera unos minutos e intenta de nuevo."
        );
      } else {
        setError(
          "No se pudieron cargar los productos. Intente nuevamente más tarde."
        );
      }
      if (pageToLoad === 1 && products.length === 0) {
        setProducts([]); // Clear products only if it's the initial load and nothing loaded
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsCategoryChanging(false); // Reset category loading state
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      loadProducts(1, selectedCategory); // Retry loading the first page
    }, 2000);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      loadProducts(currentPage + 1, selectedCategory);
    }
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(
      {
        id: product.id || product._id,
        name: product.name || product.title,
        price: product.price,
        image:
          product.images?.[0] || product.thumbnails?.[0] || "/placeholder.svg",
        size: product.sizes?.[0] || "M",
        color: product.colors?.[0]?.name || "Negro",
      },
      1
    );
  };

  // Filter products by category (this filtering is now mostly handled by the API call)
  // This local filter is only for the products already loaded.
  // The `selectedCategory` state now directly influences the API call.
  const filteredProducts = products; // Products are already filtered by API based on selectedCategory

  const hasMore = currentPage < totalPages;

  if (loading && products.length === 0) {
    // Only show full loading spinner if no products are loaded yet
    return (
      <section
        id="products"
        className="py-12 lg:py-32"
        style={{ backgroundColor: "var(--creme)" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto"></div>
          <p className="mt-4 text-clay">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (retrying) {
    return (
      <section
        id="products"
        className="py-12 lg:py-32"
        style={{ backgroundColor: "var(--creme)" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay mx-auto"></div>
          <p className="mt-4 text-clay">Reintentando cargar productos...</p>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    // Only show error if no products could be loaded at all
    return (
      <section
        id="products"
        className="py-12 lg:py-32"
        style={{ backgroundColor: "var(--creme)" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <p className="text-clay mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-clay text-white rounded-md flex items-center justify-center mx-auto"
            disabled={retrying}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="products"
      className="py-12 lg:py-32"
      style={{ backgroundColor: "var(--creme)" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-20">
          <p
            className="text-[10px] sm:text-sm uppercase tracking-[0.3em] font-medium mb-3 sm:mb-6 animate-fade-in-up"
            style={{ color: "var(--clay)" }}
          >
            Lencería de Lujo
          </p>
          <h2
            className="font-serif text-2xl sm:text-5xl lg:text-7xl font-light mb-4 sm:mb-8 tracking-wide animate-fade-in-up animate-delay-200"
            style={{ color: "var(--deep-clay)" }}
          >
            {content.mainTitle.split(" ")[0]}{" "}
            <span className="italic" style={{ color: "var(--clay)" }}>
              {content.mainTitle.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p
            className="text-xs sm:text-xl font-light max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-400 px-4"
            style={{ color: "var(--dark-clay)" }}
          >
            {content.subtitle}
          </p>
        </div>

        {/* Category Carousel - Mobile only */}
        <div className="block md:hidden mb-6">
          <div className="relative">
            {/* Category carousel */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto scrollbar-hide gap-3 px-8 py-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category, _) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.15em] transition-all duration-400 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.name
                      ? "text-white shadow-warm"
                      : "text-gray-700 border hover:shadow-warm"
                  } ${
                    isCategoryChanging ? "opacity-50 cursor-not-allowed" : ""
                  }`} // Disable and dim
                  style={{
                    backgroundColor:
                      selectedCategory === category.name
                        ? "var(--clay)"
                        : "var(--pure-white)",
                    borderColor:
                      selectedCategory === category.name
                        ? "var(--clay)"
                        : "var(--oak)",
                    borderWidth:
                      selectedCategory === category.name ? "0" : "1px",
                  }}
                  disabled={isCategoryChanging} // Disable button
                >
                  {category.display_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter - Desktop */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 mb-20">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.15em] transition-all duration-400 animate-fade-in-up ${
                selectedCategory === category.name
                  ? "text-white shadow-warm"
                  : "text-gray-700 border hover:shadow-warm"
              } ${isCategoryChanging ? "opacity-50 cursor-not-allowed" : ""}`} // Disable and dim
              style={{
                backgroundColor:
                  selectedCategory === category.name
                    ? "var(--clay)"
                    : "var(--pure-white)",
                borderColor:
                  selectedCategory === category.name
                    ? "var(--clay)"
                    : "var(--oak)",
                borderWidth: selectedCategory === category.name ? "0" : "1px",
              }}
              disabled={isCategoryChanging} // Disable button
            >
              {category.display_name}
            </button>
          ))}
        </div>

        {/* Products Grid - 2 fixed columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-10 relative">
          {isCategoryChanging && (
            <div
              className="absolute inset-0 flex items-center justify-center z-20 rounded-lg"
              style={{
                backgroundColor: "var(--creme)",
              }}
            >
              <Loader2
                className="h-10 w-10 animate-spin"
                style={{ color: "var(--clay)" }}
              />
            </div>
          )}
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group relative overflow-hidden transition-all duration-500 ease-in-out
            shadow-lg hover:shadow-xl rounded-lg cursor-pointer flex flex-col hover:scale-[1.03]" /* This div has cursor-pointer */
              style={{
                backgroundColor: "var(--pure-white)",
              }}
              onClick={() => navigate(`/product/${product._id}`)} // Makes the entire card clickable
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
                {" "}
                {/* flex-shrink-0 to prevent image from shrinking */}
                <div
                  className="aspect-[4/5] md:aspect-square overflow-hidden"
                  style={{ backgroundColor: "var(--bone)" }}
                >
                  <img
                    src={product.thumbnails?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {/* Image Overlay on Hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Badges */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2">
                  {typeof product.discount === "number" &&
                    product.discount > 0 && (
                      <span
                        className="text-white px-2 py-1 md:px-3 md:py-1.5 text-sm md:text-base font-bold rounded-md uppercase tracking-wide"
                        style={{ backgroundColor: "var(--clay)" }}
                      >
                        {product.discount}% OFF
                      </span>
                    )}
                </div>
                {/* Action Buttons - Top right corner, appear on hover */}
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents card click from firing
                      navigate(`/product/${product._id}`);
                    }}
                    className="p-2 md:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-300 shadow-md"
                    style={{ color: "var(--clay)" }}
                  >
                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents card click from firing
                      handleQuickAdd(product);
                    }}
                    className="p-2 md:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-300 shadow-md"
                    style={{ color: "var(--clay)" }}
                  >
                    <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 md:p-6 flex flex-col flex-grow">
                {" "}
                {/* flex-grow to push button to bottom */}
                {/* Category */}
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <span
                    className="text-xs md:text-sm uppercase tracking-[0.15em] font-medium"
                    style={{ color: "var(--oak)" }}
                  >
                    {product.category}
                  </span>
                </div>
                {/* Product Name */}
                <h3
                  className="font-serif text-base md:text-xl font-medium mb-2 md:mb-4 tracking-wide line-clamp-2 leading-tight"
                  style={{ color: "var(--deep-clay)" }}
                >
                  {product.title}
                </h3>
                {/* Price Section */}
                <div className="mb-4 md:mb-6 mt-auto">
                  {" "}
                  {/* mt-auto to push price and button to bottom */}
                  <div className="flex items-baseline space-x-2 mb-1">
                    {product.originalPrice && (
                      <span
                        className="text-sm md:text-base line-through opacity-60"
                        style={{ color: "var(--oak)" }}
                      >
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span
                      className="text-lg md:text-2xl font-semibold"
                      style={{ color: "var(--deep-clay)" }}
                    >
                      ${product.price.toLocaleString()}
                    </span>
                  </div>
                  {product.originalPrice && (
                    <div
                      className="text-xs md:text-sm font-medium"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      Ahorrás $
                      {(product.originalPrice - product.price).toLocaleString()}
                    </div>
                  )}
                </div>
                {/* "Ver más" Button - Now always visible, with adjusted size */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents card click from firing
                    navigate(`/product/${product._id}`);
                  }}
                  className="w-full py-2.5 rounded-md text-white font-semibold text-xs uppercase tracking-[0.1em] transition-all duration-300 hover:brightness-110 shadow-md hover:shadow-lg" /* Adjusted py and text size */
                  style={{
                    background:
                      "linear-gradient(to right, var(--clay), var(--dark-clay))",
                  }}
                >
                  Ver más
                </button>
              </div>

              {/* Hover Border Effect */}
              <div
                className="absolute inset-0 border-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-lg"
                style={{
                  borderColor: "var(--clay)",
                }}
              />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <p className="text-xl font-light" style={{ color: "var(--oak)" }}>
              Aún no hay productos cargados en el sistema. ¡Pronto verás tus productos aquí!
            </p>
          </div>
        )}

        {hasMore && (
          <div
            className="text-center mt-12"
            style={{ backgroundColor: "var(--creme)" }}
          >
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 rounded-full text-white font-semibold text-base uppercase tracking-[0.1em] transition-all duration-300 hover:brightness-110 shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
              style={{
                background: "var(--creme)",
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
            {error && !loadingMore && (
              <p className="text-red-500 mt-4">{error}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
