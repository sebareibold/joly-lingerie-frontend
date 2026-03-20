/*
  ====================  API Service (Mock Mode) ====================

  🧪 MODO PORTFOLIO — Sin conexión a backend real.
  
  Este archivo re-exporta el servicio mock para que todas las 
  importaciones existentes (contexts, pages, components) sigan 
  funcionando sin modificar una sola línea de código.

  Para volver al backend real:
    1. Eliminar este archivo
    2. Renombrar api.real.ts → api.ts

  =========================================================
*/

export { apiService } from "./mockService"
