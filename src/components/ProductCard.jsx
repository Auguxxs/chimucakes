import { useState } from 'react'
import { useCart } from '../context/CartContext'

const DIET_CATEGORIES = ['Budines', 'Tortas', 'Cheesecakes']
const CHIPA_CATEGORY = 'Chipas'
const VASCO_PRODUCT = 'Cheesecake Vasco'

// Normaliza texto: minúsculas y sin acentos
function normalizeText(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

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
  const [cookingType, setCookingType] = useState('Horneado')

  const hasVariantes = product.variantes && product.variantes.length > 0
  const hasDietOptions = DIET_CATEGORIES.includes(product.category)
  const isChipa = product.category === CHIPA_CATEGORY
  const isVasco = product.name === VASCO_PRODUCT
  const nombreNormalizado = String(product.nombre || product.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const isChaja = nombreNormalizado.includes('chaja')

  console.log('Producto actual:', product.nombre || product.name, '| Es Chajá:', isChaja)

  // Forzar sinAzucar a false si es Torta Chajá
  const effectiveSinAzucar = isChaja ? false : sinAzucar

  const currentPrice = hasVariantes
    ? product.variantes[selectedVariant].precio
    : product.price

  const dietLabel = getDietLabel(effectiveSinAzucar, sinGluten)

  const handleAdd = () => {
    const item = {
      ...product,
      dietOptions: hasDietOptions ? { sinAzucar: effectiveSinAzucar, sinGluten } : null,
      dietLabel: hasDietOptions ? dietLabel : '',
      cookingType: isChipa ? cookingType : null,
    }
    if (hasVariantes) {
      item.selectedSize = product.variantes[selectedVariant].tamano
      item.finalPrice = product.variantes[selectedVariant].precio
    }
    if (isChipa) {
      item.selectedSize = `${product.variantes[selectedVariant].tamano} (${cookingType})`
    }
    addToCart(item)
    // Reset options after adding
    setSinAzucar(false)
    setSinGluten(false)
    setSelectedVariant(0)
    setCookingType('Horneado')
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
        <p className="mt-2 text-sm text-marron/70">
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

        {/* Tipo de cocción (solo Chipá) */}
        {isChipa && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-marron/70">
              Tipo de cocción:
            </label>
            <div className="flex gap-2">
              {['Horneado', 'Congelado'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCookingType(type)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    cookingType === type
                      ? 'bg-verde text-white shadow-sm'
                      : 'bg-crema text-marron hover:bg-verde/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variantes (checkboxes como pills) */}
        {hasDietOptions && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-marron/70">
              Variantes:
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Sin Azúcar — oculto para Torta Chajá */}
              {!isChaja && (
                <button
                  onClick={() => setSinAzucar(!sinAzucar)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    sinAzucar
                      ? 'bg-rosa text-oscuro shadow-sm'
                      : 'bg-rosaClaro/50 text-marron hover:bg-rosaClaro'
                  }`}
                >
                  Sin Azúcar
                </button>
              )}
              {/* Sin Gluten */}
              {isVasco ? (
                <span className="inline-flex items-center rounded-full bg-verde/20 px-4 py-1.5 text-xs font-medium text-verde cursor-not-allowed" title="El Cheesecake Vasco siempre es sin gluten">
                  Sin Gluten ✓
                </span>
              ) : (
                <button
                  onClick={() => setSinGluten(!sinGluten)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    sinGluten
                      ? 'bg-rosa text-oscuro shadow-sm'
                      : 'bg-rosaClaro/50 text-marron hover:bg-rosaClaro'
                  }`}
                >
                  Sin Gluten
                </button>
              )}
            </div>
            {isVasco && (
              <p className="mt-1 text-xs text-marron/50">
                El Cheesecake Vasco siempre es sin gluten
              </p>
            )}
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
