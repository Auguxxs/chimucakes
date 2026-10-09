import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, updateOrder, createOrder } from '../services/airtableService'
import OrderStats from '../components/OrderStats'

const STATUS_LIST = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']

const STATUS_COLORS = {
  'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'En preparación': 'bg-blue-100 text-blue-800 border-blue-300',
  'Listo': 'bg-green-100 text-green-800 border-green-300',
  'Entregado': 'bg-gray-100 text-gray-800 border-gray-300',
  'Cancelado': 'bg-red-100 text-red-800 border-red-300',
}

function isDeliveryNear(deliveryDate) {
  if (!deliveryDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const delivery = new Date(deliveryDate + 'T00:00:00')
  const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24))
  return diffDays <= 2 && diffDays >= 0
}

function isToday(dateStr) {
  if (!dateStr) return false
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function isTomorrow(dateStr) {
  if (!dateStr) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateStr === tomorrow.toISOString().split('T')[0]
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const weekEnd = new Date()
  weekEnd.setDate(today.getDate() + 7)
  return date >= today && date <= weekEnd
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-verde' : 'bg-red-500'

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-white shadow-lg ${bgColor} animate-slide-up`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">×</button>
      </div>
    </div>
  )
}

function OrderModal({ order, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    customerName: order?.customerName || '',
    phone: order?.phone || '',
    address: order?.address || '',
    deliveryDate: order?.deliveryDate || '',
    itemsText: order?.itemsText || '',
    total: order?.total || '',
    status: order?.status || 'Pendiente',
    notes: order?.notes || '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, total: Number(form.total) || 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-oscuro/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-crema p-6 shadow-2xl">
        <h2 className="font-display text-xl font-bold text-marron">
          {order ? 'Editar Pedido' : 'Nuevo Pedido'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Nombre del cliente *</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Teléfono *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Dirección de entrega *</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Fecha de entrega *</label>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Items del pedido *</label>
            <textarea
              name="itemsText"
              value={form.itemsText}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Ej: 2x Tarta Chocolate (16cm), 1x Budín Banana"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-marron">Total *</label>
              <input
                type="number"
                name="total"
                value={form.total}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-marron">Estado</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-oscuro border-t-transparent" />
                  Guardando...
                </span>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderCard({ order, onStatusChange, onEdit, loadingId }) {
  const nearDelivery = isDeliveryNear(order.deliveryDate)
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '5493794689777'
  const isLoading = loadingId === order.id

  const handleWhatsApp = () => {
    const message = `Hola ${order.customerName}, soy de ChimuCakes. Consulto sobre tu pedido (${order.itemsText}) con entrega ${order.deliveryDate}.`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className={`card p-5 border-l-4 ${nearDelivery ? 'border-l-lima' : 'border-l-transparent'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-marron">{order.customerName}</h3>
          <p className="text-sm text-marron/70">{order.phone}</p>
          <p className="text-sm text-marron/60">{order.address}</p>
        </div>
        <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </span>
      </div>

      {/* Delivery date */}
      {order.deliveryDate && (
        <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${nearDelivery ? 'bg-lima/20 text-verde font-medium' : 'bg-crema text-marron/70'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Entrega: {order.deliveryDate}</span>
          {nearDelivery && <span className="ml-auto rounded-full bg-lima px-2 py-0.5 text-xs font-bold text-oscuro">¡Próxima!</span>}
        </div>
      )}

      {/* Items */}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-marron/50">Items</p>
        <p className="mt-1 text-sm text-oscuro">{order.itemsText}</p>
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-verde">${order.total?.toLocaleString('es-AR')}</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          disabled={isLoading}
          className="input-field flex-1 disabled:opacity-50"
        >
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => onEdit(order)}
          disabled={isLoading}
          className="btn-secondary whitespace-nowrap px-4 py-2 text-sm disabled:opacity-50"
        >
          Editar
        </button>
        <button
          onClick={handleWhatsApp}
          className="btn-whatsapp whitespace-nowrap px-4 py-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </div>
  )
}

function Admin() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [dateFilter, setDateFilter] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('[Admin] Error cargando pedidos:', err)
      showToast('Error al cargar pedidos', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('adminUser')
    navigate('/login')
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setLoadingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      showToast(`Estado actualizado a "${newStatus}"`)
    } catch (err) {
      console.error('Error actualizando estado:', err)
      showToast('Error al actualizar estado', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const handleOpenCreate = () => {
    setEditingOrder(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (order) => {
    setEditingOrder(order)
    setModalOpen(true)
  }

  const handleSaveOrder = async (formData) => {
    setSaving(true)
    try {
      if (editingOrder) {
        // Actualizar pedido existente
        await updateOrder(editingOrder.id, formData)
        setOrders((prev) =>
          prev.map((o) => (o.id === editingOrder.id ? { ...o, ...formData } : o))
        )
        showToast('Pedido actualizado correctamente')
      } else {
        // Crear nuevo pedido
        const result = await createOrder(formData)
        const newOrder = {
          id: result.id,
          ...formData,
          date: new Date().toISOString(),
        }
        setOrders((prev) => [newOrder, ...prev])
        showToast('Pedido creado correctamente')
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Error guardando pedido:', err)
      showToast('Error al guardar pedido', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'Todos' && order.status !== statusFilter) return false
      if (dateFilter === 'Hoy' && !isToday(order.deliveryDate)) return false
      if (dateFilter === 'Mañana' && !isTomorrow(order.deliveryDate)) return false
      if (dateFilter === 'Esta semana' && !isThisWeek(order.deliveryDate)) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchName = order.customerName?.toLowerCase().includes(query)
        const matchPhone = order.phone?.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }
      return true
    })
  }, [orders, statusFilter, dateFilter, searchQuery])

  const statusCounts = useMemo(() => {
    const counts = { Todos: orders.length }
    STATUS_LIST.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length
    })
    return counts
  }, [orders])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <OrderModal
          order={editingOrder}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveOrder}
          loading={saving}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-oscuro">Panel de Pedidos</h1>
          <p className="mt-1 text-marron/60">Gestioná el estado de los pedidos</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleOpenCreate} className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Pedido
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-marron/50 underline hover:text-marron self-center"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <OrderStats orders={orders} />

      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="input-field"
        />
      </div>

      {/* Filtros de estado */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['Todos', ...STATUS_LIST].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-rosa text-oscuro shadow-md'
                : 'bg-white text-marron hover:bg-rosaClaro'
            }`}
          >
            {s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Filtros de fecha */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['Todos', 'Hoy', 'Mañana', 'Esta semana'].map((f) => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              dateFilter === f
                ? 'bg-verde text-white'
                : 'bg-white text-marron hover:bg-verde/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rosa border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-marron/60">No hay pedidos que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin
