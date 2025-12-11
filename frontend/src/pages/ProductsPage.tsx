import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Product, CartItem } from '../types'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../ui/ToastContext'

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [inCart, setInCart] = useState<Set<number>>(new Set())
  const [lastAddTs, setLastAddTs] = useState<number>(0)
  const { isAuthenticated } = useAuth()
  const { showError, showSuccess, showInfo } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const prodRes = await api.get<Product[]>('/products')
        setProducts(prodRes.data)
      } catch {
        setError('Не удалось загрузить товары')
        showError('Ошибка при загрузке товаров')
      } finally {
        setLoading(false)
      }

      if (isAuthenticated) {
        try {
          const cartRes = await api.get<CartItem[]>('/cart')
          const ids = new Set<number>(cartRes.data.map(ci => ci.product.id))
          setInCart(ids)
        } catch {
          // игнорируем ошибки корзины (например, 401/403)
          setInCart(new Set())
        }
      } else {
        setInCart(new Set())
      }
    }

    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])


  const addOrGo = async (productId: number) => {
    if (inCart.has(productId)) {
      navigate('/cart')
      return
    }

    if (!isAuthenticated) {
      showInfo('Авторизуйтесь, чтобы добавлять товары в корзину')
      return
    }

    const now = Date.now()
    if (now - lastAddTs < 1500) {
      showInfo('Слишком часто добавляете товары, подождите секунду')
      return
    }
    setLastAddTs(now)

    setAddingId(productId)
    try {
      await api.post(`/cart/add/${productId}?quantity=1`)
      setInCart(prev => {
        const next = new Set(prev)
        next.add(productId)
        return next
      })
      showSuccess('Товар добавлен в корзину')
    } catch {
      showError('Ошибка при добавлении в корзину')
    } finally {
      setAddingId(null)
    }
  }

  if (loading && products.length === 0) {
    return <p className="mt-3">Загрузка...</p>
  }

  if (error) {
    return <p className="mt-3 text-danger">{error}</p>
  }

  return (
    <div>
      <h1 className="h4 mb-3">Каталог</h1>
      {products.length === 0 ? (
        <p className="text-muted">Товары пока не созданы.</p>
      ) : (
        <div className="row g-3">
        {products.map(p => {
          const already = inCart.has(p.id)
          const disabled = addingId === p.id

          return (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
              <div className="card h-100">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    className="card-img-top"
                    alt={p.name}
                    style={{ objectFit: 'cover', height: '180px' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </h5>
                  <p className="card-text mb-2">{p.price.toFixed(2)} ₽</p>
                  {typeof p.stock === 'number' && (
                    <p className="card-text text-muted mb-3">
                      В наличии: {p.stock} шт.
                    </p>
                  )}
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <button
                      onClick={() => addOrGo(p.id)}
                      className="btn btn-sm btn-primary"
                      type="button"
                      disabled={disabled}
                    >
                      {already
                        ? 'Перейти в корзину'
                        : disabled
                          ? 'Добавляем...'
                          : 'В корзину'}
                    </button>
                    <Link
                      to={`/products/${p.id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
