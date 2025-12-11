import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { CartItem } from '../types'
import { useToast } from '../ui/ToastContext'

export const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [placing, setPlacing] = useState(false)
  const { showError, showSuccess, showInfo } = useToast()

  const [lastIncrementTs, setLastIncrementTs] = useState<number | null>(null)
  const loadCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<CartItem[]>('/cart')
      setItems(res.data)
      // если какие‑то выбранные элементы исчезли – очищаем выбор
      setSelectedIds(prev => {
        const next = new Set<number>()
        for (const it of res.data) {
          if (prev.has(it.id)) next.add(it.id)
        }
        return next
      })
    } catch (err) {
      setError('Не удалось загрузить корзину')
      showError('Не удалось загрузить корзину')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(items.map(i => i.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const total = useMemo(
    () =>
      items
        .filter(i => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items, selectedIds]
  )

  const selectedCount = useMemo(
    () =>
      items
        .filter(i => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.quantity, 0),
    [items, selectedIds]
  )

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await api.post(`/cart/set/${productId}?quantity=${quantity}`)
      await loadCart()
    } catch {
      showError('Ошибка при обновлении количества')
    }
  }

  const removeItem = async (productId: number) => {
    try {
      await api.delete(`/cart/remove/${productId}`)
      await loadCart()
    } catch {
      showError('Ошибка при удалении товара из корзины')
    }
  }
  const handleIncrement = (productId: number, currentQuantity: number, maxStock: number) => {
    const now = Date.now()
    if (lastIncrementTs && now - lastIncrementTs < 1000) {
      showInfo('Слишком часто изменяете количество. Подождите секунду.')
      return
    }
    if (currentQuantity >= maxStock) {
      showInfo('Нельзя добавить больше, чем есть на складе')
      return
    }
    setLastIncrementTs(now)
    updateQuantity(productId, currentQuantity + 1)
  }


  const openOrderModal = () => {
    if (selectedIds.size === 0) {
      showInfo('Выберите хотя бы один товар для оформления заказа')
      return
    }
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    if (placing) return
    setShowOrderModal(false)
  }

  const placeOrder = async () => {
    if (selectedIds.size === 0) {
      showInfo('Выберите товары для оформления')
      return
    }

    setPlacing(true)
    try {
      const ids = Array.from(selectedIds)
      await api.post('/orders', {
        cartItemIds: ids
      })
      showSuccess('Заказ успешно оформлен')
      setShowOrderModal(false)
      setSelectedIds(new Set())
      await loadCart()
    } catch {
      showError('Не удалось оформить заказ')
    } finally {
      setPlacing(false)
    }
  }

  const isAllSelected = items.length > 0 && selectedIds.size === items.length

  return (
    <div>
      <h1 className="h4 mb-3">Корзина</h1>

      {loading && items.length === 0 && <p>Загрузка...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && items.length === 0 && (
        <p>Корзина пуста.</p>
      )}

      {items.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 me-3"
                onClick={isAllSelected ? clearSelection : selectAll}
              >
                {isAllSelected ? 'Снять выделение' : 'Выделить всё'}
              </button>
              <span className="text-muted">
                Товары в корзине: {items.length}
              </span>
            </div>
          </div>

          <div className="list-group mb-3">
            {items.map(item => (
              <div
                key={item.id}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center"
              >
                <div className="d-flex align-items-start">
                  <input
                    type="checkbox"
                    className="form-check-input me-2 mt-1"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <div>
                    <div className="fw-semibold">{item.product.name}</div>
                    <div className="text-muted small">
                      Цена: {item.product.price.toFixed(2)} ₽
                    </div>
                    <div className="text-muted small">
                      В корзине: {item.quantity} шт.
                    </div>
                  </div>
                </div>
                <div className="mt-2 mt-md-0 d-flex align-items-center">
                  <div className="input-group input-group-sm me-2" style={{ maxWidth: '130px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="form-control text-center"
                      value={item.quantity}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '')
                        const raw = digits === '' ? 0 : Number(digits)
                        const next = Math.min(item.product.stock, Math.max(0, raw))
                        updateQuantity(item.product.id, next)
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleIncrement(item.product.id, item.quantity, item.product.stock)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeItem(item.product.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div className="mb-2 mb-md-0">
                <div>
                  Итого: <strong>{total.toFixed(2)} ₽</strong>
                </div>
                <div className="text-muted small">
                  Выбрано товаров: {selectedCount}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-success"
                onClick={openOrderModal}
                disabled={selectedIds.size === 0}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </>
      )}

      {showOrderModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Подтверждение заказа</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeOrderModal}
                    disabled={placing}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Оформить заказ на{' '}
                    <strong>{selectedCount}</strong> товар(ов) на сумму{' '}
                    <strong>{total.toFixed(2)} ₽</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeOrderModal}
                    disabled={placing}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={placeOrder}
                    disabled={placing}
                  >
                    {placing ? 'Оформляем...' : 'Подтвердить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}