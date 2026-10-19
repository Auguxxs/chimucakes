import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartModal from './components/CartModal'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import About from './pages/About'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Checkout from './pages/Checkout'

function App() {
  const { tiendaCargada } = useCart()

  useEffect(() => {
    // La carga de tienda se maneja dentro de CartProvider
  }, [])

  if (!tiendaCargada) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rosa"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
      <Footer />
      <CartModal />
    </div>
  )
}

export default App
