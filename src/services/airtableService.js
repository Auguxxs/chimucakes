import productsData from '../data/products'

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID

console.log('[Airtable] API_KEY cargada:', API_KEY ? `Sí (${API_KEY.substring(0, 8)}...)` : 'No')
console.log('[Airtable] BASE_ID cargado:', BASE_ID ? `Sí (${BASE_ID})` : 'No')

const isConfigured = !!(API_KEY && BASE_ID)

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/faf6f2/6d544f?text=ChimuCakes'

/**
 * Parsea variantes_json desde Airtable (puede ser JSON string, array o null)
 */
function parseVariantes(variantesRaw) {
  if (!variantesRaw) return null
  if (Array.isArray(variantesRaw)) return variantesRaw
  try {
    const parsed = JSON.parse(variantesRaw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Obtiene los productos disponibles desde Airtable.
 * Si no hay credenciales configuradas, retorna datos mock locales.
 */
export async function getProducts() {
  if (!isConfigured) {
    console.log('[Airtable] No configurado, usando datos mock locales')
    return productsData.map((p) => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description,
      precio: p.price,
      categoria: p.category,
      imagen_url: p.image,
      variantes: p.variantes || null,
    }))
  }

  // Traemos los productos sin formulas en la URL para evitar errores de sintaxis
  const url = `${BASE_URL}/Productos`
  console.log('[Airtable] GET URL:', url)

  try {
    const res = await fetch(url, { headers })
    console.log('[Airtable] Response status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] Error response:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    console.log('[Airtable] Productos recibidos en total:', data.records?.length || 0)

    // Filtramos en JavaScript: si disponible no está definido, se asume disponible
    const availableRecords = (data.records || []).filter(
      (record) => record.fields?.disponible !== false
    )

    return availableRecords.map((record) => {
      const fields = record.fields || {}
      const imagenUrl = fields.imagen?.[0]?.url || fields.imagen?.[0]?.thumbnails?.large?.url || PLACEHOLDER_IMAGE
      const nombre = fields.nombre || 'Sin nombre'
      const descripcion = fields.descripcion || ''
      const precio = fields.precio || 0
      const categoria = fields.categoria || 'Variados'

      return {
        id: record.id,
        nombre,
        name: nombre,
        descripcion,
        description: descripcion,
        precio,
        price: precio,
        categoria,
        category: categoria,
        imagen_url: imagenUrl,
        image: imagenUrl,
        variantes: parseVariantes(fields.variantes_json),
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getProducts:', error)
    throw error
  }
}

/**
 * Crea un nuevo pedido en Airtable.
 * @param {Object} orderData - Datos del pedido
 * @returns {Object} Confirmación con ID del pedido
 */
export async function createOrder(orderData) {
  if (!isConfigured) {
    const localId = `local-${Date.now()}`
    console.log('Pedido registrado (modo local):', { id: localId, ...orderData })
    return { id: localId, ...orderData }
  }

  const url = `${BASE_URL}/Pedidos`
  console.log('[Airtable] POST URL:', url)

  // NOTA: Se remueve fecha_creacion porque si es de tipo "Created time" en Airtable la calcula el servidor.
  const body = {
    records: [
      {
        fields: {
          cliente_nombre: orderData.customerName,
          cliente_telefono: orderData.phone,
          direccion_entrega: orderData.address,
          items_json: orderData.itemsText,
          total: orderData.total,
          estado: 'Pendiente',
          fecha_entrega: orderData.deliveryDate,
        },
      },
    ],
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] POST status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] POST error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    return { id: data.records[0].id, ...orderData }
  } catch (error) {
    console.error('[Airtable] Error en createOrder:', error)
    throw error
  }
}

/**
 * Obtiene todos los pedidos desde Airtable, ordenados por fecha descendente.
 * Si no hay credenciales configuradas, retorna pedidos de ejemplo.
 */
export async function getOrders() {
  if (!isConfigured) {
    return [
      {
        id: 'demo-1',
        customerName: 'María García',
        phone: '11 5555-1234',
        address: 'Av. Corrientes 1234, CABA',
        notes: 'Sin azúcar en la tarta',
        itemsText: '1x Tarta de Chocolate y Aguacate (16cm), 2x Cookies de Avena',
        total: 19800,
        status: 'Pendiente',
        date: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'demo-2',
        customerName: 'Carlos López',
        phone: '11 6666-5678',
        address: 'Retiro en local',
        notes: '',
        itemsText: '2x Cheesecake de Anacardos (10cm)',
        total: 28000,
        status: 'En preparación',
        date: new Date(Date.now() - 86400000).toISOString(),
        deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      },
    ]
  }

  const url = `${BASE_URL}/Pedidos?sort%5B0%5D%5Bfield%5D=fecha_creacion&sort%5B0%5D%5Bdirection%5D=desc`
  console.log('[Airtable] GET Orders URL:', url)

  try {
    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Orders status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] GET Orders error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()

    return data.records.map((record) => {
      const fields = record.fields || {}
      return {
        id: record.id,
        customerName: fields.cliente_nombre || '',
        phone: fields.cliente_telefono || '',
        address: fields.direccion_entrega || '',
        notes: fields.notas || '',
        itemsText: fields.items_json || '',
        total: fields.total || 0,
        status: fields.estado || 'Pendiente',
        date: fields.fecha_creacion || new Date().toISOString(),
        deliveryDate: fields.fecha_entrega || '',
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getOrders:', error)
    throw error
  }
}

/**
 * Autentica un usuario contra la tabla "usuarios" de Airtable.
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} { success: boolean, user?: Object, error?: string }
 */
export async function authenticateUser(username, password) {
  if (!isConfigured) {
    // Fallback local con credenciales de demo
    const localUser = import.meta.env.VITE_ADMIN_USER || 'admin'
    const localPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'dulce2024'

    if (username === localUser && password === localPassword) {
      return { success: true, user: { username: localUser, name: 'Admin' } }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  try {
    const formula = encodeURIComponent(`AND({username} = '${username}', {password} = '${password}')`)
    const url = `${BASE_URL}/usuarios?filterByFormula=${formula}`
    console.log('[Airtable] Auth URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] Auth status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] Auth error:', errorBody)
      return { success: false, error: 'Error de conexión. Intentá nuevamente.' }
    }

    const data = await res.json()

    if (data.records && data.records.length > 0) {
      const userRecord = data.records[0]
      return {
        success: true,
        user: {
          id: userRecord.id,
          username: userRecord.fields.username,
          name: userRecord.fields.name || userRecord.fields.username,
          email: userRecord.fields.email || '',
          role: userRecord.fields.role || 'admin',
        },
      }
    }

    return { success: false, error: 'Usuario o contraseña incorrectos' }
  } catch (error) {
    console.error('[Airtable] Error en authenticateUser:', error)
    return { success: false, error: 'Error de conexión. Intentá nuevamente.' }
  }
}

/**
 * Actualiza el estado de un pedido en Airtable.
 * @param {string} orderId - ID del registro en Airtable
 * @param {string} newStatus - Nuevo estado
 */
export async function updateOrderStatus(orderId, newStatus) {
  if (!isConfigured) {
    console.log(`Estado actualizado (modo local): ${orderId} -> ${newStatus}`)
    return { id: orderId, status: newStatus }
  }

  const url = `${BASE_URL}/Pedidos/${orderId}`
  console.log('[Airtable] PATCH URL:', url)

  const body = {
    fields: {
      estado: newStatus,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] PATCH status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] PATCH error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error('[Airtable] Error en updateOrderStatus:', error)
    throw error
  }
}

/**
 * Actualiza un pedido completo en Airtable.
 * @param {string} orderId - ID del registro en Airtable
 * @param {Object} updateData - Campos a actualizar
 * @returns {Object} Confirmación de actualización
 */
export async function updateOrder(orderId, updateData) {
  if (!isConfigured) {
    console.log('Pedido actualizado (modo local):', { id: orderId, ...updateData })
    return { id: orderId, ...updateData }
  }

  const url = `${BASE_URL}/Pedidos/${orderId}`
  console.log('[Airtable] PATCH Order URL:', url)

  const body = {
    fields: {
      cliente_nombre: updateData.customerName,
      cliente_telefono: updateData.phone,
      direccion_entrega: updateData.address,
      items_json: updateData.itemsText,
      total: updateData.total,
      estado: updateData.status,
      fecha_entrega: updateData.deliveryDate,
      notas: updateData.notes || '',
    },
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] PATCH Order status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] PATCH Order error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error('[Airtable] Error en updateOrder:', error)
    throw error
  }
}
