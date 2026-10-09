function Footer() {
  return (
    <footer className="bg-oscuro py-10 text-crema">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-display text-2xl font-bold">
          Chimu<span className="text-rosa">Cakes</span>
        </p>
        <p className="mt-2 text-sm text-crema/70">
          Pastelería vegana artesanal · Hecho con amor y plantas
        </p>
        <p className="mt-4 text-xs text-crema/50">
          © {new Date().getFullYear()} ChimuCakes. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
