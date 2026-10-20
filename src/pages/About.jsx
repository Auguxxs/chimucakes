import { useState, useEffect } from 'react'
import { getNosotrosData } from '../services/airtableService'

function About() {
  const [nosotros, setNosotros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getNosotrosData()
      .then((data) => {
        console.log("Datos listos para renderizar en el componente:", data)
        setNosotros(data)
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

  if (error && nosotros.length === 0) {
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-oscuro md:text-5xl">
          Nuestra Historia
        </h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-rosa" />
      </div>

      {nosotros.length > 0 ? (
        <>
          {nosotros.map((item, index) => (
            <div key={item.id || index} className="card p-8 md:p-12 rounded-2xl mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="font-display text-3xl font-bold text-marron">
                    {item.titulo || 'Sin título'}
                  </h2>
                  <div className="whitespace-pre-line text-marron/80 leading-relaxed text-lg">
                    {item.contenido || ''}
                  </div>
                </div>
                {item.imagen && typeof item.imagen === 'string' && item.imagen.startsWith('http') ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={item.imagen}
                      alt={item.titulo || 'Imagen'}
                      className="w-full h-auto object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-rosa/20" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="mt-12 rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-marron/60">No hay información disponible para mostrar</p>
        </div>
      )}
    </div>
  )
}

export default About
