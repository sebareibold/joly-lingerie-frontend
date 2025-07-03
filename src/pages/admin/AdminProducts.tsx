"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { apiService } from "../../services/api"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  category: string
  stock: number
  size: string[]
  status: boolean
  thumbnails: string[]
  discount?: number
  createdAt: string
  updatedAt: string
}

interface Category {
  name: string
  display_name: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProductsCount, setTotalProductsCount] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const loadProducts = async () => {
    try {
      console.log("AdminProducts - Iniciando carga de productos...", {
        currentPage,
        categoryFilter,
        statusFilter,
        searchTerm,
      })

      setLoading(true)
      const params: {
        page?: number
        limit?: number
        category?: string
        searchTerm?: string
        status?: boolean
      } = {
        page: currentPage,
        limit: 10,
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter
      }
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim()
      }
      if (statusFilter !== "all") {
        params.status = statusFilter === "active"
      }

      console.log("AdminProducts - Parámetros de búsqueda:", params)

      const response = await apiService.getProducts(params)

      console.log("AdminProducts - Respuesta recibida:", response)

      if (!response) {
        throw new Error("Respuesta vacía del servidor")
      }

      // Manejar tanto respuestas exitosas como de error
      if (!response.success) {
        console.warn("AdminProducts - Error en la respuesta:", response.error)
        setProducts([])
        setTotalProductsCount(0)
        setTotalPages(1)
        return
      }

      const products = response.payload || []
      const totalDocs = response.totalProducts || 0
      const totalPages = response.totalPages || Math.ceil(totalDocs / 10) || 1

      console.log("AdminProducts - Datos procesados:", {
        productsCount: products.length,
        totalDocs,
        totalPages,
      })

      setProducts(products)
      setTotalProductsCount(totalDocs)
      setTotalPages(totalPages)
    } catch (error) {
      console.error("Error loading products:", error)

      // Establecer estado de error pero no bloquear la UI
      setProducts([])
      setTotalProductsCount(0)
      setTotalPages(1)

      if (error instanceof Error) {
        console.error("Error específico:", error.message)
        // Solo mostrar alerta si es un error crítico, no para errores de red menores
        if (!error.message.includes("Network Error") && !error.message.includes("timeout")) {
          alert(`Error al cargar productos: ${error.message}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("AdminProducts - useEffect ejecutándose por cambio en dependencias")
    loadProducts()
  }, [currentPage, categoryFilter, statusFilter])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      loadProducts()
      return
    }

    const timeoutId = setTimeout(() => {
      console.log("AdminProducts - Búsqueda por término:", searchTerm)
      setCurrentPage(1)
      loadProducts()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Cargar categorías desde el backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await apiService.getSiteContent()

        if (response.success && response.content?.productCatalog?.categories) {
          setAvailableCategories(response.content.productCatalog.categories)
          console.log("AdminProducts - Categorías cargadas:", response.content.productCatalog.categories.length)
        } else {
          // Categorías por defecto si no se pueden cargar
          const defaultCategories = [
            { name: "electronics", display_name: "Electrónicos" },
            { name: "clothing", display_name: "Ropa" },
            { name: "books", display_name: "Libros" },
            { name: "home", display_name: "Hogar" },
            { name: "sports", display_name: "Deportes" },
            { name: "beauty", display_name: "Belleza" },
            { name: "toys", display_name: "Juguetes" },
            { name: "food", display_name: "Comida" },
            { name: "automotive", display_name: "Automotriz" },
          ]
          setAvailableCategories(defaultCategories)
          console.log("AdminProducts - Usando categorías por defecto")
        }
      } catch (error) {
        console.error("AdminProducts - Error loading categories:", error)
        // Usar categorías por defecto en caso de error
        const defaultCategories = [
          { name: "electronics", display_name: "Electrónicos" },
          { name: "clothing", display_name: "Ropa" },
          { name: "books", display_name: "Libros" },
          { name: "home", display_name: "Hogar" },
          { name: "sports", display_name: "Deportes" },
          { name: "beauty", display_name: "Belleza" },
          { name: "toys", display_name: "Juguetes" },
          { name: "food", display_name: "Comida" },
          { name: "automotive", display_name: "Automotriz" },
        ]
        setAvailableCategories(defaultCategories)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const deleteProduct = async (id: string) => {
    // Encontrar el producto para mostrar información en la confirmación
    const product = products.find((p) => p._id === id)
    const productName = product ? product.title : "este producto"

    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${productName}"?\n\nEsta acción es irreversible y no se podrá deshacer.`,
      )
    ) {
      try {
        setUpdating(true)

        // Llamar al servicio API mejorado
        await apiService.deleteProduct(id)

        alert("Producto eliminado exitosamente.")

        // Recargar la lista de productos
        await loadProducts()
      } catch (error) {
        console.error("Error deleting product:", error)

        // Mostrar mensaje de error específico
        if (error instanceof Error) {
          if (error.message.includes("órdenes activas")) {
            alert(
              "❌ No se puede eliminar este producto porque tiene órdenes activas asociadas.\n\nPrimero debe completar o cancelar las órdenes relacionadas.",
            )
          } else if (error.message.includes("no encontrado")) {
            alert("❌ El producto ya no existe o fue eliminado previamente.")
            // Recargar la lista para reflejar el estado actual
            await loadProducts()
          } else {
            alert(`❌ Error al eliminar el producto: ${error.message}`)
          }
        } else {
          alert("❌ Error desconocido al eliminar el producto.")
        }
      } finally {
        setUpdating(false)
      }
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      setUpdating(true)
      await apiService.updateProduct(product._id, { status: !product.status })
      alert(`Producto ${product.status ? "desactivado" : "activado"} exitosamente.`)
      loadProducts()
    } catch (error) {
      console.error("Error toggling product status:", error)
      alert("Error al cambiar el estado del producto.")
    } finally {
      setUpdating(false)
    }
  }

  // Function to get category-based gradient styling
  const getCategoryGradient = (category: string) => {
    const categoryStyles: Record<string, { gradient: string; border: string; textColor: string }> = {
      electronics: {
        gradient: "bg-gradient-to-r from-blue-900/10 via-blue-800/5 to-transparent",
        border: "border-l-2 border-blue-600/30",
        textColor: "text-blue-400",
      },
      clothing: {
        gradient: "bg-gradient-to-r from-purple-900/10 via-purple-800/5 to-transparent",
        border: "border-l-2 border-purple-600/30",
        textColor: "text-purple-400",
      },
      books: {
        gradient: "bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-transparent",
        border: "border-l-2 border-amber-600/30",
        textColor: "text-amber-400",
      },
      home: {
        gradient: "bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-transparent",
        border: "border-l-2 border-emerald-600/30",
        textColor: "text-emerald-400",
      },
      sports: {
        gradient: "bg-gradient-to-r from-red-900/10 via-red-800/5 to-transparent",
        border: "border-l-2 border-red-600/30",
        textColor: "text-red-400",
      },
      beauty: {
        gradient: "bg-gradient-to-r from-pink-900/10 via-pink-800/5 to-transparent",
        border: "border-l-2 border-pink-600/30",
        textColor: "text-pink-400",
      },
      toys: {
        gradient: "bg-gradient-to-r from-orange-900/10 via-orange-800/5 to-transparent",
        border: "border-l-2 border-orange-600/30",
        textColor: "text-orange-400",
      },
      food: {
        gradient: "bg-gradient-to-r from-green-900/10 via-green-800/5 to-transparent",
        border: "border-l-2 border-green-600/30",
        textColor: "text-green-400",
      },
      automotive: {
        gradient: "bg-gradient-to-r from-gray-900/10 via-gray-800/5 to-transparent",
        border: "border-l-2 border-gray-600/30",
        textColor: "text-gray-400",
      },
    }

    return (
      categoryStyles[category] || {
        gradient: "bg-gradient-to-r from-gray-900/10 via-gray-800/5 to-transparent",
        border: "border-l-2 border-gray-600/30",
        textColor: "text-gray-400",
      }
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Productos</h1>
          <p className="mt-2 text-gray-400">Administra y supervisa todos los productos de tu tienda</p>
        </div>
        <Link
          to="/admin"
          className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      </div>

      {/* Action Bar con Gradiente */}
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/20 to-gray-700/10 border border-gray-600/30 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600/30 to-blue-700/20 text-blue-300 border border-blue-600/40 rounded-lg hover:from-blue-600/40 hover:to-blue-700/30 transition-all duration-300 hover:scale-105 font-medium shadow-lg text-xs sm:text-base"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Añadir Nuevo Producto
          </Link>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input w-full sm:w-auto text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="admin-input text-xs sm:text-sm"
                  disabled={categoriesLoading}
                >
                  <option value="all">Todas las categorías</option>
                  {availableCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="admin-input text-xs sm:text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <button
                onClick={loadProducts}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-600/30 to-emerald-700/20 text-emerald-300 border border-emerald-600/40 rounded-lg hover:from-emerald-600/40 hover:to-emerald-700/30 transition-all duration-300 font-medium text-xs sm:text-base"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table con Gradientes por Categoría */}
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/20 to-gray-700/10 border border-gray-600/30 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "No se encontraron productos con los filtros aplicados."
                : "Añade tu primer producto para empezar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gradient-to-r from-gray-900/60 to-gray-800/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end space-x-2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {products.map((product) => {
                  const categoryStyle = getCategoryGradient(product.category)
                  return (
                    <tr
                      key={product._id}
                      className={`${categoryStyle.gradient} ${categoryStyle.border} hover:from-gray-800/30 hover:via-gray-700/20 hover:to-transparent transition-all duration-300`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover border-2 border-gray-600/50 mr-4 shadow-md"
                            src={product.thumbnails[0] || "/placeholder.svg?height=48&width=48"}
                            alt={product.title}
                          />
                          <div className="sm:pr-10">
                            <div className="text-sm font-medium text-white">{product.title}</div>
                            <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-gray-700/40 to-gray-600/30 border border-gray-600/40 ${categoryStyle.textColor}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-emerald-400" />
                          {product.price.toLocaleString()}
                          {product.discount && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/40">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.status ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/30 to-emerald-600/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle className="h-3 w-3 mr-1" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500/30 to-red-600/20 text-red-300 border border-red-500/40">
                            <XCircle className="h-3 w-3 mr-1" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end space-x-2">
                        <Link
                          to={`/product/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-blue-700/20 text-blue-300 border border-blue-600/40 rounded-lg hover:from-blue-600/40 hover:to-blue-700/30 transition-all duration-300 text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-700/20 text-amber-300 border border-amber-600/40 rounded-lg hover:from-amber-600/40 hover:to-amber-700/30 transition-all duration-300 text-sm font-medium"
                          onClick={(e) => {
                            // Verificar que el producto existe antes de navegar
                            if (!product._id || product._id.trim() === "") {
                              e.preventDefault()
                              alert("Error: ID de producto inválido")
                              return
                            }

                            // Opcional: Prefetch del producto para edición más rápida
                            apiService.getProduct(product._id).catch((err) => {
                              console.warn("Error prefetching product:", err)
                            })
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Link>
                        <button
                          onClick={() => toggleProductStatus(product)}
                          disabled={updating}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium ${
                            product.status
                              ? "bg-gradient-to-r from-red-600/30 to-red-700/20 text-red-300 border border-red-600/40 hover:from-red-600/40 hover:to-red-700/30"
                              : "bg-gradient-to-r from-emerald-600/30 to-emerald-700/20 text-emerald-300 border border-emerald-600/40 hover:from-emerald-600/40 hover:to-emerald-700/30"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {product.status ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" /> Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" /> Activar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          disabled={updating}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-700/50 to-gray-800/40 text-gray-300 border border-gray-600/50 rounded-lg hover:from-gray-600/60 hover:to-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination con Gradiente */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-900/40 via-gray-800/20 to-gray-700/10 border border-gray-600/30 rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="text-sm text-gray-400">
            Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalProductsCount)} de{" "}
            {totalProductsCount} productos
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-700/50 to-gray-800/40 text-gray-300 border border-gray-600/50 rounded-lg hover:from-gray-600/60 hover:to-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Anterior
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-600/40 to-blue-700/30 text-blue-300 border border-blue-600/50 shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/40"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-700/50 to-gray-800/40 text-gray-300 border border-gray-600/50 rounded-lg hover:from-gray-600/60 hover:to-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
