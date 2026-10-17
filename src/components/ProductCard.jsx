import { useState } from 'react'
import { useCart } from '../context/CartContext'

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
  const [selectedAdicionales, setSelectedAdicionales] = useState([])

  const hasVariantes = product.variantes && product.variantes.length > 0
  const hasAdicionales = product.adicionales && product.adicionales.length > 0

  // Evaluación defensiva de permite_sin_gluten y permite_sin_azucar desde Airtable
  const permiteSinGluten = Boolean(
    product.permite_sin_gluten === true ||
    product.permite_sin_gluten === 'true' ||
    String(product.permite_sin_gluten).toLowerCase() === 'true' ||
    (Array.isArray(product.permite_sin_gluten) && product.permite_sin_gluten[0] === true) ||
    product.fields?.permite_sin_gluten === true ||
    product.fields?.permite_sin_gluten === 'true'
  )
  const permiteSinAzucar = Boolean(
    product.permite_sin_azucar === true ||
    product.permite_sin_azucar === 'true' ||
    String(product.permite_sin_azucar).toLowerCase() === 'true' ||
    (Array.isArray(product.permite_sin_azucar) && product.permite_sin_azucar[0] === true) ||
    product.fields?.permite_sin_azucar === true ||
    product.fields?.permite_sin_azucar === 'true'
  )

  // Lectura dinámica de badge_texto desde Airtable (múltiples variaciones de columna)
  const badgeTexto = Boolean(
    product.badge_texto ||
    product['badge_texto'] ||
    product['Etiqueta'] ||
    product['badge'] ||
    product.fields?.badge_texto ||
    product.fields?.Etiqueta ||
    product.fields?.badge
  ) ? (
    product.badge_texto ||
    product['badge_texto'] ||
    product['Etiqueta'] ||
    product['badge'] ||
    product.fields?.badge_texto ||
    product.fields?.Etiqueta ||
    product.fields?.badge
  ) : ''

  const basePrice = hasVariantes
    ? product.variantes[selectedVariant].precio
    : product.price

  const adicionalesTotal = selectedAdicionales.reduce((sum, idx) => {
    return sum + (product.adicionales?.[idx]?.precio || 0)
  }, 0)

  const currentPrice = basePrice + adicionalesTotal

  const dietLabel = getDietLabel(sinAzucar, sinGluten)

  const toggleAdicional = (idx) => {
    setSelectedAdicionales((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const handleAdd = () => {
    const item = {
      ...product,
      dietOptions: {
        sinAzucar,
        sinGluten,
      },
      dietLabel,
      cookingType: cookingType || null,
      selectedAdicionales: hasAdicionales ? selectedAdicionales.map((idx) => product.adicionales[idx]) : [],
      adicionalesLabel: hasAdicionales
        ? selectedAdicionales.map((idx) => product.adicionales[idx].nombre).join(' + ')
        : '',
    }
    if (hasVariantes) {
      item.selectedSize = product.variantes[selectedVariant].tamano
      item.finalPrice = currentPrice
    }
    addToCart(item)
    // Reset options after adding
    setSinAzucar(false)
    setSinGluten(false)
    setSelectedVariant(0)
    setCookingType('Horneado')
    setSelectedAdicionales([])
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
        {badgeTexto && (
          <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border-2 border-emerald-500 font-bold px-3 py-1 rounded-lg text-xs md:text-sm shadow-sm my-1.5">
            {badgeTexto}
          </div>
        )}
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

        {/* Adicionales */}
        {hasAdicionales && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-marron/70">
              Adicionales:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.adicionales.map((adicional, idx) => (
                <button
                  key={adicional.nombre}
                  onClick={() => toggleAdicional(idx)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    selectedAdicionales.includes(idx)
                      ? 'bg-lima text-oscuro shadow-sm'
                      : 'bg-crema text-marron hover:bg-lima/30'
                  }`}
                >
                  {adicional.nombre} (+${adicional.precio.toLocaleString('es-AR')})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variantes (toggle individuales, independientes de categorías y tamaños) */}
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-marron/70">
            Variantes:
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Sin Azúcar */}
            {permiteSinAzucar ? (
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
            ) : null}

            {/* Sin Gluten */}
            {permiteSinGluten ? (
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
            ) : null}
          </div>
        </div>

        {/* Tipo de cocción (solo Chipá si tiene variantes) */}
        {hasVariantes && product.category === 'Chipas' && (
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
