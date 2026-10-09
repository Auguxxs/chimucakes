import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartModal() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, totalPrice } = useCart()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-oscuro/50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-crema shadow-2xl">
        <div className="flex items-center justify-between border-b border-marron/10 p-6">
          <h2 className="font-display text-xl font-bold text-marron">Tu Pedido</h2>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-marron transition hover:bg-marron/10"
            aria-label="Cerrar carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-lg text-marron/60">Tu carrito está vacío</p>
              <button onClick={closeCart} className="mt-4 text-rosa underline">
                Volver al catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.finalPrice || item.price
                return (
                  <div key={item.cartKey} className="flex gap-4 rounded-xl bg-white p-3 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-marron">{item.name}</h4>
                          {item.selectedSize && (
                            <span className="text-xs text-marron/60">
                              Tamaño: {item.selectedSize}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          className="text-marron/40 hover:text-red-500"
                          aria-label="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-rosaClaro text-marron hover:bg-rosa"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-rosaClaro text-marron hover:bg-rosa"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-verde">
                          ${(price * item.quantity).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-marron/10 p-6">
            <div className="mb-4 flex justify-between text-lg font-bold">
              <span className="text-marron">Total</span>
              <span className="text-verde">${totalPrice.toLocaleString('es-AR')}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full"
            >
              Confirmar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal
