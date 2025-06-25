# Documentación del Frontend - Joly Lingerie

## Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Secciones Implementadas](#secciones-implementadas)
3. [Componentes en Uso](#componentes-en-uso)
4. [Componentes No Utilizados](#componentes-no-utilizados)
5. [Contextos y Estado Global](#contextos-y-estado-global)
6. [Rutas y Navegación](#rutas-y-navegación)
7. [Estilos y Diseño](#estilos-y-diseño)
8. [Recomendaciones](#recomendaciones)

## Estructura del Proyecto

El frontend está estructurado siguiendo un patrón organizativo por funcionalidad:

\`\`\`
frontend/
├── src/
│   ├── assets/            # Imágenes y recursos estáticos
│   ├── components/        # Componentes reutilizables
│   │   ├── admin/         # Componentes específicos para el panel admin
│   │   └── ...            # Componentes generales
│   ├── contexts/          # Contextos de React para estado global
│   ├── data/              # Datos mock y utilidades
│   ├── layouts/           # Layouts reutilizables (Admin, Public)
│   ├── pages/             # Páginas de la aplicación
│   │   ├── admin/         # Páginas del panel administrativo
│   │   └── public/        # Páginas públicas
│   ├── services/          # Servicios para API y lógica de negocio
│   ├── App.css            # Estilos globales
│   ├── App.tsx            # Componente principal y configuración de rutas
│   └── main.tsx           # Punto de entrada de la aplicación
\`\`\`

## Secciones Implementadas

### Sección Pública

1. **Home (HomePage)**
   - Hero principal con imagen destacada
   - Categorías destacadas en grid
   - Catálogo de productos
   - Sección de newsletter
   - Sección "Encuentra tiendas"

2. **Detalle de Producto (ProductDetail)**
   - Galería de imágenes
   - Información del producto
   - Selección de tallas y colores
   - Controles de cantidad
   - Secciones expandibles (descripción, cuidados, envíos)
   - Productos relacionados

3. **Categorías (CategoryPage)**
   - Listado de productos filtrados por categoría
   - Opciones de ordenamiento

4. **Carrito (CartPage)**
   - Listado de productos en carrito
   - Controles de cantidad
   - Opciones para eliminar productos
   - Resumen de pedido con subtotal, envío y total
   - Campo para código de descuento
   - Botón para finalizar compra

### Sección Administrativa

1. **Login (AdminLogin)**
   - Formulario de acceso para administradores

2. **Dashboard (AdminDashboard)**
   - Resumen estadístico
   - Acciones rápidas
   - Listado de carritos recientes

3. **Productos (AdminProducts)**
   - Listado de productos
   - Filtros y búsqueda
   - Acciones para ver, editar y eliminar

4. **Formulario de Producto (AdminProductForm)**
   - Creación y edición de productos
   - Campos para información básica, estado, imágenes

5. **Carritos (AdminCarts)**
   - Listado de carritos
   - Estadísticas
   - Detalle de carritos

6. **Configuración (AdminSettings)**
   - Ajustes generales
   - Notificaciones
   - Seguridad

## Componentes en Uso

### Componentes Principales

1. **Header**
   - Navegación principal
   - Logo
   - Iconos de usuario y carrito
   - Menú móvil

2. **Footer**
   - Enlaces de navegación
   - Información de contacto
   - Redes sociales

3. **HeroSection**
   - Banner principal con imagen de fondo
   - Texto y botones de llamada a la acción

4. **ProductCatalog**
   - Grid de productos
   - Filtros por categoría
   - Productos destacados

5. **ProductCard**
   - Tarjeta individual de producto
   - Imagen, título, precio
   - Botones de acción rápida

6. **Newsletter**
   - Formulario de suscripción
   - Diseño atractivo con elementos decorativos

7. **CategoryGrid**
   - Grid de categorías destacadas
   - Imágenes y enlaces

8. **FindStores**
   - Sección para localizar tiendas físicas

### Componentes Administrativos

1. **AdminSidebar**
   - Navegación lateral del panel admin
   - Enlaces a secciones administrativas

2. **AdminHeader**
   - Barra superior del panel admin
   - Información del usuario
   - Notificaciones

3. **ProtectedRoute**
   - Componente para proteger rutas administrativas
   - Redirección si no hay autenticación

## Componentes No Utilizados

Algunos componentes que están implementados pero actualmente no se utilizan o podrían optimizarse:

1. **PopularCategories**
   - Componente para mostrar categorías populares
   - Actualmente no se muestra en la página principal

2. **ProductCollections**
   - Componente para mostrar colecciones de productos
   - No se utiliza actualmente en ninguna página

3. **HeroCarousel**
   - Carrusel para la sección hero
   - Implementado pero no utilizado (se usa HeroSection en su lugar)

## Contextos y Estado Global

La aplicación utiliza dos contextos principales para gestionar el estado global:

1. **AuthContext**
   - Gestiona la autenticación de usuarios
   - Proporciona funciones para login/logout
   - Almacena información del usuario autenticado
   - Protege rutas administrativas

2. **CartContext**
   - Gestiona el estado del carrito de compras
   - Proporciona funciones para añadir, eliminar y actualizar productos
   - Calcula totales y cantidades
   - Persiste el carrito en localStorage

## Rutas y Navegación

La navegación se gestiona con React Router v6:

### Rutas Públicas
- `/` - Página principal
- `/product/:id` - Detalle de producto
- `/category/:category` - Productos por categoría
- `/cart` - Carrito de compras

### Rutas Administrativas
- `/admin/login` - Acceso al panel
- `/admin` - Dashboard administrativo
- `/admin/products` - Gestión de productos
- `/admin/products/new` - Crear nuevo producto
- `/admin/products/:id/edit` - Editar producto existente
- `/admin/carts` - Gestión de carritos
- `/admin/settings` - Configuración

## Estilos y Diseño

El diseño sigue una estética elegante y minimalista:

1. **Paleta de Colores**
   - Colores neutros y cálidos (crema, hueso, roble, arcilla)
   - Acentos en tonos dorados
   - Variables CSS para consistencia

2. **Tipografía**
   - Playfair Display para títulos (serif)
   - Inter para texto general (sans-serif)
   - Uso de pesos ligeros para elegancia

3. **Componentes UI**
   - Diseño con bordes redondeados
   - Sombras sutiles
   - Animaciones suaves en interacciones
   - Diseño responsivo para todas las pantallas

4. **Framework CSS**
   - Tailwind CSS para estilos utilitarios
   - Personalización mediante variables CSS

## Recomendaciones

### Mejoras de Funcionalidad

1. **Implementar búsqueda real**
   - Actualmente el icono de búsqueda se ha eliminado, pero sería útil implementar una funcionalidad de búsqueda completa
   - Considerar añadir una página de resultados de búsqueda

2. **Autenticación de usuarios**
   - Implementar registro y login para clientes
   - Perfil de usuario con historial de pedidos
   - Guardar direcciones de envío

3. **Integración de pagos**
   - Conectar con una pasarela de pagos real (Stripe, PayPal, MercadoPago)
   - Implementar proceso de checkout completo

4. **Optimización de datos**
   - Reemplazar datos mock por conexión a API real
   - Implementar caché y gestión de estado con React Query o SWR

### Mejoras de UX/UI

1. **Filtros avanzados**
   - Añadir más opciones de filtrado en la página de categorías
   - Implementar filtros por precio, talla, color

2. **Mejoras en el carrito**
   - Añadir animaciones al agregar/eliminar productos
   - Implementar carrito persistente entre sesiones
   - Añadir opción "guardar para después"

3. **Optimización de imágenes**
   - Implementar carga progresiva de imágenes
   - Utilizar formatos modernos (WebP)
   - Implementar lazy loading

4. **Accesibilidad**
   - Mejorar el contraste de colores
   - Asegurar navegación completa por teclado
   - Añadir atributos ARIA donde sea necesario

### Optimizaciones Técnicas

1. **Rendimiento**
   - Implementar Code Splitting para reducir el tamaño del bundle
   - Optimizar renderizados con React.memo y useMemo
   - Implementar Server Components si se migra a Next.js

2. **Testing**
   - Añadir tests unitarios con Jest/React Testing Library
   - Implementar tests e2e con Cypress o Playwright

3. **SEO**
   - Mejorar metadatos para cada página
   - Implementar Schema.org para rich snippets
   - Considerar migración a Next.js para SSR/SSG

4. **Monitoreo**
   - Implementar análisis de rendimiento con Lighthouse
   - Añadir tracking de eventos de usuario
   - Monitorear errores con Sentry o similar

### Componentes a Desarrollar

1. **Wishlist/Lista de deseos**
   - Permitir a los usuarios guardar productos para después

2. **Reseñas de productos**
   - Sistema de valoraciones y comentarios

3. **Comparador de productos**
   - Permitir comparar características entre productos

4. **Chat de soporte**
   - Implementar chat en vivo o chatbot para asistencia

5. **Localizador de tiendas**
   - Mapa interactivo para encontrar tiendas físicas
