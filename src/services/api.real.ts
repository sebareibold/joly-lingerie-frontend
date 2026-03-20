/*
  ====================  API Service ====================

  Este módulo centraliza toda la comunicación del frontend con la API.
  implementa una cola de peticiones con retardo para evitar errores 429, un 
  sistema de caché en memoria con expiración de 5 minutos para respuestas GET,
  y métodos genéricos (get, post, put, del) que gestionan cabeceras, token y
  borran el caché relacionado tras cambios de datos; maneja errores diferenciando
  fallos de red, HTTP y mensajes del backend; ofrece endpoints específicos para 
  autenticación, usuarios, productos, órdenes, contenido, interacciones, subida
  de archivos, formulario de contacto y chequeo de salud; invalida de forma 
  selectiva el caché al modificar recursos clave y procesa las solicitudes de
  forma secuencial con intervalos de 100 ms.

  =========================================================
*/

import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL 

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
    console.log(" Caché de API limpiado.")
  },

  // Limpiar caché de productos
  clearProductsCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/products")) {
        apiCache.delete(key)
      }
    }
    console.log(" Caché de productos limpiado.")
  },

  // Limpiar caché de órdenes
  clearOrdersCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/orders")) {
        apiCache.delete(key)
      }
    }
    console.log(" Caché de órdenes limpiado.")
  },

  // Limpiar caché de contenido del sitio
  clearSiteContentCache: () => {
    for (const key of apiCache.keys()) {
      if (key.startsWith("/content")) {
        apiCache.delete(key)
      }
    }
    console.log(" Caché de contenido del sitio limpiado.")
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
      if (url.startsWith("/content")) apiService.clearSiteContentCache()
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
      if (url.startsWith("/content")) apiService.clearSiteContentCache()
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
      if (url.startsWith("/content")) apiService.clearSiteContentCache()
      return response
    } catch (error) {
      console.error(`Error en DELETE ${url}:`, error)
      throw error
    }
  },

  /* =================== Endpoints de Usuarios  y Autentifacion ===================== */

  login: async (credentials: any) => {
    try {
      const response = (await apiService.post("/auth/login", credentials)) as any
      if (response.token) {
        localStorage.setItem("token", response.token)
      }
      return { success: true, user: response.user, token: response.token }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error de credenciales"
          : "Error desconocido",
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    return { success: true }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return { success: false, user: null }
    }
    try {
      const response = (await apiService.get("/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      })) as any
      return { success: true, user: response.user }
    } catch (error: unknown) {
      console.error("Error checking auth:", error)
      localStorage.removeItem("token")
      return { success: false, user: null }
    }
  },
  
  updateProfile: async (profileData: any) => {
    try {
      const response = (await apiService.put("/users/profile", profileData)) as any
      return { success: true, user: response.user }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar perfil"
          : "Error desconocido",
      }
    }
  },

  updatePassword: async (passwordData: any) => {
    try {
      const response = (await apiService.put("/users/password", passwordData)) as any
      return { success: true, message: response.message }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar contraseña"
          : "Error desconocido",
      }
    }
  },

  /* ========================== Endpoints de Productos ========================== */

  getProducts: async (params?: any) => {
    try {
      const response = (await apiService.get("/products", params)) as any
      return {
        success: response.status === "success", // Propagar el éxito del backend
        payload: response.payload, 
        totalPages: response.totalPages, 
        totalProducts: response.totalDocs, 
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener productos"
          : "Error desconocido",
        payload: [],
        totalPages: 0,
        totalProducts: 0,
      }
    }
  },


 getProductsCount: async () => {
    try {
      const response = (await apiService.get("/products/count")) as any
      return {
        success: true,
        count: response.count || 0,
      }
    } catch (error: unknown) {
      console.error("Error obteniendo conteo de productos:", error)
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener conteo de productos"
          : "Error desconocido",
        count: 0,
      }
    }
  },


  getAllProducts: async () => {
    try {
      const response = (await apiService.get("/products", { limit: "all" })) as any
      return {
        success: response.status === "success",
        payload: response.payload,
        totalProducts: response.totalDocs,
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener todos los productos"
          : "Error desconocido",
        payload: [],
        totalProducts: 0,
      }
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = (await apiService.get(`/products/${id}`)) as any
      return { success: true, product: response.product }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener producto"
          : "Error desconocido",
      }
    }
  },

  createProduct: async (productData: any) => {
    try {
      const response = (await apiService.post("/products", productData)) as any
      return { success: true, product: response.product }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al crear producto"
          : "Error desconocido",
      }
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const response = (await apiService.put(`/products/${id}`, productData)) as any
      return { success: true, product: response.product }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar producto"
          : "Error desconocido",
      }
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = (await apiService.del(`/products/${id}`)) as any
      return { success: true, message: response.message }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al eliminar producto"
          : "Error desconocido",
      }
    }
  },

  /* ========================== Endpoints de Orden ========================== */
  createOrder: async (orderData: any) => {
    try {
      const response = (await apiService.post("/orders", orderData)) as any
      return { success: true, order: response.order }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al crear orden"
          : "Error desconocido",
      }
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = (await apiService.get(`/orders/${id}`)) as any
      return { success: true, order: response.order }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener orden"
          : "Error desconocido",
      }
    }
  },

  getAllOrders: async (page = 1, limit = 10, status?: string) => {
    try {
      const params = { page, limit, ...(status && { status }) }
      const response = (await apiService.get("/orders", params)) as any
      return {
        success: true,
        orders: response.orders,
        totalOrders: response.totalOrders,
        totalPages: response.totalPages,
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener órdenes"
          : "Error desconocido",
        orders: [],
        totalOrders: 0,
        totalPages: 0,
      }
    }
  },

  updateOrderStatus: async (id: string, status: string, adminNotes: string) => {
    try {
      const response = (await apiService.put(`/orders/${id}/status`, { status, adminNotes })) as any
      return { success: true, order: response.order }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar estado de orden"
          : "Error desconocido",
      }
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const response = (await apiService.del(`/orders/${id}`)) as any
      return { success: true, message: response.message }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al eliminar orden"
          : "Error desconocido",
      }
    }
  },

  getOrdersSummary: async () => {
    try {
      const response = (await apiService.get("/orders/summary")) as any
      return { success: true, summary: response.summary }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener resumen de órdenes"
          : "Error desconocido",
      }
    }
  },
  

  getOrderByOrderNumber: async (orderNumber: string) => {
    try {
      const response = (await apiService.get(`/orders/by-number/${orderNumber}`)) as any
      return { success: true, order: response.order }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener orden por número"
          : "Error desconocido",
      }
    }
  },

  /* ========================== Endpoints de Contenido del Sitio ========================== */
  getSiteContent: async () => {
    try {
      const response = (await apiService.get("/content")) as any
      return { success: true, content: response.content }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener contenido del sitio"
          : "Error desconocido",
      }
    }
  },

  updateSiteContent: async (contentData: any) => {
    try {
      const response = (await apiService.put("/content", contentData)) as any
      return { success: true, content: response.content }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al actualizar contenido del sitio"
          : "Error desconocido",
      }
    }
  },

  /* ========================== Endpoints de Interaccion ========================== */
  createInteraction: async (type: string, data: any) => {
    try {
      const response = (await apiService.post("/interactions", { type, data })) as any
      return { success: true, interaction: response.interaction }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al registrar interacción"
          : "Error desconocido",
      }
    }
  },

  getInteractionsSummary: async () => {
    try {
      const response = (await apiService.get("/interactions/summary")) as any
      return { success: true, summary: response.summary }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener resumen de interacciones"
          : "Error desconocido",
      }
    }
  },

  getMostViewedProducts: async (limit: number) => {
    try {
      const response = (await apiService.get("/interactions/most-viewed-products", { limit })) as any
      return { success: true, products: response.products }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener productos más vistos"
          : "Error desconocido",
        products: [],
      }
    }
  },

  getMostViewedCategories: async (limit: number) => {
    try {
      const response = (await apiService.get("/interactions/most-viewed-categories", { limit })) as any
      return { success: true, categories: response.categories }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al obtener categorías más vistas"
          : "Error desconocido",
        categories: [],
      }
    }
  },

  /* ====================== Endpoints de Fotos de Transferencias  ====================== */
  uploadTransferProof: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await axios.post(`${API_BASE_URL}/upload/proof`, formData, {
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

  /* ========================== Endpoints de Contacto ========================== */
  sendContactForm: async (formData: any) => {
    try {
      const response = (await apiService.post("/contact", formData)) as any
      return { success: true, message: response.message }
    } catch (error: unknown) {
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Error al enviar formulario de contacto"
          : "Error desconocido",
      }
    }
  },


  /* ========================== Endpoints de Health ========================== */
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
