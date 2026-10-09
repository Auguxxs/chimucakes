import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartContext = createContext()

// Genera un ID único por producto + variante
const getItemKey = (item) => {
  return item.selectedSize ? `${item.id}-${item.selectedSize}` : item.id
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = useCallback((product) => {
    const key = getItemKey(product)
    setItems((prev) => {
      const existing = prev.find((item) => getItemKey(item) === key)
      if (existing) {
        return prev.map((item) =>
          getItemKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1, cartKey: key }]
    })
    setIsCartOpen(true)
  }, [])

  const removeFromCart = useCallback((cartKey) => {
    setItems((prev) => prev.filter((item) => item.cartKey !== cartKey))
  }, [])

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.cartKey !== cartKey))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => {
      const price = item.finalPrice || item.price
      return sum + price * item.quantity
    }, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      totalItems,
      totalPrice,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, openCart, closeCart, totalItems, totalPrice]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
