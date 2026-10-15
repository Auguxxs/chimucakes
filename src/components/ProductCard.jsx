import { useState } from 'react'
import { useCart } from '../context/CartContext'

const DIET_CATEGORIES = ['Budines', 'Tortas']

function getDietLabel(sinAzucar, sinGluten) {
  if (sinAzucar && sinGluten) return 'Sin Azúcar y Sin Gluten'
  if (sinAzucar) return 'Sin Azúcar'
  if (sinGluten) return 'Sin Gluten'
  return ''
}

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [sinAzucar, setSinAzucar] = useState(false)
  const [sinGluten, setSinGluten] = useState(false)

  const hasVariantes = product.variantes && product.variantes.length > 0
  const hasDietOptions = DIET_CATEGORIES.includes(product.category)
  const currentPrice = hasVariantes
    ? product.variantes[selectedVariant].precio
    : product.price

  const dietLabel = getDietLabel(sinAzucar, sinGluten)

  const handleAdd = () => {
    const item = {
      ...product,
      dietOptions: hasDietOptions ? { sinAzucar, sinGluten } : null,
      dietLabel: hasDietOptions ? dietLabel : '',
    }
    if (hasVariantes) {
      item.selectedSize = product.variantes[selectedVariant].tamano
      item.finalPrice = product.variantes[selectedVariant].precio
    }
    addToCart(item)
    // Reset diet options after adding
    setSinAzucar(false)
    setSinGluten(false)
    setSelectedVariant(0)
  }

  return (
    <div className="card group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-lima px-3 py-1 text-xs font-semibold text-oscuro">
          {product.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-marron">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-marron/70 line-clamp-2">
          {product.description}
        </p>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-rosaClaro px-2 py-0.5 text-xs text-marron"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Selector de tamaño */}
        {hasVariantes && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-marron/70">
              Tamaño:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variantes.map((variante, idx) => (
                <button
                  key={variante.tamano}
                  onClick={() => setSelectedVariant(idx)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedVariant === idx
                      ? 'bg-rosa text-oscuro shadow-sm'
                      : 'bg-rosaClaro/50 text-marron hover:bg-rosaClaro'
                  }`}
                >
                  {variante.tamano}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkboxes de dieta */}
        {hasDietOptions && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-marron/70">
              Opciones de dieta:
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-marron">
                <input
                  type="checkbox"
                  checked={sinAzucar}
                  onChange={(e) => setSinAzucar(e.target.checked)}
                  className="h-4 w-4 accent-rosa"
                />
                Sin Azúcar
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-marron">
                <input
                  type="checkbox"
                  checked={sinGluten}
                  onChange={(e) => setSinGluten(e.target.checked)}
                  className="h-4 w-4 accent-rosa"
                />
                Sin Gluten
              </label>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-verde">
            ${currentPrice.toLocaleString('es-AR')}
          </span>
          <button
            onClick={handleAdd}
            className="rounded-full bg-rosa px-4 py-2 text-sm font-medium text-oscuro transition hover:bg-rosaClaro active:scale-95"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
