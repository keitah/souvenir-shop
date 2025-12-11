import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (path: string) =>
    'nav-link' + (isActive(path) ? ' active fw-semibold text-primary' : '')

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          Keita
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={navLinkClass('/')} to="/">Главная</Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass('/cart')} to="/cart">Корзина</Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/orders')} to="/orders">Мои заказы</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <Link className={navLinkClass('/admin/products')} to="/admin/products">
                  Админ-панель
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass('/login')} to="/login">Вход</Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/register')} to="/register">Регистрация</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger btn-sm ms-lg-2 mt-2 mt-lg-0"
                  onClick={handleLogout}
                  type="button"
                >
                  Выйти
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
