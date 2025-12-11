import React, { useEffect, useState } from 'react'
import { api } from '../api'
import type { Order } from '../types'
import { useToast } from '../ui/ToastContext'

function formatDate (iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ru-RU')
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<Order[]>('/orders')
      setOrders(res.data)
    } catch (err) {
      const msg = 'Не удалось загрузить заказы'
      setError(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <h1 className="h5 mb-3">Мои заказы</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p>У вас ещё нет оформленных заказов.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{o.totalPrice.toFixed(2)} ₽</td>
                      <td>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
