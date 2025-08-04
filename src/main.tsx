import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import "./styles/admin-theme.css" // Importamos los estilos del admin
import { Toaster } from "react-hot-toast"
import { NotificationProvider } from "./contexts/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
      <Toaster position="top-center" reverseOrder={false} />
    </NotificationProvider>
  </React.StrictMode>,
)
