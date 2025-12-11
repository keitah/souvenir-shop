import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import type { Product, CartItem } from '../types'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../ui/ToastContext'

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [inCart, setInCart] = useState(false)
  const { isAuthenticated } = useAuth()
  const { showError, showSuccess, showInfo } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Product>(`/products/${id}`)
        setProduct(res.data)
      } catch {
        setError('Не удалось загрузить товар')
        showError('Ошибка при загрузке товара')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id, showError])

  useEffect(() => {
    const checkCart = async () => {
      if (!isAuthenticated || !id) {
        setInCart(false)
        return
      }
      try {
        const res = await api.get<CartItem[]>('/cart')
        const pid = Number(id)
        setInCart(res.data.some(ci => ci.product.id === pid))
      } catch {
        // если корзина не загрузилась – просто не трогаем состояние
      }
    }

    void checkCart()
  }, [isAuthenticated, id])

  const addOrGo = async () => {
    if (!product) return

    if (inCart) {
      navigate('/cart')
      return
    }

    if (!isAuthenticated) {
      showInfo('Авторизуйтесь, чтобы добавлять товары в корзину')
      return
    }

    setAdding(true)
    try {
      await api.post(`/cart/add/${product.id}?quantity=1`)
      setInCart(true)
      showSuccess('Товар добавлен в корзину')
    } catch {
      showError('Ошибка при добавлении в корзину')
    } finally {
      setAdding(false)
    }
  }

  if (loading && !product) {
    return <p className="mt-3">Загрузка...</p>
  }

  if (error) {
    return <p className="mt-3 text-danger">{error}</p>
  }

  if (!product) {
    return <p className="mt-3">Товар не найден</p>
  }

  return (
    <div className="row">
      <div className="col-12 col-md-5 mb-3 mb-md-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid rounded"
          />
        ) : (
          <div
            className="bg-light border rounded d-flex align-items-center justify-content-center"
            style={{ height: 240 }}
          >
            <span className="text-muted">Нет изображения</span>
          </div>
        )}
      </div>
      <div className="col-12 col-md-7">
        <h1 className="h4 mb-3">{product.name}</h1>
        <p className="fs-5 mb-3">{product.price.toFixed(2)} ₽</p>
        {product.description && <p className="mb-3 product-description">{product.description}</p>}
        {typeof product.stock === 'number' && (
          <p className="text-muted mb-3">В наличии: {product.stock} шт.</p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={addOrGo}
          disabled={adding}
        >
          {inCart
            ? 'Перейти в корзину'
            : adding
              ? 'Добавляем...'
              : 'Добавить в корзину'}
        </button>
      </div>
    </div>
  )
}
