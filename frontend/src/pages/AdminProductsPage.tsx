import React, { useEffect, useState } from 'react'
import { api } from '../api'
import type { Product } from '../types'
import { useToast } from '../ui/ToastContext'

const emptyProduct: Product = {
  id: 0,
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  stock: 0
}
const MAX_NAME = 63

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lastActionTs, setLastActionTs] = useState<number>(0)
  const { showError, showSuccess } = useToast()

  const showToast = (message: string) => {
    const lower = message.toLowerCase()
    if (lower.includes('ошибка') || lower.includes('не удалось')) {
      showError(message)
    } else {
      showSuccess(message)
    }
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<Product[]>('/admin/products')
      setProducts(res.data)
    } catch (err) {
      setError('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const startCreate = () => {
    setEditing({ ...emptyProduct, id: 0 })
    setFormError(null)
  }

  const startEdit = (p: Product) => {
    setEditing({ ...p })
    setFormError(null)
  }

  const validate = (p: Product): string | null => {
    if (!p.name || !p.name.trim()) return 'Название обязательно'
    if (!p.description || !p.description.trim()) return 'Описание обязательно'
    if (p.price == null || p.price <= 0) return 'Цена должна быть больше 0'
    if (p.price > 10000000000) return 'Цена не может превышать 10 000 000 000 ₽'
    if (p.stock == null || p.stock < 0) return 'Остаток обязателен и не может быть отрицательным'
    if (p.stock > 10000) return 'Остаток не может превышать 10 000 шт.'
    if (!p.imageUrl || !p.imageUrl.trim()) return 'Изображение обязательно'
    return null
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post<{ url: string }>('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setEditing(prev => (prev ? { ...prev, imageUrl: res.data.url } : prev))
      setFormError(null)
      showToast('Изображение загружено', 'success')
    } catch (e) {
      console.error(e)
      showToast('Не удалось загрузить изображение', 'error')
    }
  }

  const save = async () => {
    if (!editing) return
    const now = Date.now()
    if (now - lastActionTs < 1500) {
      setFormError('Слишком часто отправляете запросы, подождите чуть-чуть')
      return
    }
    setLastActionTs(now)
    const validationError = validate(editing)
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)
    setSaving(true)
    try {
      if (editing.id === 0) {
        await api.post('/admin/products', editing)
        showSuccess('Товар создан')
      } else {
        await api.put(`/admin/products/${editing.id}`, editing)
        showSuccess('Товар обновлён')
      }
      setEditing(null)
      await load()
    } catch (err) {
      showError('Ошибка при сохранении товара')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (p: Product) => {
    setProductToDelete(p)
  }

  const cancelDelete = () => {
    if (!deleting) {
      setProductToDelete(null)
    }
  }

  const del = async () => {
    if (!productToDelete) return
    const now = Date.now()
    if (now - lastActionTs < 1500) {
      showError('Слишком часто отправляете запросы, подождите чуть-чуть')
      return
    }
    setLastActionTs(now)
    setDeleting(true)
    try {
      await api.delete(`/admin/products/${productToDelete.id}`)
      showSuccess('Товар удалён')
      setProductToDelete(null)
      await load()
    } catch (err) {
      showError('Ошибка при удалении товара')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h5 mb-0">Админ-панель: товары</h1>
        <button className="btn btn-sm btn-primary" type="button" onClick={startCreate}>
          Добавить товар
        </button>
      </div>
      {loading && <p>Загрузка...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price.toFixed(2)} ₽</td>
                  <td>{p.stock ?? '-'}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      type="button"
                      onClick={() => startEdit(p)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      type="button"
                      onClick={() => confirmDelete(p)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center small text-muted">
                    Товары пока не созданы.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h2 className="h6 mb-3">{editing.id === 0 ? 'Новый товар' : 'Редактирование товара'}</h2>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small">
                  Название
                  <span className="text-muted ms-1">
                    ({editing.name.length} / {MAX_NAME} символов)
                  </span>
                </label>
                <input
                  className="form-control form-control-sm"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value.slice(0, MAX_NAME) })}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small">Цена</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editing.price}
                  onChange={e => {
                  const raw = Number(e.target.value)
                  const value = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 10000000000) : 0
                  setEditing({ ...editing, price: value })
                }}
                  min={0}
                  max={10000000000}
                  step="0.01"
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small">Остаток</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editing.stock ?? 0}
                  onChange={e => {
                  const raw = Number(e.target.value)
                  const value = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 10000) : 0
                  setEditing({ ...editing, stock: value })
                }}
                  min={0}
                  max={10000}
                />
              </div>
              <div className="col-12">
                <label className="form-label small">Изображение</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void handleImageUpload(file)
                    }
                  }}
                />
                {editing.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={editing.imageUrl}
                      alt={editing.name || 'Предпросмотр'}
                      style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label small">
                  Описание{' '}
                  <span className="text-muted">
                    ({(editing.description?.length ?? 0)} / 2000&nbsp;символов)
                  </span>
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  maxLength={2000}
                  value={editing.description ?? ''}
                  onChange={e =>
                    setEditing({
                      ...editing,
                      description: e.target.value.slice(0, 2000)
                    })
                  }
                />
              </div>
            </div>
            {formError && <p className="text-danger small mt-2 mb-0">{formError}</p>}
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Отмена
              </button>
              <button
                className="btn btn-sm btn-success"
                type="button"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Удаление товара</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={cancelDelete}
                  disabled={deleting}
                />
              </div>
              <div className="modal-body">
                <p>
                  Удалить товар «<strong>{productToDelete.name}</strong>»?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={del}
                  disabled={deleting}
                >
                  {deleting ? 'Удаляем...' : 'Удалить'}
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