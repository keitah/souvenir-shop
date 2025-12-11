import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header'
import { ProductsPage } from './pages/ProductsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CartPage } from './pages/CartPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ToastProvider } from './ui/ToastContext'

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductDetailsPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/cart"
      element={
        <PrivateRoute>
          <CartPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <PrivateRoute>
          <OrdersPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/products"
      element={
        <AdminRoute>
          <AdminProductsPage />
        </AdminRoute>
      }
    />
  </Routes>
)

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Header />
          <main className="container pb-5">
            <AppRoutes />
          </main>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
