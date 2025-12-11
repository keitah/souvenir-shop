import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../ui/ToastContext'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      showSuccess('Вы успешно вошли')
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data || 'Ошибка авторизации'
      setError(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="card shadow-sm">
          <div className="row g-0">
            <div className="col-12 col-md-6 d-flex flex-column justify-content-center p-4 bg-light border-end">
              <h1 className="h3 mb-3 text-primary">Keita</h1>
              <p className="small text-muted">
                Добро пожаловать в Keita — ваш онлайн-магазин сувениров.
                Войдите в аккаунт, чтобы просматривать корзину и оформлять заказы.
              </p>
            </div>
            <div className="col-12 col-md-6">
              <div className="p-4">
                <h2 className="h5 mb-3">Вход</h2>
                <form onSubmit={handleSubmit} className="mb-3">
                  <div className="mb-3">
                    <label className="form-label small">E-mail</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Пароль</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-danger small mb-2">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 btn-sm"
                  >
                    {loading ? 'Входим...' : 'Войти'}
                  </button>
                </form>
                <p className="small mb-0">
                  Нет аккаунта?{' '}
                  <Link to="/register">Зарегистрироваться</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
