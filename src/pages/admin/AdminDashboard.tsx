"use client"

import { useState, useEffect } from "react"
import {
  Package,
  DollarSign,
  Clock,
  Plus,
  Settings,
  Activity,
  ShoppingCart,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Link } from "react-router-dom"
import { apiService } from "../../services/api"
import type { Order } from "../../types/Order" // Declare the Order variable
import type { Product } from "../../services/api" // Import new types

interface ProductViewData {
  _id: string
  productTitle: string
  productCategory: string
  count: number
  displayName: string
  viewCount: number
  category: string
}

interface CategoryViewData {
  category: string
  count: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalInteractions: 0,
    },
    recentOrders: [] as Order[],
    mostViewedProducts: [] as ProductViewData[],
    mostVisitedCategories: [] as CategoryViewData[],
    recentInteractions: [],
    ordersByStatus: {
      pending_manual: 0,
      paid: 0,
      cancelled: 0,
      refunded: 0,
    },
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log("🔄 AdminDashboard - Iniciando carga optimizada del dashboard...")

      // OPTIMIZACIÓN: Hacer todas las peticiones en PARALELO en lugar de secuencial
      const [
        productsResponsePromise,
        ordersResponsePromise,
        interactionsResponsePromise,
        mostViewedProductsResponsePromise,
        mostVisitedCategoriesResponsePromise,
      ] = await Promise.allSettled([
        // Reducir la cantidad de datos iniciales para mayor velocidad
        apiService.getProducts({ limit: 10 }), // Menos productos inicialmente
        apiService.getAllOrders(1, 20), // Menos órdenes inicialmente
        apiService.getInteractionsSummary(),
        apiService.getMostViewedProducts(10), // Menos productos más vistos
        apiService.getMostViewedCategories(5),
      ])

      console.log("✅ Todas las peticiones completadas en paralelo")

      // Process responses safely
      const products =
        productsResponsePromise.status === "fulfilled" ? productsResponsePromise.value : { payload: [] as Product[] }
      const orders =
        ordersResponsePromise.status === "fulfilled" ? ordersResponsePromise.value : { orders: [] as Order[] }
      const interactions =
        interactionsResponsePromise.status === "fulfilled"
          ? interactionsResponsePromise.value
          : { summary: { totalInteractions: 0, recentInteractions: [] } }
      const mostViewedProducts =
        mostViewedProductsResponsePromise.status === "fulfilled"
          ? mostViewedProductsResponsePromise.value
          : { products: [] }
      const mostVisitedCategories =
        mostVisitedCategoriesResponsePromise.status === "fulfilled"
          ? mostVisitedCategoriesResponsePromise.value
          : { categories: [] }

      // Log de errores si los hay
      if (productsResponsePromise.status === "rejected")
        console.error("❌ Error cargando productos:", productsResponsePromise.reason)
      if (ordersResponsePromise.status === "rejected")
        console.error("❌ Error cargando órdenes:", ordersResponsePromise.reason)
      if (interactionsResponsePromise.status === "rejected")
        console.error("❌ Error cargando interacciones:", interactionsResponsePromise.reason)
      if (mostViewedProductsResponsePromise.status === "rejected")
        console.error("❌ Error cargando productos más vistos:", mostViewedProductsResponsePromise.reason)
      if (mostVisitedCategoriesResponsePromise.status === "rejected")
        console.error("❌ Error cargando categorías más visitadas:", mostVisitedCategoriesResponsePromise.reason)

      // Calcular estadísticas con datos seguros
      const totalProducts = products.payload?.length || 0
      const ordersArray: Order[] = orders.orders || [] // Explicitly type ordersArray
      const totalOrders = ordersArray.length
      const totalRevenue = ordersArray
        .filter((order: Order) => order.status === "paid") // Explicitly type order
        .reduce((sum: number, order: Order) => sum + (order.total || 0), 0) // Explicitly type sum and order

      console.log("📈 Estadísticas calculadas:", {
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersCount: ordersArray.length,
      })

      // Estadísticas por estado de órdenes
      const ordersByStatus = ordersArray.reduce(
        (acc: { [key: string]: number }, order: Order) => {
          // Explicitly type acc and order
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        },
        { pending_manual: 0, paid: 0, cancelled: 0, refunded: 0 },
      )

      // Órdenes recientes
      const recentOrders = ordersArray
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Explicitly type a and b
        .slice(0, 5)

      // Productos más vistos con nombres claros
      const processedMostViewedProducts: ProductViewData[] = (mostViewedProducts.products || []).map(
        (product: {
          productTitle?: string
          title?: string
          name?: string
          productCategory?: string
          category?: string
          count?: number
        }) => {
          return {
            _id: product.productTitle || product.title || product.name || "unknown", // Provide a fallback for _id
            productTitle: product.productTitle || product.title || product.name || "Producto sin nombre",
            productCategory: product.productCategory || product.category || "Sin categoría",
            count: product.count || 0,
            displayName: product.productTitle || product.title || product.name || "Producto sin nombre",
            viewCount: product.count || 0,
            category: product.productCategory || product.category || "Sin categoría",
          }
        },
      )

      // Categorías más visitadas
      const processedMostVisitedCategories: CategoryViewData[] = mostVisitedCategories.categories || []

      const finalData = {
        stats: {
          totalProducts,
          totalOrders,
          totalRevenue,
          totalInteractions: interactions.summary?.totalInteractions || 0,
        },
        recentOrders,
        mostViewedProducts: processedMostViewedProducts,
        mostVisitedCategories: processedMostVisitedCategories,
        recentInteractions: interactions.summary?.recentInteractions || [],
        ordersByStatus,
      }

      console.log("🎯 Dashboard cargado exitosamente en paralelo")
      setDashboardData(finalData)
    } catch (error) {
      console.error("💥 Error general cargando datos del dashboard:", error)
    } finally {
      setLoading(false)
      console.log("✅ Carga del dashboard completada")
    }
  }

  const stats = [
    {
      name: "Productos Almacenados",
      value: loading ? "-" : dashboardData.stats.totalProducts.toString(),
      icon: Package,
      gradient: "bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-700/10",
      border: "border-blue-600/40",
      iconBg: "bg-blue-600/20 border-blue-500/30",
      textColor: "text-blue-300",
      link: "/admin/products",
      change: "",
    },
    {
      name: "Órdenes Totales",
      value: loading ? "-" : dashboardData.stats.totalOrders.toString(),
      icon: ShoppingCart,
      gradient: "bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-700/10",
      border: "border-purple-600/40",
      iconBg: "bg-purple-600/20 border-purple-500/30",
      textColor: "text-purple-300",
      link: "/admin/orders",
      change: "",
    },
    {
      name: "Ingresos",
      value: loading ? "-" : `$${dashboardData.stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-emerald-900/30 via-emerald-800/20 to-emerald-700/10",
      border: "border-emerald-600/40",
      iconBg: "bg-emerald-600/20 border-emerald-500/30",
      textColor: "text-emerald-300",
      link: "/admin/orders",
      change: "",
      valueClassName: "text-2xl",
    },
    {
      name: "Interacciones",
      value: loading ? "-" : dashboardData.stats.totalInteractions.toString(),
      icon: Activity,
      gradient: "bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-amber-700/10",
      border: "border-amber-600/40",
      iconBg: "bg-amber-600/20 border-amber-500/30",
      textColor: "text-amber-300",
      link: "#",
      change: "",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; text: string }> = {
      pending_manual: { class: "admin-badge-warning", text: "Pendiente (Efectivo)" },
      pending_transfer_confirmation: { class: "admin-badge-info", text: "Pendiente (Verificar Comprobante)" },
      paid: { class: "admin-badge-success", text: "Pagado" },
      cancelled: { class: "admin-badge-danger", text: "Cancelado" },
      refunded: { class: "admin-badge-info", text: "Reembolsado" },
    }

    const config = statusConfig[status] || {
      class: "admin-badge",
      text: status,
    }
    return <span className={`admin-badge ${config.class}`}>{config.text}</span>
  }

  // Determinar cuántos productos mostrar
  const productsToShow = showAllProducts
    ? dashboardData.mostViewedProducts
    : dashboardData.mostViewedProducts.slice(0, 5)
  const categoriesToShow = showAllCategories
    ? dashboardData.mostVisitedCategories
    : dashboardData.mostVisitedCategories.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Panel de administración - Resumen ejecutivo</p>
            {loading && <div className="mt-2 text-sm text-blue-400">🔄 Cargando datos del dashboard...</div>}
          </div>
        </div>
      </div>

      {/* Estadísticas Principales con Gradientes */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link
            to={stat.link}
            key={stat.name}
            className={`${stat.gradient} border ${stat.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`p-2 sm:p-3 ${stat.iconBg} border rounded-xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                </div>
                <div>
                  <div
                    className={`${stat.valueClassName || "text-2xl sm:text-3xl"} font-bold text-white ${loading ? "admin-animate-pulse" : ""}`}
                  >
                    {stat.value}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium ${stat.textColor}`}>{stat.name}</div>
                </div>
              </div>
              <div className="text-xs text-green-400 font-medium">{stat.change}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Productos Más Vistos con Gradiente */}
      <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-700/5 border border-green-600/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-600/20 rounded-xl border border-green-500/30 mr-3">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-300">Productos Más Vistos</h2>
              <p className="text-sm text-green-400/80">
                Análisis de popularidad{" "}
                {dashboardData.mostViewedProducts.length > 0 &&
                  `(${dashboardData.mostViewedProducts.length} productos)`}
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="px-3 py-2 sm:px-4 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-all duration-200 text-xs sm:text-sm font-medium"
          >
            <span className="hidden sm:inline">Ver catálogo →</span>
            <span className="sm:hidden">Ver →</span>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-green-800/20 rounded-lg"></div>
            ))}
          </div>
        ) : dashboardData.mostViewedProducts.length > 0 ? (
          <>
            <div className="space-y-3">
              {productsToShow.map((product: ProductViewData, index: number) => (
                <div
                  key={product._id || index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-800/20 via-green-700/10 to-transparent border border-green-700/20 rounded-lg hover:from-green-800/30 hover:via-green-700/20 transition-all duration-300"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-600/30 to-green-700/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4 border border-green-600/40 flex-shrink-0">
                      <span className="text-green-300 font-bold text-xs sm:text-sm">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate text-sm sm:text-base">{product.displayName}</div>
                      <div className="text-xs sm:text-sm text-green-400/80 truncate">{product.category}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-base sm:text-lg font-bold text-green-300">{product.viewCount}</div>
                    <div className="text-xs text-green-400/70">vistas</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para mostrar más/menos productos */}
            {dashboardData.mostViewedProducts.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="inline-flex items-center px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-all duration-200 text-sm font-medium"
                >
                  {showAllProducts ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Mostrar todos ({dashboardData.mostViewedProducts.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-green-400/60">No hay datos de visualizaciones</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Categorías Más Visitadas con Gradiente */}
        <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-700/5 border border-purple-600/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 mr-3">
                <Tag className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-300">Categorías Más Visitadas</h2>
                <p className="text-sm text-purple-400/80">
                  Tendencias de navegación{" "}
                  {dashboardData.mostVisitedCategories.length > 0 &&
                    `(${dashboardData.mostVisitedCategories.length} categorías)`}
                </p>
              </div>
            </div>
            <Link
              to="/admin/content"
              className="px-3 py-2 sm:px-4 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Gestionar categorías →</span>
              <span className="sm:hidden">Gestionar →</span>
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-purple-800/20 rounded-lg"></div>
              ))}
            </div>
          ) : dashboardData.mostVisitedCategories.length > 0 ? (
            <>
              <div className="space-y-3">
                {categoriesToShow.map((category: CategoryViewData, index: number) => (
                  <div
                    key={category.category || index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 via-purple-700/10 to-transparent border border-purple-700/20 rounded-lg hover:from-purple-800/30 hover:via-purple-700/20 transition-all duration-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate text-sm sm:text-base">
                        {category.category || "Sin categoría"}
                      </div>
                      <div className="text-xs sm:text-sm text-purple-400/80">Categoría</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="px-2 py-1 sm:px-3 bg-purple-600/20 text-purple-300 border border-purple-600/30 rounded-full text-xs sm:text-sm font-medium">
                        {category.count}
                      </span>
                      <div className="text-xs sm:text-sm text-purple-400/70 mt-1">
                        <span className="hidden sm:inline">visualizaciones</span>
                        <span className="sm:hidden">vistas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para mostrar más/menos categorías */}
              {dashboardData.mostVisitedCategories.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-all duration-200 text-sm font-medium"
                  >
                    {showAllCategories ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Mostrar todas ({dashboardData.mostVisitedCategories.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-purple-400/60">No hay datos de categorías visitadas</div>
          )}
        </div>

        {/* Órdenes recientes con Gradiente */}
        <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-700/5 border border-blue-600/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 mr-3">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-300">Órdenes Recientes</h2>
                <p className="text-sm text-blue-400/80">Actividad reciente</p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="px-3 py-2 sm:px-4 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Ver todas →</span>
              <span className="sm:hidden">Ver →</span>
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-blue-800/20 rounded-lg"></div>
              ))}
            </div>
          ) : dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order: Order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-800/20 via-blue-700/10 to-transparent border border-blue-700/20 rounded-lg hover:from-blue-800/30 hover:via-blue-700/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white text-sm sm:text-base">#{order.orderNumber}</div>
                    <div className="text-xs sm:text-sm text-blue-400/80 truncate">
                      {order.shippingInfo?.fullName || "N/A"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    {getStatusBadge(order.status)}
                    <div className="text-xs sm:text-sm text-blue-400/80 mt-1">${order.total?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-400/60">No hay órdenes recientes</div>
          )}
        </div>
      </div>

      {/* Accesos rápidos con Gradientes */}
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/20 to-gray-700/10 border border-gray-600/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gray-600/20 rounded-xl border border-gray-500/30 mr-3">
            <Settings className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Accesos Rápidos</h2>
            <p className="text-sm text-gray-400">Herramientas principales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/admin/products/new"
            className="bg-gradient-to-br from-blue-800/30 via-blue-700/20 to-blue-600/10 border border-blue-600/40 rounded-xl p-4 hover:from-blue-800/40 hover:via-blue-700/30 hover:to-blue-600/20 transition-all duration-300 hover:scale-105 flex items-center group"
          >
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 sm:p-3 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-white text-sm sm:text-base">Nuevo Producto</h3>
              <p className="text-xs sm:text-sm text-blue-400/80">Añadir al catálogo</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-gradient-to-br from-purple-800/30 via-purple-700/20 to-purple-600/10 border border-purple-600/40 rounded-xl p-4 hover:from-purple-800/40 hover:via-purple-700/30 hover:to-purple-600/20 transition-all duration-300 hover:scale-105 flex items-center group"
          >
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-2 sm:p-3 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-white text-sm sm:text-base">Gestionar Órdenes</h3>
              <p className="text-xs sm:text-sm text-purple-400/80">Ver pedidos</p>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-gradient-to-br from-emerald-800/30 via-emerald-700/20 to-emerald-600/10 border border-emerald-600/40 rounded-xl p-4 hover:from-emerald-800/40 hover:via-emerald-700/30 hover:to-emerald-600/20 transition-all duration-300 hover:scale-105 flex items-center group"
          >
            <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-2 sm:p-3 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-white text-sm sm:text-base">Inventario</h3>
              <p className="text-xs sm:text-sm text-emerald-400/80">Gestionar productos</p>
            </div>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-gradient-to-br from-amber-800/30 via-amber-700/20 to-amber-600/10 border border-amber-600/40 rounded-xl p-4 hover:from-amber-800/40 hover:via-amber-700/30 hover:to-amber-600/20 transition-all duration-300 hover:scale-105 flex items-center group"
          >
            <div className="bg-amber-600/20 border border-amber-500/30 rounded-lg p-2 sm:p-3 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-white text-sm sm:text-base">Configuración</h3>
              <p className="text-xs sm:text-sm text-amber-400/80">Ajustes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
