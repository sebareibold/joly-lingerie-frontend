# 🌸 Joly Lingerie - Documentación Frontend

## 📖 ¿Qué es este proyecto?

**Joly Lingerie** es una tienda online de lencería que tiene dos partes principales:
- **Parte Pública**: Donde los clientes ven productos y compran
- **Parte Privada (Admin)**: Donde el administrador gestiona la tienda

---

## 🏗️ ¿Cómo está organizado el código?

### 📁 **Estructura de Carpetas**

```
frontend/
├── src/
│   ├── components/          # Piezas reutilizables de la página
│   ├── contexts/           # Información compartida entre páginas
│   ├── layouts/            # Plantillas base para las páginas
│   ├── pages/              # Las páginas que ve el usuario
│   ├── data/               # Información de productos (temporal)
│   └── App.tsx             # El "cerebro" que controla todo
```

---

## 🧠 **App.tsx - El Cerebro de la Aplicación**

**¿Qué hace App.tsx?**
Es como el **director de orquesta** que decide:
- ¿Qué página mostrar según la URL?
- ¿El usuario puede ver esta página?
- ¿Cómo organizar la información?

```typescript
// App.tsx hace esto:
1. Envuelve todo en "contextos" (información compartida)
2. Define las rutas (URLs) y qué página mostrar
3. Protege las páginas de admin
4. Aplica layouts (plantillas) a las páginas
```

**Ejemplo de cómo funciona:**
- Usuario va a `/` → Muestra la página de inicio
- Usuario va a `/admin` → Verifica si es admin, si no lo redirige
- Usuario va a `/product/123` → Muestra el producto con ID 123

---

## 🎭 **Layouts - Las Plantillas**

Los **layouts** son como plantillas que envuelven las páginas:

### 🌐 **PublicLayout** (Para clientes)
```
┌─────────────────────┐
│      HEADER         │ ← Logo, menú, carrito
├─────────────────────┤
│                     │
│    PÁGINA ACTUAL    │ ← Inicio, productos, etc.
│                     │
├─────────────────────┤
│      FOOTER         │ ← Información de contacto
└─────────────────────┘
```

### 🔒 **AdminLayout** (Para administrador)
```
┌─────────────────────┐
│    ADMIN HEADER     │ ← Notificaciones, usuario
├─────┬───────────────┤
│MENU │               │
│LADO │  PÁGINA ADMIN │ ← Dashboard, productos, etc.
│     │               │
└─────┴───────────────┘
```

---

## 📄 **Páginas (Pages)**

### 🌐 **Páginas Públicas** (Cualquiera puede ver)

#### **🏠 HomePage** (`/`)
**¿Qué hace?**
- Muestra la página principal de la tienda
- Presenta productos destacados
- Información de la marca

**¿Qué puede hacer el usuario?**
- Ver productos
- Navegar a categorías
- Contactar a la tienda

#### **🛍️ ProductDetail** (`/product/:id`)
**¿Qué hace?**
- Muestra un producto específico
- Permite seleccionar talla, color, cantidad
- Muestra productos relacionados

**¿Qué puede hacer el usuario?**
- Ver fotos del producto
- Leer descripción detallada
- Agregar al carrito
- Cambiar cantidad

#### **📂 CategoryPage** (`/category/:category`)
**¿Qué hace?**
- Muestra todos los productos de una categoría
- Permite filtrar y ordenar

**¿Qué puede hacer el usuario?**
- Ver productos por categoría
- Ordenar por precio o nombre
- Ir a detalles de producto

#### **🛒 CartPage** (`/cart`)
**¿Qué hace?**
- Muestra productos en el carrito
- Calcula totales y envío
- Permite finalizar compra

**¿Qué puede hacer el usuario?**
- Ver productos agregados
- Cambiar cantidades
- Eliminar productos
- Aplicar cupones de descuento
- Finalizar compra

---

### 🔒 **Páginas Privadas** (Solo administrador)

#### **🔐 AdminLogin** (`/admin/login`)
**¿Qué hace?**
- Página de inicio de sesión para administradores

**¿Qué puede hacer?**
- Ingresar usuario y contraseña
- Acceder al panel de administración

#### **📊 AdminDashboard** (`/admin`)
**¿Qué hace?**
- Muestra resumen general de la tienda
- Estadísticas importantes

**¿Qué puede ver el admin?**
- Total de productos
- Carritos activos
- Productos con stock bajo
- Ingresos totales

#### **📦 AdminProducts** (`/admin/products`)
**¿Qué hace?**
- Lista todos los productos de la tienda
- Permite gestionar el catálogo

**¿Qué puede hacer el admin?**
- Ver todos los productos
- Buscar productos
- Filtrar por categoría
- Editar productos
- Eliminar productos
- Crear nuevos productos

#### **✏️ AdminProductForm** (`/admin/products/new` o `/admin/products/:id/edit`)
**¿Qué hace?**
- Formulario para crear o editar productos

**¿Qué puede hacer el admin?**
- Agregar título, descripción, precio
- Subir imágenes
- Establecer stock
- Definir categoría
- Activar/desactivar producto

