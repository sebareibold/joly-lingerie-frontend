"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, X, Plus, Upload, Check, AlertTriangle, ChevronLeft, Clock } from "lucide-react"
import { apiService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

interface ProductForm {
  title: string
  description: string
  price: number | string
  category: string
  stock: number | string
  size: string[]
  status: boolean
  thumbnails: string[]
  discount: number | string
}

interface Category {
  name: string
  display_name: string
}

export default function AdminProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    size: [],
    status: true,
    thumbnails: [""],
    discount: 0,
  })

  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const availableSizes = [
    // Ropa
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    // Calzado
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    // Accesorios
    "Único",
    "Ajustable",
    // Relojes/Electrónicos
    "35mm",
    "40mm",
    "42mm",
    "45mm",
  ]

  // Verificar autenticación
  useEffect(() => {
    console.log("AdminProductForm - Verificando autenticación:", { user, isEditing, id })

    if (user && user.role !== "admin") {
      console.warn("AdminProductForm - Acceso denegado: Se requiere rol de administrador")
      navigate("/admin/login")
      return
    }

    if (isEditing && !id) {
      console.error("AdminProductForm - ID de producto requerido para edición")
      navigate("/admin/products")
      return
    }

    console.log("AdminProductForm - Autenticación verificada correctamente")
  }, [user, navigate, isEditing, id])

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("AdminProductForm - Cargando categorías...")
        setCategoriesLoading(true)
        setCategoriesError(null)

        const response = await apiService.getSiteContent()
        console.log("AdminProductForm - Respuesta de contenido:", response)

        if (response.success && response.content?.productCatalog?.categories) {
          setAvailableCategories(response.content.productCatalog.categories)
          console.log("AdminProductForm - Categorías cargadas:", response.content.productCatalog.categories.length)
        } else {
          // Si no hay categorías, usar categorías por defecto
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
          console.log("AdminProductForm - Usando categorías por defecto debido a:", response.error || "respuesta vacía")
        }
      } catch (err) {
        console.error("AdminProductForm - Error loading categories:", err)

        // En caso de error, usar categorías por defecto para no bloquear el formulario
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
        setCategoriesError("No se pudieron cargar las categorías del servidor. Usando categorías por defecto.")
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Cargar producto si es edición
  useEffect(() => {
    const loadProductData = async () => {
      if (isEditing && id) {
        try {
          setLoading(true)
          console.log(`AdminProductForm - Cargando producto con ID: ${id}`)

          const response = await apiService.getProduct(id)
          console.log("AdminProductForm - Respuesta del producto:", response)

          if (response.success && response.product) {
            const product = response.product
            console.log("AdminProductForm - Datos del producto recibidos:", product)

            setForm({
              title: product.title || "",
              description: product.description || "",
              price: product.price !== undefined ? String(product.price) : "",
              category: product.category || "",
              stock: product.stock !== undefined ? String(product.stock) : "",
              size: Array.isArray(product.size) ? product.size : product.size ? [product.size] : [],
              status: product.status !== undefined ? product.status : true,
              thumbnails: product.thumbnails && product.thumbnails.length > 0 ? product.thumbnails : [""],
              discount: product.discount !== undefined ? String(product.discount) : "0",
            })
            console.log("AdminProductForm - Estado del formulario actualizado")
          } else {
            console.error("AdminProductForm - Error en la respuesta:", response)
            const errorMessage = response.error || "Error al cargar el producto"

            if (errorMessage.includes("no encontrado")) {
              alert("❌ El producto no existe o fue eliminado.")
            } else {
              alert(`❌ ${errorMessage}`)
            }

            navigate("/admin/products")
          }
        } catch (error) {
          console.error("AdminProductForm - Error loading product:", error)

          let errorMessage = "Error desconocido al cargar el producto"
          if (error instanceof Error) {
            errorMessage = error.message
          }

          alert(`❌ ${errorMessage}`)
          navigate("/admin/products")
        } finally {
          setLoading(false)
        }
      } else if (!isEditing) {
        // Reset form for create mode
        setForm({
          title: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          size: [],
          status: true,
          thumbnails: [""],
          discount: "0",
        })
      }
    }

    loadProductData()
  }, [id, isEditing, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleThumbnailChange = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails.map((thumb, i) => (i === index ? value : thumb)),
    }))
  }

  const addThumbnail = () => {
    setForm((prev) => ({
      ...prev,
      thumbnails: [...prev.thumbnails, ""],
    }))
  }

  const removeThumbnail = (index: number) => {
    if (form.thumbnails.length > 1) {
      setForm((prev) => ({
        ...prev,
        thumbnails: prev.thumbnails.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones mejoradas
    const errors: string[] = []

    if (!form.title.trim()) errors.push("El título es requerido")
    if (!form.description.trim()) errors.push("La descripción es requerida")
    if (!form.category) errors.push("La categoría es requerida")
    if (!form.price || Number(form.price) <= 0) errors.push("El precio debe ser mayor a 0")
    if (form.size.length === 0) errors.push("Debe seleccionar al menos una talla")
    if (form.thumbnails.every((thumb) => !thumb.trim())) errors.push("Debe incluir al menos una imagen")

    // Validar que la categoría existe
    if (form.category && !availableCategories.some((cat) => cat.name === form.category)) {
      errors.push("La categoría seleccionada no es válida")
    }

    // Validar URLs de imágenes
    const invalidImages = form.thumbnails.filter((thumb) => {
      if (!thumb.trim()) return false
      try {
        new URL(thumb)
        return false
      } catch {
        return true
      }
    })

    if (invalidImages.length > 0) {
      errors.push("Algunas URLs de imágenes no son válidas")
    }

    if (errors.length > 0) {
      alert(`❌ Errores de validación:\n\n${errors.map((err) => `• ${err}`).join("\n")}`)
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      setSaving(true)
      setRateLimited(false)

      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        discount: Number(form.discount || 0),
        thumbnails: form.thumbnails.filter((thumb) => thumb.trim() !== ""),
      }

      console.log("AdminProductForm - Enviando datos del producto:", productData)

      if (isEditing && id) {
        await apiService.updateProduct(id, productData)
        console.log("AdminProductForm - Producto actualizado exitosamente")
      } else {
        await apiService.createProduct(productData)
        console.log("AdminProductForm - Producto creado exitosamente")
      }

      navigate("/admin/products")
    } catch (error: unknown) {
      console.error("AdminProductForm - Error saving product:", error)

      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      
      if (errorMessage.includes("429")) {
        setRateLimited(true)
        alert("Demasiadas peticiones. Por favor, espera 15 minutos antes de intentar nuevamente.")
      } else {
        alert(isEditing ? "Error al actualizar el producto" : "Error al crear el producto")
      }
    } finally {
      setSaving(false)
      if (!rateLimited) {
        setShowConfirmation(false)
      }
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setRateLimited(false)
  }

  // Estados de carga
  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-300 text-lg">
            {categoriesLoading ? "Cargando categorías..." : "Cargando producto..."}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar advertencia si hay error de categorías pero continuar
  if (categoriesError) {
    console.warn("AdminProductForm - Advertencia de categorías:", categoriesError)
  }

  // Pantalla de confirmación
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleCancelConfirmation}
                className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Confirmar {isEditing ? "Actualización" : "Creación"}</h1>
                <p className="mt-2 text-gray-400 text-base">
                  Por favor revisa los detalles del producto antes de {isEditing ? "actualizar" : "crear"}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limit Warning */}
          {rateLimited && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-8 flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-red-500 font-medium">Límite de peticiones alcanzado</h4>
                <p className="text-red-200/70 text-sm">
                  Has realizado demasiadas peticiones en poco tiempo. Por favor, espera 15 minutos antes de intentar
                  nuevamente.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Card */}
          <div className="bg-gradient-to-br from-gray-800/40 via-gray-700/20 to-gray-600/10 backdrop-blur-sm border border-gray-600/40 rounded-xl shadow-lg mb-8">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Resumen del Producto</h3>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-transparent rounded-xl p-6 border border-gray-700/30">
                  <h4 className="text-base font-medium text-white mb-4">Información Básica</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Título</p>
                      <p className="text-white font-medium">{form.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Categoría</p>
                      <p className="text-white font-medium">
                        {availableCategories.find((cat) => cat.name === form.category)?.display_name || form.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Precio</p>
                      <p className="text-white font-medium">${Number(form.price).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Descuento</p>
                      <p className="text-white font-medium">{Number(form.discount)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Stock</p>
                      <p className="text-white font-medium">{form.stock} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tallas disponibles</p>
                      <div className="flex flex-wrap gap-1">
                        {form.size.map((size, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estado</p>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            form.status
                              ? "bg-green-900 text-green-300 border border-green-700"
                              : "bg-red-900 text-red-300 border border-red-700"
                          }`}
                        >
                          {form.status ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-transparent rounded-xl p-6 border border-gray-700/30">
                  <h4 className="text-base font-medium text-white mb-4">Descripción</h4>
                  <p className="text-gray-300 whitespace-pre-line">{form.description}</p>
                </div>

                {/* Images */}
                <div className="bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-transparent rounded-xl p-6 border border-gray-700/30">
                  <h4 className="text-base font-medium text-white mb-4">
                    Imágenes ({form.thumbnails.filter((t) => t.trim()).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {form.thumbnails
                      .filter((thumb) => thumb.trim())
                      .map((thumbnail, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-600">
                          <img
                            src={thumbnail || "/placeholder.svg"}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ))}
                  </div>
                  {form.thumbnails.filter((t) => t.trim()).length === 0 && (
                    <p className="text-gray-400 text-center py-4">No hay imágenes disponibles</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-8 flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="text-yellow-500 font-medium">Importante</h4>
              <p className="text-yellow-200/70 text-sm">
                Esta acción {isEditing ? "actualizará" : "creará"} el producto en el sistema.
                {isEditing
                  ? " Los cambios se aplicarán inmediatamente."
                  : " El producto estará disponible inmediatamente si está marcado como activo."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancelConfirmation}
              className="px-8 py-3 border-2 border-gray-600 rounded-xl text-gray-300 bg-transparent hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium text-base"
            >
              Volver al Formulario
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={saving || rateLimited}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-base min-w-[180px] sm:min-w-[200px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Guardando...
                </>
              ) : rateLimited ? (
                <>
                  <Clock className="h-5 w-5 mr-3" />
                  Límite alcanzado
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-3" />
                  Confirmar y {isEditing ? "Actualizar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 border border-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h1>
              <p className="mt-2 text-gray-400 text-base">
                {isEditing ? "Modifica los datos del producto" : "Completa la información del nuevo producto"}
              </p>
              {categoriesError && (
                <div className="mt-2 flex items-center space-x-2">
                  <p className="text-yellow-400 text-sm">⚠️ {categoriesError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded hover:bg-yellow-600/30 transition-all duration-200"
                  >
                    Recargar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-700/5 border border-blue-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Información Básica</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title - Full Width */}
                <div className="lg:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Título del Producto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="admin-input"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Ingresa el nombre del producto"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    className="admin-input resize-none"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe las características del producto"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    className="admin-input"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar categoría</option>
                    {availableCategories.map((category) => (
                      <option key={category.name} value={category.name} className="bg-gray-700">
                        {category.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size - SELECCIÓN MEJORADA CON CHECKBOXES */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Tallas Disponibles *</label>
                  <div className="bg-gradient-to-r from-blue-800/20 via-blue-700/10 to-transparent rounded-xl p-4 border border-blue-700/30">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableSizes.map((size) => (
                        <label
                          key={size}
                          className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            form.size.includes(size)
                              ? "border-blue-500 bg-blue-500/20 text-blue-300"
                              : "border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={form.size.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm((prev) => ({
                                  ...prev,
                                  size: [...prev.size, size],
                                }))
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  size: prev.size.filter((s) => s !== size),
                                }))
                              }
                            }}
                          />
                          <span className="text-sm font-medium">{size}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Tallas seleccionadas ({form.size.length}):</span>{" "}
                        {form.size.length > 0 ? form.size.join(", ") : "Ninguna"}
                      </p>
                      {form.size.length === 0 && (
                        <p className="text-red-400 text-xs mt-1">⚠️ Debes seleccionar al menos una talla</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    className="admin-input"
                    value={form.stock}
                    onChange={handleInputChange}
                    placeholder="Cantidad disponible"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg font-medium">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      min="0"
                      step="0.01"
                      className="admin-input pl-6 pr-4"
                      value={form.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-2">
                    Descuento (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount"
                      id="discount"
                      min="0"
                      max="100"
                      step="1"
                      className="admin-input pr-8 pl-4"
                      value={form.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-700/5 border border-green-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Estado del Producto</h3>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="status"
                    id="status"
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    checked={form.status}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="status" className="ml-3 text-gray-300 text-lg">
                    Producto activo y visible
                  </label>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    form.status
                      ? "bg-green-900 text-green-300 border border-green-700"
                      : "bg-red-900 text-red-300 border border-red-700"
                  }`}
                >
                  {form.status ? "Activo" : "Inactivo"}
                </div>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-700/5 border border-purple-600/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Imágenes del Producto</h3>
              </div>

              <div className="space-y-6">
                {form.thumbnails.map((thumbnail, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-800/20 via-purple-700/10 to-transparent rounded-xl p-6 border border-purple-700/30 hover:from-purple-800/30 hover:via-purple-700/20 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <label htmlFor={`thumbnail-${index}`} className="block text-sm font-medium text-gray-300 mb-2">
                          <span className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <span>
                              URL de Imagen {index + 1} {index === 0 && "*"}
                            </span>
                          </span>
                        </label>
                        <input
                          type="url"
                          id={`thumbnail-${index}`}
                          className="admin-input"
                          value={thumbnail}
                          onChange={(e) => handleThumbnailChange(index, e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>

                      {/* Image Preview */}
                      {thumbnail && (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-gray-600">
                            <img
                              src={thumbnail || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Remove Button */}
                      {form.thumbnails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeThumbnail(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addThumbnail}
                  className="w-full py-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Agregar otra imagen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-8 py-3 border-2 border-gray-600 rounded-xl text-gray-300 bg-transparent hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-base min-w-[180px] sm:min-w-[200px]"
            >
              <Save className="h-5 w-5 mr-3" />
              Revisar y {isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
