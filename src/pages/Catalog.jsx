import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/airtableService'
import { categories } from '../data/products'

function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Todos')

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[Catalog] Error cargando productos:', err)
        setError(err.message || 'Error desconocido al cargar productos')
        setLoading(false)
      })
  }, [])

  const filtered =
    activeCategory === 'Todos'
      ? products
      : products.filter((p) => {
          const prodCat = (p.categoria || p.category || '').toLowerCase().trim()
          const activeCat = activeCategory.toLowerCase().trim()
          return prodCat === activeCat
        })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-oscuro">Nuestro Catálogo</h1>
        <p className="mt-2 text-marron/70">
          Todas nuestras creaciones son 100% veganas y artesanales
        </p>
      </div>

      {/* Error visible */}
      {error && (
        <div className="mb-8 rounded-xl border-2 border-red-300 bg-red-50 p-4 text-center">
          <p className="font-medium text-red-700">
            Error de conexión con Airtable: {error}
          </p>
          <p className="mt-1 text-sm text-red-500">
            Verificá la consola para más detalles
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-rosa text-oscuro shadow-md'
                : 'bg-white text-marron hover:bg-rosaClaro'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rosa border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-marron/60">No se pudieron cargar los productos</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalog
