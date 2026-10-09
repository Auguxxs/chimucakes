import { Link } from 'react-router-dom'

function Home() {
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
