import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticateUser } from '../services/airtableService'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authenticateUser(username, password)

      if (result.success) {
        sessionStorage.setItem('isAuthenticated', 'true')
        sessionStorage.setItem('adminUser', JSON.stringify(result.user))
        navigate('/admin')
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos')
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('Error de conexión. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-marron">
            Chimu<span className="text-rosa">Cakes</span>
          </h1>
          <p className="mt-2 text-sm text-marron/60">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-marron">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresá tu usuario"
              className="input-field"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-marron">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá tu contraseña"
              className="input-field"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-oscuro border-t-transparent" />
                Iniciando sesión...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-marron/40">
          Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  )
}

export default Login
