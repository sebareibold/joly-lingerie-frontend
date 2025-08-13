# 🌸 Joly Lingerie - Frontend con React y TypeScript

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

## Objetivo del Proyecto

Este proyecto consiste en el desarrollo de la interfaz de usuario (frontend) para Joly Lingerie, una tienda online de lencería. El objetivo es crear una experiencia de usuario fluida y moderna, separando claramente la vista pública para clientes de un panel de administración privado para la gestión de la tienda.

La aplicación está construida con React y TypeScript, siguiendo una arquitectura modular basada en componentes, contextos y layouts reutilizables. 

## Características Principales

### 🌐 Interfaz Pública para Clientes

- **Catálogo de Productos**: Visualización de productos con filtros y categorías.
- **Detalle de Producto**: Página dedicada con galería de imágenes, selección de variantes y descripción.
- **Diseño Responsivo**: Adaptado para una correcta visualización en dispositivos móviles, tablets y escritorio.

### 🛒 Sistema de Carrito de Compras

- **Gestión del Carrito**: Lógica para agregar, actualizar y eliminar productos.
- **Contexto Global**: El estado del carrito es accesible desde cualquier parte de la aplicación gracias al Context API de React.
- **Proceso de Compra**: Flujo simplificado para que el cliente finalice su pedido.

### 🔒 Panel de Administración

- **Dashboard de Control**: Resumen con estadísticas clave de la tienda.
- **Gestión de Productos (CRUD)**: Interfaz para crear, leer, actualizar y eliminar productos del catálogo.
- **Visualización de Carritos**: Seguimiento de los carritos de compra de los usuarios.
- **Rutas Protegidas**: Acceso exclusivo para administradores autenticados.

## Tecnologías Utilizadas

- **React**: Biblioteca de JavaScript para construir interfaces de usuario interactivas.
- **TypeScript**: Superset de JavaScript que añade tipado estático para un código más robusto y mantenible.
- **Vite**: Entorno de desarrollo moderno y rápido para proyectos frontend.
- **React Router**: Librería para la gestión de rutas y navegación entre las distintas páginas de la aplicación.
- **React Context API**: Para la gestión de estados globales como la autenticación y el carrito de compras.
- **SCSS**: Preprocesador de CSS para escribir estilos de forma más organizada y potente.
- **JWT (JSON Web Tokens)**: Utilizados para asegurar las rutas del panel de administración.

## Estructura del Proyecto

La estructura de carpetas está diseñada para separar responsabilidades y facilitar la escalabilidad.

```
frontend/
├── public/                # Archivos estáticos
├── src/
│   ├── components/        # Componentes reutilizables (Header, ProductCard, etc.)
│   │   ├── admin/         # Componentes exclusivos del panel de admin
│   │   └── public/        # Componentes para la vista pública
│   ├── contexts/          # Lógica de estado global (AuthContext, CartContext)
│   ├── layouts/           # Plantillas estructurales (AdminLayout, PublicLayout)
│   ├── pages/             # Componentes que representan páginas completas
│   │   ├── admin/         # Páginas del panel de administración
│   │   └── public/        # Páginas de la tienda pública
│   ├── styles/            # Archivos de estilos globales (SCSS)
│   └── App.tsx            # Componente raíz, define el enrutamiento principal
├── .env.example           # Ejemplo de variables de entorno
├── index.html             # Punto de entrada HTML
├── package.json           # Dependencias y scripts del proyecto
└── tsconfig.json          # Configuración de TypeScript
```

## Vistas y Lógica Principal

La aplicación se organiza en torno a los siguientes conceptos clave:

- **Layouts** (`/layouts`): Definen la estructura visual base.
  - `PublicLayout`: Incluye el Header y Footer para los clientes.
  - `AdminLayout`: Incluye el AdminSidebar y la barra superior para el panel de gestión.

- **Pages** (`/pages`): Son las vistas que el usuario final ve en el navegador, compuestas por múltiples componentes. Se dividen en `public` y `admin`.

- **Contexts** (`/contexts`): Manejan la lógica de negocio y el estado que se comparte a través de la aplicación.
  - `AuthContext`: Gestiona el inicio/cierre de sesión y la información del usuario administrador.
  - `CartContext`: Controla todos los aspectos del carrito de compras.

- **Components** (`/components`): Son las piezas de construcción más pequeñas y reutilizables de la UI.

## Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (versión 16 o superior): Incluye npm.
- **Git**: Para clonar el repositorio.

## Estado del Proyecto

✅ **Completado** - Funcionalidades principales implementadas y listas para conectar con un servicio backend.
