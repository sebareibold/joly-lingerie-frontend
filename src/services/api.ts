// Este archivo se comporta como un manager de la API, de tal manera que únicamente los subsistemas del front se comunican con él.
import axios from "axios"

// Asegúrate de que esta URL coincida con el puerto donde tu backend está escuchando
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para enviar cookies (ej. tokens JWT)
})

// Interceptor para añadir el token de autorización si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta (ej. 401 Unauthorized)
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000 // Aumentado a 3 segundos
const RATE_LIMIT_DELAY_MS = 5000 // 5 segundos para rate limit

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401) {
      // Redirigir al login si el token expira o es inválido
      localStorage.removeItem("admin_token")
      window.location.href = "/admin/login"
      return Promise.reject(error)
    }

    // Manejar 429 Too Many Requests con delay más largo
    if (error.response && error.response.status === 429) {
      originalRequest._retryCount = originalRequest._retryCount || 0

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount++
        console.warn(
          `Rate limit exceeded (429). Retrying request ${originalRequest.url} (attempt ${originalRequest._retryCount}/${MAX_RETRIES})...`,
        )

        // Delay más largo para rate limiting
        const delay = RATE_LIMIT_DELAY_MS * Math.pow(2, originalRequest._retryCount - 1) // Backoff exponencial
        await new Promise((resolve) => setTimeout(resolve, delay))
        return api(originalRequest)
      } else {
        console.error(`Max retries reached for request ${originalRequest.url}.`)
        // Mostrar mensaje al usuario
        if (typeof window !== "undefined") {
          console.warn("Demasiadas solicitudes. Por favor, espera un momento antes de continuar.")
        }
      }
    }

    return Promise.reject(error)
  },
)

interface SiteContent {
  hero: {
    mainDescription: string
    slogan: string
    buttonText: string
    buttonLink: string
  }
  productCatalog: {
    mainTitle: string
    subtitle: string
    categories: any[] // Declared as any[] for now, replace with actual type if available
  }
  whyChooseJoly: {
    mainTitle: string
    description: string
    values: any[] // Declared as any[] for now, replace with actual type if available
  }
  contact: {
    mainTitle: string
    subtitle: string
    description: string
    formTitle: string
    formDescription: string
    responseMessage: string
    responseDisclaimer: string
    // NUEVOS CAMPOS DE CONTACTO
    contactInfo: {
      icon: string
      title: string
      details: string[]
      description?: string
    }[]
    socialMedia: {
      icon: string
      name: string
      handle: string
      link: string
    }[]
  }
}

class ApiService {
  API_BASE_URL = API_URL
  TOKEN_KEY = "admin_token"
  MAX_PAGE_SIZE = 100
  LOW_STOCK_THRESHOLD = 10

  // Cache para almacenar respuestas y reducir solicitudes
  private cache: Record<string, { data: any; timestamp: number }> = {}
  private CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos

  // Cache variables
  private productsCache: any = null
  private productsCacheTimestamp = 0
  private siteContentCache: any = null
  private siteContentCacheTimestamp = 0
  private ordersCache: any = null
  private ordersCacheTimestamp = 0

  // Cache durations
  private PRODUCTS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private SITE_CONTENT_CACHE_DURATION = 60 * 60 * 1000 // 60 minutes
  private ORDERS_CACHE_DURATION = 60 * 1000 // 1 minute

  // Enhanced cache management with route-based prefetching
  private routeDataCache: Map<string, { data: any; timestamp: number; loading: boolean }> = new Map()
  private readonly ROUTE_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

  // Sistema de throttling
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private readonly REQUEST_INTERVAL = 1000 // 1 segundo entre peticiones

