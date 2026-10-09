function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-oscuro">Nuestra Historia</h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-rosa" />
      </div>

      <div className="mt-12 space-y-8 text-marron/80">
        {/* Inicio */}
        <div className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-marron">El Comienzo</h2>
          <p className="mt-4 leading-relaxed">
            Mi pasión por la repostería comenzó desde muy chica. Todavía me acuerdo cuando una amiga de la familia me enseñó las primeras cosas básicas de repostería. O cuando iba en el colegio y hacía postres o tortas para mis amigos en cumpleaños y juntadas.
          </p>
          <p className="mt-3 leading-relaxed">
            Y así, sin darme cuenta, fueron pasando los años. Hasta que en 2022 decidí dar el paso y comenzar a emprender.
          </p>
        </div>

        {/* Dificultad y pasión */}
        <div className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-marron">Lo que me mueve</h2>
          <p className="mt-4 leading-relaxed">
            No ha sido fácil, pero es algo que me fascina y disfruto hacer cada día. Cada receta es un nuevo desafío y una nueva oportunidad de crear algo especial.
          </p>
        </div>

        {/* Veganismo */}
        <div className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-marron">Compromiso Vegano</h2>
          <p className="mt-4 leading-relaxed">
            Desde el 2020 soy vegana. Pero viendo que no hay opciones aptas para nosotros, decidí juntar mi pasión por la repostería con el veganismo. Es así que cada vez les ofrezco más postres veganos 🌱
          </p>
        </div>

        {/* Filosofía */}
        <div className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-marron">Mi Filosofía</h2>
          <p className="mt-4 leading-relaxed">
            Una de las cosas que me encanta es exactamente eso: <em>veganizar recetas</em>. Porque lo vegano no es feo si se hace con pasión y compromiso 💕
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-rosaClaro to-lima/20 p-8 text-center">
        <p className="font-display text-xl font-semibold text-marron">
          "La verdadera dulzura está en lo que compartimos"
        </p>
        <p className="mt-2 text-sm text-marron/60">— Equipo ChimuCakes</p>
      </div>
    </div>
  )
}

export default About
