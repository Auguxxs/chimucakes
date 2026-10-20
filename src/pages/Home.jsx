import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getInicioDestacadosData } from '../services/airtableService'

function Home() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '5493794689777'
  const [destacados, setDestacados] = useState([])
  const [loadingDestacados, setLoadingDestacados] = useState(true)
  const [errorDestacados, setErrorDestacados] = useState('')

  const openWhatsApp = (message) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    getInicioDestacadosData()
      .then((data) => {
        setDestacados(data)
        setLoadingDestacados(false)
      })
      .catch((err) => {
        console.error('[Home] Error cargando destacados:', err)
        setErrorDestacados('No se pudieron cargar los destacados')
        setLoadingDestacados(false)
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-crema via-rosaClaro/30 to-crema">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full bg-lima/20 px-4 py-1 text-sm font-semibold text-verde">
              100% Vegano · Artesanal · ChimuCakes
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-oscuro md:text-6xl">
              Dulce sabor,<br />
              <span className="text-rosa">consciencia real</span>
            </h1>
            <p className="mt-6 text-lg text-marron/80 md:text-xl">
              Pastelería vegana artesanal elaborada con ingredientes naturales,
              amor y dedicación.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalogo" className="btn-primary text-lg">
                Ver Catálogo
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/nosotros" className="btn-secondary">
                Nuestra Historia
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rosa/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-lima/20 blur-3xl" />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rosaClaro">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rosa" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-marron">Hecho con Amor</h3>
            <p className="mt-2 text-sm text-marron/70">
              Cada preparación es artesanal, en pequeños lotes, con ingredientes seleccionados.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lima/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-marron">100% Plant-Based</h3>
            <p className="mt-2 text-sm text-marron/70">
              Sin lácteos, sin huevo, sin ingredientes de origen animal. Puro sabor vegetal.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rosaClaro">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rosa" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-marron">Empaque Sostenible</h3>
            <p className="mt-2 text-sm text-marron/70">
              Packaging compostable y reciclable. Cuidamos el planeta en cada detalle.
            </p>
          </div>
        </div>
      </section>

      {/* Destacados - Mesa Dulce y Torta Personalizada */}
      {loadingDestacados ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-rosa border-t-transparent" />
          </div>
        </section>
      ) : destacados.length > 0 ? (
        <>
          {destacados.map((item) => {
            console.log("Item de inicio en JSX:", item);
            return (
              <section key={item.id || item.titulo} className="mx-auto max-w-6xl px-4 py-16">
                <div className="card overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-rosaClaro to-rosa/30 p-8 md:p-12 flex flex-col justify-center">
                      <span className="mb-3 inline-block w-fit rounded-full bg-rosa px-3 py-1 text-xs font-semibold text-oscuro">
                        Catering & Eventos
                      </span>
                      <h2 className="font-display text-3xl font-bold text-oscuro md:text-4xl">
                        {item.titulo}
                      </h2>
                      <p className="mt-4 text-marron/80 whitespace-pre-line">
                        {item.contenido}
                      </p>
                      <button
                        onClick={() => openWhatsApp(item.whatsappMessage)}
                        className="btn-whatsapp mt-6 w-fit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Consultar
                      </button>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[250px]">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.titulo || 'Destacado'}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-100 flex items-center justify-center min-h-[250px] rounded-2xl">
                          <span className="text-pink-400 font-medium">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              )
            })}
        </>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-marron/60">No hay destacados disponibles</p>
        </section>
      )}

      {/* CTA */}
      <section className="bg-marron py-16 text-crema">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            ¿Antojo de algo dulce?
          </h2>
          <p className="mt-4 text-crema/80">
            Explora nuestro catálogo y pedí tus favoritos por WhatsApp.
          </p>
          <Link to="/catalogo" className="btn-primary mt-8 bg-lima text-oscuro hover:bg-lima/80">
            Explorar Catálogo
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
