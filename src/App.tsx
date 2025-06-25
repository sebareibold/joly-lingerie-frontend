import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import PublicLayout from "./layouts/PublicLayout"
import AdminLayout from "./layouts/AdminLayout"
import ProtectedRoute from "./components/admin/ProtectedRoute"
import ScrollToTop from "./components/utils/ScrollToTop"

// Public pages
import HomePage from "./pages/public/HomePage"
import ProductDetail from "./pages/public/ProductDetail"
import CategoryPage from "./pages/public/CategoryPage"
import CartPage from "./pages/public/CartPage"
import CheckoutPage from "./pages/public/CheckoutPage"
import OrderConfirmationPage from "./pages/public/OrderConfirmationPage"
import OrderTrackingPage from "./pages/public/OrderTrackingPage"

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminProductForm from "./pages/admin/AdminProductForm"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminAdvertising from "./pages/admin/AdminAdvertising"
import AdminContent from "./pages/admin/AdminContent"

import "./App.css"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="category/:category" element={<CategoryPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
              <Route path="track-order" element={<OrderTrackingPage />} />
            </Route>

            {/* Ruta de Login Admin (fuera del layout protegido) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Rutas de Admin Protegidas */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              {/* CORREGIDO: Cambiar la ruta para que coincida con el enlace */}
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="advertising" element={<AdminAdvertising />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Ruta 404 - Redirección */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
