import { useState, useEffect } from 'react'
import { getNosotrosData } from '../services/airtableService'

function About() {
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getNosotrosData()
      .then((data) => {
        setSecciones(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[About] Error cargando datos:', err)
        setError('No se pudieron cargar los datos de la sección Nosotros')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="animate-spin rounded-full h-10 w-12 border-b-2 border-rosa"></div>
      </div>
    )
  }

  if (error && secciones.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-oscuro">Nuestra Historia</h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-rosa" />
        <div className="mt-12 rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-marron/60">{error}</p>
        </div>
      </div>
    )
  }

  const seccionEquipo = secciones.find((s) => s.tipo === 'equipo')
  const seccionCompromiso = secciones.find((s) => s.tipo === 'compromiso')
  const seccionFilosofia = secciones.find((s) => s.tipo === 'filosofia')
  const seccionFirma = secciones.find((s) => s.tipo === 'firma')

  const imagenUrl =
    seccionEquipo?.imagen || 'https://placehold.co/600x400/faf6f2/6d544f?text=ChimuCakes'

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-oscuro md:text-5xl">
          Nuestra Historia
        </h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-rosa" />
      </div>

      {/* Sección: Equipo de Chimu con imagen decorativa */}
      <div className="mb-16 card p-8 md:p-12 rounded-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold text-marron">
              {seccionEquipo?.titulo || 'Equipo de Chimu'}
            </h2>
            <div className="whitespace-pre-line text-marron/80 leading-relaxed text-lg">
              {seccionEquipo?.contenido || ''}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={imagenUrl}
              alt="Equipo ChimuCakes"
              className="w-full h-auto object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-rosa/20" />
          </div>
        </div>
      </div>

      {/* Sección: Compromiso y filosofía */}
      <div className="mb-12 grid md:grid-cols-2 gap-8">
        <div className="card p-8 rounded-2xl">
          <h2 className="font-display text-2xl font-bold text-marron mb-4">
            {seccionCompromiso?.titulo || 'Nuestro compromiso'}
          </h2>
          <div className="whitespace-pre-line text-marron/80 leading-relaxed">
            {seccionCompromiso?.contenido || ''}
          </div>
        </div>
        <div className="card p-8 rounded-2xl">
          <h2 className="font-display text-2xl font-bold text-marron mb-4">
            {seccionFilosofia?.titulo || 'Nuestra filosofía'}
          </h2>
          <div className="whitespace-pre-line text-marron/80 leading-relaxed">
            {seccionFilosofia?.contenido || ''}
          </div>
        </div>
      </div>

      {/* Firma final */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-rosaClaro to-lima/20 p-8 text-center border border-rosa/40">
        <p className="font-display text-xl font-bold text-marron">
          "{seccionFirma?.contenido || 'Con cariño, Lu, Deli y toda la familia Chimu 🩷'}"
        </p>
      </div>
    </div>
  )
}

export default About
