import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { totalItems, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('adminUser')
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `transition-colors hover:text-rosa ${isActive ? 'text-rosa font-semibold' : 'text-marron'}`

  return (
    <header className="sticky top-0 z-40 border-b border-marron/10 bg-crema/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-2xl font-bold text-marron">
          Chimu<span className="text-rosa">Cakes</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={linkClass} end>Inicio</NavLink>
          <NavLink to="/catalogo" className={linkClass}>Catálogo</NavLink>
          <NavLink to="/nosotros" className={linkClass}>Nosotros</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin" className={linkClass}>Admin</NavLink>
              <button
                onClick={handleLogout}
                className="text-sm text-marron/60 underline hover:text-marron transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>Iniciar sesión</NavLink>
          )}
          <button
            onClick={openCart}
            className="relative rounded-full bg-rosa p-2 text-oscuro transition hover:bg-rosaClaro"
            aria-label="Abrir carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-lima text-xs font-bold text-oscuro">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-marron"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-marron/10 bg-crema px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" className={linkClass} end onClick={() => setMobileOpen(false)}>Inicio</NavLink>
            <NavLink to="/catalogo" className={linkClass} onClick={() => setMobileOpen(false)}>Catálogo</NavLink>
            <NavLink to="/nosotros" className={linkClass} onClick={() => setMobileOpen(false)}>Nosotros</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>Admin</NavLink>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="text-left text-sm text-marron/60 underline hover:text-marron"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass} onClick={() => setMobileOpen(false)}>Iniciar sesión</NavLink>
            )}
            <button
              onClick={() => { openCart(); setMobileOpen(false) }}
              className="flex items-center gap-2 text-marron"
            >
              Carrito ({totalItems})
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
