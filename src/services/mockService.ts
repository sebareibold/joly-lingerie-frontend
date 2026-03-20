/*
  ====================  Mock Service ====================

  Simula las llamadas a la API usando datos mock estáticos.
  Cada función retorna una Promise con un pequeño delay 
  para emular el comportamiento real de red.

  Este servicio reemplaza completamente al apiService real
  cuando el backend no está disponible (modo portfolio).

  =========================================================
*/

import {
  mockProducts,
  mockOrders,
  mockSiteContent,
  mockInteractionsSummary,
  mockMostViewedProducts,
  mockMostViewedCategories,
  type MockProduct,
} from "./mockData"

// Estado mutable en memoria (para simular CRUD en la sesión)
let products = [...mockProducts]
let orders = [...mockOrders]
let nextProductId = 13
let nextOrderId = 6

// ========================== Helpers ==========================

/** Simula un delay de red (200-500ms aleatorio) */
const delay = (ms?: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms ?? 200 + Math.random() * 300))

/** Genera un ID sencillo */
const generateId = (prefix: string, num: number): string =>
  `${prefix}_${String(num).padStart(3, "0")}`

// ========================== Mock API Service ==========================

export const apiService = {
  // ---------- Cache (no-op en mock, mantiene compatibilidad) ----------
  clearCache: () => {
    console.log("🧪 [Mock] Caché limpiado (no-op)")
  },
  clearProductsCache: () => {
    console.log("🧪 [Mock] Caché de productos limpiado (no-op)")
  },
  clearOrdersCache: () => {
    console.log("🧪 [Mock] Caché de órdenes limpiado (no-op)")
  },
  clearSiteContentCache: () => {
    console.log("🧪 [Mock] Caché de contenido limpiado (no-op)")
  },

  // ---------- HTTP genéricos (mantienen compatibilidad) ----------
  get: async (_url: string, _params?: any) => {
    await delay()
    console.warn("🧪 [Mock] apiService.get() llamado directamente — usa los métodos específicos")
    return {}
  },
  post: async (_url: string, _data: any) => {
    await delay()
    console.warn("🧪 [Mock] apiService.post() llamado directamente — usa los métodos específicos")
    return {}
  },
  put: async (_url: string, _data: any) => {
    await delay()
    console.warn("🧪 [Mock] apiService.put() llamado directamente — usa los métodos específicos")
    return {}
  },
  del: async (_url: string) => {
    await delay()
    // Manejar rutas especiales de delete
    if (_url === "/interactions/reset") {
      return { success: true }
    }
    console.warn("🧪 [Mock] apiService.del() llamado directamente — usa los métodos específicos")
    return { success: true }
  },

  // ====================== Autenticación ======================

  login: async (credentials: { email: string; password: string }) => {
    await delay(400)
    console.log("🧪 [Mock] Login con:", credentials.email)

    // Aceptar cualquier credencial para demo
    if (credentials.email && credentials.password) {
      const mockToken = "mock_jwt_token_" + Date.now()
      localStorage.setItem("token", mockToken)
      return {
        success: true,
        user: {
          id: "user_001",
          _id: "user_001",
          email: credentials.email,
          role: "admin",
          name: "Admin Joly",
          firstName: "Admin",
        },
        token: mockToken,
      }
    }
    return { success: false, error: "Credenciales inválidas" }
  },

  logout: () => {
    localStorage.removeItem("token")
    console.log("🧪 [Mock] Logout exitoso")
    return { success: true }
  },

  checkAuth: async () => {
    await delay(200)
    const token = localStorage.getItem("token")
    if (!token) {
      return { success: false, user: null }
    }
    return {
      success: true,
      user: {
        id: "user_001",
        email: "admin@jolylingerie.com",
        role: "admin",
        name: "Admin Joly",
      },
    }
  },

  updateProfile: async (profileData: any) => {
    await delay()
    console.log("🧪 [Mock] Perfil actualizado:", profileData)
    return {
      success: true,
      user: { id: "user_001", ...profileData },
    } as any
  },

  updatePassword: async (_passwordData: any) => {
    await delay()
    console.log("🧪 [Mock] Contraseña actualizada")
    return { success: true, message: "Contraseña actualizada exitosamente" } as any
  },

  // ====================== Productos ======================

  getProducts: async (params?: any) => {
    await delay()
    let result = [...products].filter((p) => p.status) // Solo productos activos por defecto

    // Si viene del admin, mostrar todos
    if (params?.status === false || params?.status === "inactive") {
      result = [...products].filter((p) => !p.status)
    } else if (params?.status === true || params?.status === "active") {
      result = [...products].filter((p) => p.status)
    } else if (params?.status === undefined && !params?.category) {
      // Sin filtro de status, mostrar solo activos para público
      result = [...products].filter((p) => p.status)
    }

    // Filtro por categoría
    if (params?.category && params.category !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === params.category.toLowerCase()
      )
    }

    // Filtro por búsqueda
    if (params?.searchTerm) {
      const term = params.searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      )
    }

    // Filtro por tallas
    if (params?.sizes && Array.isArray(params.sizes) && params.sizes.length > 0) {
      const sizesUpper = params.sizes.map((s: string) => s.trim().toUpperCase())
      result = result.filter((p) =>
        p.size.some((s) => sizesUpper.includes(s.trim().toUpperCase()))
      )
    }

    // Ordenamiento
    if (params?.sortBy === "price") {
      result.sort((a, b) =>
        params.sortOrder === "desc" ? b.price - a.price : a.price - b.price
      )
    } else if (params?.sortBy === "title") {
      result.sort((a, b) =>
        params.sortOrder === "desc"
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title)
      )
    }

    // Paginación
    const page = params?.page || 1
    const limit =
      params?.limit === "all" ? result.length : params?.limit || 12
    const start = (page - 1) * limit
    const paginatedResult = result.slice(start, start + limit)

    console.log(
      `🧪 [Mock] getProducts: ${paginatedResult.length}/${result.length} (página ${page})`
    )

    return {
      success: true,
      status: "success",
      payload: paginatedResult,
      totalPages: Math.ceil(result.length / limit) || 1,
      totalDocs: result.length,
      totalProducts: result.length,
    }
  },

  getProductsCount: async () => {
    await delay(150)
    const count = products.filter((p) => p.status).length
    console.log(`🧪 [Mock] getProductsCount: ${count}`)
    return { success: true, count }
  },

  getAllProducts: async () => {
    await delay()
    const activeProducts = products.filter((p) => p.status)
    console.log(`🧪 [Mock] getAllProducts: ${activeProducts.length}`)
    return {
      success: true,
      status: "success",
      payload: activeProducts,
      totalDocs: activeProducts.length,
    }
  },

  getProduct: async (id: string) => {
    await delay()
    const product = products.find((p) => p._id === id)
    console.log(`🧪 [Mock] getProduct(${id}):`, product ? "encontrado" : "no encontrado")
    if (product) {
      return { success: true, product } as any
    }
    return { success: false, error: "Producto no encontrado" } as any
  },

  createProduct: async (productData: any) => {
    await delay(300)
    const newProduct: MockProduct = {
      _id: generateId("prod", nextProductId++),
      title: productData.title || "Nuevo Producto",
      description: productData.description || "",
      price: productData.price || 0,
      category: productData.category || "corpiños",
      stock: productData.stock || 0,
      status: productData.status ?? true,
      thumbnails: productData.thumbnails || [],
      size: productData.size || [],
      discount: productData.discount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    products.push(newProduct)
    console.log("🧪 [Mock] Producto creado:", newProduct.title)
    return { success: true, product: newProduct }
  },

  updateProduct: async (id: string, productData: any) => {
    await delay(300)
    const index = products.findIndex((p) => p._id === id)
    if (index === -1) {
      return { success: false, error: "Producto no encontrado" }
    }
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    }
    console.log("🧪 [Mock] Producto actualizado:", products[index].title)
    return { success: true, product: products[index] }
  },

  deleteProduct: async (id: string) => {
    await delay(300)
    const index = products.findIndex((p) => p._id === id)
    if (index === -1) {
      return { success: false, error: "Producto no encontrado" }
    }
    const deleted = products.splice(index, 1)
    console.log("🧪 [Mock] Producto eliminado:", deleted[0].title)
    return { success: true, message: "Producto eliminado exitosamente" }
  },

  // ====================== Órdenes ======================

  createOrder: async (orderData: any) => {
    await delay(400)
    const newOrder = {
      _id: generateId("ord", nextOrderId++),
      orderNumber: `JL-2025-${String(nextOrderId).padStart(4, "0")}`,
      items: orderData.items || [],
      shippingInfo: orderData.shippingInfo || {},
      paymentMethod: orderData.paymentMethod || "cash",
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      total: orderData.total || 0,
      status: orderData.paymentMethod === "transfer" ? "pending_transfer_proof" : "pending_manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any
    orders.push(newOrder)
    console.log("🧪 [Mock] Orden creada:", newOrder.orderNumber)
    return { success: true, order: newOrder } as any
  },

  getOrder: async (id: string) => {
    await delay()
    const order = orders.find((o) => o._id === id)
    if (order) {
      return { success: true, order } as any
    }
    return { success: false, error: "Orden no encontrada" } as any
  },

  getAllOrders: async (page = 1, limit = 10, status?: string) => {
    await delay()
    let result = [...orders]

    if (status) {
      result = result.filter((o) => o.status === status)
    }

    // Ordenar por fecha de creación descendente
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const start = (page - 1) * limit
    const paginatedResult = result.slice(start, start + limit)

    console.log(
      `🧪 [Mock] getAllOrders: ${paginatedResult.length}/${result.length}`
    )
    return {
      success: true,
      orders: paginatedResult,
      totalOrders: result.length,
      totalPages: Math.ceil(result.length / limit) || 1,
    }
  },

  updateOrderStatus: async (id: string, status: string, adminNotes: string) => {
    await delay(300)
    const index = orders.findIndex((o) => o._id === id)
    if (index === -1) {
      return { success: false, error: "Orden no encontrada" } as any
    }
    orders[index] = {
      ...orders[index],
      status: status as any,
      adminNotes,
      updatedAt: new Date().toISOString(),
      ...(status === "paid" ? { paidAt: new Date().toISOString() } : {}),
    }
    console.log("🧪 [Mock] Estado de orden actualizado:", id, "→", status)
    return { success: true, order: orders[index] } as any
  },

  deleteOrder: async (id: string) => {
    await delay(300)
    const index = orders.findIndex((o) => o._id === id)
    if (index === -1) {
      return { success: false, error: "Orden no encontrada" }
    }
    orders.splice(index, 1)
    console.log("🧪 [Mock] Orden eliminada:", id)
    return { success: true, message: "Orden eliminada exitosamente" }
  },

  getOrdersSummary: async () => {
    await delay()
    const paidOrders = orders.filter((o) => o.status === "paid")
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

    // Build summaryByStatusAndPaymentMethod for AdminOrders
    const countByStatusAndMethod = (status: string, method: string) =>
      orders.filter((o) => o.status === status && o.paymentMethod === method).length
    const byStatusAndPaymentMethod = {
      pending_manual: { cash: countByStatusAndMethod("pending_manual", "cash"), transfer: countByStatusAndMethod("pending_manual", "transfer") },
      pending_transfer_proof: { cash: countByStatusAndMethod("pending_transfer_proof", "cash"), transfer: countByStatusAndMethod("pending_transfer_proof", "transfer") },
      pending_transfer_confirmation: { cash: countByStatusAndMethod("pending_transfer_confirmation", "cash"), transfer: countByStatusAndMethod("pending_transfer_confirmation", "transfer") },
      paid: { cash: countByStatusAndMethod("paid", "cash"), transfer: countByStatusAndMethod("paid", "transfer") },
      cancelled: { cash: countByStatusAndMethod("cancelled", "cash"), transfer: countByStatusAndMethod("cancelled", "transfer") },
      refunded: { cash: countByStatusAndMethod("refunded", "cash"), transfer: countByStatusAndMethod("refunded", "transfer") },
      confirmado: { cash: countByStatusAndMethod("confirmado", "cash"), transfer: countByStatusAndMethod("confirmado", "transfer") },
    }

    const summary = {
      totalOrders: orders.length,
      totalRevenue,
      ordersByStatus: {
        pending_manual: orders.filter((o) => o.status === "pending_manual").length,
        pending_transfer_proof: orders.filter((o) => o.status === "pending_transfer_proof").length,
        pending_transfer_confirmation: orders.filter((o) => o.status === "pending_transfer_confirmation").length,
        paid: paidOrders.length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
        refunded: orders.filter((o) => o.status === "refunded").length,
      },
      summaryByStatusAndPaymentMethod: byStatusAndPaymentMethod,
    }
    return { success: true, summary }
  },

  getOrderByOrderNumber: async (orderNumber: string) => {
    await delay()
    const order = orders.find((o) => o.orderNumber === orderNumber)
    if (order) {
      return { success: true, order } as any
    }
    return { success: false, error: "Orden no encontrada" } as any
  },

  // ====================== Contenido del Sitio ======================

  getSiteContent: async () => {
    await delay(250)
    console.log("🧪 [Mock] getSiteContent")
    return { success: true, content: mockSiteContent } as any
  },

  updateSiteContent: async (contentData: any) => {
    await delay(400)
    console.log("🧪 [Mock] Contenido del sitio actualizado (solo en memoria)")
    return { success: true, content: { ...mockSiteContent, ...contentData } } as any
  },

  // ====================== Interacciones ======================

  createInteraction: async (type: string, data: any) => {
    await delay(100)
    console.log(`🧪 [Mock] Interacción registrada: ${type}`, data)
    return {
      success: true,
      interaction: { type, data, createdAt: new Date().toISOString() },
    }
  },

  getInteractionsSummary: async () => {
    await delay()
    return { success: true, summary: mockInteractionsSummary }
  },

  getMostViewedProducts: async (limit: number) => {
    await delay()
    const result = mockMostViewedProducts.slice(0, limit)
    return { success: true, products: result }
  },

  getMostViewedCategories: async (limit: number) => {
    await delay()
    const result = mockMostViewedCategories.slice(0, limit)
    return { success: true, categories: result }
  },

  // ====================== Upload / Archivos ======================

  uploadTransferProof: async (_file: File) => {
    await delay(500)
    console.log("🧪 [Mock] Comprobante de transferencia simulado")
    return {
      success: true,
      url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
      filename: "mock_proof_" + Date.now() + ".jpg",
    } as any
  },

  // ====================== Contacto ======================

  sendContactForm: async (formData: any) => {
    await delay(400)
    console.log("🧪 [Mock] Formulario de contacto recibido:", formData)
    return {
      success: true,
      message: "Mensaje enviado exitosamente. Te responderemos pronto.",
    } as any
  },

  // ====================== Health ======================

  healthCheck: async () => {
    await delay(100)
    return {
      status: "ok",
      mode: "mock",
      message: "Servicio mock activo (modo portfolio)",
      timestamp: new Date().toISOString(),
    } as any
  },
}