  // Método para procesar cola de peticiones
  private async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
          console.error("Error processing queued request:", error)
        }
        // Esperar antes de la siguiente petición
        await new Promise((resolve) => setTimeout(resolve, this.REQUEST_INTERVAL))
      }
    }

    this.isProcessingQueue = false
  }

  // Método para añadir petición a la cola
  private queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processRequestQueue()
    })
  }

  // Método para verificar si hay una respuesta en caché
  private getCachedResponse(cacheKey: string): any | null {
    const cachedItem = this.cache[cacheKey]
    if (cachedItem && Date.now() - cachedItem.timestamp < this.CACHE_DURATION) {
      console.log(`Usando respuesta en caché para: ${cacheKey}`)
      return cachedItem
    }
    return null
  }

  // Método para guardar una respuesta en caché
  private setCachedResponse(cacheKey: string, data: any): void {
    this.cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    }
    console.log(`Respuesta guardada en caché: ${cacheKey}`)
  }

  // Método para generar una clave de caché basada en la URL y parámetros
  private generateCacheKey(url: string, method = "GET", body?: any): string {
    let key = `${method}:${url}`
    if (body && method !== "GET") {
      key += `:${JSON.stringify(body)}`
    }
    return key
  }

  // Method to clear orders cache specifically
  public clearOrdersCache(): void {
    this.ordersCache = null
    this.ordersCacheTimestamp = 0
    console.log("🗑️ Orders cache cleared")
  }

  // Enhanced cache clearing that preserves prefetched data briefly
  clearCache(): void {
    this.cache = {}
    this.siteContentCache = null
    this.productsCache = null
    this.ordersCache = null
    this.siteContentCacheTimestamp = 0
    this.productsCacheTimestamp = 0
    this.ordersCacheTimestamp = 0
    // Don't clear route cache immediately - let it expire naturally
    console.log("🗑️ API cache cleared (route cache preserved)")
  }

  // Método para limpiar caché específico de productos
  public clearProductsCache(): void {
    const keysToDelete = Object.keys(this.cache).filter((key) => key.includes("/products"))
    keysToDelete.forEach((key) => delete this.cache[key])
    console.log(`Caché de productos limpiada: ${keysToDelete.length} entradas eliminadas`)
  }

  // Prefetch data for admin routes
  async prefetchRouteData(route: string): Promise<void> {
    const cacheKey = `route_${route}`
    const cached = this.routeDataCache.get(cacheKey)

    // Don't prefetch if already loading or recently cached
    if (cached && (cached.loading || Date.now() - cached.timestamp < this.ROUTE_CACHE_DURATION)) {
      return
    }

    // Mark as loading
    this.routeDataCache.set(cacheKey, { data: null, timestamp: Date.now(), loading: true })

    try {
      let data: any = {}

      switch (route) {
        case "/admin":
        case "/admin/dashboard":
          // Prefetch dashboard data
          const [productsRes, ordersRes, interactionsRes] = await Promise.allSettled([
            this.getProducts({ limit: 5 }),
            this.getAllOrders(1, 5),
            this.getInteractionsSummary(),
          ])

          data = {
            products: productsRes.status === "fulfilled" ? productsRes.value : null,
            orders: ordersRes.status === "fulfilled" ? ordersRes.value : null,
            interactions: interactionsRes.status === "fulfilled" ? interactionsRes.value : null,
          }
          break

        case "/admin/products":
          // Prefetch products data
          data = await this.getProducts({ page: 1, limit: 10 })
          break

        case "/admin/orders":
          // Prefetch orders data
          data = await this.getAllOrders(1, 20)
          break

        case "/admin/content":
          // Prefetch site content
          data = await this.getSiteContent()
          break
      }

      // Cache the prefetched data
      this.routeDataCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        loading: false,
      })

      console.log(`✅ Prefetched data for route: ${route}`)
    } catch (error) {
      console.error(`❌ Failed to prefetch data for route ${route}:`, error)
      // Remove loading state on error
      this.routeDataCache.delete(cacheKey)
    }
  }

  // Método para hacer peticiones con delay para evitar rate limiting
  private async makeRequestWithDelay(requestFn: () => Promise<any>, delay = 2000): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, delay))
    return requestFn()
  }

  // Get prefetched route data
  getPrefetchedRouteData(route: string): any | null {
    const cacheKey = `route_${route}`
    const cached = this.routeDataCache.get(cacheKey)

    if (cached && !cached.loading && Date.now() - cached.timestamp < this.ROUTE_CACHE_DURATION) {
      console.log(`📦 Using prefetched data for route: ${route}`)
      return cached.data
    }

    return null
  }

  // Clear route cache
  clearRouteCache(): void {
    this.routeDataCache.clear()
    console.log("🗑️ Route cache cleared")
  }

  /* ============================== PETICIONES AL SERVIDOR BACKEND ==============================*/

  // Auth
  async login(email: string, password: string) {
    try {
      console.log("API Service - Intentando iniciar sesión con email:", email)

      // CAMBIO AQUÍ: Cambiado de "/auth/admin/login" a "/auth/login"
      const response = await api.post("/auth/login", { email, password })
      if (response.data.token) {
        localStorage.setItem("admin_token", response.data.token)
      }
      return response.data
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      throw error
    }
  }

  async logout() {
    try {
      localStorage.removeItem("admin_token")
      // Opcional: llamar a un endpoint de logout en el backend si hay invalidación de sesión
      // await api.post('/auth/admin/logout');
    } catch (error) {
      console.error("Error de cierre de sesión:", error)
      throw error
    }
  }

  async checkAuth() {
    try {
      const response = await api.get("/auth/admin/check")
      return response.data.isAuthenticated
    } catch (error) {
      return false
    }
  }

  // Products
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    searchTerm?: string
    status?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) {
    try {
      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.append("page", params.page.toString())
      if (params?.limit) searchParams.append("limit", params.limit.toString())
      if (params?.category) searchParams.append("category", params.category)
      if (params?.searchTerm) searchParams.append("search", params.searchTerm)
      if (params?.status !== undefined) searchParams.append("status", params.status.toString())
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)

      const url = `/products?${searchParams.toString()}`
      const cacheKey = this.generateCacheKey(url)

      console.log("API Service - Solicitando productos:", url)

      // Verificar si hay una respuesta en caché
      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        console.log("API Service - Usando datos en caché para productos")
        return cachedResponse.data
      }

      const response = await api.get(url)
      const data = response.data

      console.log("API Service - Respuesta de productos recibida:", {
        status: response.status,
        dataKeys: Object.keys(data),
        hasPayload: !!data.payload,
        payloadLength: data.payload?.length || 0,
      })

      // Guardar la respuesta en caché
      this.setCachedResponse(cacheKey, data)

      return data
    } catch (error) {
      console.error("Error al obtener productos:", error)

      // Proporcionar información más detallada del error
      if (axios.isAxiosError(error)) {
        console.error("Error de Axios:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })

        // Manejar diferentes tipos de errores
        if (error.response?.status === 500) {
          throw new Error("Error interno del servidor. Intente nuevamente.")
        } else if (error.response?.status === 404) {
          throw new Error("Recurso no encontrado.")
        } else if (error.code === "NETWORK_ERROR") {
          throw new Error("Error de conexión. Verifique su conexión a internet.")
        }
      }

      throw error
    }
  }

  async getProduct(id: string) {
    try {
      const url = `/products/${id}`
      const cacheKey = this.generateCacheKey(url)

      // Verificar si hay una respuesta en caché
      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        return cachedResponse.data
      }

      const response = await api.get(url)
      const data = response.data

      this.setCachedResponse(cacheKey, data)
      return data
    } catch (error) {
      console.error("Error al obtener producto:", error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return { success: false, error: "Producto no encontrado" }
        } else if (error.response?.status === 400) {
          return { success: false, error: "ID de producto inválido" }
        }
      }

      throw error
    }
  }

  async createProduct(productData: {
    title: string
    description: string
    price: number
    category: string
    stock: number
    size: string[] // Cambiado a array para múltiples tallas
    status: boolean
    thumbnails: string[]
    discount?: number // NUEVO: Añadir descuento
  }) {
    try {
      console.log("API Service - Creando producto con datos:", productData)

      const url = "/products"
      const response = await api.post(url, productData)

      console.log("API Service - Respuesta de creación:", response.status, response.statusText)

      // Limpiar caché después de una operación de escritura
      this.clearCache()

      return response.data
    } catch (error) {
      console.error("Error al crear producto:", error)
      throw error
    }
  }

  // MODIFICADO: Ahora acepta un objeto `productData` completo para la actualización
  async updateProduct(
    id: string,
    productData: {
      title?: string
      description?: string
      price?: number
      category?: string
      stock?: number
      size?: string[]
      status?: boolean
      thumbnails?: string[]
      discount?: number // NUEVO: Añadir descuento
    },
  ) {
    try {
      console.log(`API Service - Actualizando producto ${id} con datos:`, productData)

      const url = `/products/${id}`
      const response = await api.put(url, productData) // Enviar el objeto completo

      this.clearCache()
      return response.data
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      throw error
    }
  }

  async deleteProduct(id: string) {
    try {
      console.log(`API Service - Eliminando producto ${id}`)

      // Verificar si el producto existe primero
      const existingProduct = await this.getProduct(id)
      if (!existingProduct || !existingProduct.success) {
        throw new Error("El producto no existe o no se puede eliminar")
      }

      const url = `/products/${id}`
      const response = await api.delete(url)

      console.log(`API Service - Producto ${id} eliminado exitosamente`)

      // Limpiar cache después de eliminar
      this.clearCache()
      this.clearProductsCache()

      return response.data
    } catch (error) {
      console.error("Error al eliminar producto:", error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("El producto no existe")
        } else if (error.response?.status === 409) {
          throw new Error("No se puede eliminar el producto porque está asociado a órdenes activas")
        } else if (error.response?.status === 403) {
          throw new Error("No tienes permisos para eliminar este producto")
        }

        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error desconocido"
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error("Error de conexión al eliminar el producto")
    }
  }

  async getMostViewedProducts(limit = 5) {
    try {
      // CORRECCIÓN AQUÍ: Cambiado a la URL correcta para interacciones
      const url = `/interactions/most-viewed-products?limit=${limit}`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error al obtener productos más vistos:", error)
      throw error
    }
  }

  // Orders API
  async getAllOrders(page = 1, limit = 20, status?: string) {
    const now = Date.now()
    const cacheKey = `orders_${page}_${limit}_${status || "all"}`

    // Check cache but with shorter duration for orders
    if (this.ordersCache && now - this.ordersCacheTimestamp < this.ORDERS_CACHE_DURATION) {
      console.log("📦 Serving orders from cache:", cacheKey)
      return this.ordersCache
    }

    try {
      const searchParams = new URLSearchParams()
      searchParams.append("page", page.toString())
      searchParams.append("limit", limit.toString())
      if (status) searchParams.append("status", status)

      const url = `/orders?${searchParams.toString()}`
      console.log("🌐 Fetching orders from API:", url)

      const response = await api.get(url)

      if (!response.data) {
        throw new Error("No data received from server")
      }

      const data = response.data
      console.log("✅ Orders API response:", {
        status: response.status,
        ordersCount: data.orders?.length || 0,
        totalOrders: data.totalOrders || 0,
        hasOrders: Array.isArray(data.orders),
      })

      // Validate response structure
      if (!data.orders || !Array.isArray(data.orders)) {
        console.warn("⚠️ Invalid orders structure, creating empty array")
        data.orders = []
      }

      // Cache the response
      this.ordersCache = data
      this.ordersCacheTimestamp = now
      console.log("💾 Orders cached successfully")

      return data
    } catch (error) {
      console.error("❌ Error fetching orders:", error)

      // Provide more detailed error information
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        })

        // Return a more specific error message
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error(`Error de red: ${error.message}`)
    }
  }

  async getOrder(orderId: string) {
    try {
      const url = `/orders/${orderId}`
      const cacheKey = this.generateCacheKey(url)

      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }

      const response = await api.get(url)
      const data = response.data

      this.setCachedResponse(cacheKey, data)
      return data
    } catch (error) {
      console.error("Error al obtener orden:", error)
      throw error
    }
  }

  // Nuevo método para obtener orden por número de orden
  async getOrderByOrderNumber(orderNumber: string) {
    try {
      const url = `/orders/by-number/${orderNumber}`
      const cacheKey = this.generateCacheKey(url)

      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }

      const response = await api.get(url)
      const data = response.data

      this.setCachedResponse(cacheKey, data)
      return data
    } catch (error) {
      console.error("Error al obtener orden por número:", error)
      // Lanzar el error para que el componente pueda manejarlo
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || "Error desconocido")
      }
      throw new Error("Error de red o servidor")
    }
  }

  async updateOrderStatus(orderId: string, status: string, adminNotes = "") {
    try {
      console.log(`🔄 API Service - Actualizando estado de orden ${orderId} a ${status}`)

      const url = `/orders/${orderId}/status`
      const response = await api.put(url, { status, adminNotes })

      // Clear orders cache after updating
      this.clearOrdersCache()
      console.log(`✅ API Service - Estado de orden actualizado exitosamente`)

      return response.data
    } catch (error) {
      console.error("❌ API Service - Error al actualizar estado de orden:", error)

      // Provide more detailed error information
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw error
    }
  }

  async deleteOrder(orderId: string) {
    try {
      console.log(`🗑️ API Service - Eliminando orden ${orderId}`)

      const url = `/orders/${orderId}`
      const response = await api.delete(url)

      // Clear orders cache after deletion
      this.clearOrdersCache()
      console.log(`✅ API Service - Orden eliminada exitosamente`)

      return response.data
    } catch (error) {
      console.error("❌ API Service - Error al eliminar orden:", error)

      // Provide more detailed error information
      if (axios.isAxiosError(error)) {
        console.error("Delete order error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        })

        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error(`Error de red: ${error.message}`)
    }
  }

  // NUEVO: Método para subir comprobante de transferencia a Vercel Blob
  async uploadTransferProof(file: File) {
    try {
      console.log("📤 API Service - Subiendo comprobante de transferencia:", {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        type: file.type,
      })

      // Validaciones previas
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Tipo de archivo no válido. Solo se aceptan JPG, PNG y WEBP.")
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande. Máximo 5MB permitido.")
      }

      const formData = new FormData()
      formData.append("file", file) // CORREGIDO: usar "file" en lugar de "transferProof"

      const url = "/upload/proof" // CORREGIDO: endpoint correcto

      console.log("🌐 Enviando archivo a:", `${this.API_BASE_URL}${url}`)

      // Crear una promesa con timeout personalizado
      const uploadPromise = api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 segundos timeout
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`📊 Upload progress: ${percentCompleted}%`)
          }
        },
      })

      const response = await uploadPromise

      console.log("✅ API Service - Comprobante subido exitosamente:", {
        url: response.data.url,
        filename: response.data.filename,
        size: response.data.size,
      })

      return {
        success: true,
        url: response.data.url,
        filename: response.data.filename,
        size: response.data.size,
      }
    } catch (error) {
      console.error("❌ API Service - Error subiendo comprobante:", error)

      let errorMessage = "Error desconocido al subir el comprobante"

      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        })

        if (error.code === "ECONNABORTED") {
          errorMessage = "Tiempo de espera agotado. El archivo puede ser muy grande o la conexión lenta."
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.error || "Archivo inválido o demasiado grande."
        } else if (error.response?.status === 413) {
          errorMessage = "El archivo es demasiado grande. Máximo 5MB permitido."
        } else if (error.response?.status === 415) {
          errorMessage = "Tipo de archivo no soportado. Solo se aceptan imágenes JPG, PNG y WEBP."
        } else if (error.response?.status >= 500) {
          errorMessage = "Error del servidor. Por favor intenta nuevamente."
        } else if (error.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        } else {
          errorMessage = error.response?.data?.error || error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  async createOrder(orderData: any) {
    try {
      console.log("📝 API Service - Creando orden con datos:", {
        itemsCount: orderData.items?.length,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        hasTransferProof: !!orderData.transferProofUrl,
      })

      const url = "/orders"
      const response = await api.post(url, orderData, {
        timeout: 15000, // 15 segundos timeout para crear orden
      })

      console.log("✅ API Service - Orden creada exitosamente:", {
        orderNumber: response.data.order?.orderNumber,
        status: response.data.order?.status,
      })

      // Limpiar caché después de crear orden
      this.clearOrdersCache()
      this.clearCache()

      return response.data
    } catch (error) {
      console.error("❌ API Service - Error creando orden:", error)

      let errorMessage = "Error procesando tu orden. Por favor intenta nuevamente."

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage = "Tiempo de espera agotado. Por favor intenta nuevamente."
        } else if (error.response?.status === 400) {
          errorMessage = "Datos de orden inválidos. Verifica la información e intenta nuevamente."
        } else if (error.response?.status >= 500) {
          errorMessage = "Error interno del servidor. Por favor intenta más tarde."
        } else {
          errorMessage = error.response?.data?.error || error.message
        }
      }

      throw new Error(errorMessage)
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await api.get("/health")
      return response.status === 200 && response.data.status === "online"
    } catch (error) {
      console.error("Error en health check:", error)
      return false
    }
  }

  // Orders Summary - MODIFICADO para incluir desglose por método de pago
  async getOrdersSummary() {
    try {
      const url = "/orders/summary"
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error fetching orders summary:", error)
      throw error
    }
  }

  // NEW: Method to create interactions
  async createInteraction(type: string, data: any, userId?: string, sessionId?: string, ipAddress?: string) {
    try {
      const url = "/interactions"
      const response = await api.post(url, { type, data, userId, sessionId, ipAddress })
      this.clearCache()
      return response.data
    } catch (error) {
      console.error("Error creating interaction:", error)
      // Don't throw, just log, as interaction tracking shouldn't block user flow
      return { success: false, error: "Error creating interaction" }
    }
  }

  // NEW: Method to get most viewed categories
  async getMostViewedCategories(limit = 5) {
    try {
      const url = `/interactions/most-viewed-categories?limit=${limit}`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error al obtener categorías más visitadas:", error)
      throw error
    }
  }

  // NUEVO: Métodos para la gestión de contenido del sitio
  async getSiteContent() {
    try {
      const now = Date.now()

      // Check cache with shorter duration for content
      if (this.siteContentCache && now - this.siteContentCacheTimestamp < this.SITE_CONTENT_CACHE_DURATION) {
        console.log("📦 Serving site content from cache")
        return this.siteContentCache
      }

      console.log("🌐 Fetching site content from API")
      const url = "/content"
      const response = await api.get(url)

      if (!response.data) {
        throw new Error("No data received from server")
      }

      const data = response.data
      console.log("✅ Site content API response:", {
        status: response.status,
        hasContent: !!data.content,
        contentKeys: data.content ? Object.keys(data.content) : [],
      })

      // Validate response structure
      if (!data.content) {
        console.warn("⚠️ Invalid content structure received")
        throw new Error("Estructura de contenido inválida")
      }

      // Cache the response
      this.siteContentCache = data
      this.siteContentCacheTimestamp = now
      console.log("💾 Site content cached successfully")

      return data
    } catch (error) {
      console.error("❌ Error fetching site content:", error)

      if (axios.isAxiosError(error)) {
        console.error("Site content error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        })

        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error(`Error de red: ${error.message}`)
    }
  }

  // Method to clear site content cache specifically
  public clearSiteContentCache(): void {
    this.siteContentCache = null
    this.siteContentCacheTimestamp = 0
    console.log("🗑️ Site content cache cleared")
  }

  async updateSiteContent(contentData: any) {
    try {
      console.log("API Service - Actualizando contenido del sitio:", contentData)
      const url = "/content"
      const response = await api.put(url, contentData)

      // Clear specific caches after updating - MEJORADO
      this.clearSiteContentCache()
      this.clearRouteCache()
      this.clearCache() // Limpiar todo el caché para asegurar consistencia

      console.log("✅ Contenido actualizado y caché limpiado")
      return response.data
    } catch (error) {
      console.error("Error al actualizar el contenido del sitio:", error)
      throw error
    }
  }

  // Añadir este nuevo método después del método updateSiteContent:
  async forceRefreshSiteContent() {
    try {
      console.log("🔄 Forzando recarga del contenido del sitio...")
      this.clearSiteContentCache()
      this.clearCache()
      return await this.getSiteContent()
    } catch (error) {
      console.error("Error al forzar recarga del contenido:", error)
      throw error
    }
  }

  // NUEVO: Método para enviar el formulario de contacto desde el frontend
  async sendContactForm(formData: { name: string; email: string; phone: string; subject: string; message: string }) {
    try {
      console.log("API Service - Enviando formulario de contacto con datos:", formData)
      const url = "/contact" // Esta es la ruta de tu backend para el formulario de contacto
      const response = await api.post(url, formData)
      return response.data
    } catch (error) {
      console.error("Error al enviar formulario de contacto:", error)
      // Re-lanzar el error para que el componente que llama pueda manejarlo
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || "Error desconocido al enviar el formulario")
      }
      throw new Error("Error de red o servidor al enviar el formulario de contacto")
    }
  }

  // NEW: Method to get interactions summary (fixed method name)
  async getInteractionsSummary() {
    try {
      const url = "/interactions/summary"
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error fetching interactions summary:", error)
      // Return default structure instead of throwing
      return {
        success: true,
        summary: {
          totalInteractions: 0,
          recentInteractions: [],
          byType: [],
          uniqueSessions: 0,
          byDay: [],
        },
      }
    }
  }

  // ============================== VIDEO GENERATION API ==============================

  /**
   * Genera un video automáticamente basado en la configuración
   */
  async generateVideo(config: {
    videoType: "campaign" | "slideshow"
    style: "dynamic" | "elegant" | "modern" | "romantic"
    productSelection?: {
      type: "category" | "featured" | "catalog" | "promotional"
      categoryId?: string
      productIds?: string[]
    }
    promotionalPhrases?: string
    callToActionText?: string
    introVideo?: string
    outroVideo?: string
    musicType?: "predetermined" | "upload"
    musicTrack?: string
    customText?: string
  }) {
    try {
      console.log("🎬 API Service - Generando video con configuración:", config)

      const url = "/videos/generate"
      const response = await api.post(url, config)

      console.log("✅ API Service - Video generado exitosamente")
      return response.data
    } catch (error) {
      console.error("❌ API Service - Error generando video:", error)

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error(`Error de red: ${error.message}`)
    }
  }

  /**
   * Obtiene las plantillas disponibles para videos
   */
  async getVideoTemplates() {
    try {
      const url = "/videos/templates"
      const cacheKey = this.generateCacheKey(url)

      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        return cachedResponse.data
      }

      const response = await api.get(url)
      const data = response.data

      this.setCachedResponse(cacheKey, data)
      return data
    } catch (error) {
      console.error("Error obteniendo plantillas de video:", error)
      throw error
    }
  }

  /**
   * Obtiene el historial de videos generados
   */
  async getVideoHistory(limit = 20) {
    try {
      const url = `/videos/history?limit=${limit}`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error obteniendo historial de videos:", error)
      throw error
    }
  }

  /**
   * Elimina un video generado
   */
  async deleteVideo(filename: string) {
    try {
      console.log(`🗑️ API Service - Eliminando video: ${filename}`)

      const url = `/videos/${filename}`
      const response = await api.delete(url)

      console.log("✅ API Service - Video eliminado exitosamente")
      return response.data
    } catch (error) {
      console.error("❌ API Service - Error eliminando video:", error)

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
        throw new Error(`Error del servidor: ${errorMessage}`)
      }

      throw new Error(`Error de red: ${error.message}`)
    }
  }

  /**
   * Obtiene estadísticas de videos generados
   */
  async getVideoStats() {
    try {
      const url = "/videos/stats"
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error obteniendo estadísticas de videos:", error)
      throw error
    }
  }
}

// Exportar directamente la instancia de ApiService
export const apiService = new ApiService()
