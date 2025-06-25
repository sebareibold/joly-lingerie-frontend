// Este archivo se comporta como un manager de la API, de tal manera que únicamente los subsistemas del front se comunican con él.
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

// Cache para las respuestas de la API
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Cola de peticiones para evitar el error 429 (Too Many Requests)
const requestQueue: {
  url: string
  method: string
  data?: any
  params?: any
  resolve: (value: any) => void
  reject: (reason?: any) => void
}[] = []
let isProcessingQueue = false
const REQUEST_INTERVAL = 100 // 100ms entre peticiones

// Función para procesar la cola de peticiones
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) {
    return
  }

  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const { url, method, data, params, resolve, reject } = requestQueue.shift()!
    try {
      const response = await makeRequestWithDelay(url, method, data, params)
      resolve(response)
    } catch (error) {
      reject(error)
    }
    await new Promise((res) => setTimeout(res, REQUEST_INTERVAL)) // Esperar antes de la siguiente petición
  }

  isProcessingQueue = false
}

// Función auxiliar para hacer peticiones con delay
const makeRequestWithDelay = async (url: string, method: string, data?: any, params?: any) => {
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    data,
    params,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }

  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Error en la petición ${method} ${url}:`, error.response.status, error.response.data)
      throw new Error(error.response.data.message || `Error en la petición: ${error.response.status}`)
    } else {
      console.error(`Error desconocido en la petición ${method} ${url}:`, error)
      throw new Error("Error de red o desconocido")
    }
  }
}

// Función para encolar una petición
const queueRequest = (url: string, method: string, data?: any, params?: any) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ url, method, data, params, resolve, reject })
    processRequestQueue() // Iniciar procesamiento si no está activo
  })
}

export const apiService = {
  // Limpiar todo el caché
  clearCache: () => {
    apiCache.clear()
    console.log("🗑️ Caché de API limpiado.")
  },

  // Limpiar caché de productos
  clearProductsCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/products")) {
        apiCache.delete(key)
      }
    }
    console.log("🗑️ Caché de productos limpiado.")
  },

  // Limpiar caché de órdenes
  clearOrdersCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/orders")) {
        apiCache.delete(key)
      }
    }
    console.log("🗑️ Caché de órdenes limpiado.")
  },

  // Limpiar caché de contenido del sitio
  clearSiteContentCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/site-content")) {
        apiCache.delete(key)
      }
    }
    console.log("🗑️ Caché de contenido del sitio limpiado.")
  },

  // Función genérica para hacer peticiones GET con caché
  get: async (url: string, params?: any) => {
    const cacheKey = `${url}?${new URLSearchParams(params).toString()}`
    const cached = apiCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`⚡ Usando caché para GET ${url}`)
      return cached.data
    }

    try {
      const response = await queueRequest(url, "get", undefined, params)
      apiCache.set(cacheKey, { data: response, timestamp: Date.now() })
      return response
    } catch (error) {
      console.error(`Error en GET ${url}:`, error)
      throw error
    }
  },

  // Función genérica para hacer peticiones POST
  post: async (url: string, data: any) => {
    try {
      const response = await queueRequest(url, "post", data)
      // Invalidar caché relevante después de un POST
      if (url.startsWith("/products")) apiService.clearProductsCache()
      if (url.startsWith("/orders")) apiService.clearOrdersCache()
      if (url.startsWith("/site-content")) apiService.clearSiteContentCache()
      return response
    } catch (error) {
      console.error(`Error en POST ${url}:`, error)
      throw error
    }
  },

  // Función genérica para hacer peticiones PUT
  put: async (url: string, data: any) => {
    try {
      const response = await queueRequest(url, "put", data)
      // Invalidar caché relevante después de un PUT
      if (url.startsWith("/products")) apiService.clearProductsCache()
      if (url.startsWith("/orders")) apiService.clearOrdersCache()
      if (url.startsWith("/site-content")) apiService.clearSiteContentCache()
      return response
    } catch (error) {
      console.error(`Error en PUT ${url}:`, error)
      throw error
    }
  },

  // Función genérica para hacer peticiones DELETE
  del: async (url: string) => {
    try {
      const response = await queueRequest(url, "delete")
      // Invalidar caché relevante después de un DELETE
      if (url.startsWith("/products")) apiService.clearProductsCache()
      if (url.startsWith("/orders")) apiService.clearOrdersCache()
      if (url.startsWith("/site-content")) apiService.clearSiteContentCache()
      return response
    } catch (error) {
      console.error(`Error en DELETE ${url}:`, error)
      throw error
    }
  },

  // Auth Endpoints
  login: async (credentials: any) => {
    try {
      const response = await apiService.post("/auth/login", credentials)
      if (response.token) {
        localStorage.setItem("token", response.token)
      }
      return { success: true, user: response.user }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error de credenciales"
          : "Error desconocido",
      } // Narrow type
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    // No hay endpoint de logout en el backend, solo se limpia el token local
    return { success: true }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return { success: false, user: null }
    }
    try {
      const response = await apiService.get("/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      })
      return { success: true, user: response.user }
    } catch (error: unknown) {
      // Type 'error' as unknown
      console.error("Error checking auth:", error)
      localStorage.removeItem("token") // Token inválido o expirado
      return { success: false, user: null }
    }
  },

  // User Profile Endpoints
  updateProfile: async (profileData: any) => {
    try {
      const response = await apiService.put("/users/profile", profileData)
      return { success: true, user: response.user }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar perfil"
          : "Error desconocido",
      } // Narrow type
    }
  },

  updatePassword: async (passwordData: any) => {
    try {
      const response = await apiService.put("/users/password", passwordData)
      return { success: true, message: response.message }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar contraseña"
          : "Error desconocido",
      } // Narrow type
    }
  },

  // Product Endpoints
  getProducts: async (params?: any) => {
    try {
      const response = await apiService.get("/products", params)
      return {
        success: true,
        payload: response.products,
        totalPages: response.totalPages,
        totalProducts: response.totalProducts,
      }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener productos"
          : "Error desconocido",
        payload: [],
        totalPages: 0,
        totalProducts: 0,
      } // Narrow type
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = await apiService.get(`/products/${id}`)
      return { success: true, product: response.product }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener producto"
          : "Error desconocido",
      } // Narrow type
    }
  },

  createProduct: async (productData: any) => {
    try {
      const response = await apiService.post("/products", productData)
      return { success: true, product: response.product }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al crear producto"
          : "Error desconocido",
      } // Narrow type
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const response = await apiService.put(`/products/${id}`, productData)
      return { success: true, product: response.product }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar producto"
          : "Error desconocido",
      } // Narrow type
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await apiService.del(`/products/${id}`)
      return { success: true, message: response.message }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al eliminar producto"
          : "Error desconocido",
      } // Narrow type
    }
  },

  // Order Endpoints
  createOrder: async (orderData: any) => {
    try {
      const response = await apiService.post("/orders", orderData)
      return { success: true, order: response.order }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al crear orden"
          : "Error desconocido",
      } // Narrow type
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await apiService.get(`/orders/${id}`)
      return { success: true, order: response.order }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener orden"
          : "Error desconocido",
      } // Narrow type
    }
  },

  getAllOrders: async (page = 1, limit = 10, status?: string) => {
    try {
      const params = { page, limit, ...(status && { status }) }
      const response = await apiService.get("/orders", params)
      return {
        success: true,
        orders: response.orders,
        totalOrders: response.totalOrders,
        totalPages: response.totalPages,
      }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener órdenes"
          : "Error desconocido",
        orders: [],
        totalOrders: 0,
        totalPages: 0,
      } // Narrow type
    }
  },

  updateOrderStatus: async (id: string, status: string, adminNotes: string) => {
    try {
      const response = await apiService.put(`/orders/${id}/status`, { status, adminNotes })
      return { success: true, order: response.order }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar estado de orden"
          : "Error desconocido",
      } // Narrow type
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const response = await apiService.del(`/orders/${id}`)
      return { success: true, message: response.message }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al eliminar orden"
          : "Error desconocido",
      } // Narrow type
    }
  },

  getOrdersSummary: async () => {
    try {
      const response = await apiService.get("/orders/summary")
      return { success: true, summary: response.summary }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener resumen de órdenes"
          : "Error desconocido",
      } // Narrow type
    }
  },

  // Site Content Endpoints
  getSiteContent: async () => {
    try {
      const response = await apiService.get("/site-content")
      return { success: true, content: response.content }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener contenido del sitio"
          : "Error desconocido",
      } // Narrow type
    }
  },

  updateSiteContent: async (contentData: any) => {
    try {
      const response = await apiService.put("/site-content", contentData)
      return { success: true, content: response.content }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar contenido del sitio"
          : "Error desconocido",
      } // Narrow type
    }
  },

  // Interaction Endpoints
  createInteraction: async (type: string, data: any) => {
    try {
      const response = await apiService.post("/interactions", { type, data })
      return { success: true, interaction: response.interaction }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al registrar interacción"
          : "Error desconocido",
      } // Narrow type
    }
  },

  getInteractionsSummary: async () => {
    try {
      const response = await apiService.get("/interactions/summary")
      return { success: true, summary: response.summary }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener resumen de interacciones"
          : "Error desconocido",
      } // Narrow type
    }
  },

  getMostViewedProducts: async (limit: number) => {
    try {
      const response = await apiService.get("/interactions/most-viewed-products", { limit })
      return { success: true, products: response.products }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener productos más vistos"
          : "Error desconocido",
        products: [],
      } // Narrow type
    }
  },

  getMostViewedCategories: async (limit: number) => {
    try {
      const response = await apiService.get("/interactions/most-viewed-categories", { limit })
      return { success: true, categories: response.categories }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener categorías más vistas"
          : "Error desconocido",
        categories: [],
      } // Narrow type
    }
  },

  // File Upload Endpoints
  uploadTransferProof: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(`${API_BASE_URL}/upload/transfer-proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      return { success: true, url: response.data.url, filename: response.data.filename }
    } catch (error: unknown) {
      // Type 'error' as unknown
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al subir archivo"
          : "Error desconocido",
      } // Narrow type
    }
  },

  // Health Check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      return response.data
    } catch (error) {
      console.error("Health check failed:", error)
      return null
    }
  },
}
