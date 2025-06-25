# Configuración del Backend

Este documento explica cómo configurar la conexión entre el frontend y el backend de la aplicación.

## Configuración Básica

La URL del backend se configura en el archivo `src/config/config.ts`. Por defecto, la aplicación intentará conectarse a:

\`\`\`
http://localhost:8080/api
\`\`\`

## Métodos para Cambiar la URL del Backend

### 1. Editar el archivo de configuración

Abre el archivo `src/config/config.ts` y modifica la variable `API_BASE_URL`:

\`\`\`typescript
export const API_BASE_URL = 'https://tu-backend.com/api';
\`\`\`

### 2. Usar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

\`\`\`
VITE_API_BASE_URL=https://tu-backend.com/api
\`\`\`

Las variables de entorno tienen prioridad sobre los valores definidos en el archivo de configuración.

## Verificación de Conexión

La aplicación verifica automáticamente la conexión con el backend:

1. Al iniciar la aplicación
2. Cada 30 segundos
3. Manualmente al hacer clic en el botón de actualización

El estado de la conexión se muestra en la parte superior del panel de administración.

## Endpoints Principales

El backend debe proporcionar los siguientes endpoints:

- `/health` - Para verificar el estado del backend
- `/auth/login` - Para autenticación
- `/products` - Para gestión de productos
- `/carts` - Para gestión de carritos
- `/users` - Para gestión de usuarios

## Solución de Problemas

Si tienes problemas de conexión:

1. Verifica que el backend esté en ejecución
2. Comprueba que la URL configurada sea correcta
3. Asegúrate de que el backend tenga CORS configurado correctamente
4. Revisa la consola del navegador para ver errores específicos

## Configuración de CORS en el Backend

Si estás desarrollando el backend, asegúrate de configurar CORS para permitir solicitudes desde el frontend:

\`\`\`javascript
// Ejemplo para Express.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));
\`\`\`

## Entornos

### Desarrollo
\`\`\`
VITE_API_BASE_URL=http://localhost:8080/api
\`\`\`

### Producción
\`\`\`
VITE_API_BASE_URL=https://api.tudominio.com
\`\`\`

### Testing
\`\`\`
VITE_API_BASE_URL=https://api-test.tudominio.com
