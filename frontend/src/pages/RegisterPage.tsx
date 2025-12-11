import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../ui/ToastContext'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!emailRegex.test(username)) {
      const msg = 'Введите корректный E-mail'
      setError(msg)
      showError(msg)
      return
    }

    if (password.length < 6) {
      const msg = 'Пароль должен быть не менее 6 символов'
      setError(msg)
      showError(msg)
      return
    }

    if (password !== password2) {
      const msg = 'Пароли не совпадают'
      setError(msg)
      showError(msg)
      return
    }

    setLoading(true)
    try {
      await register(username, password)
      showSuccess('Регистрация успешна, вы вошли в аккаунт')
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data || 'Ошибка регистрации'
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
                Создайте аккаунт Keita, чтобы сохранять корзину, оформлять заказы
                и управлять своими покупками сувениров.
              </p>
            </div>
            <div className="col-12 col-md-6">
              <div className="p-4">
                <h2 className="h5 mb-3">Регистрация</h2>
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
                  <div className="mb-3">
                    <label className="form-label small">Повтор пароля</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={password2}
                      onChange={e => setPassword2(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-danger small mb-2">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 btn-sm"
                  >
                    {loading ? 'Создаём...' : 'Зарегистрироваться'}
                  </button>
                </form>
                <p className="small mb-0">
                  Уже есть аккаунт?{' '}
                  <Link to="/login">Войти</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