#### **🛒 AdminCarts** (`/admin/carts`)
**¿Qué hace?**
- Muestra todos los carritos de compras
- Permite ver qué están comprando los clientes

**¿Qué puede hacer el admin?**
- Ver todos los carritos
- Ver detalles de cada carrito
- Eliminar carritos
- Ver estadísticas de compras

#### **⚙️ AdminSettings** (`/admin/settings`)
**¿Qué hace?**
- Configuraciones generales de la tienda

**¿Qué puede hacer el admin?**
- Cambiar configuraciones
- Gestionar usuarios admin
- Ver logs del sistema

---

## 🔄 **Contexts - Información Compartida**

Los **contexts** son como "cajas de información" que todas las páginas pueden usar:

### 🛒 **CartContext**
**¿Qué guarda?**
- Productos en el carrito
- Cantidades de cada producto
- Total del carrito

**¿Qué funciones tiene?**
- `addToCart()` - Agregar producto
- `removeFromCart()` - Quitar producto
- `updateQuantity()` - Cambiar cantidad
- `clearCart()` - Vaciar carrito
- `getTotalItems()` - Contar productos
- `getTotalPrice()` - Calcular total

### 🔐 **AuthContext**
**¿Qué guarda?**
- Si hay un usuario logueado
- Información del usuario (nombre, rol)
- Token de autenticación

**¿Qué funciones tiene?**
- `login()` - Iniciar sesión
- `logout()` - Cerrar sesión
- `isAuthenticated` - ¿Está logueado?
- `isAdmin` - ¿Es administrador?

---

## 🧩 **Components - Piezas Reutilizables**

### 🌐 **Componentes Públicos**

#### **🎯 Header**
- Logo de la tienda
- Menú de navegación
- Icono del carrito con contador
- Botón de login de admin

#### **🦶 Footer**
- Información de contacto
- Redes sociales
- Enlaces importantes

#### **🏠 HeroSection**
- Imagen principal de la página de inicio
- Mensaje de bienvenida

#### **📦 ProductCatalog**
- Muestra grid de productos
- Tarjetas de productos

#### **📞 ContactSection**
- Formulario de contacto
- Información de la tienda

### 🔒 **Componentes de Admin**

#### **📋 AdminSidebar**
- Menú lateral del panel de administración
- Enlaces a diferentes secciones

#### **🎯 AdminHeader**
- Barra superior del admin
- Notificaciones
- Información del usuario

#### **🛡️ ProtectedRoute**
- Protege rutas que solo pueden ver los admins
- Redirige si no estás autorizado

---

## 🧭 **Navegación - Cómo se mueve el usuario**

### 🌐 **Navegación Pública**
```
Inicio (/) 
├── Ver producto (/product/123)
│   ├── Agregar al carrito
│   └── Ver productos relacionados
├── Ver categoría (/category/lenceria)
│   └── Ver producto específico
└── Ver carrito (/cart)
    └── Finalizar compra
```

### 🔒 **Navegación Admin**
```
Login Admin (/admin/login)
└── Dashboard (/admin)
    ├── Productos (/admin/products)
    │   ├── Nuevo producto (/admin/products/new)
    │   └── Editar producto (/admin/products/123/edit)
    ├── Carritos (/admin/carts)
    └── Configuración (/admin/settings)
```

---

## 🔐 **Seguridad**

### **¿Cómo se protegen las páginas de admin?**
1. **ProtectedRoute**: Componente que verifica si eres admin
2. **AuthContext**: Guarda si estás logueado
3. **Token JWT**: Se guarda en localStorage
4. **Redirección**: Si no eres admin, te envía al login

### **¿Qué pasa si alguien trata de acceder sin permisos?**
- Se redirige automáticamente al login
- No puede ver información sensible
- No puede modificar productos

---

## 📱 **Responsive Design**

La aplicación se adapta a diferentes tamaños de pantalla:
- **📱 Móvil**: Menú hamburguesa, layout vertical
- **💻 Tablet**: Layout adaptado, botones más grandes
- **🖥️ Desktop**: Layout completo, sidebar visible

---

## 🎨 **Estilos y Diseño**

### **Colores Principales**
- **Clay**: Marrón elegante para acentos
- **Deep Clay**: Marrón oscuro para textos
- **Bone**: Beige claro para fondos
- **Pure White**: Blanco para tarjetas

### **Tipografía**
- **Serif**: Para títulos elegantes
- **Sans-serif**: Para texto normal

---

## 🚀 **¿Cómo agregar una nueva página?**

### **Página Pública**
1. Crear archivo en `src/pages/public/`
2. Agregar ruta en `App.tsx` dentro de `PublicLayout`
3. Agregar enlace en `Header.tsx`

### **Página Admin**
1. Crear archivo en `src/pages/admin/`
2. Agregar ruta en `App.tsx` dentro de `AdminLayout` y `ProtectedRoute`
3. Agregar enlace en `AdminSidebar.tsx`

---

## 🛠️ **Comandos Útiles**

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Crear build para producción
npm run build

# Previsualizar build
npm run preview
```

