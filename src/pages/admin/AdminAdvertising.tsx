"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  Tag,
  ShoppingBag,
  Package,
  Instagram,
  MessageCircle,
  AlertCircle,
  Zap,
  Type,
  DollarSign,
  Download,
  Share2,
} from "lucide-react"
import { apiService } from "../../services/api"

interface VideoConfig {
  selectionType: "all" | "category" | "discount"
  categoryId?: string
  maxProducts: number
  showProductName: boolean
  showProductPrice: boolean
  productDuration: number // segundos por producto
  animationType: "fade" | "zoom" | "slide" | "rotate" // Nueva opción de animación
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  category: string
  size: string[]
  stock: number
  status: boolean
  thumbnails: string[]
  discount?: number
  featured?: boolean
}

interface GeneratedVideo {
  videoBlob: Blob
  videoUrl: string
  videoId: string
  products: Product[]
  config: VideoConfig
  duration: number
  size: number
}

const AdminAdvertising: React.FC = () => {
  // Estados principales
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle")
  const [generationMessage, setGenerationMessage] = useState<string>("")
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  // Estados de textos personalizables
  const [customTexts, setCustomTexts] = useState({
    brandName: "Joly Lingerie",
    introSubtitle: "Nuestra Colección",
    introDescription: "productos exclusivos y elegantes",
    outroMessage: "Gracias por tu preferencia",
    outroCallToAction: "Visítanos en nuestra tienda",
  })

  // Configuración
  const [config, setConfig] = useState<VideoConfig>({
    selectionType: "all",
    maxProducts: 8,
    showProductName: true,
    showProductPrice: true,
    productDuration: 6,
    animationType: "zoom", // Animación por defecto
  })

  // Referencias para Canvas y Video
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Limpiar URLs de video al desmontar
  useEffect(() => {
    return () => {
      if (generatedVideo?.videoUrl) {
        URL.revokeObjectURL(generatedVideo.videoUrl)
      }
    }
  }, [generatedVideo])

  // Función para verificar el estado del backend
  const checkBackendStatus = async () => {
    try {
      setBackendStatus("checking")
      const response = await apiService.healthCheck()
      if (response) {
        setBackendStatus("online")
        return true
      } else {
        setBackendStatus("offline")
        return false
      }
    } catch (error: unknown) {
      console.error("❌ Error conectando con backend:", error)
      setBackendStatus("offline")
      return false
    }
  }

  const loadInitialData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔄 Cargando datos del backend...")

      const backendOnline = await checkBackendStatus()
      if (!backendOnline) {
        throw new Error("Backend no disponible. Verifica que el servidor esté corriendo.")
      }

      const productsResponse = await apiService.getProducts({
        limit: 100,
        status: true,
      })
      console.log("📦 Respuesta de productos:", productsResponse)

      if (productsResponse.success && productsResponse.payload) {
        setProducts(productsResponse.payload)

        const uniqueCategories = [
          ...new Set(productsResponse.payload.map((product: Product) => product.category).filter(Boolean)),
        ] as string[]
        setCategories(uniqueCategories)
        console.log("📂 Categorías encontradas:", uniqueCategories)
      } else {
        throw new Error("No se pudieron cargar los productos")
      }

      console.log("✅ Datos cargados exitosamente")
    } catch (error: unknown) {
      console.error("❌ Error cargando datos:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener productos filtrados
  const getFilteredProducts = (): Product[] => {
    let filtered = products

    switch (config.selectionType) {
      case "category":
        if (config.categoryId) {
          filtered = products.filter((p) => p.category === config.categoryId)
        }
        break
      case "discount":
        filtered = products.filter((p) => p.discount && p.discount > 0)
        break
      case "all":
      default:
        filtered = products.filter((p) => p.status === true)
        break
    }

    return filtered.slice(0, config.maxProducts)
  }

  // Función para cargar imagen con mejor manejo de CORS
  const loadImage = (src: string, product: Product): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        console.log(`✅ Imagen cargada: ${product.title}`)
        resolve(img)
      }

      img.onerror = () => {
        console.warn(`⚠️ Error cargando imagen para ${product.title}, creando placeholder`)

        // Crear imagen placeholder con canvas
        const canvas = document.createElement("canvas")
        canvas.width = 400
        canvas.height = 400
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Fondo degradado elegante
          const gradient = ctx.createLinearGradient(0, 0, 400, 400)
          gradient.addColorStop(0, "#F5F2ED")
          gradient.addColorStop(1, "#E5E0D8")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 400, 400)

          // Borde sutil
          ctx.strokeStyle = "#D1C7BD"
          ctx.lineWidth = 2
          ctx.strokeRect(1, 1, 398, 398)

          // Texto del producto
          ctx.fillStyle = "#7A5C4A"
          ctx.font = "bold 24px Arial"
          ctx.textAlign = "center"
          ctx.fillText(product.title.substring(0, 20), 200, 180)

          // Ícono de imagen
          ctx.font = "60px Arial"
          ctx.fillText("🖼️", 200, 240)

          // Precio si está disponible
          if (product.price) {
            ctx.font = "18px Arial"
            ctx.fillStyle = "#999999"
            ctx.fillText(`$${product.price.toFixed(2)}`, 200, 280)
          }

          // Convertir canvas a imagen
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const placeholderImg = new Image()
              placeholderImg.onload = () => {
                URL.revokeObjectURL(url)
                resolve(placeholderImg)
              }
              placeholderImg.onerror = () => {
                reject(new Error("No se pudo crear imagen placeholder"))
              }
              placeholderImg.src = url
            } else {
              reject(new Error("No se pudo crear blob del placeholder"))
            }
          }, "image/png")
        } else {
          reject(new Error("No se pudo crear contexto de canvas"))
        }
      }

      // Intentar cargar la imagen original
      img.src = src
    })
  }

  // Función para obtener URL de imagen con fallback
  const getProxiedImageUrl = (originalUrl: string) => {
    if (!originalUrl) {
      return "/placeholder.svg?height=400&width=400"
    }

    // Si la URL ya es absoluta (http/https), usarla directamente
    if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
      return originalUrl
    }

    // Si es una URL relativa que empieza con /, construir URL completa
    if (originalUrl.startsWith("/")) {
      return `${window.location.origin}${originalUrl}`
    }

    // Si no tiene protocolo, asumir que es una URL relativa
    return originalUrl.startsWith("./") ? originalUrl : `./${originalUrl}`
  }

  // Función para obtener el codec de video soportado por el navegador
  const getSupportedVideoCodec = (): string => {
    const mp4Codecs = ["video/mp4;codecs=h264", "video/mp4;codecs=avc1.42E01E", "video/mp4"]
    for (const codec of mp4Codecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        console.log(`✅ Codec MP4 soportado para grabación: ${codec}`)
        return codec
      }
    }

    const webmCodecs = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
    for (const codec of webmCodecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        console.warn(`⚠️ No se encontró codec MP4. Usando fallback WebM: ${codec}`)
        return codec
      }
    }

    console.error("❌ Ningún codec de video soportado por MediaRecorder.")
    return "video/mp4" // Fallback a MP4, pero podría fallar
  }

  // Función de easing para animaciones más suaves
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const easeOutElastic = (t: number): number => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }

  const renderProductOnCanvas = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    product: Product,
    image: HTMLImageElement,
    animationProgress = 1,
    animationType = "zoom",
  ) => {
    const { width, height } = canvas

    // Aplicar diferentes tipos de animación con easing
    let imageScale = 1
    let imageOpacity = 1
    let imageRotation = 0
    const imageOffsetX = 0
    let imageOffsetY = 0
    let textOffsetY = 0
    let textOpacity = 1

    const easedProgress = easeInOutCubic(animationProgress)

    switch (animationType) {
      case "fade":
        imageOpacity = easedProgress
        textOpacity = easedProgress
        break

      case "zoom":
        imageScale = 0.3 + easedProgress * 0.7 // De 30% a 100%
        imageOpacity = easedProgress
        textOpacity = Math.max(0, easedProgress - 0.3) / 0.7 // Texto aparece después
        break

      case "slide":
        imageOffsetY = (1 - easedProgress) * height * 0.5 // Desliza desde abajo
        textOffsetY = (1 - easedProgress) * 100
        imageOpacity = easedProgress
        textOpacity = easedProgress
        break

      case "rotate":
        imageRotation = (1 - easeOutElastic(animationProgress)) * Math.PI * 2 // Rotación con elastic
        imageScale = 0.5 + easedProgress * 0.5
        imageOpacity = easedProgress
        textOpacity = Math.max(0, easedProgress - 0.4) / 0.6
        break
    }

    // Fondo beige claro / blanco hueso
    ctx.fillStyle = "#F5F2ED"
    ctx.fillRect(0, 0, width, height)

    // Función para dibujar siluetas florales grandes y sutiles
    const drawFloralSilhouette = (x: number, y: number, size: number, opacity: number, rotation = 0) => {
      ctx.save()
      ctx.globalAlpha = opacity * imageOpacity * 0.25
      ctx.translate(x, y)
      ctx.rotate(rotation)

      // Color gris claro para las siluetas
      ctx.fillStyle = "#D1C7BD"

      // Dibujar flor estilizada grande
      for (let i = 0; i < 8; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI * 2) / 8)

        // Pétalo elegante
        ctx.beginPath()
        ctx.moveTo(0, -size * 1.4)
        ctx.quadraticCurveTo(size * 0.6, -size * 1.1, size * 0.8, -size * 0.4)
        ctx.quadraticCurveTo(size * 0.9, size * 0.1, size * 0.5, size * 0.7)
        ctx.quadraticCurveTo(size * 0.2, size * 0.9, 0, size * 0.5)
        ctx.quadraticCurveTo(-size * 0.2, size * 0.9, -size * 0.5, size * 0.7)
        ctx.quadraticCurveTo(-size * 0.9, size * 0.1, -size * 0.8, -size * 0.4)
        ctx.quadraticCurveTo(-size * 0.6, -size * 1.1, 0, -size * 1.4)
        ctx.fill()

        ctx.restore()
      }

      // Centro de la flor
      ctx.fillStyle = "#C4B8A9"
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Siluetas florales en las esquinas
    drawFloralSilhouette(120, 180, 45, 1, 0)
    drawFloralSilhouette(width - 120, height - 200, 50, 1, Math.PI / 4)
    drawFloralSilhouette(80, height - 300, 40, 1, -Math.PI / 6)
    drawFloralSilhouette(width - 80, 250, 35, 1, Math.PI / 3)

    // IMAGEN DEL PRODUCTO con animaciones
    const imageAreaHeight = height * 0.65
    const imageAreaWidth = width * 0.8
    const imageAreaY = height * 0.15 + imageOffsetY
    const imageAreaX = (width - imageAreaWidth) / 2 + imageOffsetX

    // Calcular dimensiones de imagen
    const imageAspect = image.width / image.height
    const areaAspect = imageAreaWidth / imageAreaHeight

    let drawWidth, drawHeight, drawX, drawY

    if (imageAspect > areaAspect) {
      drawWidth = imageAreaWidth * imageScale
      drawHeight = drawWidth / imageAspect
      drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
      drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
    } else {
      drawHeight = imageAreaHeight * imageScale
      drawWidth = drawHeight * imageAspect
      drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
      drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
    }

    // Sombra con opacidad animada
    ctx.shadowColor = `rgba(0, 0, 0, ${0.08 * imageOpacity})`
    ctx.shadowBlur = 20 * imageOpacity
    ctx.shadowOffsetY = 8 * imageOpacity

    // Dibujar imagen con transformaciones
    ctx.save()
    ctx.globalAlpha = imageOpacity
    ctx.translate(drawX + drawWidth / 2, drawY + drawHeight / 2)
    ctx.rotate(imageRotation)
    ctx.translate(-drawWidth / 2, -drawHeight / 2)

    ctx.beginPath()
    ctx.roundRect(0, 0, drawWidth, drawHeight, 12)
    ctx.clip()
    ctx.drawImage(image, 0, 0, drawWidth, drawHeight)
    ctx.restore()

    // Resetear sombra
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // ÁREA DE TEXTO con animaciones
    let textY = imageAreaY + imageAreaHeight + 60 + textOffsetY

    if (config.showProductName) {
      ctx.save()
      ctx.globalAlpha = textOpacity
      ctx.fillStyle = "#2C2C2C"
      ctx.font = "400 64px 'Playfair Display', serif"
      ctx.textAlign = "center"

      // Dividir texto en líneas
      const maxWidth = width * 0.8
      const words = product.title.split(" ")
      let line = ""
      const lines: string[] = []

      for (const word of words) {
        const testLine = line + word + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && line !== "") {
          lines.push(line.trim())
          line = word + " "
        } else {
          line = testLine
        }
      }
      lines.push(line.trim())

      const displayLines = lines.slice(0, 2)
      displayLines.forEach((textLine, index) => {
        ctx.fillText(textLine, width / 2, textY + index * 70)
      })

      ctx.restore()
      textY += displayLines.length * 70 + 30
    }

    if (config.showProductPrice) {
      ctx.save()
      ctx.globalAlpha = textOpacity

      if (product.discount && product.discount > 0 && product.discount !== 0) {
        const originalPrice = product.price
        const discountedPrice = originalPrice * (1 - product.discount / 100)

        // Precio con descuento
        ctx.fillStyle = "#7A5C4A"
        ctx.font = "600 48px 'Lato', sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`$${discountedPrice.toFixed(2)}`, width / 2, textY)

        // Precio original tachado
        ctx.fillStyle = "#999999"
        ctx.font = "400 36px 'Lato', sans-serif"
        const priceText = `$${originalPrice.toFixed(2)}`
        const priceWidth = ctx.measureText(priceText).width
        ctx.fillText(priceText, width / 2, textY + 45)

        // Línea tachada
        ctx.strokeStyle = "#999999"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width / 2 - priceWidth / 2, textY + 40)
        ctx.lineTo(width / 2 + priceWidth / 2, textY + 40)
        ctx.stroke()

        // Badge de descuento
        const badgeSize = 35
        const badgeMargin = 50
        const badgeX = width - badgeMargin
        const badgeY = height - badgeMargin

        ctx.fillStyle = "#7A5C4A"
        ctx.beginPath()
        ctx.arc(badgeX, badgeY, badgeSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#FFFFFF"
        ctx.font = "600 22px 'Lato', sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`-${product.discount}%`, badgeX, badgeY + 8)
      } else {
        // Precio sin descuento
        ctx.fillStyle = "#7A5C4A"
        ctx.font = "600 48px 'Lato', sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`$${product.price.toFixed(2)}`, width / 2, textY)
      }

      ctx.restore()
    }
  }

  // Función para renderizar texto con wrapping automático
  const renderWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    font: string,
    color: string,
  ) => {
    ctx.save()
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = "center"

    // Dividir texto en palabras
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    // Renderizar cada línea
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight)
    })

    ctx.restore()
    return lines.length
  }

  // Función principal para generar video
  const handleGenerateVideo = async () => {
    if (!isOnline) {
      setError("No hay conexión a internet. Verifica tu conexión e intenta nuevamente.")
      return
    }

    if (backendStatus !== "online") {
      setError("Backend no disponible. Verifica que el servidor esté corriendo.")
      return
    }

    const productsToUse = getFilteredProducts()
    if (productsToUse.length === 0) {
      setError("No hay productos disponibles con los filtros seleccionados.")
      return
    }

    setIsGenerating(true)
    setGenerationStatus("generating")
    setGenerationProgress(0)
    setGenerationMessage("Preparando canvas para video...")
    setError(null)

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        throw new Error("Canvas no disponible")
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Contexto 2D no disponible")
      }

      // Configurar canvas para formato de historia (9:16)
      canvas.width = 1080
      canvas.height = 1920

      setGenerationMessage("Cargando imágenes de productos...")

      // Cargar todas las imágenes primero
      const imagePromises = productsToUse.map(async (product, index) => {
        try {
          const imageUrl = getProxiedImageUrl(product.thumbnails[0])
          const image = await loadImage(imageUrl, product)
          setGenerationProgress(((index + 1) / productsToUse.length) * 30)
          return { product, image }
        } catch (error) {
          console.warn(`⚠️ Error cargando imagen para ${product.title}:`, error)
          const canvas = document.createElement("canvas")
          canvas.width = 400
          canvas.height = 400
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = "#6366F1"
            ctx.fillRect(0, 0, 400, 400)
            ctx.fillStyle = "#FFFFFF"
            ctx.font = "20px Arial"
            ctx.textAlign = "center"
            ctx.fillText(product.title.substring(0, 15), 200, 200)
          }

          return new Promise<{ product: Product; image: HTMLImageElement }>((resolve) => {
            canvas.toBlob((blob: Blob | null) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const img = new Image()
                img.onload = () => {
                  URL.revokeObjectURL(url)
                  resolve({ product, image: img })
                }
                img.src = url
              }
            })
          })
        }
      })

      const productImages = await Promise.all(imagePromises)
      setGenerationMessage("Iniciando grabación de video...")

      // Detectar codec soportado
      const supportedCodec = getSupportedVideoCodec()

      // Configurar MediaRecorder
      const stream = canvas.captureStream(60) // 60 FPS para animaciones más fluidas
      recordedChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedCodec,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType
        const blob = new Blob(recordedChunksRef.current, {
          type: actualMimeType,
        })
        const videoUrl = URL.createObjectURL(blob)

        const result: GeneratedVideo = {
          videoBlob: blob,
          videoUrl: videoUrl,
          videoId: `fashion_show_${Date.now()}`,
          products: productsToUse,
          config: config,
          duration: productsToUse.length * config.productDuration + 2,
          size: blob.size,
        }

        setGeneratedVideo(result)
        setGenerationStatus("success")
        setGenerationMessage("¡Video generado exitosamente!")
        setGenerationProgress(100)
        setIsGenerating(false)

        console.log("✅ Video generado:", result)
      }

      // Iniciar grabación
      mediaRecorder.start()

      // Renderizar intro
      setGenerationMessage("Renderizando introducción...")

      ctx.fillStyle = "#F5F2ED"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#2C2C2C"
      ctx.font = "300 88px 'Playfair Display', serif"
      ctx.textAlign = "center"
      ctx.fillText(customTexts.brandName, canvas.width / 2, canvas.height / 2 - 40)

      ctx.font = "400 52px 'Playfair Display', serif"
      ctx.fillStyle = "#7A5C4A"
      ctx.fillText(customTexts.introSubtitle, canvas.width / 2, canvas.height / 2 + 20)

      ctx.font = "300 36px 'Playfair Display', serif"
      ctx.fillStyle = "#999999"
      ctx.fillText(customTexts.introDescription, canvas.width / 2, canvas.height / 2 + 70)

      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Renderizar cada producto con animación fluida
      for (let i = 0; i < productImages.length; i++) {
        const { product, image } = productImages[i]

        setGenerationMessage(`Renderizando producto ${i + 1} de ${productImages.length}: ${product.title}`)
        setGenerationProgress(30 + (i / productImages.length) * 60)

        // Animación de entrada más fluida (90 frames = 1.5 segundos a 60fps)
        const animationFrames = 90
        for (let frame = 0; frame <= animationFrames; frame++) {
          const progress = frame / animationFrames
          renderProductOnCanvas(canvas, ctx, product, image, progress, config.animationType)
          await new Promise((resolve) => setTimeout(resolve, 16.67)) // ~60fps
        }

        // Mostrar producto estático
        const staticDuration = (config.productDuration - 1.5) * 1000
        const startTime = Date.now()
        while (Date.now() - startTime < staticDuration) {
          renderProductOnCanvas(canvas, ctx, product, image, 1, config.animationType)
          await new Promise((resolve) => setTimeout(resolve, 16.67))
        }
      }

      // Renderizar outro
      setGenerationMessage("Renderizando cierre...")

      ctx.fillStyle = "#F5F2ED"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Configuración para el texto del outro
      const outroPadding = 100 // Padding de 100px desde los bordes
      const maxTextWidth = canvas.width - outroPadding * 2
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Renderizar mensaje principal con wrapping
      const mainMessageLines = renderWrappedText(
        ctx,
        customTexts.outroMessage,
        centerX,
        centerY - 60,
        maxTextWidth,
        80,
        "400 72px 'Playfair Display', serif",
        "#2C2C2C",
      )

      // Calcular posición para el submensaje basado en cuántas líneas ocupó el mensaje principal
      const subMessageY = centerY - 60 + mainMessageLines * 80 + 40

      // Renderizar submensaje con wrapping
      const subMessageLines = renderWrappedText(
        ctx,
        customTexts.outroCallToAction,
        centerX,
        subMessageY,
        maxTextWidth,
        60,
        "300 48px 'Playfair Display', serif",
        "#7A5C4A",
      )

      // Calcular posición para el nombre de la marca
      const brandNameY = subMessageY + subMessageLines * 60 + 40

      // Renderizar nombre de la marca
      ctx.font = "400 36px 'Lato', sans-serif"
      ctx.fillStyle = "#999999"
      ctx.textAlign = "center"
      ctx.fillText(customTexts.brandName, centerX, brandNameY)

      await new Promise((resolve) => setTimeout(resolve, 3000))

      setGenerationProgress(95)
      setGenerationMessage("Finalizando video...")

      mediaRecorder.stop()
    } catch (error: unknown) {
      console.error("❌ Error generando video:", error)
      setGenerationStatus("error")
      setGenerationMessage(error instanceof Error ? error.message : "Error desconocido al generar el video")
      setIsGenerating(false)
    }
  }

  // Función para descargar video
  const handleDownloadVideo = (video: GeneratedVideo) => {
    const link = document.createElement("a")
    link.href = video.videoUrl
    const extension = video.videoBlob.type.includes("mp4") ? "mp4" : "webm"
    link.download = `desfile_moda_${video.videoId}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log(`📥 Descargando video: ${video.videoId} como .${extension}`)
  }

  // Función para compartir video
  const handleShareVideo = async (video: GeneratedVideo) => {
    const extension = video.videoBlob.type.includes("mp4") ? "mp4" : "webm"
    const fileName = `desfile_moda.${extension}`

    if (
      navigator.share &&
      navigator.canShare({
        files: [new File([video.videoBlob], fileName, { type: video.videoBlob.type })],
      })
    ) {
      try {
        await navigator.share({
          title: "Desfile de Moda",
          text: "Mira este increíble desfile de moda",
          files: [
            new File([video.videoBlob], fileName, {
              type: video.videoBlob.type,
            }),
          ],
        })
      } catch (error) {
        console.log("Error sharing:", error)
        navigator.clipboard.writeText(video.videoUrl)
        alert("URL del video copiada al portapapeles")
      }
    } else {
      navigator.clipboard.writeText(video.videoUrl)
      alert("URL del video copiada al portapapeles")
    }
  }

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Función para manejar errores de carga de imágenes en la UI
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, product: Product) => {
    const target = e.currentTarget

    // Evitar bucle infinito si ya es placeholder
    if (target.src.includes("placeholder.svg")) return

    console.warn(`⚠️ Error cargando imagen para ${product.title}, usando placeholder`)
    target.src = "/placeholder.svg?height=200&width=200"
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-white text-lg">Cargando sistema de videos...</p>
          <p className="text-slate-400 text-sm">Conectando con la base de datos</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-green-400"
                  : backendStatus === "offline"
                    ? "bg-red-400"
                    : "bg-yellow-400"
              }`}
            />
            <span className="text-sm text-slate-400">
              Backend:{" "}
              {backendStatus === "online"
                ? "Conectado"
                : backendStatus === "offline"
                  ? "Desconectado"
                  : "Verificando..."}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si no se pudieron cargar los datos
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Error al cargar datos</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Canvas oculto para generación de video */}
        <canvas ref={canvasRef} className="hidden" width={1080} height={1920} />

        {/* Header - Optimizado para móvil */}
        <div className="mb-6 lg:mb-8">
          {/* Título principal y descripción */}
          <div className="text-center lg:text-left mb-4 lg:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
              {/* Ícono centrado en móvil */}
              <div className="mx-auto lg:mx-0 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit">
                <Video className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>

              {/* Título y descripción */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-1">Generador de Desfile de Moda</h1>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm lg:text-base">Videos reales para historias</span>
                  </div>
                  <span className="hidden sm:inline text-slate-500">•</span>
                  <span className="text-sm lg:text-base">{products.length} productos disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mostrar error si existe pero hay productos cargados */}
          {error && products.length > 0 && (
            <div className="mb-4 p-3 lg:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
          {/* PRIMERO: Personalización de Textos */}
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-slate-600/50 p-4 lg:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <Type className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
              <h3 className="text-lg lg:text-xl font-semibold text-white">Textos del Video</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="p-3 lg:p-4 border border-slate-600/50 rounded-xl bg-slate-800/20">
                <h4 className="font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Introducción
                </h4>
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de la Marca</label>
                    <input
                      type="text"
                      value={customTexts.brandName}
                      onChange={(e) =>
                        setCustomTexts({
                          ...customTexts,
                          brandName: e.target.value,
                        })
                      }
                      className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                      placeholder="Joly Lingerie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subtítulo</label>
                    <input
                      type="text"
                      value={customTexts.introSubtitle}
                      onChange={(e) =>
                        setCustomTexts({
                          ...customTexts,
                          introSubtitle: e.target.value,
                        })
                      }
                      className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                      placeholder="Nuestra Colección"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                    <input
                      type="text"
                      value={customTexts.introDescription}
                      onChange={(e) =>
                        setCustomTexts({
                          ...customTexts,
                          introDescription: e.target.value,
                        })
                      }
                      className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                      placeholder="productos exclusivos y elegantes"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 lg:p-4 border border-slate-600/50 rounded-xl bg-slate-800/20">
                <h4 className="font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Cierre
                </h4>
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mensaje de Cierre</label>
                    <input
                      type="text"
                      value={customTexts.outroMessage}
                      onChange={(e) =>
                        setCustomTexts({
                          ...customTexts,
                          outroMessage: e.target.value,
                        })
                      }
                      className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                      placeholder="Gracias por tu preferencia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Submensaje de Cierre</label>
                    <input
                      type="text"
                      value={customTexts.outroCallToAction}
                      onChange={(e) =>
                        setCustomTexts({
                          ...customTexts,
                          outroCallToAction: e.target.value,
                        })
                      }
                      className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                      placeholder="Visítanos en nuestra tienda"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEGUNDO: Selección de Productos */}
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-slate-600/50 p-4 lg:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
              <h3 className="text-lg lg:text-xl font-semibold text-white">Configuración de Productos</h3>
            </div>

            {/* Tipo de Selección - Optimizado para móvil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
              {[
                {
                  id: "all",
                  label: "Todos",
                  icon: Package,
                  count: products.filter((p) => p.status).length,
                  description: "Todos los productos activos",
                },
                {
                  id: "category",
                  label: "Por Categoría",
                  icon: Tag,
                  count: config.categoryId ? products.filter((p) => p.category === config.categoryId).length : 0,
                  description: "Productos de una categoría específica",
                },
                {
                  id: "discount",
                  label: "En Descuento",
                  icon: Sparkles,
                  count: products.filter((p) => p.discount && p.discount > 0).length,
                  description: "Solo productos con descuento",
                },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setConfig({ ...config, selectionType: option.id as VideoConfig["selectionType"] })}
                  className={`p-3 lg:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.selectionType === option.id
                      ? "border-green-500 bg-green-500/10 shadow-lg"
                      : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3 mb-2">
                    <option.icon
                      className={`w-5 h-5 lg:w-6 lg:h-6 ${
                        config.selectionType === option.id ? "text-green-400" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm lg:text-base">{option.label}</h4>
                      <p className="text-xs lg:text-sm text-slate-400">({option.count} productos)</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">{option.description}</p>
                </div>
              ))}
            </div>

            {/* Selección de Categoría */}
            {config.selectionType === "category" && (
              <div className="mb-4 lg:mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Seleccionar Categoría</label>
                <select
                  value={config.categoryId || ""}
                  onChange={(e) => setConfig({ ...config, categoryId: e.target.value as string })}
                  className="w-full p-2 lg:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none text-sm lg:text-base"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => {
                    const count = products.filter((p) => p.category === category).length
                    return (
                      <option key={category} value={category}>
                        {category} ({count} productos)
                      </option>
                    )
                  })}
                </select>
              </div>
            )}

            {/* Tipo de Animación - Optimizado para móvil */}
            <div className="mb-4 lg:mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Animación</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                {[
                  {
                    id: "fade",
                    label: "Fade In",
                    description: "Aparición gradual",
                  },
                  {
                    id: "zoom",
                    label: "Zoom In",
                    description: "Acercamiento dinámico",
                  },
                  {
                    id: "slide",
                    label: "Slide Up",
                    description: "Deslizamiento suave",
                  },
                  {
                    id: "rotate",
                    label: "Rotate",
                    description: "Rotación elegante",
                  },
                ].map((animation) => (
                  <div
                    key={animation.id}
                    onClick={() =>
                      setConfig({
                        ...config,
                        animationType: animation.id as VideoConfig["animationType"],
                      })
                    }
                    className={`p-2 lg:p-3 rounded-lg border cursor-pointer transition-all ${
                      config.animationType === animation.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <h5 className="font-medium text-white text-xs lg:text-sm">{animation.label}</h5>
                    <p className="text-xs text-slate-400">{animation.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuraciones del Video - Optimizado para móvil */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
              {/* Máximo de Productos */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Máximo de productos: {config.maxProducts}
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={config.maxProducts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxProducts: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Duración por Producto */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Segundos por producto: {config.productDuration}s
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={config.productDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      productDuration: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Duración total estimada: {getFilteredProducts().length * config.productDuration + 3}s
                </p>
              </div>
            </div>

            {/* Opciones de Visualización - Optimizado para móvil */}
            <div className="mb-4 lg:mb-6">
              <h4 className="font-semibold text-white mb-3">Información a Mostrar</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.showProductName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showProductName: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Type className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium text-sm lg:text-base">Nombre del Producto</span>
                    <p className="text-xs text-slate-400">Mostrar el título de cada producto</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.showProductPrice}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showProductPrice: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium text-sm lg:text-base">Precio del Producto</span>
                    <p className="text-xs text-slate-400">Mostrar el precio (con descuento si aplica)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Vista Previa de Productos - Optimizado para móvil */}
            <div>
              <h4 className="font-semibold text-white mb-3 lg:mb-4">
                Vista Previa ({getFilteredProducts().length} productos seleccionados)
              </h4>

              {getFilteredProducts().length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-slate-400">
                  <Package className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2" />
                  <p className="text-sm lg:text-base">No hay productos disponibles con los filtros seleccionados</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  {getFilteredProducts().map((product, index) => (
                    <div
                      key={product._id}
                      className="bg-slate-800/30 rounded-lg overflow-hidden border border-slate-600"
                    >
                      <div className="relative">
                        <img
                          src={
                            product.thumbnails && product.thumbnails.length > 0
                              ? getProxiedImageUrl(product.thumbnails[0])
                              : "/placeholder.svg?height=200&width=200"
                          }
                          alt={product.title}
                          className="w-full h-24 lg:h-32 object-cover"
                          onError={(e) => handleImageError(e, product)}
                        />
                        {product.discount && product.discount > 0 && product.discount !== 0 && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs">
                            -{product.discount}%
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-purple-500 text-white px-1 py-0.5 rounded text-xs">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-2 lg:p-3">
                        {config.showProductName && (
                          <h5 className="font-medium text-white text-xs lg:text-sm mb-1 truncate">{product.title}</h5>
                        )}
                        {config.showProductPrice && (
                          <div className="flex items-center gap-1 lg:gap-2">
                            <span className="text-green-400 text-xs lg:text-sm">
                              $
                              {product.discount && product.discount > 0 && product.discount !== 0
                                ? (product.price * (1 - product.discount / 100)).toFixed(2)
                                : product.price.toFixed(2)}
                            </span>
                            {product.discount && product.discount > 0 && product.discount !== 0 && (
                              <span className="text-xs text-slate-400 line-through">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botón de Generación - Optimizado para móvil */}
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-slate-600/50 p-4 lg:p-6 shadow-xl">
            <div className="text-center">
              {generationStatus === "generating" && (
                <div className="mb-4 lg:mb-6">
                  <div className="w-full bg-slate-800 rounded-full h-2 lg:h-3 mb-3 lg:mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 lg:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="text-slate-300 text-sm lg:text-base">{generationMessage}</p>
                  <p className="text-slate-400 text-xs lg:text-sm mt-1">{generationProgress.toFixed(0)}% completado</p>
                </div>
              )}

              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating || !isOnline || backendStatus !== "online" || getFilteredProducts().length === 0}
                className="w-full lg:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    Generando Video...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                    Generar Video de Desfile
                  </>
                )}
              </button>

              {!isOnline && <p className="text-red-400 text-xs lg:text-sm mt-2">Sin conexión a internet</p>}
              {backendStatus !== "online" && isOnline && (
                <p className="text-yellow-400 text-xs lg:text-sm mt-2">Backend no disponible</p>
              )}
              {getFilteredProducts().length === 0 && (
                <p className="text-yellow-400 text-xs lg:text-sm mt-2">No hay productos para generar el video</p>
              )}
            </div>
          </div>

          {/* Video Generado - Optimizado para móvil */}
          {generatedVideo && (
            <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-slate-600/50 p-4 lg:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                <h3 className="text-lg lg:text-xl font-semibold text-white">Video Generado Exitosamente</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Vista Previa del Video */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Vista Previa</h4>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoPreviewRef}
                      src={generatedVideo.videoUrl}
                      controls
                      className="w-full h-auto max-h-64 lg:max-h-80"
                      poster="/placeholder.svg?height=400&width=225"
                    >
                      Tu navegador no soporta el elemento video.
                    </video>
                  </div>
                </div>

                {/* Información del Video */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Información del Video</h4>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="p-3 lg:p-4 bg-slate-800/30 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 lg:gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Duración</p>
                          <p className="text-white font-medium">{generatedVideo.duration}s</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Tamaño</p>
                          <p className="text-white font-medium">{formatFileSize(generatedVideo.size)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Productos</p>
                          <p className="text-white font-medium">{generatedVideo.products.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Formato</p>
                          <p className="text-white font-medium">
                            {generatedVideo.videoBlob.type.includes("mp4") ? "MP4" : "WebM"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción - Optimizados para móvil */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                      <button
                        onClick={() => handleDownloadVideo(generatedVideo)}
                        className="flex-1 px-4 py-2 lg:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      <button
                        onClick={() => handleShareVideo(generatedVideo)}
                        className="flex-1 px-4 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
                      >
                        <Share2 className="w-4 h-4" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAdvertising
