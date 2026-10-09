import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/airtableService'

function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
    deliveryDate: '',
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const generateWhatsAppMessage = () => {
    const itemsText = items
      .map((item) => {
        const price = item.finalPrice || item.price
        const sizeLabel = item.selectedSize ? ` (${item.selectedSize})` : ''
        return `• ${item.quantity}x ${item.name}${sizeLabel} — $${(price * item.quantity).toLocaleString('es-AR')}`
      })
      .join('\n')

    return `🌱 *Nuevo Pedido — ChimuCakes* 🌱

*Cliente:* ${form.customerName}
*Teléfono:* ${form.phone}
*Dirección/Retiro:* ${form.address}
*Fecha de Entrega:* ${form.deliveryDate}
${form.notes ? `*Notas:* ${form.notes}` : ''}

*Pedido:*
${itemsText}

*Total: $${totalPrice.toLocaleString('es-AR')}*

¡Gracias por su pedido! 🌿`
  }

  const getMinDate = () => {
    const min = new Date()
    min.setDate(min.getDate() + 2)
    return min.toISOString().split('T')[0]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.customerName || !form.phone || !form.address || !form.deliveryDate) {
      setError('Completá todos los campos obligatorios')
      return
    }

    setSending(true)

    const itemsText = items
      .map((item) => {
        const sizeLabel = item.selectedSize ? ` (${item.selectedSize})` : ''
        return `${item.quantity}x ${item.name}${sizeLabel}`
      })
      .join(', ')

    try {
      // Registrar en Airtable (o fallback local)
      await createOrder({
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        itemsText,
        total: totalPrice,
        deliveryDate: form.deliveryDate,
      })

      // Abrir WhatsApp
      const message = generateWhatsAppMessage()
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '5491123456789'
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')

      clearCart()
      navigate('/')
    } catch (err) {
      setError('Hubo un error al procesar el pedido. Intentá nuevamente.')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-marron">Tu carrito está vacío</h1>
        <p className="mt-2 text-marron/60">Agregá productos antes de confirmar el pedido</p>
        <button onClick={() => navigate('/catalogo')} className="btn-primary mt-6">
          Ir al Catálogo
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-oscuro">Confirmar Pedido</h1>
      <p className="mt-2 text-marron/60">
        Completá tus datos y enviá el pedido por WhatsApp
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="card p-6">
          <h2 className="font-display text-xl font-semibold text-marron">Tus Datos</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-marron">
                Nombre completo *
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="María García"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-marron">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="11 5555-1234"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-marron">
                Dirección de entrega o retiro *
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Av. Corrientes 1234, CABA o Retiro en local"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-marron">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={handleChange}
                min={getMinDate()}
                className="input-field"
                required
              />
              <p className="mt-1 text-xs text-marron/50">
                Mínimo 48 horas a partir de hoy
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-marron">
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Alergias, preferencias, dedicatoria..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="btn-whatsapp mt-6 w-full disabled:opacity-50"
          >
            {sending ? (
              'Enviando...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar por WhatsApp
              </>
            )}
          </button>
        </form>

        {/* Resumen */}
        <div className="card h-fit p-6">
          <h2 className="font-display text-xl font-semibold text-marron">Resumen del Pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const price = item.finalPrice || item.price
              return (
                <div key={item.cartKey} className="flex justify-between text-sm">
                  <div>
                    <span className="text-marron">
                      {item.quantity}x {item.name}
                    </span>
                    {item.selectedSize && (
                      <span className="ml-1 text-xs text-marron/50">
                        ({item.selectedSize})
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-oscuro">
                    ${(price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-marron/10 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-marron">Total</span>
              <span className="text-verde">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
